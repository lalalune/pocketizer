import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/callClaude') {
      // Anthropic API call handling
      const { prompt } = await request.json();

      const anthropic = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      anthropic.messages.stream({
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-3-haiku-20240307',
      })
      .on('text', (text) => {
        const encoder = new TextEncoder();
        const chunk = encoder.encode(text);
        writer.write(chunk);
      })
      .on('finalMessage', (message) => {
        console.log('\n*** Final response:', message);
        writer.close();
      })
      .on('end', () => {
        writer.close();
      })
      .on('error', (error) => {
        console.error('Streaming error:', error);
        writer.abort(error);
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else if (path === '/callChatGPT') {
      // OpenAI API call handling
      const { prompt } = await request.json();
    
      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
    
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }, { responseType: 'stream' });
    
        const reader = response[Symbol.asyncIterator]();
    
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.next();
          done = readerDone;
    
          if (value) {
            let chunkText = '';
            if (typeof value === 'string') {
              chunkText = value;
            } else if (value instanceof Uint8Array) {
              const decoder = new TextDecoder('utf-8');
              chunkText = decoder.decode(value);
            } else if (typeof value === 'object') {
              chunkText = JSON.stringify(value);
            } else {
              console.warn('Unexpected chunk type:', typeof value);
              continue;
            }
    
            const lines = chunkText.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              const message = line.replace(/^data: /, '');
              if (message === '[DONE]') {
                break;
              }
              try {
                const data = JSON.parse(message);
                if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                  const token = data.choices[0].delta.content;
                  const encoder = new TextEncoder();
                  await writer.write(encoder.encode(token));
                }
              } catch (error) {
                console.error('JSON parsing error:', error);
              }
            }
          }
        }
    
        await writer.close();
      } catch (error) {
        console.error('Error:', error);
        writer.abort(error);
        return new Response('Internal Server Error', { status: 500 });
      }
    
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

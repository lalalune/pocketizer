// @pocketizer-ignore-file

import { Anthropic } from '@anthropic-ai/sdk';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/callClaude') {
      const { prompt } = await request.json();

      const anthropic = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      anthropic.messages.stream({
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-3-sonnet-20240229',
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
        .on('end', (message) => {
          console.log('\n*** end response:', message);
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
    }

    return new Response('Not Found', { status: 404 });
  },
};
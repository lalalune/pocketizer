// @pocketizer-ignore-file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

import pocketCodebase from './concatenated-output.mjs';

dotenv.config({
  path: path.join(process.cwd(), '.dev.vars')
});

const cloudflareWorkerUrl = process.env.CLOUDFLARE_WORKER_URL || 'https://ai-proxy.shawmakesmagic.workers.dev';

export async function callClaudeWorker(prompt) {
  try {
    let finalResponse = '';

    const response = await fetch(cloudflareWorkerUrl + '/callClaude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    // if response is error, log it
    if (!response.ok) {
      console.error('Error calling Claude API:', response.status, response.statusText);
      throw new Error('Error calling Claude API');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      finalResponse += text;
      process.stdout.write(text);
    }

    console.log('*** final response is', finalResponse);

    return finalResponse;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// __dirname is not defined in ES module scope, so we need to create it
const __filename = fileURLToPath(import.meta.url);

// The directory containing the TypeScript/JavaScript files
const directoryPath = process.cwd();

// Function to recursively read through directories and process .ts, .js, .tsx, .jsx files
const processDirectory = async (dirPath) => {
  const files = fs.readdirSync(dirPath)

  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)

    // if the path includes node_modules, skip it
    if (filePath.includes('node_modules')) {
      continue;
    }

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(filePath)
    } else if (['.ts', '.js', '.tsx', '.jsx', '.mjs', '.mjsx'].includes(path.extname(file))) {
      // Read the file content
      const content = fs.readFileSync(filePath, 'utf8')

      // Check if the file contains calls to Infura, Alchemy, ethers.js, or web3.js
      if ((content.includes('infura') || content.includes('alchemy') || content.includes('@alch') || content.includes('ethers') || content.includes('web3')) && !content.includes('@pocketizer-ignore-file')) {
        // Add the file to the queue for rewriting
        await rewriteFileUsingPocketJS(filePath, content)
      }
    }
  }
}

// Function to rewrite a file using Pocket JS
const rewriteFileUsingPocketJS = async (filePath, content) => {
  console.log(`Rewriting file: ${filePath}`)

  // Prepare the prompt for the Claude API
  let prompt = `${pocketCodebase}\n
  Please rewrite the following code to use Pocket JS instead of Infura, Alchemy, ethers.js, or web3.js:

\`\`\`
${content}
\`\`\`

First, describe the steps to rewrite the code.
Replace all calls to other web3 providers with Pocket JS.
Next, compile all the rewritten code into a complete file.
Then write it out as a single markdown JS code block, along with all the necessary imports and exports.
Once you've rewritten the code, respond with the complete markdown JS code block. No need for additional commentary or explanation after that.`

  const response = await callClaudeWorker(prompt)

  console.log('*** response \n', response)

  // Check if the response contains a single JSON code block
  const codeBlocks = response?.match(/```(?:\w+)?\n([\s\S]*?)\n```/g)

  if (!codeBlocks || codeBlocks.length !== 1) {
    console.warn('*** file skipped')
    return;
  }
  const codeBlock = codeBlocks[0]
  console.log('*** codeBlock \n', codeBlock)
  const code = codeBlock.replace(/```(?:\w+)?\n|```/g, '')

  // Save the rewritten code back to the file
  if (!code) {
    console.warn('*** file skipped')
    return;
  }

  fs.writeFileSync(filePath, code)

  console.log(`File rewritten: ${filePath}`)
}

// Start processing from the current working directory
processDirectory(directoryPath)
  .then(() => {
    console.log('Code rewriting completed.')
  })
  .catch((error) => {
    console.error('An error occurred:', error)
  })
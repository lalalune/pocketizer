#!/usr/bin/env node
// @pocketizer-ignore-file
import { Anthropic } from '@anthropic-ai/sdk';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import os from 'os';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import pocketCodebase from './pocketCodebase.js';

const execAsync = promisify(exec);

async function run() {
  dotenv.config({
    path: path.join(process.cwd(), '.dev.vars')
  });

  // Function to get the API key from ~/.pocketizerrc or prompt the user
  async function getApiKey() {
    const homedir = os.homedir();
    const rcFilePath = path.join(homedir, '.pocketizerrc');

    try {
      if (fs.existsSync(rcFilePath)) {
        const rcFileContent = fs.readFileSync(rcFilePath, 'utf8');
        const apiKey = rcFileContent.trim();
        if (apiKey.startsWith('sk-')) {
          return apiKey;
        }
      }
    } catch (error) {
      console.error('Error reading ~/.pocketizerrc:', error);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter your ChatGPT or Claude API key (starting with "sk-"): ', (apiKey) => {
        rl.close();
        if (apiKey.startsWith('sk-')) {
          try {
            fs.writeFileSync(rcFilePath, apiKey);
            console.log('API key stored in ~/.pocketizerrc');
          } catch (error) {
            console.error('Error storing API key in ~/.pocketizerrc:', error);
          }
          resolve(apiKey);
        } else {
          console.error('Invalid API key. Please enter a valid key starting with "sk-".');
          process.exit(1);
        }
      });
    });
  }

  async function callClaude(prompt, apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });

      const response = await anthropic.complete({
        prompt,
        model: 'claude-v1',
        max_tokens_to_sample: 2048,
      });

      const finalResponse = response.completion;

      return finalResponse;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  async function callChatGPT(prompt, apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
  
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });
  
      let finalResponse = '';
  
      for await (const data of response) {
        // structure of chunk is {
        //   id: 'chatcmpl-92lbu3AjgWXwSjuzkBqkgwxsXxK5Z',
        //   object: 'chat.completion.chunk',
        //   created: 1710446698,
        //   model: 'gpt-4-0125-preview',
        //   system_fingerprint: 'fp_31c0f205d1',
        //   choices: [
        //     { index: 0, delta: [Object], logprobs: null, finish_reason: null }
        //   ]
        // }
          try {
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              const token = data.choices[0].delta.content;
              process.stdout.write(token);
              finalResponse += token;
            }
          } catch (error) {
            console.error('JSON parsing error:', error);
          }
      }
    
      return finalResponse;
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      throw error;
    }
  }

  // Function to prompt the user for confirmation
  async function promptConfirmation(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${message} (yes/no) `, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'yes');
      });
    });
  }

  // Check if the current directory is a git repository
  async function isGitRepository() {
    try {
      await execAsync('git rev-parse --is-inside-work-tree');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check if there are uncommitted changes in the git repository
  async function hasUncommittedChanges() {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      return stdout.trim() !== '';
    } catch (error) {
      return false;
    }
  }

  // __dirname is not defined in ES module scope, so we need to create it
  const __filename = fileURLToPath(import.meta.url);

  // The directory containing the TypeScript/JavaScript files
  const directoryPath = process.cwd();

  // Function to recursively read through directories and process .ts, .js, .tsx, .jsx files
  const processDirectory = async (dirPath) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      // if the path includes node_modules, skip it
      if (
        filePath.includes('node_modules') ||
        // ignore .config.js
        filePath.includes('.config.js')
      ) {
        continue;
      }

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(filePath);
      } else if (['.ts', '.js', '.tsx', '.jsx', '.mjs', '.mjsx'].includes(path.extname(file))) {
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if the file contains calls to Infura, Alchemy, ethers.js, or web3.js
        if (
          (content.includes('alchemy') || content.includes('@alch') || content.includes('infura') || content.includes('wagmi') || content.includes('ethers')) &&
          !content.includes('@pocketizer-ignore-file')
        ) {
          // Add the file to the queue for rewriting
          await rewriteFileUsingPocketJS(filePath, content);
        }
      }
    }
  };

  const apiKey = await getApiKey();
  const isClaude = apiKey.includes('.');

  const rewriteFileUsingPocketJS = async (filePath, content) => {
    console.log(`Rewriting file: ${filePath}`);

    let prompt = `${pocketCodebase}\n
    Please rewrite the following code to use Pocket JS instead of Alchemy:

\`\`\`
${content}
\`\`\`

First, describe the steps to rewrite the code.
Replace all calls to other web3 providers with Pocket JS that can be replaced. Specifically, look for calls to Alchemy, Infura, ethers.js, wagmi or web3.js, as well as any other provider-specific code.
Next, compile all the rewritten code into a complete file.
Then write it out as a single markdown JS code block, along with all the necessary imports and exports.
Once you've rewritten the code, respond with the complete markdown JS code block. No need for additional commentary or explanation after that.
If it doesn't make sense to change this code or no code changes are necessary, respond with "No changes needed" and no code blocks.`;

    const response = isClaude
      ? await callClaude(prompt, apiKey)
      : await callChatGPT(prompt, apiKey);

    const codeBlocks = response?.match(/```(?:\w+)?\n([\s\S]*?)\n```/g);

    if (!codeBlocks || codeBlocks.length !== 1) {
      console.warn('*** file skipped');
      return;
    }
    const codeBlock = codeBlocks[0];
    const code = codeBlock.replace(/```(?:\w+)?\n|```/g, '');

    if (!code) {
      console.warn('*** file skipped');
      return;
    }

    fs.writeFileSync(filePath, code);

    console.log(`File rewritten: ${filePath}`);
  };

  const isGitRepo = await isGitRepository();

  if (!isGitRepo) {
    const continueWithoutGit = await promptConfirmation(
      'Warning: The current directory is not a git repository. Are you sure you want to continue?'
    );
    if (!continueWithoutGit) {
      console.log('Aborting the process.');
      process.exit(0);
    }
  } else {
    const hasChanges = await hasUncommittedChanges();
    if (hasChanges) {
      const continueWithChanges = await promptConfirmation(
        'Warning: There are uncommitted changes in the git repository. This process is destructive. Are you sure you want to continue?'
      );
      if (!continueWithChanges) {
        console.log('Aborting the process.');
        process.exit(0);
      }
    }
  }

  // Start processing from the current working directory
  processDirectory(directoryPath)
    .then(() => {
      console.log('Code rewriting completed.');
    })
    .catch((error) => {
      console.error('An error occurred:', error);
    });
}

run();
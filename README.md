# pocketizer

A simple tool to convert Alchemy projects to use Pocket JS.

## To convert an Alchemy or Infura project automatically

First, go to the project root.
    
Then, run the following command:
```bash
npx pocketizer
```

## Development

#### Setup:
Copy .env.vars.example to .env.vars and fill in the values.
```bash
cp .dev.vars.example .dev.vars
```

#### Installation:
```bash
npm install
```

#### Deployment
The API key for Claude is hidden behind a Cloudflare worker. To deploy the worker, run `npx wrangler deploy`. You will then need to set the environment variable for CLOUDFLARE_WORKER_URL to your new worker URL.

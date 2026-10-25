#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { request as httpsRequest } from 'node:https';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { exit } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHelp() {
  console.log(`ai-prompt-orchestrator

Usage: ai-prompt-orchestrator --prompt <path|url> --context <json-file> [--output <file>]

Options:
  --prompt   Path to a local prompt file or an http/https URL containing the template.
  --context  JSON file that provides key/value pairs for placeholder substitution.
  --output   Optional file to write the final prompt. If omitted, the prompt is printed to stdout.
  -h, --help Show this help message.
`);
  exit(0);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') printHelp();
    if (arg === '--prompt') options.prompt = args[++i];
    else if (arg === '--context') options.context = args[++i];
    else if (arg === '--output') options.output = args[++i];
    else {
      console.error(`Unknown argument: ${arg}`);
      exit(1);
    }
  }
  if (!options.prompt || !options.context) {
    console.error('Both --prompt and --context are required.');
    exit(1);
  }
  return options;
}

function isHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function fetchRemote(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? httpsRequest : http.request;
    const req = lib(url, res => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function loadPrompt(source) {
  if (isHttpUrl(source)) {
    return await fetchRemote(source);
  }
  const fullPath = path.isAbsolute(source) ? source : path.resolve(process.cwd(), source);
  if (!existsSync(fullPath)) {
    throw new Error(`Prompt file not found: ${fullPath}`);
  }
  return await readFile(fullPath, 'utf8');
}

async function loadContext(contextPath) {
  const fullPath = path.isAbsolute(contextPath) ? contextPath : path.resolve(process.cwd(), contextPath);
  if (!existsSync(fullPath)) {
    throw new Error(`Context file not found: ${fullPath}`);
  }
  const raw = await readFile(fullPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('Context file must be valid JSON');
  }
}

function substitute(template, context) {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      return String(context[key]);
    }
    return `{{${key}}}`; // leave untouched if missing
  });
}

async function main() {
  const opts = parseArgs();
  try {
    const [template, context] = await Promise.all([
      loadPrompt(opts.prompt),
      loadContext(opts.context)
    ]);
    const result = substitute(template, context);
    if (opts.output) {
      const outPath = path.isAbsolute(opts.output) ? opts.output : path.resolve(process.cwd(), opts.output);
      await writeFile(outPath, result, 'utf8');
    } else {
      console.log(result);
    }
    exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

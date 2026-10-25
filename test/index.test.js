import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const cliPath = path.resolve(import.meta.dirname, '..', 'src', 'index.js');

test('CLI substitutes placeholders from JSON context', async (t) => {
  const tmpDir = await import('node:fs/promises').then(fs => fs.mkdtemp(path.join(import.meta.dirname, 'tmp-')));
  const promptPath = path.join(tmpDir, 'prompt.txt');
  const contextPath = path.join(tmpDir, 'context.json');

  const promptContent = 'Hello {{name}}, your task is {{task}}.';
  const contextContent = JSON.stringify({ name: 'Alice', task: 'review code' }, null, 2);

  await writeFile(promptPath, promptContent, 'utf8');
  await writeFile(contextPath, contextContent, 'utf8');

  const result = spawnSync('node', [cliPath, '--prompt', promptPath, '--context', contextPath], { encoding: 'utf8' });

  assert.equal(result.status, 0, 'process should exit with code 0');
  assert.equal(result.stdout.trim(), 'Hello Alice, your task is review code.');

  // Clean up
  await rm(tmpDir, { recursive: true, force: true });
});

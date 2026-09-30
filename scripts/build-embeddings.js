/**
 * Walk a vault, embed Markdown chunks, and write embeddings.json.
 * Cap: 10 markdown files.
 *
 *   VAULT_PATH=../my-vault npm run build-embeddings
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { embedText } from '../lib/embeddings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const MAX_NOTES = 10;
const MAX_CHARS_PER_NOTE = 12000;
const CHUNK_SIZE = 1400;
const CHUNK_OVERLAP = 180;
const vaultPath = process.env.VAULT_PATH || path.join(root, 'sample-vault');

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Vault folder not found: ${dir}`);
  }
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) out.push(...listMarkdown(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

function splitIntoChunks(content) {
  const text = content.slice(0, MAX_CHARS_PER_NOTE);
  const chunks = [];
  for (let start = 0; start < text.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
    const end = Math.min(text.length, start + CHUNK_SIZE);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
  }
  return chunks;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  let files;
  try {
    files = listMarkdown(vaultPath).slice(0, MAX_NOTES);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  if (!files.length) {
    console.error(`No .md files under ${vaultPath}. Set VAULT_PATH or add notes.`);
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const embeddingsData = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.length > MAX_CHARS_PER_NOTE) {
      console.warn(`Truncating ${path.relative(vaultPath, file)} to ${MAX_CHARS_PER_NOTE} characters.`);
    }
    const relativeFile = path.relative(vaultPath, file);
    const chunks = splitIntoChunks(content);
    if (!chunks.length) continue;
    for (let index = 0; index < chunks.length; index += 1) {
      console.log('Embedding', relativeFile, `${index + 1}/${chunks.length}`);
      const embedding = await embedText(ai, chunks[index], 'RETRIEVAL_DOCUMENT');
      embeddingsData.push({
        file: relativeFile,
        content: chunks[index],
        embedding,
      });
    }
  }

  if (!embeddingsData.length) {
    console.error(`No non-empty Markdown notes under ${vaultPath}.`);
    process.exitCode = 1;
    return;
  }

  const outPath = path.join(root, 'embeddings.json');
  fs.writeFileSync(outPath, JSON.stringify(embeddingsData, null, 2));
  console.log(`Wrote ${embeddingsData.length} chunks → ${outPath}`);
}

main().catch((err) => {
  console.error('Could not build embeddings:', err);
  process.exitCode = 1;
});

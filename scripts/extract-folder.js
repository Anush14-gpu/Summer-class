/**
 * Session 12 Core: batch-extract images in a folder → extracted-data.json
 *
 *   npm run extract-folder
 *   node scripts/extract-folder.js ./sample-images
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { extractImageInformation } from '../lib/image-extraction.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Set GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const inputDir = path.resolve(process.argv[2] || path.join(root, 'sample-images'));
  if (!fs.existsSync(inputDir)) {
    console.error('Folder not found:', inputDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(inputDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

  if (files.length < 2) {
    console.warn('Core expects at least two images. Add more under sample-images/.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const results = [];

  for (let i = 0; i < files.length; i += 1) {
    const filename = files[i];
    const full = path.join(inputDir, filename);
    console.log(`Processing ${i + 1}/${files.length}: ${filename}`);
    const buffer = fs.readFileSync(full);
    const data = await extractImageInformation(ai, mimeFor(full), buffer.toString('base64'));
    results.push({ file: filename, data });
    await sleep(1000);
  }

  const outPath = path.join(root, 'extracted-data.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} results → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

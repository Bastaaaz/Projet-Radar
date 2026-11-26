import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStore as getNetlifyBlobStore } from '@netlify/blobs';
import seedFallback from './seed-fallback.js';

function resolveRootDir() {
  if (fsSync.existsSync(path.join(process.cwd(), 'data', 'seed-discoveries.json'))) {
    return process.cwd();
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const candidate = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
      if (fsSync.existsSync(path.join(candidate, 'data', 'seed-discoveries.json'))) {
        return candidate;
      }
    }
  } catch {
    // Fallback CJS / Netlify bundler
  }
  return process.cwd();
}

export const ROOT_DIR = resolveRootDir();
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const SEED_PATH = path.join(DATA_DIR, 'seed-discoveries.json');
export const STORE_PATH = path.join(DATA_DIR, 'store.json');
export const SECRETS_PATH = path.join(DATA_DIR, 'secrets.json');

export const SECRET_KEYS = [
  'TAVILY_API_KEY',
  'BRAVE_API_KEY',
  'SERPER_API_KEY',
  'X_BEARER_TOKEN',
  'GEMINI_API_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
];

export function isNetlifyRuntime() {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      globalThis.netlifyBlobsContext ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.CONTEXT
  );
}

export function hasBlobsContext() {
  return Boolean(
    globalThis.netlifyBlobsContext ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)
  );
}

function getTmpFallbackPath(filePath) {
  return path.join('/tmp', 'project-radar-v2', path.basename(filePath));
}

async function readLocalJson(filePath, fallback) {
  const candidates = isNetlifyRuntime()
    ? [getTmpFallbackPath(filePath), filePath]
    : [filePath, getTmpFallbackPath(filePath)];

  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, 'utf-8');
      return JSON.parse(raw);
    } catch {
      // Try next path
    }
  }
  return fallback;
}

async function writeLocalJson(filePath, data) {
  const target = isNetlifyRuntime() ? getTmpFallbackPath(filePath) : filePath;
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    const tmpFallback = getTmpFallbackPath(filePath);
    await fs.mkdir(path.dirname(tmpFallback), { recursive: true });
    await fs.writeFile(tmpFallback, JSON.stringify(data, null, 2), 'utf-8');
  }
}

function openNetlifyStore() {
  if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN && !globalThis.netlifyBlobsContext && !process.env.NETLIFY_BLOBS_CONTEXT) {
    return getNetlifyBlobStore({
      name: 'project-radar-v2',
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
    });
  }
  return getNetlifyBlobStore({ name: 'project-radar-v2' });
}

async function readBlobJson(key, fallback) {
  if (!hasBlobsContext()) return fallback;
  try {
    const blobStore = openNetlifyStore();
    const data = await blobStore.get(key, { type: 'json' });
    return data ?? fallback;
  } catch (err) {
    console.warn(`[storage] Netlify Blobs read fallback (${key}): ${err.message}`);
    return fallback;
  }
}

async function writeBlobJson(key, data) {
  if (!hasBlobsContext()) return false;
  try {
    const blobStore = openNetlifyStore();
    await blobStore.setJSON(key, data);
    return true;
  } catch (err) {
    console.warn(`[storage] Netlify Blobs write fallback (${key}): ${err.message}`);
    return false;
  }
}

export async function readStorageJson(key, localPath, fallback) {
  if (isNetlifyRuntime()) {
    const blobData = await readBlobJson(key, null);
    if (blobData !== null) return blobData;
    return readLocalJson(localPath, fallback);
  }
  return readLocalJson(localPath, fallback);
}

export async function writeStorageJson(key, localPath, data) {
  if (isNetlifyRuntime()) {
    const wroteBlob = await writeBlobJson(key, data);
    if (wroteBlob) return;
    await writeLocalJson(localPath, data);
    return;
  }
  return writeLocalJson(localPath, data);
}

export async function getSeedData() {
  const candidates = [
    SEED_PATH,
    path.join(process.cwd(), 'data', 'seed-discoveries.json'),
    '/var/task/data/seed-discoveries.json',
  ];
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const loaded = JSON.parse(raw);
      if (loaded) return loaded;
    } catch {
      // Try next
    }
  }
  return seedFallback;
}

export async function getRadarStore() {
  const seed = await getSeedData();
  const existing = await readStorageJson('store', STORE_PATH, null);
  if (existing) {
    return {
      editionDate: existing.editionDate || seed.editionDate,
      editionLabel: existing.editionLabel || seed.editionLabel,
      discoveries: existing.discoveries || seed.discoveries,
      watchlist: existing.watchlist || seed.watchlist,
      favorites: existing.favorites || [],
      testedIds: existing.testedIds || [],
      hiddenIds: existing.hiddenIds || [],
      leads: existing.leads || [],
      scanHistory: existing.scanHistory || [],
      schedule: existing.schedule || {
        enabled: true,
        hourParis: 8,
        lastAutoRunDate: null,
      },
    };
  }
  const initial = {
    ...seed,
    favorites: [],
    testedIds: [],
    hiddenIds: [],
    leads: [],
    scanHistory: [],
    schedule: {
      enabled: true,
      hourParis: 8,
      lastAutoRunDate: null,
    },
  };
  await writeStorageJson('store', STORE_PATH, initial);
  return initial;
}

export async function saveRadarStore(store) {
  return writeStorageJson('store', STORE_PATH, store);
}

export async function getSecrets() {
  const storedSecrets = await readStorageJson('secrets', SECRETS_PATH, {});
  const merged = {};
  for (const k of SECRET_KEYS) {
    merged[k] = (storedSecrets[k] || process.env[k] || '').trim();
  }
  return merged;
}

export async function saveSecrets(updatedObj) {
  return writeStorageJson('secrets', SECRETS_PATH, updatedObj);
}

export async function readRawSecrets() {
  return readStorageJson('secrets', SECRETS_PATH, {});
}

export function maskSecrets(secrets) {
  const masked = {};
  for (const k of SECRET_KEYS) {
    const val = secrets[k] || '';
    masked[k] = {
      configured: Boolean(val),
      preview: val ? `${val.slice(0, 4)}••••${val.slice(-4)}` : '',
    };
  }
  return masked;
}

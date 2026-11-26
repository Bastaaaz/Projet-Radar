import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStore as getNetlifyBlobStore } from '@netlify/blobs';

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
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.CONTEXT
  );
}

async function readLocalJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeLocalJson(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    const tmpFallback = path.join('/tmp', 'project-radar-v2', path.basename(filePath));
    await fs.mkdir(path.dirname(tmpFallback), { recursive: true });
    await fs.writeFile(tmpFallback, JSON.stringify(data, null, 2), 'utf-8');
  }
}

async function readBlobJson(key, fallback) {
  try {
    const blobStore = getNetlifyBlobStore({ name: 'project-radar-v2', consistency: 'strong' });
    const data = await blobStore.get(key, { type: 'json' });
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeBlobJson(key, data) {
  const blobStore = getNetlifyBlobStore({ name: 'project-radar-v2', consistency: 'strong' });
  await blobStore.setJSON(key, data);
}

export async function readStorageJson(key, localPath, fallback) {
  if (isNetlifyRuntime()) {
    return readBlobJson(key, fallback);
  }
  return readLocalJson(localPath, fallback);
}

export async function writeStorageJson(key, localPath, data) {
  if (isNetlifyRuntime()) {
    return writeBlobJson(key, data);
  }
  return writeLocalJson(localPath, data);
}

export async function getSeedData() {
  const candidates = [
    SEED_PATH,
    path.join(process.cwd(), 'data', 'seed-discoveries.json'),
  ];
  for (const p of candidates) {
    const loaded = await readLocalJson(p, null);
    if (loaded) return loaded;
  }
  return { editionDate: '2026-11-26', editionLabel: 'Édition #01 — 26 novembre 2026', discoveries: [], watchlist: [] };
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

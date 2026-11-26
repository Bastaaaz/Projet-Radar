import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createApiApp, executeAutonomousScan } from './app.js';
import { ROOT_DIR, getRadarStore, saveRadarStore } from './storage.js';

const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const app = createApiApp();

// En production ou après vite build, servir l'application React compilée sur le même port
try {
  await fs.access(DIST_DIR);
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} catch {
  // Mode dev : Vite sert le frontend séparément
}

// Planificateur autonome quotidien (mode serveur continu)
setInterval(async () => {
  try {
    const store = await getRadarStore();
    if (!store.schedule?.enabled) return;

    const nowParis = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const parts = Object.fromEntries(nowParis.map((p) => [p.type, p.value]));
    const todayStr = `${parts.year}-${parts.month}-${parts.day}`;
    const currentHour = Number(parts.hour);

    if (currentHour >= Number(store.schedule.hourParis ?? 8) && store.schedule.lastAutoRunDate !== todayStr) {
      store.schedule.lastAutoRunDate = todayStr;
      await saveRadarStore(store);
      await executeAutonomousScan({ theme: 'all', trigger: 'scheduled-daily' });
    }
  } catch {
    // Silent background guard
  }
}, 5 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[PROJECT RADAR V2] Serveur actif sur http://0.0.0.0:${PORT}`);
});

import { executeAutonomousScan } from '../../server/app.js';
import { getRadarStore, saveRadarStore } from '../../server/storage.js';

export default async () => {
  try {
    const store = await getRadarStore();
    if (store.schedule?.enabled === false) {
      return new Response('Scheduled scan disabled in settings.', { status: 200 });
    }
    const result = await executeAutonomousScan({ theme: 'all', trigger: 'netlify-scheduled-daily' });
    const updated = await getRadarStore();
    updated.schedule = {
      ...(updated.schedule || {}),
      lastAutoRunDate: new Date().toISOString().slice(0, 10),
    };
    await saveRadarStore(updated);
    return new Response(JSON.stringify({ ok: true, run: result.run }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  schedule: '0 7 * * *',
};

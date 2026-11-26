import serverless from 'serverless-http';
import { connectLambda } from '@netlify/blobs';
import { createApiApp } from '../../server/app.js';

const app = createApiApp();
const expressHandler = serverless(app);

export const handler = async (event, context) => {
  try {
    connectLambda(event);
  } catch {
    // Fallback si exécuté hors contexte Blobs
  }
  return expressHandler(event, context);
};

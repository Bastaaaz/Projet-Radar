import serverless from 'serverless-http';
import { createApiApp } from '../../server/app.js';

const app = createApiApp();
const expressHandler = serverless(app);

// Netlify Functions v2 : injecte nativement @netlify/blobs et gère Web Request/Response
export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const headers = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const queryStringParameters = {};
    url.searchParams.forEach((value, key) => {
      queryStringParameters[key] = value;
    });

    let body;
    let isBase64Encoded = false;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const ab = await req.arrayBuffer();
      if (ab && ab.byteLength > 0) {
        body = Buffer.from(ab).toString('base64');
        isBase64Encoded = true;
      }
    }

    const event = {
      httpMethod: req.method,
      path: url.pathname,
      rawUrl: req.url,
      rawQuery: url.search ? url.search.slice(1) : '',
      queryStringParameters,
      headers,
      body,
      isBase64Encoded,
    };

    const result = await expressHandler(event, context);

    const responseHeaders = new Headers();
    if (result.headers) {
      for (const [k, v] of Object.entries(result.headers)) {
        if (v !== undefined && v !== null) {
          responseHeaders.set(k, String(v));
        }
      }
    }
    if (result.multiValueHeaders) {
      for (const [k, values] of Object.entries(result.multiValueHeaders)) {
        if (Array.isArray(values)) {
          for (const val of values) {
            responseHeaders.append(k, String(val));
          }
        }
      }
    }

    const responseBody = result.isBase64Encoded
      ? Buffer.from(result.body || '', 'base64')
      : (result.body ?? '');

    return new Response(responseBody, {
      status: result.statusCode || 200,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal API Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

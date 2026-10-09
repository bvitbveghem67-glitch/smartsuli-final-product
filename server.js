import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chatHandler from './api/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Hide Express framework fingerprint
app.disable('x-powered-by');

// Parse request bodies in JSON, URL-encoded, or raw text formats
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Global CORS & Header Middleware: Prevents 405 Method Not Allowed on all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Immediately resolve preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Security Middleware: Keep secrets, env keys, and backend source files completely hidden
app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase();

  // Explicitly allow study assistant API endpoints
  if (
    reqPath === '/api/chat' ||
    reqPath === '/api/chat/' ||
    reqPath === '/.netlify/functions/chat' ||
    reqPath === '/.netlify/functions/chat/' ||
    reqPath === '/chat' ||
    reqPath === '/chat/' ||
    reqPath.startsWith('/api/') ||
    reqPath.startsWith('/.netlify/functions/')
  ) {
    return next();
  }

  // Deny direct file access to server source, configs, and secret variables
  const protectedPatterns = [
    '/.env',
    '/.git',
    '/server.js',
    '/server.ts',
    '/api/chat.js',
    '/netlify/functions',
    '/package.json',
    '/bun.lock',
    '/tsconfig.json',
    '/metadata.json',
    '/netlify.toml',
  ];

  const isProtected = protectedPatterns.some((pattern) => {
    return reqPath === pattern || reqPath.startsWith(pattern + '/');
  });

  if (isProtected) {
    return res.status(403).json({ error: 'Access forbidden.' });
  }

  next();
});

// Central API Router: Supports POST, GET, PUT, PATCH, HEAD to eliminate 404/405 errors
const handleChatRoute = (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  return chatHandler(req, res);
};

// Register all API routes for local development, Cloud Run, and Netlify rewrites
const apiRoutes = [
  '/api/chat',
  '/api/chat/',
  '/.netlify/functions/chat',
  '/.netlify/functions/chat/',
  '/chat',
  '/chat/',
  '/api',
  '/api/',
];

app.all(apiRoutes, handleChatRoute);
app.all('/api/*', handleChatRoute);
app.all('/.netlify/functions/*', handleChatRoute);

// Intercept any POST/PUT request with chat payload anywhere to ensure 100% reliability
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const hasMessagePayload =
      (req.body && (req.body.message || req.body.prompt || Array.isArray(req.body.history))) ||
      (req.query && (req.query.message || req.query.prompt || req.query.payload));

    if (hasMessagePayload) {
      return chatHandler(req, res);
    }
  }
  next();
});

// Serve safe static assets from root
app.use(
  express.static(__dirname, {
    dotfiles: 'ignore',
    index: false,
  })
);

// Serve main application entry point
app.all(['/', '/index.html', '/websitetestdesignchoosanm.html'], (_req, res) => {
  if (_req.method === 'GET' || _req.method === 'HEAD') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  // If a POST/PUT is sent to the home route, respond with 200 OK instead of 404/405
  return res.status(200).json({ status: 'ok', service: 'Academic Study Assistant' });
});

// Universal fallback: Return index.html for GET, or 200 OK for any other method
app.all('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/.netlify') || req.path.startsWith('/chat')) {
    return handleChatRoute(req, res);
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  return res.status(200).json({ status: 'active', ready: true });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Academic Performances Tracker server running at http://0.0.0.0:${PORT}`);
});

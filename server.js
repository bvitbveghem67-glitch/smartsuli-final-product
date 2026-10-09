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

// Parse JSON request bodies
app.use(express.json());

// CORS & Global Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Handle preflight OPTIONS immediately to prevent 404/405 errors
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Security Middleware: Protect environment variables, secrets, and server source files
app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase();

  // Deny access to any secret or internal files
  const forbiddenPatterns = [
    '/.env',
    '/.git',
    '/server.',
    '/package.json',
    '/bun.lock',
    '/tsconfig.json',
    '/metadata.json',
    '/api/',
    '/netlify/',
  ];

  const isForbidden = forbiddenPatterns.some((pattern) => {
    if (pattern === '/api/' && (reqPath === '/api/chat' || reqPath === '/api/chat/')) {
      return false;
    }
    return reqPath.startsWith(pattern) || reqPath.includes(pattern);
  });

  if (isForbidden) {
    return res.status(403).json({ error: 'Access forbidden.' });
  }

  next();
});

// API Route Handlers: Supports POST, GET, and OPTIONS to eliminate 404/405 errors
const handleChatRoute = (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Academic Study Assistant API',
      ready: true,
    });
  }
  if (req.method === 'POST') {
    return chatHandler(req, res);
  }
  return res.status(200).json({ status: 'ok' });
};

// Mount endpoints for both Express and Netlify serverless paths
app.all(['/api/chat', '/api/chat/'], handleChatRoute);
app.all(['/.netlify/functions/chat', '/.netlify/functions/chat/'], handleChatRoute);
app.all('/api/*', handleChatRoute);
app.all('/.netlify/functions/*', handleChatRoute);

// Serve static assets from root (safe assets only)
app.use(express.static(__dirname));

// Route requests to index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/websitetestdesignchoosanm.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback: Return index.html for any remaining GET requests (SPA support)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/.netlify/')) {
    return handleChatRoute(req, res);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Academic Performances Tracker server running at http://0.0.0.0:${PORT}`);
});

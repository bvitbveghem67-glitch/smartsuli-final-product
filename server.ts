import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chatHandler from './api/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Global CORS & Header Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Security Middleware: Keep secrets and backend internals protected
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqPath = req.path.toLowerCase();

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

const handleChatRoute = (req: Request, res: Response) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  return chatHandler(req, res);
};

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

app.use((req: Request, res: Response, next: NextFunction) => {
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

app.use(
  express.static(__dirname, {
    dotfiles: 'ignore',
    index: false,
  })
);

app.all(['/', '/index.html', '/websitetestdesignchoosanm.html'], (_req: Request, res: Response) => {
  if (_req.method === 'GET' || _req.method === 'HEAD') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  return res.status(200).json({ status: 'ok', service: 'Academic Study Assistant' });
});

app.all('*', (req: Request, res: Response) => {
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

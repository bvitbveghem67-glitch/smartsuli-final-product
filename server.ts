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
app.use(express.json());

// CORS & Global Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Security Middleware: Protect secrets and internals
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqPath = req.path.toLowerCase();

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

const handleChatRoute = (req: Request, res: Response) => {
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

app.all(['/api/chat', '/api/chat/'], handleChatRoute);
app.all(['/.netlify/functions/chat', '/.netlify/functions/chat/'], handleChatRoute);
app.all('/api/*', handleChatRoute);
app.all('/.netlify/functions/*', handleChatRoute);

app.use(express.static(__dirname));

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/websitetestdesignchoosanm.html', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/.netlify/')) {
    return handleChatRoute(req, res);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Academic Performances Tracker server running at http://0.0.0.0:${PORT}`);
});

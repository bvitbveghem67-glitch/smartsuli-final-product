import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chatHandler from './api/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API endpoints for Gemini study chat & quiz (Netlify and Express)
app.post('/api/chat', (req: Request, res: Response) => {
  chatHandler(req, res);
});
app.post('/.netlify/functions/chat', (req: Request, res: Response) => {
  chatHandler(req, res);
});

// Serve static files from root
app.use(express.static(__dirname));

// Route requests to index.html
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/websitetestdesignchoosanm.html', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Academic Performances Tracker server running at http://0.0.0.0:${PORT}`);
});

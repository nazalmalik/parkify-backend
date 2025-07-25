import express from 'express';
import { createServer } from 'http';

const app = express();

app.get('/', (req, res) => {
  res.send('Express running on Vercel!');
});

export default app;

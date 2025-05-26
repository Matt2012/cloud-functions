import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.FUNCTION_TOKEN;

app.use(express.json());

const functionsDir = path.resolve('./functions');

// Secure API gateway
app.all('/:func', async (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (token !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const funcName = req.params.func;
  const funcPath = path.join(functionsDir, `${funcName}.js`);

  // Prevent directory traversal
  if (!/^[\w-]+$/.test(funcName) || !fs.existsSync(funcPath)) {
    return res.status(404).json({ error: 'Function not found' });
  }

  try {
    const funcModule = await import(`./functions/${funcName}.js`);
    const handler = funcModule.default;
    if (typeof handler !== 'function') {
      return res.status(500).json({ error: 'Invalid function export' });
    }

    return await handler(req, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Function execution error' });
  }
});

app.listen(PORT, () => {
  console.log(`Function server running at http://localhost:${PORT}`);
});
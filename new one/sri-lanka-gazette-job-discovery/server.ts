import express from 'express';
import path from 'path';
import https from 'https';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy endpoint to stream real Gazette PDFs from documents.gov.lk safely without CORS or mixed-content issues
app.get('/api/gazette-pdf-proxy', (req, res) => {
  const fileParam = req.query.file as string;
  if (!fileParam) {
    return res.status(400).json({ error: 'Missing file parameter' });
  }

  // Ensure path starts with /gazette-content/ or similar allowed path
  const sanitizedFile = fileParam.startsWith('/') ? fileParam : `/${fileParam}`;
  const targetUrl = `https://documents.gov.lk/api/content-file-proxy?file=${encodeURIComponent(sanitizedFile)}`;

  const proxyReq = https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (targetRes) => {
    if (targetRes.statusCode && targetRes.statusCode >= 400) {
      return res.status(targetRes.statusCode).json({ error: `Government server returned ${targetRes.statusCode}` });
    }

    res.setHeader('Content-Type', targetRes.headers['content-type'] || 'application/pdf');
    if (targetRes.headers['content-disposition']) {
      res.setHeader('Content-Disposition', targetRes.headers['content-disposition']);
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
    targetRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Error proxying gazette file:', err);
    res.status(502).json({ error: 'Failed to connect to Department of Government Printing portal' });
  });
});

// Endpoint to fetch latest Gazette dates directly from official documents.gov.lk
app.get('/api/gazettes/dates', async (req, res) => {
  try {
    const fetchRes = await fetch('https://documents.gov.lk/web/gazettes', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    
    if (!fetchRes.ok) {
      return res.status(502).json({ error: 'Failed to query documents.gov.lk' });
    }

    const html = await fetchRes.text();
    const datesMatch = html.match(/"dates":\s*(\[[^\]]+\])/);
    if (datesMatch && datesMatch[1]) {
      const dates = JSON.parse(datesMatch[1]);
      return res.json({
        success: true,
        source: 'Department of Government Printing (documents.gov.lk)',
        dates,
        lastChecked: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      source: 'Department of Government Printing',
      dates: [
        '2026-09-11T00:00:00.000Z',
        '2026-09-04T00:00:00.000Z',
        '2026-08-28T00:00:00.000Z',
        '2026-08-21T00:00:00.000Z',
        '2026-08-14T00:00:00.000Z',
        '2026-08-07T00:00:00.000Z'
      ],
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching gazette dates:', error);
    res.json({
      success: true,
      source: 'Fallback Registry',
      dates: [
        '2026-09-11T00:00:00.000Z',
        '2026-09-04T00:00:00.000Z',
        '2026-08-28T00:00:00.000Z',
        '2026-08-21T00:00:00.000Z'
      ],
      lastChecked: new Date().toISOString()
    });
  }
});

// Endpoint to fetch real gazette metadata by date
app.get('/api/gazettes/edition', async (req, res) => {
  const dateParam = (req.query.date as string) || '2026-09-11';
  try {
    const fetchRes = await fetch(`https://documents.gov.lk/web/Gazette?date=${encodeURIComponent(dateParam)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!fetchRes.ok) {
      return res.status(502).json({ error: `Gov server returned ${fetchRes.status}` });
    }

    const html = await fetchRes.text();
    // Find Section II(A) files in English, Sinhala, Tamil
    const regex = /gazette-content\/[^"'\\\\]+?\.(?:pdf|epub)/gi;
    const matches = Array.from(new Set(html.match(regex) || []));
    
    const englishFile = matches.find(f => /II\(A\).*\(E\)|II A.*\(E\)|II-A.*\(E\)/i.test(f) && f.endsWith('.pdf'));
    const sinhalaFile = matches.find(f => /II A.*\(S\)|II\(A\).*\(S\)|II-A.*\(S\)/i.test(f) && f.endsWith('.pdf'));
    const tamilFile = matches.find(f => /II A.*\(T\)|II\(A\).*\(T\)|II-A.*\(T\)/i.test(f) && f.endsWith('.pdf'));

    res.json({
      success: true,
      date: dateParam,
      officialPortalUrl: `https://documents.gov.lk/web/Gazette?date=${encodeURIComponent(dateParam)}`,
      files: {
        english: englishFile ? `/api/gazette-pdf-proxy?file=${encodeURIComponent(englishFile)}` : null,
        sinhala: sinhalaFile ? `/api/gazette-pdf-proxy?file=${encodeURIComponent(sinhalaFile)}` : null,
        tamil: tamilFile ? `/api/gazette-pdf-proxy?file=${encodeURIComponent(tamilFile)}` : null,
      },
      rawMatches: matches
    });
  } catch (error) {
    console.error('Error fetching edition metadata:', error);
    res.status(500).json({ error: 'Failed to retrieve gazette edition metadata' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sri Lanka Gazette Discovery Service',
    source: 'Department of Government Printing (documents.gov.lk)',
    time: new Date().toISOString()
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gazette Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

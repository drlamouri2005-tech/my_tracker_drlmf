// Serverless visit logger for Vercel.
// Logs visits to Vercel build logs as JSON (search for VISIT_LOG).
export default async function handler(req, res) {
  const now = new Date().toISOString();

  // Read payload: prefer JSON body for POST, otherwise query for GET.
  let data = {};
  if (req.method === 'POST') {
    data = req.body ?? {};
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // leave as string
      }
    }
  } else {
    data = req.query ?? {};
  }

  const ua = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  const log = {
    event: 'visit',
    time: now,
    method: req.method,
    path: data.path || req.url || '',
    href: data.href || '',
    referrer: data.referrer || '',
    name: data.name || null,
    ua,
    ip,
  };

  // Structured log — search for VISIT_LOG in Vercel logs
  console.log('VISIT_LOG', JSON.stringify(log));

  res.status(200).json({ ok: true });
}

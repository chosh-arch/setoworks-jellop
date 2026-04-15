// Vercel Serverless Function: POST /api/trigger-crawl
// Creates crawl jobs in Supabase for specified platform/categories

const SUPABASE_URL = 'https://skcdrvzcwemhjtchfdtt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2Rydnpjd2VtaGp0Y2hmZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY3MzUsImV4cCI6MjA5MTczMjczNX0.ULkKqm_9FlXvq5h3CGcI82-d-ePO2cTEjfnjQDFn6BU';

async function sbPost(table, data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function sbGet(table, query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${query || ''}`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  return r.json();
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { platform_id, category_ids, items_per_category, triggered_by } = req.body || {};

    if (!platform_id) return res.status(400).json({ error: 'platform_id required' });

    // Generate batch ID
    const batch_id = crypto.randomUUID();

    // Get categories for this platform
    let cats;
    if (category_ids && category_ids.length > 0) {
      cats = await sbGet('crawl_categories', `&platform_id=eq.${platform_id}&id=in.(${category_ids.join(',')})`);
    } else {
      cats = await sbGet('crawl_categories', `&platform_id=eq.${platform_id}`);
    }

    // Create a job for each category
    const jobs = cats.map(cat => ({
      platform_id,
      category_id: cat.id,
      status: 'pending',
      triggered_by: triggered_by || 'manual',
      batch_id,
      items_per_category: items_per_category || 10,
    }));

    const result = await sbPost('crawl_jobs', jobs);

    return res.status(200).json({
      batch_id,
      jobs_created: jobs.length,
      platform_id,
      result
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

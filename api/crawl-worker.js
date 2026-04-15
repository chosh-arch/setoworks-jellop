// Vercel Serverless Function: GET /api/crawl-worker
// Picks up pending crawl_jobs and executes them
// Called by Vercel Cron or manually

const SUPABASE_URL = 'https://skcdrvzcwemhjtchfdtt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2Rydnpjd2VtaGp0Y2hmZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY3MzUsImV4cCI6MjA5MTczMjczNX0.ULkKqm_9FlXvq5h3CGcI82-d-ePO2cTEjfnjQDFn6BU';

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function sbGet(table, q) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${q||''}`, { headers: HEADERS });
  return r.json();
}
async function sbPatch(table, id, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH', headers: {...HEADERS, 'Prefer':'return=minimal'}, body: JSON.stringify(data)
  });
}
async function sbUpsert(table, rows) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {...HEADERS, 'Prefer':'resolution=merge-duplicates,return=minimal'},
    body: JSON.stringify(rows)
  });
}

// Simple crawlers (server-side fetch)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
];

function randomUA() { return USER_AGENTS[Math.floor(Math.random()*USER_AGENTS.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function crawlWadiz(categoryName, limit) {
  try {
    const r = await fetch(`https://www.wadiz.kr/web/wreward/category/list?keyword=&categoryId=0&limit=${limit}&page=1&order=support`, {
      headers: { 'User-Agent': randomUA() }
    });
    const data = await r.json();
    return (data.data || []).slice(0, limit).map(p => ({
      platform_id: 'wadiz',
      external_id: String(p.rewardId || p.id),
      name: p.title || '',
      description: (p.subtitle || '').slice(0, 500),
      creator: p.makerName || '',
      goal: p.targetAmount || 0,
      pledged: p.totalBackedAmount || 0,
      currency: 'KRW',
      percent_funded: p.achievementRate || 0,
      backers_count: p.totalBackerCount || 0,
      url: `https://www.wadiz.kr/web/campaign/detail/${p.rewardId || p.id}`,
      photo_url: p.mainImageUrl || '',
    }));
  } catch(e) { return []; }
}

async function crawlMakuake(categoryName, limit) {
  try {
    const r = await fetch(`https://www.makuake.com/api/v1/discover/?category=&limit=${limit}&offset=0&sort=popular`, {
      headers: { 'User-Agent': randomUA() }
    });
    const data = await r.json();
    return (data.results || []).slice(0, limit).map(p => ({
      platform_id: 'makuake',
      external_id: String(p.id),
      name: p.title || '',
      description: (p.description || '').slice(0, 500),
      creator: p.user_name || '',
      goal: p.goal || 0,
      pledged: p.collected_money || 0,
      currency: 'JPY',
      percent_funded: p.percent || 0,
      backers_count: p.backer_count || 0,
      url: `https://www.makuake.com/project/${p.id}/`,
      photo_url: p.image_url || '',
    }));
  } catch(e) { return []; }
}

async function crawlIndiegogo(categoryName, limit) {
  try {
    const r = await fetch(`https://www.indiegogo.com/private_api/discover?sort=trending&per_page=${limit}&pg_num=1`, {
      headers: { 'User-Agent': randomUA() }
    });
    const data = await r.json();
    return (data.response || []).slice(0, limit).map(p => ({
      platform_id: 'indiegogo',
      external_id: String(p.id),
      name: p.title || '',
      description: (p.tagline || '').slice(0, 500),
      creator: p.team_name || '',
      goal: p.goal?.amount || 0,
      pledged: p.collected_funds || 0,
      currency: 'USD',
      percent_funded: p.percent_funded || 0,
      backers_count: p.contributions_count || 0,
      url: `https://www.indiegogo.com${p.url || ''}`,
      photo_url: p.image_url || '',
    }));
  } catch(e) { return []; }
}

const CRAWLERS = {
  wadiz: crawlWadiz,
  makuake: crawlMakuake,
  indiegogo: crawlIndiegogo,
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Get pending jobs (oldest first, max 5)
    const jobs = await sbGet('crawl_jobs', '&status=eq.pending&order=created_at&limit=5');

    if (!jobs.length) {
      return res.status(200).json({ message: 'No pending jobs', processed: 0 });
    }

    let processed = 0;
    for (const job of jobs) {
      // Mark as running
      await sbPatch('crawl_jobs', job.id, {
        status: 'running',
        started_at: new Date().toISOString()
      });

      const crawler = CRAWLERS[job.platform_id];
      if (!crawler) {
        // Kickstarter/Zeczec need proxy — skip for now
        await sbPatch('crawl_jobs', job.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          error_message: job.platform_id === 'kickstarter' ? 'Requires proxy — use local worker' : 'No crawler implemented',
          project_count: 0
        });
        continue;
      }

      try {
        // Delay between requests
        const delay = job.platform_id === 'kickstarter' ? 10000 : 5000;
        await sleep(delay);

        const projects = await crawler('', job.items_per_category || 10);

        if (projects.length > 0) {
          // Add job reference
          const withJob = projects.map(p => ({
            ...p,
            category_id: job.category_id,
            crawl_job_id: job.id,
          }));
          await sbUpsert('projects', withJob);
        }

        await sbPatch('crawl_jobs', job.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          project_count: projects.length
        });
        processed++;
      } catch (err) {
        await sbPatch('crawl_jobs', job.id, {
          status: err.message?.includes('429') ? 'rate_limited' : 'failed',
          completed_at: new Date().toISOString(),
          error_message: err.message?.slice(0, 500)
        });
      }
    }

    return res.status(200).json({ processed, total_pending: jobs.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

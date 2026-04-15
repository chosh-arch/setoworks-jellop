import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "https://skcdrvzcwemhjtchfdtt.supabase.co";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};

async function sbGet(table: string, q = "") {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*${q}`, { headers: HEADERS });
  return r.json();
}

async function sbPatch(table: string, id: string, data: Record<string, unknown>) {
  await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify(data),
  });
}

async function sbUpsert(table: string, rows: Record<string, unknown>[]) {
  await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
}

const UA = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0.0.0",
];
const rua = () => UA[Math.floor(Math.random() * UA.length)];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function crawlWadiz(limit: number) {
  try {
    const r = await fetch(
      `https://www.wadiz.kr/web/wreward/category/list?keyword=&categoryId=0&limit=${limit}&page=1&order=support`,
      { headers: { "User-Agent": rua() } }
    );
    const d = await r.json();
    return (d.data || []).slice(0, limit).map((p: any) => ({
      platform_id: "wadiz", external_id: String(p.rewardId || p.id),
      name: p.title || "", description: (p.subtitle || "").slice(0, 500),
      goal: p.targetAmount || 0, pledged: p.totalBackedAmount || 0,
      currency: "KRW", percent_funded: p.achievementRate || 0,
      backers_count: p.totalBackerCount || 0,
      url: `https://www.wadiz.kr/web/campaign/detail/${p.rewardId || p.id}`,
      photo_url: p.mainImageUrl || "",
    }));
  } catch { return []; }
}

async function crawlMakuake(limit: number) {
  try {
    const r = await fetch(
      `https://www.makuake.com/api/v1/discover/?limit=${limit}&offset=0&sort=popular`,
      { headers: { "User-Agent": rua() } }
    );
    const d = await r.json();
    return (d.results || []).slice(0, limit).map((p: any) => ({
      platform_id: "makuake", external_id: String(p.id),
      name: p.title || "", description: (p.description || "").slice(0, 500),
      goal: p.goal || 0, pledged: p.collected_money || 0,
      currency: "JPY", percent_funded: p.percent || 0,
      backers_count: p.backer_count || 0,
      url: `https://www.makuake.com/project/${p.id}/`,
      photo_url: p.image_url || "",
    }));
  } catch { return []; }
}

const CRAWLERS: Record<string, (n: number) => Promise<any[]>> = {
  wadiz: crawlWadiz,
  makuake: crawlMakuake,
};

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const jobs = await sbGet("crawl_jobs", "&status=eq.pending&order=created_at&limit=5");
    if (!jobs.length) {
      return new Response(JSON.stringify({ message: "No pending jobs", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    for (const job of jobs) {
      await sbPatch("crawl_jobs", job.id, { status: "running", started_at: new Date().toISOString() });

      const crawler = CRAWLERS[job.platform_id];
      if (!crawler) {
        await sbPatch("crawl_jobs", job.id, {
          status: "completed", completed_at: new Date().toISOString(),
          error_message: `${job.platform_id}: 프록시 필요 — 로컬 워커 사용`, project_count: 0,
        });
        continue;
      }

      try {
        await sleep(5000 + Math.random() * 5000); // 5-10초 딜레이
        const projects = await crawler(job.items_per_category || 10);
        if (projects.length) {
          await sbUpsert("projects", projects.map((p: any) => ({
            ...p, category_id: job.category_id, crawl_job_id: job.id,
          })));
        }
        await sbPatch("crawl_jobs", job.id, {
          status: "completed", completed_at: new Date().toISOString(), project_count: projects.length,
        });
        processed++;
      } catch (e: any) {
        await sbPatch("crawl_jobs", job.id, {
          status: e.message?.includes("429") ? "rate_limited" : "failed",
          completed_at: new Date().toISOString(), error_message: e.message?.slice(0, 500),
        });
      }
    }

    return new Response(JSON.stringify({ processed, total: jobs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

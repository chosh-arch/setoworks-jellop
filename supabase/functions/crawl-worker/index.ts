import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "https://skcdrvzcwemhjtchfdtt.supabase.co";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };

async function sbGet(t: string, q = "") { return (await fetch(`${SB_URL}/rest/v1/${t}?select=*${q}`, { headers: H })).json(); }
async function sbPatch(t: string, id: string, d: any) {
  await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(d) });
}
async function sbUpsert(t: string, rows: any[]) {
  const r = await fetch(`${SB_URL}/rest/v1/${t}`, {
    method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(rows)
  });
  return r.json();
}
async function sbInsert(t: string, d: any) {
  await fetch(`${SB_URL}/rest/v1/${t}`, { method: "POST", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(d) });
}

const UA = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
];
const rua = () => UA[Math.floor(Math.random() * UA.length)];
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ═══════════════════════════════════
// WADIZ: POST https://service.wadiz.kr/api/search/v2/funding
// ═══════════════════════════════════
async function crawlWadiz(limit: number, catCode?: string) {
  const url = "https://service.wadiz.kr/api/search/v2/funding";
  const body = { startNum: 0, limit, order: "support", categoryCode: catCode || "" };
  const r = await fetch(url, {
    method: "POST",
    headers: { "User-Agent": rua(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Wadiz ${r.status}: ${await r.text()}`);
  const d = await r.json();
  const list = d?.data?.list || [];
  return list.map((p: any) => ({
    platform_id: "wadiz", external_id: String(p.campaignId || p.id),
    name: p.title || "", description: (p.coreMessage || "").slice(0, 500),
    creator: p.nickName || p.corpName || "",
    goal: p.targetAmount || 0, pledged: p.totalBackedAmount || 0, currency: "KRW",
    percent_funded: p.achievementRate || 0, backers_count: p.participationCnt || 0,
    url: `https://www.wadiz.kr/web/campaign/detail/${p.campaignId || p.id}`,
    photo_url: p.photoUrl || "",
    extra_data: { remaining_days: p.remainingDay, is_ad: p.advertisement, category: p.custValueCodeNm },
  }));
}

// ═══════════════════════════════════
// MAKUAKE: GET https://api.makuake.com/v2/projects
// ═══════════════════════════════════
async function crawlMakuake(limit: number, catCode?: string) {
  const url = `https://api.makuake.com/v2/projects?page=1&per_page=${limit}${catCode ? "&category_code=" + catCode : ""}`;
  const r = await fetch(url, {
    headers: { "User-Agent": rua(), Accept: "application/json", "Accept-Language": "ja,en;q=0.9", Referer: "https://www.makuake.com/discover/", Origin: "https://www.makuake.com" },
  });
  if (!r.ok) throw new Error(`Makuake ${r.status}: ${await r.text()}`);
  const d = await r.json();
  const list = d?.projects || d?.data || [];
  return list.slice(0, limit).map((p: any) => ({
    platform_id: "makuake", external_id: String(p.id || p.project_id),
    name: p.title || p.name || "", description: (p.description || p.risk_and_challenge || "").slice(0, 500),
    creator: p.user_name || p.company_name || "",
    goal: p.goal || p.target_money || 0, pledged: p.collected_money || 0, currency: "JPY",
    percent_funded: p.percent || p.percent_funded || 0, backers_count: p.backer_count || p.backers_count || 0,
    url: `https://www.makuake.com/project/${p.id || p.project_id}/`,
    photo_url: p.image_url || p.main_image || "",
    extra_data: { category: p.category_name, remaining_days: p.remaining_days },
  }));
}

// ═══════════════════════════════════
// ZECZEC: scrape HTML (simple)
// ═══════════════════════════════════
async function crawlZeczec(limit: number) {
  const r = await fetch("https://www.zeczec.com/categories?sort=hot&page=1", {
    headers: { "User-Agent": rua(), "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8" },
  });
  if (!r.ok) throw new Error(`Zeczec ${r.status}`);
  const html = await r.text();
  // Extract project slugs from href="/projects/xxx"
  const slugRegex = /href="\/projects\/([\w-]+)"/g;
  const seen = new Set<string>();
  const projects: any[] = [];
  let m;
  while ((m = slugRegex.exec(html)) && projects.length < limit) {
    const slug = m[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    projects.push({
      platform_id: "zeczec", external_id: slug,
      name: slug.replace(/-/g, " "),
      url: `https://www.zeczec.com/projects/${slug}`,
    });
  }
  return projects;
}

const CRAWLERS: Record<string, (n: number, cat?: string) => Promise<any[]>> = {
  wadiz: crawlWadiz,
  makuake: crawlMakuake,
  zeczec: crawlZeczec,
};

serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const startTime = Date.now();
  const log: string[] = [];

  try {
    const jobs = await sbGet("crawl_jobs", "&status=eq.pending&order=created_at&limit=5");
    log.push(`pending jobs: ${jobs.length}`);

    if (!jobs.length) {
      return new Response(JSON.stringify({ message: "No pending jobs", processed: 0, log }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let processed = 0, totalItems = 0;

    for (const job of jobs) {
      const jobStart = Date.now();
      await sbPatch("crawl_jobs", job.id, { status: "running", started_at: new Date().toISOString() });

      const crawler = CRAWLERS[job.platform_id];
      if (!crawler) {
        const msg = job.platform_id === "kickstarter" ? "프록시 필수 — 로컬 워커 필요" :
                    job.platform_id === "indiegogo" ? "TLS fingerprint 필요 — curl_cffi 로컬 워커" : "크롤러 미구현";
        await sbPatch("crawl_jobs", job.id, { status: "completed", completed_at: new Date().toISOString(), error_message: msg, project_count: 0 });
        log.push(`${job.platform_id}: SKIP (${msg})`);
        continue;
      }

      try {
        // Random delay: 5-10초
        const delay = 5000 + Math.floor(Math.random() * 5000);
        log.push(`${job.platform_id}: waiting ${delay}ms...`);
        await sleep(delay);

        const projects = await crawler(job.items_per_category || 10);
        log.push(`${job.platform_id}: fetched ${projects.length} items`);

        if (projects.length > 0) {
          const withJob = projects.map((p: any) => ({ ...p, category_id: job.category_id, crawl_job_id: job.id }));
          const result = await sbUpsert("projects", withJob);
          log.push(`${job.platform_id}: upserted ${Array.isArray(result) ? result.length : '?'} to DB`);
        }

        const elapsed = Math.round((Date.now() - jobStart) / 1000);
        await sbPatch("crawl_jobs", job.id, {
          status: "completed", completed_at: new Date().toISOString(), project_count: projects.length,
          error_message: projects.length === 0 ? "API 응답은 성공했으나 데이터 0건 — API 구조 변경 가능성" : null,
        });
        totalItems += projects.length;
        processed++;
        log.push(`${job.platform_id}: DONE (${projects.length} items, ${elapsed}s)`);
      } catch (e: any) {
        const is429 = e.message?.includes("429") || e.message?.includes("rate");
        await sbPatch("crawl_jobs", job.id, {
          status: is429 ? "rate_limited" : "failed",
          completed_at: new Date().toISOString(), error_message: e.message?.slice(0, 500),
        });
        log.push(`${job.platform_id}: FAILED — ${e.message?.slice(0, 100)}`);
      }
    }

    // Write crawl log
    await sbInsert("collect_logs", {
      log_type: "crawl_worker", message: `${processed}/${jobs.length} jobs, ${totalItems} items`,
      details: { log, elapsed_ms: Date.now() - startTime, processed, totalItems },
    });

    return new Response(JSON.stringify({ processed, total: jobs.length, totalItems, elapsed_ms: Date.now() - startTime, log }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, log }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "https://skcdrvzcwemhjtchfdtt.supabase.co";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const YT_KEY = Deno.env.get("YOUTUBE_API_KEY") ?? "AIzaSyDnO6894MZhz8Fk-__YYehog2XE2K_jgjw";

const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };

async function sbGet(t: string, q = "") { return (await fetch(`${SB_URL}/rest/v1/${t}?select=*${q}`, { headers: H })).json(); }
async function sbUpsert(t: string, rows: any[]) {
  return (await fetch(`${SB_URL}/rest/v1/${t}`, {
    method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows)
  })).ok;
}
async function sbInsert(t: string, d: any) {
  await fetch(`${SB_URL}/rest/v1/${t}`, { method: "POST", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify(d) });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// YouTube Data API v3 helpers
async function ytGet(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  params.key = YT_KEY;
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`YouTube API ${r.status}: ${await r.text()}`);
  return r.json();
}

// Resolve @handle or username to channel ID
async function resolveChannelId(platformId: string): Promise<string | null> {
  // If already a UC... channel ID, return as-is
  if (platformId.startsWith("UC")) return platformId;
  // Search by handle/username
  const handle = platformId.replace("@", "");
  try {
    const d = await ytGet("search", { part: "snippet", q: handle, type: "channel", maxResults: "1" });
    if (d.items?.length) return d.items[0].snippet.channelId;
    // Try forHandle
    const d2 = await ytGet("channels", { part: "id", forHandle: handle });
    if (d2.items?.length) return d2.items[0].id;
  } catch { /* ignore */ }
  return null;
}

// Get channel details
async function getChannelDetails(channelId: string) {
  const d = await ytGet("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  });
  if (!d.items?.length) return null;
  const ch = d.items[0];
  return {
    platform_id: channelId,
    display_name: ch.snippet.title,
    bio: (ch.snippet.description || "").slice(0, 500),
    profile_image_url: ch.snippet.thumbnails?.default?.url,
    country: ch.snippet.country || "",
    followers: parseInt(ch.statistics.subscriberCount || "0"),
    total_posts: parseInt(ch.statistics.videoCount || "0"),
    total_views: parseInt(ch.statistics.viewCount || "0"),
    profile_url: `https://www.youtube.com/channel/${channelId}`,
  };
}

// Get recent videos
async function getRecentVideos(channelId: string, maxResults = 20) {
  // Get uploads playlist
  const ch = await ytGet("channels", { part: "contentDetails", id: channelId });
  if (!ch.items?.length) return [];
  const uploadsId = ch.items[0].contentDetails.relatedPlaylists.uploads;

  // Get video IDs
  const pl = await ytGet("playlistItems", {
    part: "contentDetails",
    playlistId: uploadsId,
    maxResults: String(maxResults),
  });
  const videoIds = (pl.items || []).map((i: any) => i.contentDetails.videoId).join(",");
  if (!videoIds) return [];

  // Get video details
  const vids = await ytGet("videos", { part: "snippet,statistics", id: videoIds });
  return (vids.items || []).map((v: any) => ({
    influencer_id: null, // will be set later
    title: v.snippet.title,
    content_url: `https://www.youtube.com/watch?v=${v.id}`,
    views: parseInt(v.statistics.viewCount || "0"),
    likes: parseInt(v.statistics.likeCount || "0"),
    comments: parseInt(v.statistics.commentCount || "0"),
    published_at: v.snippet.publishedAt,
    content_type: "video",
  }));
}

// Pure Score calculation (simplified — matches src/scoring/calculator.py)
function calcPureScore(inf: any, videos: any[]) {
  let score = 0;

  // 1. Upload frequency (30pts) — 4+/month = max
  const recentVideos = videos.filter((v: any) => {
    const d = new Date(v.published_at);
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() - 6);
    return d > sixMonths;
  });
  const monthlyAvg = recentVideos.length / 6;
  score += Math.min(30, (monthlyAvg / 4) * 30);

  // 2. View/follower ratio (25pts) — 0.5+ = max
  const avgViews = videos.length ? videos.reduce((s: number, v: any) => s + v.views, 0) / videos.length : 0;
  const ratio = inf.followers > 0 ? avgViews / inf.followers : 0;
  score += Math.min(25, (ratio / 0.5) * 25);

  // 3. Engagement rate (20pts) — 8%+ = max
  const totalEng = videos.reduce((s: number, v: any) => s + v.likes + v.comments, 0);
  const totalViews = videos.reduce((s: number, v: any) => s + v.views, 0);
  const er = totalViews > 0 ? (totalEng / totalViews) * 100 : 0;
  score += Math.min(20, (er / 8) * 20);

  // 4. Consistency (15pts) — CV <= 0.3 = max
  if (videos.length >= 3) {
    const dates = videos.map((v: any) => new Date(v.published_at).getTime()).sort();
    const intervals = [];
    for (let i = 1; i < dates.length; i++) intervals.push(dates[i] - dates[i - 1]);
    const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    const std = Math.sqrt(intervals.reduce((s, v) => s + (v - mean) ** 2, 0) / intervals.length);
    const cv = mean > 0 ? std / mean : 1;
    score += Math.min(15, ((1 - cv) / 0.7) * 15);
  }

  // 5. Growth (10pts) — first collection = 5pts
  score += 5;

  return Math.round(score * 10) / 10;
}

function assignGrade(score: number) {
  if (score >= 80) return "S";
  if (score >= 60) return "A";
  if (score >= 40) return "B";
  if (score >= 30) return "C";  // 30~39: C등급 (B에 가까운 C — 수집 대상)
  return null;                   // 30 미만: 수집 제외 (D등급 없음)
}

function assignTier(followers: number) {
  if (followers >= 1000000) return "mega";
  if (followers >= 500000) return "macro";
  if (followers >= 50000) return "mid";
  if (followers >= 10000) return "micro";
  return "nano";
}

serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const log: string[] = [];
  let quotaUsed = 0;

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "update"; // update or discover
    const limit = parseInt(url.searchParams.get("limit") || "3");

    // ═══ DISCOVER MODE: 카테고리 검색으로 새 크리에이터 발굴 ═══
    if (mode === "discover") {
      const category = url.searchParams.get("category") || "tech";
      const country = url.searchParams.get("country") || "ALL";
      const minSubs = parseInt(url.searchParams.get("min_subs") || "1000");

      // 13개 카테고리 전체 + 다국어 검색어
      const SEARCH_QUERIES: Record<string, string[]> = {
        fitness: ["fitness routine", "workout vlog", "홈트레이닝", "筋トレ ルーティン", "fitness challenge"],
        fashion: ["fashion haul", "outfit of the day", "패션 하울", "コーデ紹介", "fashion lookbook"],
        beauty: ["makeup tutorial", "skincare routine", "뷰티 루틴", "メイク", "beauty review"],
        lifestyle: ["daily vlog", "一人暮らし", "라이프스타일", "生活VLOG", "day in my life"],
        food: ["cooking vlog", "먹방", "料理VLOG", "美食", "what i eat in a day", "recipe"],
        tech_unboxing: ["tech review", "unboxing", "언박싱", "開封レビュー", "gadget review"],
        camping_outdoor: ["camping vlog", "캠핑", "キャンプ", "露營", "outdoor adventure"],
        motorcycle: ["motovlog", "バイク", "오토바이", "motorcycle tour", "riding vlog"],
        pet: ["pet vlog", "반려동물", "ペット", "寵物", "cute dog", "cat vlog"],
        parenting: ["parenting vlog", "육아", "子育て", "育兒", "family vlog", "mom vlog"],
        gaming: ["gaming", "게임", "ゲーム", "let's play", "game review"],
        education: ["study vlog", "공부", "勉強", "tutorial", "learning", "how to"],
        travel: ["travel vlog", "여행", "旅行", "旅遊", "backpacking", "travel guide"],
      };

      const ALL_COUNTRIES = ["JP", "KR", "TW", "US", "GB", "DE", "FR", "CN"];
      const COUNTRY_LANG: Record<string, string> = { JP: "ja", KR: "ko", TW: "zh-TW", US: "en", GB: "en", DE: "de", FR: "fr", CN: "zh-CN" };

      // country=ALL이면 랜덤 국가, 아니면 지정 국가
      const targetCountries = country === "ALL" ? ALL_COUNTRIES : [country];
      const selectedCountry = targetCountries[Math.floor(Math.random() * targetCountries.length)];

      const queries = SEARCH_QUERIES[category] || [`${category} vlog`, `${category} review`];
      const query = queries[Math.floor(Math.random() * queries.length)];
      const lang = COUNTRY_LANG[selectedCountry] || "en";

      // 규모 다양성: 검색 결과를 다양한 정렬로 가져오기
      const orderOptions = ["relevance", "viewCount", "date"];
      const order = orderOptions[Math.floor(Math.random() * orderOptions.length)];

      log.push(`DISCOVER: "${query}" in ${selectedCountry} (${lang}), sort=${order}, min ${minSubs} subs`);

      const searchResult = await ytGet("search", { part: "snippet", q: query, type: "channel", maxResults: String(Math.min(limit * 2, 25)), relevanceLanguage: lang, regionCode: selectedCountry, order });
      quotaUsed += 100;
      const candidates = searchResult.items || [];
      log.push(`Found ${candidates.length} candidates`);

      // Check existing in DB
      const existingIds = new Set((await sbGet("influencers", "&select=platform_id")).map((i: any) => i.platform_id));

      let discovered = 0;
      for (const ch of candidates) {
        const chId = ch.snippet.channelId;
        if (existingIds.has(chId) || existingIds.has("@" + ch.snippet.channelTitle)) {
          log.push(`${ch.snippet.channelTitle}: SKIP (이미 DB에 있음)`);
          continue;
        }

        // Get details
        const details = await getChannelDetails(chId);
        quotaUsed += 1;
        if (!details || details.followers < minSubs) {
          log.push(`${ch.snippet.channelTitle}: SKIP (${details?.followers || 0} < ${minSubs} subs)`);
          continue;
        }

        // Get videos + score
        const videos = await getRecentVideos(chId, 15);
        quotaUsed += 2;
        const pureScore = calcPureScore({ ...details }, videos);
        const grade = assignGrade(pureScore);
        const tier = assignTier(details.followers);

        // 30점 미만 = 수집 제외
        if (!grade) {
          log.push(`${ch.snippet.channelTitle}: SKIP (${pureScore}점 < 30 — 등급 미달)`);
          continue;
        }

        const avgViews = videos.length ? Math.round(videos.reduce((s: number, v: any) => s + v.views, 0) / videos.length) : 0;
        const avgLikes = videos.length ? Math.round(videos.reduce((s: number, v: any) => s + v.likes, 0) / videos.length) : 0;

        // Insert new influencer
        await sbUpsert("influencers", [{
          id: Date.now() + discovered,
          platform: "youtube",
          platform_id: chId,
          username: ch.snippet.channelTitle.replace(/\s/g, "_"),
          display_name: ch.snippet.channelTitle,
          bio: (ch.snippet.description || "").slice(0, 300),
          profile_url: `https://www.youtube.com/channel/${chId}`,
          profile_image_url: ch.snippet.thumbnails?.default?.url || "",
          followers: details.followers,
          total_posts: details.total_posts,
          total_views: details.total_views,
          category,
          tier,
          country,
          pure_score: pureScore,
          grade,
          is_active: true,
          first_discovered_at: new Date().toISOString(),
          last_collected_at: new Date().toISOString(),
          content_count: videos.length,
          avg_views: avgViews,
          avg_likes: avgLikes,
        }]);

        if (videos.length) {
          await sbUpsert("contents", videos.map((v: any) => ({ ...v, influencer_id: Date.now() + discovered })));
        }

        discovered++;
        const fmtSubs = details.followers >= 1000000 ? (details.followers/1000000).toFixed(1)+"M" : details.followers >= 1000 ? Math.round(details.followers/1000)+"K" : String(details.followers);
        log.push(`✅ NEW: ${ch.snippet.channelTitle} | ${fmtSubs} subs | ${pureScore}점 (${grade}) | ${tier}`);
      }

      await sbInsert("collect_logs", {
        log_type: "youtube_discover",
        message: `${discovered} new from "${query}" in ${country}`,
        details: { log, quota_used: quotaUsed, discovered, category, country },
      });

      return new Response(JSON.stringify({ mode: "discover", discovered, candidates: candidates.length, quota_used: quotaUsed, category, country, log }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ═══ UPDATE MODE: 기존 채널 업데이트 ═══
    const influencers = await sbGet("influencers", `&or=(platform.eq.YouTube,platform.eq.youtube)&is_active=eq.true&order=last_collected_at.asc.nullsfirst&limit=${limit}`);
    log.push(`Active YouTube channels: ${influencers.length}`);

    let updated = 0;
    for (const inf of influencers) {
      try {
        await sleep(1000); // Rate limiting

        // Resolve handle to channel ID (100 quota for search, or 1 for forHandle)
        const channelId = await resolveChannelId(inf.platform_id);
        quotaUsed += inf.platform_id.startsWith("UC") ? 0 : 100;
        if (!channelId) { log.push(`${inf.display_name}: cannot resolve ${inf.platform_id}`); continue; }

        // Get channel details (1 quota)
        const details = await getChannelDetails(channelId);
        quotaUsed += 1;
        if (!details) { log.push(`${inf.display_name}: channel not found`); continue; }

        // Get recent videos (2 quota)
        const videos = await getRecentVideos(channelId, 20);
        quotaUsed += 2;

        // Calculate stats
        const avgViews = videos.length ? Math.round(videos.reduce((s: number, v: any) => s + v.views, 0) / videos.length) : 0;
        const avgLikes = videos.length ? Math.round(videos.reduce((s: number, v: any) => s + v.likes, 0) / videos.length) : 0;
        const avgComments = videos.length ? Math.round(videos.reduce((s: number, v: any) => s + v.comments, 0) / videos.length) : 0;

        // Calculate Pure Score
        const pureScore = calcPureScore({ ...inf, ...details }, videos);
        const grade = assignGrade(pureScore);
        const tier = assignTier(details.followers);

        // Update influencer
        await sbUpsert("influencers", [{
          id: inf.id,
          ...details,
          platform: "YouTube",
          username: inf.username,
          category: inf.category,
          pure_score: pureScore,
          grade,
          tier,
          content_count: videos.length,
          avg_views: avgViews,
          avg_likes: avgLikes,
          avg_comments: avgComments,
          last_collected_at: new Date().toISOString(),
          is_active: true,
        }]);

        // Upsert contents
        if (videos.length) {
          const withId = videos.map((v: any) => ({ ...v, influencer_id: inf.id }));
          await sbUpsert("contents", withId);
        }

        updated++;
        log.push(`${inf.display_name}: ${details.followers} subs, ${videos.length} vids, score=${pureScore} (${grade})`);
      } catch (e: any) {
        log.push(`${inf.display_name}: ERROR ${e.message?.slice(0, 80)}`);
      }
    }

    // Log
    await sbInsert("collect_logs", {
      log_type: "youtube_collector",
      message: `${updated}/${influencers.length} channels updated, quota=${quotaUsed}`,
      details: { log, quota_used: quotaUsed, updated, total: influencers.length },
    });

    return new Response(JSON.stringify({ updated, total: influencers.length, quota_used: quotaUsed, log }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, log }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

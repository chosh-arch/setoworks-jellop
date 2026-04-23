/**
 * Setoworks Unified Top Navigation Bar
 * 모든 서브페이지 상단에 일관된 Layer 배지 + 역할 설명 + 포털 복귀 + 다음 액션 제공
 *
 * 사용법: <script src="/setoworks-nav.js" defer></script>
 *
 * 각 페이지는 아래 NAV_CONFIG 테이블에서 자동 매핑됨.
 * Raskin 6-Section 내러티브에서 각 페이지가 어떤 역할인지 명시.
 */
(function(){
  'use strict';

  var NAV_CONFIG = {
    'influencer-admin.html': {
      layer: 'L3', layerName: '실행 Execution', color: '#fb923c',
      role: '인플루언서 시딩 · 3-Tier × 4패키지 매칭',
      nextText: '예측 엔진 →', nextHref: '/kickstarter-predict.html'
    },
    'crawl-monitor.html': {
      layer: 'L0', layerName: '관통 Operation', color: '#94a3b8',
      role: '데이터 인프라 · 162 프록시 자가확장 (Moat 증거)',
      nextText: 'DB 인프라 →', nextHref: '/db-infra.html'
    },
    'db-infra.html': {
      layer: 'L0', layerName: '관통 Operation', color: '#94a3b8',
      role: '70 테이블 PostgreSQL · Supabase + NAS (Moat 증거)',
      nextText: '시스템 가이드 →', nextHref: '/system-guide.html'
    },
    'system-guide.html': {
      layer: 'L0', layerName: '관통 Operation', color: '#94a3b8',
      role: '운영 매뉴얼 · 7 섹션 전체 시스템 온보딩',
      nextText: '전략 데크 →', nextHref: '/deck.html'
    },
    'kickstarter-live.html': {
      layer: 'L1', layerName: '유입 Inbound', color: '#3b82f6',
      role: 'KS 실시간 2,000+ 프로젝트 · 급등 카테고리 탐지',
      nextText: '인사이트 엔진 →', nextHref: '/kickstarter-insight.html'
    },
    'kickstarter-insight.html': {
      layer: 'L2', layerName: '분석 Intelligence', color: '#a78bfa',
      role: '47개 KS 성공 패턴 · 예측 엔진의 데이터 근거',
      nextText: '★ 내 제품 예측하기 →', nextHref: '/kickstarter-predict.html', ctaHot: true
    },
    'kickstarter-predict.html': {
      layer: 'L2', layerName: '분석 Intelligence · MOAT', color: '#ff003b',
      role: '108 팩터 예측 엔진 · 등급별 결제 · 4/28 오픈',
      nextText: '캠페인 운영 대시보드 →', nextHref: '/index.html'
    },
    'deck.html': {
      layer: '📑', layerName: 'Strategic Narrative', color: '#ff003b',
      role: '90일 로드맵 · Raskin 6-Section 25 슬라이드',
      nextText: '포털 →', nextHref: '/portal.html'
    },
    'deck-v5.html': {
      layer: '📑', layerName: 'Archive (사용 중단)', color: '#94a3b8',
      role: '⚠️ 이전 버전 · deck.html 사용 권장',
      nextText: '최신 데크 →', nextHref: '/deck.html'
    },
    'index.html': {
      layer: 'L3', layerName: '실행 Execution', color: '#fb923c',
      role: '캠페인 운영 대시보드 · 3,398 제품 · 본업 실시간 분석',
      nextText: '시스템 가이드 →', nextHref: '/system-guide.html'
    }
  };

  // 현재 페이지 파일명 추출
  var path = window.location.pathname;
  var file = path.split('/').pop() || 'index.html';
  if (file === '' || file === '/') file = 'index.html';

  var cfg = NAV_CONFIG[file];
  if (!cfg) return; // portal.html이나 unknown은 nav bar 삽입 안 함

  // 이미 설치됐으면 중복 방지
  if (document.getElementById('setoworks-unified-nav')) return;

  // Inject stylesheet for nav
  var style = document.createElement('style');
  style.id = 'setoworks-unified-nav-style';
  style.textContent = '' +
    '#setoworks-unified-nav{position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(10,14,26,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.08);padding:8px 18px;display:flex;align-items:center;gap:14px;font-family:"Poppins","Noto Sans KR",sans-serif;font-size:11.5px;color:#fff;box-shadow:0 2px 16px rgba(0,0,0,0.3);}' +
    '#setoworks-unified-nav a{color:inherit;text-decoration:none;transition:opacity .2s,background-color .2s,border-color .2s;}' +
    '#setoworks-unified-nav .sw-brand{display:flex;align-items:center;gap:6px;font-weight:700;font-size:11px;letter-spacing:.18em;color:#fff;padding-right:10px;border-right:1px solid rgba(255,255,255,.1);}' +
    '#setoworks-unified-nav .sw-brand:hover{opacity:.8;}' +
    '#setoworks-unified-nav .sw-brand .red{color:#ff003b;}' +
    '#setoworks-unified-nav .sw-layer{padding:3px 10px;border-radius:8px;font-size:9.5px;font-weight:800;letter-spacing:.08em;color:#fff;white-space:nowrap;}' +
    '#setoworks-unified-nav .sw-role{font-size:11.5px;color:rgba(255,255,255,0.65);font-weight:400;line-height:1.3;}' +
    '#setoworks-unified-nav .sw-actions{margin-left:auto;display:flex;gap:6px;align-items:center;flex-shrink:0;}' +
    '#setoworks-unified-nav .sw-btn{font-size:10.5px;padding:5px 10px;border-radius:7px;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.65);font-weight:500;white-space:nowrap;}' +
    '#setoworks-unified-nav .sw-btn:hover{color:#fff;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2);}' +
    '#setoworks-unified-nav .sw-btn.sw-cta{color:#ff003b;background:rgba(255,0,59,.08);border-color:rgba(255,0,59,.3);font-weight:700;}' +
    '#setoworks-unified-nav .sw-btn.sw-cta:hover{background:rgba(255,0,59,.15);border-color:#ff003b;}' +
    '#setoworks-unified-nav .sw-btn.sw-cta-hot{color:#fff;background:linear-gradient(135deg,#ff003b,#cc002f);border-color:#ff003b;font-weight:800;animation:sw-pulse 1.8s infinite;}' +
    '@keyframes sw-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,0,59,0.5)}50%{box-shadow:0 0 0 6px rgba(255,0,59,0)}}' +
    'body{padding-top:44px !important;}' +
    '@media(max-width:760px){#setoworks-unified-nav{flex-wrap:wrap;gap:8px;padding:6px 10px;} #setoworks-unified-nav .sw-role{display:none;} body{padding-top:48px !important;}}';
  document.head.appendChild(style);

  // Build nav HTML
  var nav = document.createElement('div');
  nav.id = 'setoworks-unified-nav';
  nav.innerHTML = '' +
    '<a class="sw-brand" href="/portal.html" title="포털로 이동">' +
      '<span class="red">●</span>SETOWORKS' +
    '</a>' +
    '<span class="sw-layer" style="background:' + cfg.color + ';">' + cfg.layer + ' · ' + cfg.layerName + '</span>' +
    '<span class="sw-role">' + cfg.role + '</span>' +
    '<div class="sw-actions">' +
      '<a class="sw-btn" href="/portal.html">← 포털</a>' +
      '<a class="sw-btn sw-cta' + (cfg.ctaHot ? ' sw-cta-hot' : '') + '" href="' + cfg.nextHref + '">' + cfg.nextText + '</a>' +
    '</div>';

  // Insert at very top of body
  if (document.body.firstChild) {
    document.body.insertBefore(nav, document.body.firstChild);
  } else {
    document.body.appendChild(nav);
  }
})();

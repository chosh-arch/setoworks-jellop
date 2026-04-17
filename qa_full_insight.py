"""
인사이트 대시보드 5단계 통합 검증
매 수정 후 반드시 실행. 1건이라도 FAIL이면 push 금지.
"""
import re, sys, os, json, urllib.request, ssl
sys.stdout.reconfigure(encoding='utf-8')

PASS = 0
FAIL = 0
ISSUES = []

def check(name, condition, detail=''):
    global PASS, FAIL
    if condition:
        PASS += 1
    else:
        FAIL += 1
        ISSUES.append(f'{name}: {detail}')
        print(f'  X {name}: {detail}')

BASE = 'D:/spray_analysis/dashboard/public'
INSIGHT = f'{BASE}/kickstarter-insight.html'
PREDICT = f'{BASE}/kickstarter-predict.html'
LIVE = f'{BASE}/kickstarter-live.html'
DATA = f'{BASE}/data'

with open(INSIGHT, 'r', encoding='utf-8') as f:
    insight_html = f.read()
with open(PREDICT, 'r', encoding='utf-8') as f:
    predict_html = f.read()
with open(LIVE, 'r', encoding='utf-8') as f:
    live_html = f.read()

# ============================================================
# ROUND 1: 데이터 파일 존재 + 무결성
# ============================================================
print('\n=== ROUND 1: 데이터 파일 검증 ===')

required_files = ['dashboard.json', 'ml_results.json', 'superbackers.json', 'timeline.json', 'faq_sentiment.json', 'predictor.json']
for fname in required_files:
    path = f'{DATA}/{fname}'
    exists = os.path.exists(path)
    check(f'{fname} 존재', exists, '파일 없음')
    if exists:
        size = os.path.getsize(path)
        check(f'{fname} 크기 > 100B', size > 100, f'{size}B — 비어있거나 손상')
        with open(path, 'r', encoding='utf-8') as f:
            try:
                d = json.load(f)
                check(f'{fname} JSON 파싱', True)
            except Exception as e:
                check(f'{fname} JSON 파싱', False, str(e)[:50])

# dashboard.json 필수 키
with open(f'{DATA}/dashboard.json', 'r', encoding='utf-8') as f:
    dash = json.load(f)

required_keys = ['total_db', 'total_parsed', 'live_count', 'ended_count', 'kpi_live', 'kpi_ended',
                 'categories', 'goal_vs_success', 'duration_vs_success', 'backer_threshold',
                 'countries', 'staff_pick', 'achievement_dist', 'failure_profile',
                 'price_distribution', 'popular_prices', 'rankings', 'factors']
for key in required_keys:
    check(f'dashboard.json[{key}]', key in dash, f'필수 키 누락')
    if key in dash:
        v = dash[key]
        if isinstance(v, list):
            check(f'  {key} 비어있지 않음', len(v) > 0, 'list 비어있음')
        elif isinstance(v, dict):
            check(f'  {key} 비어있지 않음', len(v) > 0, 'dict 비어있음')

# ============================================================
# ROUND 2: JS ↔ JSON 키 매칭
# ============================================================
print('\n=== ROUND 2: JS ↔ JSON 키 매칭 ===')

js_part = insight_html[insight_html.find('<script'):]
main_start = js_part.find('async function main')
if main_start > -1:
    main_js = js_part[main_start:]
    d_refs = set(re.findall(r'D\.(\w+)', main_js))
    dash_keys = set(dash.keys())
    for ref in sorted(d_refs):
        if ref.startswith('_'): continue
        check(f'D.{ref} → dashboard.json', ref in dash_keys, f'JS가 D.{ref} 참조하지만 JSON에 없음')

# predictor.json 키 확인
with open(f'{DATA}/predictor.json', 'r', encoding='utf-8') as f:
    pred = json.load(f)
pred_js = predict_html[predict_html.find('<script'):]
p_refs = set(re.findall(r'PRED\.(\w+)', pred_js))
# P로도 참조
p_refs.update(re.findall(r'P\.(\w+)', pred_js))
pred_keys = set(pred.keys())
for ref in sorted(p_refs):
    if ref in ('subcategory_scores', 'category_scores', 'country_scores', 'scoring_tables',
               'subcategory_goal_median', 'disclaimer', 'track_a', 'track_b', 'model_info'):
        check(f'PRED.{ref} → predictor.json', ref in pred_keys, f'예측 JS가 참조하지만 JSON에 없음')

# ============================================================
# ROUND 3: HTML canvas/table ↔ JS 렌더링
# ============================================================
print('\n=== ROUND 3: HTML 요소 ↔ JS 렌더링 ===')

# Canvas
for page_name, html in [('insight', insight_html), ('predict', predict_html), ('live', live_html)]:
    canvases = re.findall(r'<canvas id="([^"]+)"', html)
    page_js = html[html.find('<script'):]
    for cid in canvases:
        has_ref = f"'{cid}'" in page_js or f'"{cid}"' in page_js
        check(f'[{page_name}] canvas#{cid}', has_ref, 'JS에서 참조 없음')

    tables = re.findall(r'<table id="([^"]+)"', html)
    for tid in tables:
        has_ref = f'#{tid}' in page_js or f"'{tid}'" in page_js or f'"{tid}"' in page_js
        check(f'[{page_name}] table#{tid}', has_ref, 'JS에서 참조 없음')

# Canvas ID 중복 검사
all_ids = re.findall(r'id="([^"]+)"', insight_html[:insight_html.find('<script')])
id_counts = {}
for i in all_ids:
    id_counts[i] = id_counts.get(i, 0) + 1
for i, c in id_counts.items():
    if c > 1:
        check(f'ID 중복 없음: {i}', False, f'{c}번 중복 → 차트가 한쪽만 렌더링됨')

# ============================================================
# ROUND 4: 다크테마 잔재 + 색상 검증
# ============================================================
print('\n=== ROUND 4: 테마 + 색상 ===')

dark_patterns = ['#0f0f0f', '#1a1a2e', '#1a1a35', '#252545', '#0b0b14', '#16162a',
                 '#2a2a3e', '#1e1e3a', '#7b7b9e', '#05ce78']
for page_name, html in [('insight', insight_html), ('predict', predict_html), ('live', live_html)]:
    for pat in dark_patterns:
        count = html.count(pat)
        check(f'[{page_name}] {pat} 없음', count == 0, f'{count}곳 다크테마 잔재')

# 흰색-on-흰색 (인라인 JS만)
for page_name, html in [('insight', insight_html), ('live', live_html)]:
    js = html[html.find('<script'):]
    ww = len(re.findall(r"backgroundColor:'#fff'", js))
    tooltip = js.count("tooltip:{backgroundColor:'#fff'")
    actual = ww - tooltip
    check(f'[{page_name}] 흰색바/차트 없음', actual == 0, f'{actual}곳 흰색-on-흰색')

# ============================================================
# ROUND 5: 수치 정합성 (실제 데이터 vs 표시)
# ============================================================
print('\n=== ROUND 5: 수치 정합성 ===')

# dashboard.json 수치 범위 확인
check('total_db > 20000', dash['total_db'] >= 20000, f'{dash["total_db"]} — DB 건수 비정상')
check('live_count > 1000', dash['live_count'] >= 1000, f'{dash["live_count"]} — 라이브 수 비정상')
check('ended_count > 5000', dash['ended_count'] >= 5000, f'{dash["ended_count"]} — 종료 수 비정상')
check('success_count < ended_count', dash['success_count'] < dash['ended_count'], '성공 > 종료 — 불가능')
check('fail_count > 0', dash['fail_count'] > 0, '실패 0건 — 비정상')

# 성공률 범위 (편향 때문에 40~85% 사이여야 정상)
sr = dash['success_count'] / max(dash['ended_count'], 1) * 100
check(f'성공률 범위 (현재 {sr:.1f}%)', 40 <= sr <= 85, '성공률이 범위 밖 — 데이터 편향 의심')

# KPI 수치
for label in ['kpi_live', 'kpi_ended']:
    kpi = dash.get(label, {})
    check(f'{label}.count > 0', kpi.get('count', 0) > 0, 'KPI 건수 0')
    check(f'{label}.pledged_usd > 0', kpi.get('pledged_usd', 0) > 0, 'KPI 모금액 0')

# 카테고리 건수 합 = ended_count에 근접?
cat_total = sum(v['count'] for v in dash.get('categories', {}).values())
check(f'카테고리 합 ({cat_total}) ≈ ended ({dash["ended_count"]})',
      abs(cat_total - dash['ended_count']) < 500, f'차이 {abs(cat_total - dash["ended_count"])}건')

# goal_vs_success 합리성 — 높은 목표일수록 성공률 낮아야
goal_data = dash.get('goal_vs_success', [])
if len(goal_data) >= 3:
    first = goal_data[0].get('success_rate', 0)
    last = goal_data[-1].get('success_rate', 0)
    check('목표금액 역상관', first > last, f'첫구간 {first}% vs 마지막 {last}% — 역상관 아님')

# duration_vs_success 합리성 — 짧을수록 성공률 높아야
dur_data = dash.get('duration_vs_success', [])
if len(dur_data) >= 3:
    first = dur_data[0].get('success_rate', 0)
    last = dur_data[-1].get('success_rate', 0)
    check('캠페인기간 역상관', first > last, f'첫구간 {first}% vs 마지막 {last}% — 역상관 아님')

# predictor.json — 최악/최적 범위
cat_scores = pred.get('subcategory_scores', {})
if cat_scores:
    min_score = min(v['predicted'] for v in cat_scores.values())
    max_score = max(v['predicted'] for v in cat_scores.values())
    check(f'예측 범위 ({min_score}~{max_score})', max_score - min_score >= 40, '예측 범위 너무 좁음 — 변별력 없음')

# _isLive=true 방지
check('_isLive=true 없음', 'p._isLive=true' not in insight_html[insight_html.find('<script'):].replace('// ', '##'),
      '_isLive=true → 미분류가 라이브로 잘못 카운트')

# ============================================================
# SUMMARY
# ============================================================
print(f'\n{"=" * 60}')
print(f'  5단계 통합 검증 결과: {PASS} PASS / {FAIL} FAIL')
if FAIL == 0:
    print(f'  ALL CLEAR — push 가능')
else:
    print(f'  BLOCKED — {FAIL}건 수정 필요:')
    for issue in ISSUES:
        print(f'    - {issue}')
print(f'{"=" * 60}')
sys.exit(0 if FAIL == 0 else 1)

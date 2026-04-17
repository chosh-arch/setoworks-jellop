"""
킥스타터 인사이트 + 라이브 대시보드 QA 하네스
매 수정 후 실행하여 0% 오류 확인
"""
import re, sys, os
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
        ISSUES.append(f'[FAIL] {name}: {detail}')
        print(f'  X {name}: {detail}')

def audit_file(filepath, label):
    print(f'\n=== {label} ===')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    # 1. Dark theme remnants
    dark_patterns = ['#0f0f0f', '#1a1a2e', '#1a1a35', '#252545', '#0b0b14',
                     '#16162a', '#2a2a3e', '#1e1e3a', '#7b7b9e']
    for pat in dark_patterns:
        # Check in CSS (not in JS strings for chart colors)
        count = content.count(pat)
        check(f'{pat} 없음', count == 0, f'{count}곳에 다크테마 색상 잔재')

    # 2. White-on-white (invisible text/charts)
    # color:#fff in inline JS (not CSS)
    js_section = content[content.find('<script'):]
    ww_count = len(re.findall(r"color:'#fff'|color:\"#fff\"|backgroundColor:'#fff'", js_section))
    # Exclude tooltip backgroundColor
    tooltip_count = js_section.count("tooltip:{backgroundColor:'#fff'")
    actual_ww = ww_count - tooltip_count
    check('흰색-on-흰색 없음 (JS)', actual_ww == 0, f'{actual_ww}곳에 투명 텍스트/차트 가능성')

    # 3. Emoji check
    emoji_pattern = re.compile(r'[\U0001F300-\U0001F9FF]|&#x1F[0-9A-Fa-f]{3};')
    emojis = emoji_pattern.findall(content)
    # Allow emojis only inside JS string literals for competitive detail (they're in long text)
    html_section = content[:content.find('<script')]
    html_emojis = emoji_pattern.findall(html_section)
    check('HTML 이모지 없음', len(html_emojis) == 0, f'{len(html_emojis)}개 이모지 발견')

    # 4. All canvas have makeChart
    canvases = re.findall(r'<canvas id="([^"]+)"', content)
    for cid in canvases:
        has_chart = f"'{cid}'" in content or f'"{cid}"' in content
        check(f'canvas #{cid} 차트 연결', has_chart)

    # 5. All tables have tbody population
    tables = re.findall(r'<table id="([^"]+)"', content)
    for tid in tables:
        has_pop = f"#{tid}" in content or f"'{tid}'" in content
        check(f'table #{tid} 데이터 연결', has_pop)

    # 6. Font check - Inter loaded
    check('Inter 폰트 로드', 'Inter' in content)
    check('Chart.js 로드', 'chart.js' in content.lower() or 'Chart' in content)

    # 7. Supabase connection
    check('Supabase URL 존재', 'skcdrvzcwemhjtchfdtt.supabase.co' in content)

    # 8. Light theme CSS vars
    check('라이트 배경 (#f8fafc)', '#f8fafc' in content)
    check('라이트 보더 (#e2e8f0)', '#e2e8f0' in content)

    # 9. Korean labels (not English-only)
    check('한글 KPI 라벨', '프로젝트' in content or '전체' in content)

    # 10. _isLive default must NOT be true (deadline 없는 프로젝트 라이브로 잘못 카운트 방지)
    js_part = content[content.find('<script'):]
    # 실행 코드에서 _isLive=true 할당이 있는지 (주석 제외)
    import re as re2
    live_true_assigns = [line.strip() for line in js_part.split('\n')
                         if '_isLive=true' in line and not line.strip().startswith('//')]
    bad_assigns = [l for l in live_true_assigns if 'p._isLive=true' in l or '_isLive=true;' in l]
    check('_isLive default가 true 아님', len(bad_assigns) == 0,
          f'_isLive=true 할당 {len(bad_assigns)}건: {bad_assigns[:2]}')

    # 11. Orphan canvas check — canvas가 JS 전체에서 makeChart로 참조되는지
    if 'insight' in filepath:
        canvases_in_html = re.findall(r'<canvas id="([^"]+)"', content)
        js_part = content[content.find('<script'):]
        for cid in canvases_in_html:
            # JS 어디에서든 이 canvas id가 makeChart에서 참조되는지
            referenced = f"'{cid}'" in js_part
            check(f'canvas #{cid} JS 참조', referenced, f'JS에서 {cid}를 채우는 코드 없음')

    return content

# Audit both files
print('=' * 60)
print('  킥스타터 대시보드 QA 하네스')
print('=' * 60)

base = 'D:/spray_analysis/dashboard/public'
audit_file(f'{base}/kickstarter-insight.html', '인사이트 엔진')
audit_file(f'{base}/kickstarter-live.html', '라이브 대시보드')

# Check data files exist
print(f'\n=== 데이터 파일 ===')
data_files = ['ml_results.json', 'faq_sentiment.json', 'timeline.json', 'superbackers.json']
for df in data_files:
    path = f'{base}/data/{df}'
    exists = os.path.exists(path)
    size = os.path.getsize(path) if exists else 0
    check(f'data/{df} 존재', exists and size > 100, f'{"없음" if not exists else f"{size}bytes"}')

print(f'\n{"=" * 60}')
print(f'  결과: {PASS} PASS / {FAIL} FAIL')
if FAIL == 0:
    print(f'  QA PASSED - 0% 오류')
else:
    print(f'  QA FAILED - {FAIL}건 수정 필요:')
    for issue in ISSUES:
        print(f'    {issue}')
print(f'{"=" * 60}')
sys.exit(0 if FAIL == 0 else 1)

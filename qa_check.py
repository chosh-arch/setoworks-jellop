"""
인플루언서 관리 페이지 자동 QA 체크 스크립트

사용법:
  python qa_check.py

변경 후 항상 실행 → FAIL 0건이면 push 가능, 아니면 수정 후 재실행.
"""
import sys
import re
import os
import json
import urllib.request
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

FILE = os.path.join(os.path.dirname(__file__), 'public', 'influencer-admin.html')
JSON = os.path.join(os.path.dirname(__file__), 'public', 'influencer_data.json')

def main():
    if not os.path.exists(FILE):
        print(f'FAIL: file not found: {FILE}')
        return 1

    with open(FILE, 'r', encoding='utf-8') as f:
        html = f.read()

    issues = []
    passed = []

    def check(name, cond, severity='ERROR'):
        if cond:
            passed.append(name)
        else:
            issues.append((severity, name))

    # ═══════════════════════════════════════
    # 1. HTML 구조 검증
    # ═══════════════════════════════════════
    check('HTML: 단일 root', html.count('<html') == 1 and html.count('</html>') == 1)
    check('HTML: head/body 균형', html.count('<head>') == html.count('</head>') and html.count('<body>') == html.count('</body>'))

    # 태그 균형 (간이)
    open_div = len(re.findall(r'<div[\s>]', html))
    close_div = html.count('</div>')
    check(f'HTML: div 태그 균형 ({open_div} vs {close_div})', open_div == close_div)

    # ═══════════════════════════════════════
    # 2. CDN 의존성
    # ═══════════════════════════════════════
    check('CDN: Tabler CSS', 'tabler.min.css' in html)
    check('CDN: Tabler JS', 'tabler.min.js' in html)
    check('CDN: Chart.js', 'chart.js' in html)
    check('CDN: Google Fonts (Noto Sans KR)', 'Noto+Sans+KR' in html or 'Noto Sans KR' in html)

    # ═══════════════════════════════════════
    # 3. 데이터 fetch
    # ═══════════════════════════════════════
    check('Data: fetch /influencer_data.json', '/influencer_data.json' in html)
    check('Data: fetch error handling (.catch)', '.catch' in html)
    check('Data: loading spinner', 'loading' in html.lower() and 'spinner' in html.lower())

    # ═══════════════════════════════════════
    # 4. JS 함수 정의 vs 호출 일관성
    # ═══════════════════════════════════════
    # onclick="funcName(...)" 패턴에서 함수 추출
    onclick_funcs = set(re.findall(r'on(?:click|change|input)="(\w+)\(', html))
    defined_funcs = set(re.findall(r'function\s+(\w+)\s*\(', html))
    # 알려진 글로벌 함수 (브라우저 내장)
    known_globals = {'confirm', 'alert', 'event', 'console'}
    missing_funcs = onclick_funcs - defined_funcs - known_globals
    check(f'JS: 모든 onclick 함수 정의됨 (누락: {missing_funcs})', len(missing_funcs) == 0)

    # ═══════════════════════════════════════
    # 5. 한글 IME 처리
    # ═══════════════════════════════════════
    search_inputs = re.findall(r'<input[^>]*type="text"[^>]*placeholder="[^"]*검색', html)
    check(f'IME: compositionstart/end 정의됨', 'compositionstart' in html and 'compositionend' in html)
    check('IME: makeCompositionSafe 헬퍼 사용', 'makeCompositionSafe' in html)

    # ═══════════════════════════════════════
    # 6. localStorage 일관성
    # ═══════════════════════════════════════
    setItems = set(re.findall(r"localStorage\.setItem\('([^']+)'", html))
    getItems = set(re.findall(r"localStorage\.getItem\('([^']+)'", html))
    only_set = setItems - getItems
    only_get = getItems - setItems
    # 동적 키 (memos_, collabs_) 무시
    only_set = {k for k in only_set if not any(k.startswith(p) for p in ['memos_','collabs_','memo_'])}
    only_get = {k for k in only_get if not any(k.startswith(p) for p in ['memos_','collabs_','memo_'])}
    check(f'localStorage: 균형 (set만 있음: {only_set}, get만 있음: {only_get})', len(only_set) == 0 and len(only_get) == 0)

    # ═══════════════════════════════════════
    # 7. 필터 일관성 (드롭다운만 사용)
    # ═══════════════════════════════════════
    # 필터 함수 안에 btn-group 없어야 함 (드롭다운 통일)
    filter_funcs = re.findall(r'function\s+render\w*Filter\w*[^{]*\{([\s\S]*?)\n\}', html)
    btn_in_filters = sum(1 for f in filter_funcs if 'btn-group' in f and 'role="group"' in f)
    check('필터: 모두 form-select 드롭다운 사용 (btn-group 없음)', btn_in_filters == 0)

    # ═══════════════════════════════════════
    # 8. 차트 메모리 관리
    # ═══════════════════════════════════════
    chart_creates = html.count('new Chart(')
    chart_destroys = html.count('.destroy()')
    # 적어도 70%는 destroy 호출되어야 함
    check(f'Chart: destroy 호출 ({chart_destroys}/{chart_creates})', chart_destroys >= chart_creates * 0.7)

    # ═══════════════════════════════════════
    # 9. 접근성
    # ═══════════════════════════════════════
    check('A11y: aria-label 존재', 'aria-label' in html)
    check('A11y: focus-visible 스타일', 'focus-visible' in html)

    # ═══════════════════════════════════════
    # 10. 디자인 일관성
    # ═══════════════════════════════════════
    check('Design: --tblr-primary 브랜드 컬러', '--tblr-primary' in html and ('ff003b' in html or '3b5bdb' in html))
    check('Design: Tier CSS 변수', '--tier-nano' in html)
    check('Design: 다크모드 지원', 'data-bs-theme' in html)
    check('Design: 인쇄 최적화', '@media print' in html)

    # ═══════════════════════════════════════
    # 11. 데이터 검증 (JSON 존재 + 필드)
    # ═══════════════════════════════════════
    if os.path.exists(JSON):
        with open(JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
        check(f'Data: influencers 존재 ({len(data.get("influencers",[]))}건)', len(data.get('influencers',[])) > 0)
        check(f'Data: top_contents 존재 ({len(data.get("top_contents",[]))}건)', len(data.get('top_contents',[])) > 0)
        check(f'Data: categories 존재 ({len(data.get("categories",[]))}개)', len(data.get('categories',[])) > 0)

        # 필수 필드 확인
        if data.get('influencers'):
            inf = data['influencers'][0]
            required = ['id','display_name','platform','followers','category','tier','grade','pure_score','content_count','avg_views','country']
            missing = [r for r in required if r not in inf]
            check(f'Data: 인플루언서 필수 필드 (누락: {missing})', len(missing) == 0)
    else:
        issues.append(('WARN', f'JSON 파일 없음: {JSON}'))

    # ═══════════════════════════════════════
    # 12. 핵심 기능 마커
    # ═══════════════════════════════════════
    features = {
        'Bookmark': 'bookmarked_influencers',
        'Compare localStorage': 'compare_selected',
        'Memo system': 'memos_',
        'Collab videos': 'collabs_',
        'CSV export': 'exportCSV',
        'Dark mode': 'toggleDark',
        'KPI animation': 'animateNumber',
        'Last update': '마지막 업데이트',
        'Filter reset': 'resetChFilters',
        'Empty state': '결과가 없' if '결과가 없' in html else '없습니다',
        'Keyboard shortcuts': 'switchToView',
        'URL state sync': 'updateURL',
        'Global search': 'global-search-results',
    }
    for name, marker in features.items():
        check(f'Feature: {name}', marker in html)

    # ═══════════════════════════════════════
    # 결과 출력
    # ═══════════════════════════════════════
    total = len(passed) + len(issues)
    print('=' * 60)
    print(f'QA CHECK: {len(passed)}/{total} PASS')
    print('=' * 60)

    if issues:
        print()
        for sev, name in issues:
            print(f'[{sev}] {name}')
        print()
        errors = sum(1 for s, _ in issues if s == 'ERROR')
        warns = sum(1 for s, _ in issues if s == 'WARN')
        print(f'Errors: {errors}, Warnings: {warns}')
        return 1 if errors > 0 else 0
    else:
        print('\n✅ All checks passed. Safe to push.')
        return 0

if __name__ == '__main__':
    sys.exit(main())

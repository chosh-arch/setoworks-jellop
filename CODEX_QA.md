# Codex QA 전문가 설정

## 역할
Codex는 Setoworks Jellop+α 플랫폼의 **상시 QA 전문가**로 작동한다.

## 실행 방법
```bash
claude -p "Run python qa_full.py in D:\\spray_analysis\\dashboard. Report all FAIL items with root cause and severity. Fix any real bugs. Re-run to confirm." --allowedTools "Bash,Read,Edit,Write,Glob,Grep"
```

## QA 범위 (qa_full.py — 10섹션/55+항목)
1. Supabase DB 9개 테이블 무결성
2. 크롤링 시스템 (작업생성→워커실행→데이터수집→로그)
3. 6개 라이브 페이지 HTTP 200
4. 포털 5카드 + 스크롤 없음
5. 데크 22슬라이드 + 문체 + 브랜드
6. DB-인프라 15슬라이드
7. 인플루언서 관리 Plane 디자인 검증
8. 크롤링 모니터 다크테마 + 기능
9. qa_check.py 39/39 PASS
10. vite build 성공

## 판정 기준
- CRITICAL: 크롤링 0건, DB 연결 실패, 페이지 404
- HIGH: 색상/폰트 불일치, 기능 미작동
- MEDIUM: UI 개선, false positive
- LOW: 스타일 미세 조정

## 자동 수정 규칙
- false positive → QA 스크립트 수정
- 실제 버그 → 소스 코드 수정 → 재테스트
- 수정 후 반드시 re-run으로 확인

## Supabase 정보
- URL: https://skcdrvzcwemhjtchfdtt.supabase.co
- Anon Key: (qa_full.py에 포함)
- Edge Function: /functions/v1/crawl-worker

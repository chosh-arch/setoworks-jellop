# 크라우드펀딩 크롤링 완전 가이드

> 이 문서는 Kickstarter, Indiegogo, Makuake, Wadiz, Zeczec 5개 플랫폼을 크롤링하는 데 필요한 모든 기술 정보를 담고 있다.
> 이 문서만 읽으면 누구든 동일한 크롤러를 처음부터 구현할 수 있다.

---

## 공통 사항

### 필수 라이브러리
```
pip install curl_cffi requests beautifulsoup4 lxml
```

- `curl_cffi`: **가장 중요**. 실제 크롬 브라우저의 TLS 핑거프린트를 복제하여 Cloudflare를 통과한다. 일반 `requests`로는 Kickstarter(403), Indiegogo(403) 접속 불가.
- `requests`: Wadiz, Makuake 등 Cloudflare가 없는 사이트용
- `beautifulsoup4` + `lxml`: Zeczec HTML 파싱용

### curl_cffi 사용법
```python
from curl_cffi import requests as cffi_requests

session = cffi_requests.Session(impersonate="chrome124")
resp = session.get("https://example.com", headers={...}, timeout=15)
```
- `impersonate="chrome124"`: 크롬 124 브라우저로 위장. 이게 핵심.
- 프록시 사용: `session.get(url, proxies={"https": "http://IP:PORT"}, ...)`

### 안전 수칙 (절대 위반 금지)
1. **테스트를 반복하지 말 것.** 같은 사이트에 짧은 시간 내 여러 번 요청하면 IP 차단된다. 한 번 테스트하고, 결과 확인하고, 다음 진행.
2. **429 응답 받으면 즉시 중단.** 재시도하면 차단이 더 길어진다.
3. **요청 간 최소 5초 딜레이.** Kickstarter는 8초 이상.
4. **분당 최대 6회 요청.**
5. **Kickstarter는 반드시 프록시를 사용.** 직접 접속 절대 금지.

---

## 1. Kickstarter (미국)

### 보호 수준: 최강
- Cloudflare Turnstile (봇 감지 CAPTCHA)
- TLS 핑거프린트 검사 (일반 requests → 403)
- IP 기반 Rate Limit (과다 요청 → 429, 장시간 차단)

### 데이터 소스: 숨겨진 JSON API

공식 API는 없지만, 내부적으로 JSON 엔드포인트가 존재한다:

```
GET https://www.kickstarter.com/discover/advanced.json
    ?category_id={카테고리ID}
    &sort=magic
    &page={페이지}
    &woe_id=0
```

한 번 요청에 **12개 프로젝트** 반환. `page`는 1~200 (최대 2,400개).

### 필수 헤더
```python
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Referer": "https://www.kickstarter.com/discover",
    "Accept-Language": "en-US,en;q=0.9",
}
```

### 프록시 필수

Kickstarter는 직접 접속하면 안 된다. 반드시 프록시를 경유해야 한다.

무료 프록시 자동 탐색 방법:
```python
import requests as std_requests
from curl_cffi import requests as cffi_requests
import random

# 1. GitHub에서 무료 프록시 리스트 수집
sources = [
    ("http", "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt"),
    ("http", "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt"),
    ("socks5", "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt"),
]

all_proxies = []
for proto, url in sources:
    r = std_requests.get(url, timeout=10)
    for line in r.text.strip().split("\n"):
        line = line.strip()
        if line and ":" in line and line[0].isdigit():
            all_proxies.append(f"{proto}://{line.split()[0]}")

random.shuffle(all_proxies)

# 2. Kickstarter에 실제 접속 테스트하여 작동하는 프록시 찾기
for proxy_url in all_proxies[:100]:
    try:
        session = cffi_requests.Session(impersonate="chrome124")
        r = session.get(
            "https://www.kickstarter.com/discover/advanced.json?category_id=16&sort=magic&page=1",
            headers={"Accept": "application/json", "Referer": "https://www.kickstarter.com/discover"},
            proxies={"https": proxy_url, "http": proxy_url},
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            if len(data.get("projects", [])) > 0:
                print(f"작동하는 프록시 발견: {proxy_url}")
                break
    except:
        pass
```

### 카테고리 (15개)
```python
CATEGORIES = {
    1: "Art",
    3: "Comics",
    26: "Crafts",
    6: "Dance",
    7: "Design",
    9: "Fashion",
    10: "Food",
    11: "Film & Video",
    12: "Games",
    13: "Journalism",
    14: "Music",
    15: "Photography",
    16: "Technology",
    17: "Theater",
    18: "Publishing",
}
```

### 전체 크롤링 코드
```python
from curl_cffi import requests as cffi_requests
import time, random

PROXY_URL = "http://위에서_찾은_프록시:PORT"

session = cffi_requests.Session(impersonate="chrome124")
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Referer": "https://www.kickstarter.com/discover",
    "Accept-Language": "en-US,en;q=0.9",
}
proxies = {"https": PROXY_URL, "http": PROXY_URL}

for cat_id, cat_name in CATEGORIES.items():
    resp = session.get(
        f"https://www.kickstarter.com/discover/advanced.json?category_id={cat_id}&sort=magic&page=1&woe_id=0",
        headers=headers,
        proxies=proxies,
        timeout=15,
    )

    if resp.status_code == 429:
        print("429 Rate Limit! 즉시 중단!")
        break

    if resp.status_code == 200:
        data = resp.json()
        projects = data.get("projects", [])
        for p in projects[:10]:
            print(f"  [{cat_name}] {p['name']} | ${p['pledged']:,.0f} ({p['percent_funded']:.0f}%)")

    # 반드시 8~15초 대기
    time.sleep(random.uniform(8.0, 15.0))
```

### JSON 응답 구조
```json
{
  "projects": [
    {
      "id": 123456,
      "name": "프로젝트 이름",
      "blurb": "짧은 설명",
      "goal": 10000.0,
      "pledged": 45000.0,
      "currency": "USD",
      "percent_funded": 450.0,
      "backers_count": 500,
      "state": "live",
      "country": "US",
      "deadline": 1718000000,
      "launched_at": 1715000000,
      "staff_pick": true,
      "creator": {"name": "만든이 이름", "id": 789},
      "category": {"id": 16, "name": "Technology", "slug": "technology"},
      "urls": {"web": {"project": "https://www.kickstarter.com/projects/creator/project-slug"}},
      "photo": {
        "thumb": "https://i.kickstarter.com/.../...?width=40&sig=...",
        "small": "https://i.kickstarter.com/.../...?width=160&sig=...",
        "1024x576": "https://i.kickstarter.com/.../...?width=1024&height=576&sig=...",
        "full": "https://i.kickstarter.com/.../...?width=1024&sig=..."
      }
    }
  ],
  "total_hits": 1234,
  "has_more": true
}
```

### 이미지 다운로드 주의점
- `photo` 필드는 dict이다. `photo["1024x576"]` 또는 `photo["full"]` 사용.
- URL에 `sig=` 서명 파라미터가 반드시 포함되어야 한다. 서명 없으면 403/404.
- API 응답에 포함된 URL을 그대로 사용해야 한다. 임의로 URL을 조합하면 안 됨.
- 이미지 서버(`i.kickstarter.com`)도 프록시 경유 필요.
- 반환 포맷은 **AVIF** (jpg가 아님). 파일 확장자 `.avif`로 저장할 것.

### 딜레이 설정
- 요청 간: 8~15초 (랜덤)
- 429 응답 시: 즉시 중단 (재시도 절대 금지)
- 403 응답 시: 프록시 교체 후 1회만 재시도
- 연속 2회 에러 시: 전체 중단

---

## 2. Indiegogo (미국)

### 보호 수준: 중간
- Cloudflare Managed Challenge (일반 requests → 403)
- SPA (React) — 프로젝트 데이터가 HTML에 직접 보이지 않음

### 데이터 소스: HTML 내 삽입된 컴포넌트 JSON

Indiegogo는 공식 API가 없고, private API는 CSRF 토큰이 필요하다. 하지만 **explore 페이지의 HTML 소스에 프로젝트 데이터가 JavaScript 컴포넌트 초기화 코드로 삽입**되어 있다.

HTML 소스 안에 이런 패턴이 있다 (약 77KB):
```javascript
App.registerComponent(
  'v-xxxxxxxx',
  'App.Components.Search.SearchProjectsResults',
  App.Components.Search.SearchProjectsResults,
  {"props":{"params":{...},"result":{"projects":{"pagedItems":[...24개 프로젝트...]}}}}
);
```

### 추출 정규식
```python
import re, json

match = re.search(
    r"SearchProjectsResults',\s*App\.Components\.Search\.SearchProjectsResults,\s*(\{\"props\":\{.*?\})\);",
    html_text,
    re.DOTALL,
)
data = json.loads(match.group(1))
items = data["props"]["result"]["projects"]["pagedItems"]  # 24개 프로젝트
```

### URL 패턴
```
GET https://www.indiegogo.com/explore/{카테고리-slug}
    ?project_type=all
    &project_timing=all
    &sort=trending
```

### 필수 헤더
```python
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.indiegogo.com/explore/all",
}
```

### 카테고리 (26개)
```python
CATEGORIES = {
    # Tech & Innovation
    "audio": "Audio",
    "camera-gear": "Camera Gear",
    "education": "Education",
    "energy-green-tech": "Energy & Green Tech",
    "fashion-wearables": "Fashion & Wearables",
    "food-beverages": "Food & Beverages",
    "health-fitness": "Health & Fitness",
    "home": "Home",
    "phones-accessories": "Phones & Accessories",
    "productivity": "Productivity",
    "transportation": "Transportation",
    "travel-outdoors": "Travel & Outdoors",
    # Creative Works
    "art": "Art",
    "comics": "Comics",
    "dance-theater": "Dance & Theater",
    "film": "Film",
    "music": "Music",
    "photography": "Photography",
    "tabletop-games": "Tabletop Games",
    "video-games": "Video Games",
    "writing-publishing": "Writing & Publishing",
    # Community Projects
    "culture": "Culture",
    "environment": "Environment",
    "human-rights": "Human Rights",
    "local-businesses": "Local Businesses",
    "wellness": "Wellness",
}
```

### 전체 크롤링 코드
```python
from curl_cffi import requests as cffi_requests
import re, json, time, random

session = cffi_requests.Session(impersonate="chrome124")
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.indiegogo.com/explore/all",
}

for slug, name in CATEGORIES.items():
    resp = session.get(
        f"https://www.indiegogo.com/explore/{slug}?project_type=all&project_timing=all&sort=trending",
        headers=headers,
        timeout=30,
    )

    match = re.search(
        r"SearchProjectsResults',\s*App\.Components\.Search\.SearchProjectsResults,\s*(\{\"props\":\{.*?\})\);",
        resp.text,
        re.DOTALL,
    )

    if match:
        data = json.loads(match.group(1))
        items = data["props"]["result"]["projects"]["pagedItems"]
        for p in items[:10]:
            print(f"  [{name}] {p['name']} | {p.get('currencySymbol','$')}{p.get('fundsGathered',0):,.2f}")

    time.sleep(random.uniform(5.0, 10.0))
```

### 프로젝트 필드 매핑
| 필드명 | 설명 | 예시 |
|---|---|---|
| `projectID` | 프로젝트 ID | `44232` |
| `name` | 프로젝트명 | `"Mikoto Studio"` |
| `shortDescription` | 짧은 설명 | `"A new singing..."` |
| `campaignGoal` | 목표 금액 | `35000` |
| `fundsGathered` | 모금 금액 | `12368.95` |
| `currencySymbol` | 통화 기호 | `"€"` |
| `backersCount` | 후원자 수 | `27` |
| `followerCount` | 팔로워 수 | `106` |
| `imageUrl` | 이미지 URL | `"https://cdn.images.indiegogo.com/..."` |
| `url` | 프로젝트 URL | `"https://www.indiegogo.com/..."` |
| `phaseLabel` | 상태 | `"Crowdfunding"` |
| `campaignStart` | 시작일 | `"2026-04-01T19:00:00Z"` |
| `campaignEnd` | 종료일 | `"2026-05-15T18:00:00Z"` |
| `catalogCategory` | 카테고리 | `{"name": "Audio", ...}` |

### 이미지 다운로드
- `imageUrl` 필드에 CDN URL이 있다: `https://cdn.images.indiegogo.com/projectimage/...`
- Cloudflare 뒤에 있어서 `curl_cffi`로 다운로드해야 한다.
- Referer: `https://www.indiegogo.com/`

### 프록시: 불필요
### 딜레이: 5~10초

---

## 3. Makuake (일본)

### 보호 수준: 낮음
- CloudFront CDN (봇 차단 약함)
- 공개 REST API 존재

### 데이터 소스: 공개 JSON API

별도 API 호스트: `api.makuake.com` (인증 불필요)

```
GET https://api.makuake.com/v2/projects
    ?category_code={카테고리코드}
    &page=1
    &per_page=10
    &kinds=funded,donative
    &is_ongoing=true
```

### 필수 헤더
```python
headers = {
    "User-Agent": "Mozilla/5.0 ...",
    "Accept": "application/json",
    "Accept-Language": "ja,en;q=0.9",
    "Referer": "https://www.makuake.com/discover/",
    "Origin": "https://www.makuake.com",
}
```

### 카테고리 (20개)
```python
CATEGORIES = {
    "product": "プロダクト",       "fashion": "ファッション",
    "food": "フード",              "restaurant": "レストラン・バー",
    "technology": "テクノロジー",    "beauty": "コスメ・ビューティー",
    "art": "アート・写真",          "film": "映画・映像",
    "anime": "アニメ・マンガ",      "music": "音楽",
    "game": "ゲーム",              "dance": "演劇・パフォーマンス",
    "entertainment": "お笑い・エンタメ", "publication": "出版・ジャーナリズム",
    "education": "教育",           "sports": "スポーツ",
    "startup": "スタートアップ",     "region": "地域活性化",
    "contribution": "社会貢献",     "worldtour": "世界一周",
}
```

### 전체 크롤링 코드
```python
import requests, time, random

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 ...",
    "Accept": "application/json",
    "Accept-Language": "ja,en;q=0.9",
    "Referer": "https://www.makuake.com/discover/",
    "Origin": "https://www.makuake.com",
})

for code, name in CATEGORIES.items():
    resp = session.get(
        "https://api.makuake.com/v2/projects",
        params={"category_code": code, "page": 1, "per_page": 10,
                "kinds": "funded,donative", "is_ongoing": "true"},
        timeout=30,
    )
    for p in resp.json().get("projects", []):
        print(f"  [{name}] {p.get('title')} | ¥{p.get('collected_money',0):,}")
    time.sleep(random.uniform(5.0, 10.0))
```

### 프록시: 불필요 | 딜레이: 5~10초

---

## 4. Wadiz (한국)

### 보호 수준: 낮음
- 공개 REST API (POST)
- CORS 완전 개방, 인증 불필요

### 데이터 소스: 공개 JSON API

```
POST https://service.wadiz.kr/api/search/v2/funding
Content-Type: application/json

{"startNum": 0, "limit": 10, "order": "support", "categoryCode": "A0010"}
```

### 카테고리 (20개)
```python
CATEGORIES = {
    "A0010": "테크·가전",    "A0020": "패션",       "A0030": "뷰티",
    "A0040": "홈·리빙",      "A0050": "스포츠·아웃도어", "A0060": "푸드",
    "A0070": "도서",         "A0080": "전자책·클래스",  "A0090": "디자인",
    "A0100": "반려동물",      "A0110": "아트",        "A0120": "캐릭터·굿즈",
    "A0130": "영화·음악",     "A0140": "키즈",        "A0150": "게임",
    "A0160": "만화·웹툰",     "A0180": "사진",        "A0190": "여행",
    "A0200": "자동차",        "A0220": "소셜",
}
```

### 전체 크롤링 코드
```python
import requests, time, random

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 ...",
    "Accept": "application/json",
    "Content-Type": "application/json",
})

for code, name in CATEGORIES.items():
    resp = session.post(
        "https://service.wadiz.kr/api/search/v2/funding",
        json={"startNum": 0, "limit": 10, "order": "support", "categoryCode": code},
        timeout=30,
    )
    for p in resp.json().get("data", {}).get("list", []):
        print(f"  [{name}] {p['title']} | {p['totalBackedAmount']:,}원 ({p['achievementRate']}%)")
    time.sleep(random.uniform(5.0, 10.0))
```

### 응답 주요 필드
`campaignId`, `title`, `coreMessage`, `nickName`, `corpName`, `totalBackedAmount`, `achievementRate`, `participationCnt`, `remainingDay`, `photoUrl`, `categoryCode`, `categoryName`, `advertisement`

### 프록시: 불필요 | 딜레이: 5~10초

---

## 5. Zeczec (대만)

### 보호 수준: 낮음~중간
- Cloudflare 존재하지만 패시브 모드 (차단 안 함)
- JSON API 없음 → HTML 파싱 필요
- robots.txt에서 **Scrapy User-Agent 명시적 차단**

### 데이터 소스: HTML 파싱 (Rails 서버 렌더링)

```
GET https://www.zeczec.com/categories
    ?category={카테고리ID}
    &type=0
    &scope=trending
```

`type=0` = 群眾集資(크라우드펀딩). 페이지당 12개.

### 필수 헤더
```python
headers = {
    "User-Agent": "Mozilla/5.0 ...",   # Scrapy UA 사용 금지!
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.zeczec.com/",
}
```

### 카테고리 (16개)
```python
CATEGORIES = {
    1: "音樂",     2: "插畫漫畫",  3: "表演",     4: "出版",
    5: "地方創生",  6: "藝術",     7: "時尚",     8: "設計",
    9: "攝影",     10: "電影動畫", 11: "科技",    12: "教育",
    13: "遊戲",    14: "飲食",    15: "社會",    16: "空間",
}
```

### 전체 크롤링 코드
```python
import requests
from bs4 import BeautifulSoup
import time, random

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8",
    "Referer": "https://www.zeczec.com/",
})

for cat_id, cat_name in CATEGORIES.items():
    resp = session.get(
        "https://www.zeczec.com/categories",
        params={"category": cat_id, "type": 0, "scope": "trending"},
        timeout=30,
    )
    soup = BeautifulSoup(resp.text, "lxml")

    seen = set()
    for card in soup.select('a[href*="/projects/"]'):
        href = card.get("href", "")
        if "/projects/" not in href or href in seen:
            continue
        if any(x in href for x in ["/comments", "/ping", "/updates", "/faqs"]):
            continue
        seen.add(href)

        slug = href.split("/projects/")[-1].rstrip("/")
        if not slug or "/" in slug:
            continue

        title_el = card.select_one("h3, h2, [class*='title']")
        title = title_el.get_text(strip=True) if title_el else ""

        img_el = card.select_one("img[src], img[data-src]")
        photo = ""
        if img_el:
            photo = img_el.get("src") or img_el.get("data-src") or ""
            if photo and not photo.startswith("http"):
                photo = f"https://www.zeczec.com{photo}"

        if title:
            print(f"  [{cat_name}] {title}")

    time.sleep(random.uniform(5.0, 10.0))
```

### 이미지 다운로드
- 이미지 서버(`assets.zeczec.com`)는 Cloudflare 뒤에 있음
- 일반 `requests`로는 실패. `curl_cffi`로 다운로드해야 함
```python
from curl_cffi import requests as cffi_requests
session = cffi_requests.Session(impersonate="chrome124")
resp = session.get(photo_url, headers={"Accept": "image/*,*/*", "Referer": "https://www.zeczec.com/"}, timeout=15)
```

### 프록시: 불필요 | 딜레이: 5~10초

---

## 플랫폼별 비교 요약

| | Kickstarter | Indiegogo | Makuake | Wadiz | Zeczec |
|---|---|---|---|---|---|
| **국가** | 미국 | 미국 | 일본 | 한국 | 대만 |
| **보호** | 최강 | 중간 | 낮음 | 낮음 | 낮음~중간 |
| **라이브러리** | `curl_cffi` 필수 | `curl_cffi` 필수 | `requests` OK | `requests` OK | `requests` (이미지만 `curl_cffi`) |
| **데이터 소스** | JSON API (.json) | HTML 내 삽입 JSON | 공개 REST API | 공개 REST API (POST) | HTML 파싱 |
| **프록시** | 필수 | 불필요 | 불필요 | 불필요 | 불필요 |
| **딜레이** | 8~15초 | 5~10초 | 5~10초 | 5~10초 | 5~10초 |
| **카테고리** | 15개 | 26개 | 20개 | 20개 | 16개 |
| **한 번 반환** | 12개 | 24개 | per_page 지정 | limit 지정 | 12개 |
| **이미지** | AVIF, sig 필요, 프록시 필수 | CDN, curl_cffi 필요 | CDN | CDN | CDN, curl_cffi 필요 |

---

## 실패 원인과 해결 기록

### Kickstarter IP 차단 사건
- **원인**: 디버깅 중 같은 엔드포인트에 10번 넘게 빠르게 요청
- **결과**: 회사 전체 IP가 약 1시간 동안 429 차단
- **해결**: 무료 프록시 3,600개에서 작동하는 프록시를 찾아 우회
- **교훈**: 테스트도 실제 요청이다. 한 번만 테스트하고 결과 확인 후 다음 단계로

### Indiegogo 데이터 추출 실패
- **시도 1**: `__NEXT_DATA__` 탐색 → 없음
- **시도 2**: `__INITIAL_STATE__` 탐색 → 있지만 유저 컨텍스트만 (프로젝트 없음)
- **시도 3**: private API (`/private_api/discover`) → CSRF 토큰 필요
- **시도 4**: HTML 전체 script 태그 조사 → **77KB짜리에서 `SearchProjectsResults` 발견, 성공**
- **교훈**: SPA라도 서버사이드 렌더링 데이터가 HTML에 삽입될 수 있다

### Zeczec 이미지 다운로드 실패
- **원인**: `assets.zeczec.com`이 Cloudflare 뒤에 있어서 일반 `requests`로 403
- **해결**: `curl_cffi`로 교체하니 66건 전부 성공
- **교훈**: 이미지 CDN도 Cloudflare 보호를 받을 수 있다

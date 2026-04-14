"""
Supabase 데이터 마이그레이션 스크립트
사전 조건: supabase_setup.sql을 Supabase SQL Editor에서 먼저 실행

사용법: python migrate_to_supabase.py
"""
import json, sys, time
sys.stdout.reconfigure(encoding='utf-8')

import httpx

SUPABASE_URL = 'https://skcdrvzcwemhjtchfdtt.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2Rydnpjd2VtaGp0Y2hmZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY3MzUsImV4cCI6MjA5MTczMjczNX0.ULkKqm_9FlXvq5h3CGcI82-d-ePO2cTEjfnjQDFn6BU'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def api(method, table, data=None, params=None):
    url = f'{SUPABASE_URL}/rest/v1/{table}'
    r = httpx.request(method, url, headers=HEADERS, json=data, params=params, timeout=30)
    if r.status_code >= 400:
        print(f'  ERROR {r.status_code}: {r.text[:200]}')
    return r

def upsert(table, rows, batch_size=50):
    headers = {**HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal'}
    total = len(rows)
    for i in range(0, total, batch_size):
        batch = rows[i:i+batch_size]
        url = f'{SUPABASE_URL}/rest/v1/{table}'
        r = httpx.post(url, headers=headers, json=batch, timeout=30)
        if r.status_code >= 400:
            print(f'  ERROR batch {i//batch_size}: {r.status_code} {r.text[:200]}')
        else:
            print(f'  {table}: {min(i+batch_size, total)}/{total} 완료')
        time.sleep(0.2)

def main():
    print('=== Setoworks Supabase 마이그레이션 ===\n')

    # 1. Load influencer data
    print('[1/4] influencer_data.json 로드...')
    with open('public/influencer_data.json', 'r', encoding='utf-8') as f:
        inf_data = json.load(f)

    influencers = inf_data.get('influencers', [])
    contents = inf_data.get('top_contents', [])
    categories = inf_data.get('categories', [])

    print(f'  인플루언서: {len(influencers)}건')
    print(f'  콘텐츠: {len(contents)}건')
    print(f'  카테고리: {len(categories)}건')

    # 2. Load crawled products
    print('\n[2/4] crawled_products.json 로드...')
    with open('public/crawled_products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
    print(f'  제품: {len(products)}건')

    # 3. Insert influencers
    print('\n[3/4] 인플루언서 upsert...')
    inf_rows = []
    for inf in influencers:
        inf_rows.append({
            'id': inf['id'],
            'platform': inf.get('platform', 'YouTube'),
            'platform_id': inf.get('platform_id'),
            'username': inf.get('username'),
            'display_name': inf.get('display_name', ''),
            'bio': inf.get('bio'),
            'profile_url': inf.get('profile_url'),
            'profile_image_url': inf.get('profile_image_url'),
            'is_verified': inf.get('is_verified', False),
            'followers': inf.get('followers', 0),
            'following': inf.get('following', 0),
            'total_posts': inf.get('total_posts', 0),
            'category': inf.get('category'),
            'tier': inf.get('tier'),
            'country': inf.get('country'),
            'language': inf.get('language'),
            'pure_score': inf.get('pure_score', 0),
            'is_active': inf.get('is_active', True),
            'first_discovered_at': inf.get('first_discovered_at'),
            'last_collected_at': inf.get('last_collected_at'),
            'grade': inf.get('grade'),
            'contact_email': inf.get('contact_email'),
            'note': inf.get('note'),
            'content_count': inf.get('content_count', 0),
            'avg_views': inf.get('avg_views', 0),
            'avg_likes': inf.get('avg_likes', 0),
            'avg_comments': inf.get('avg_comments', 0),
            'total_views': inf.get('total_views', 0),
        })
    upsert('influencers', inf_rows)

    # 4. Insert contents
    print('\n[4a] 콘텐츠 insert...')
    cnt_rows = []
    for c in contents:
        cnt_rows.append({
            'influencer_id': c.get('influencer_id'),
            'title': c.get('title'),
            'content_url': c.get('content_url'),
            'views': c.get('views', 0),
            'likes': c.get('likes', 0),
            'comments': c.get('comments', 0),
            'published_at': c.get('published_at'),
            'content_type': c.get('content_type'),
        })
    upsert('contents', cnt_rows)

    # 5. Insert products
    print('\n[4b] 크롤링 제품 upsert...')
    prod_rows = []
    for p in products:
        prod_rows.append({
            'id': str(p['id']),
            'name': p.get('name', ''),
            'description': p.get('description'),
            'image_url': p.get('imageUrl'),
            'platform': p.get('platform'),
            'funding_goal': p.get('fundingGoal', 0),
            'current_amount': p.get('currentAmount', 0),
            'percentage': p.get('percentage', 0),
            'backer_count': p.get('backerCount', 0),
            'days_left': p.get('daysLeft', 0),
            'tags': json.dumps(p.get('tags', [])),
            'category': p.get('category'),
            'url': p.get('url'),
            'source': p.get('source'),
        })
    upsert('crawled_products', prod_rows)

    # 6. Insert categories
    print('\n[4c] 카테고리 upsert...')
    cat_rows = []
    for c in categories:
        cat_rows.append({
            'id': c if isinstance(c, str) else c.get('id', str(c)),
            'name_ko': c if isinstance(c, str) else c.get('name_ko'),
            'name_en': c if isinstance(c, str) else c.get('name_en'),
        })
    upsert('categories', cat_rows)

    print('\n=== 마이그레이션 완료 ===')

    # Verify
    print('\n검증:')
    for table in ['influencers', 'contents', 'crawled_products', 'categories']:
        r = httpx.get(
            f'{SUPABASE_URL}/rest/v1/{table}?select=id&limit=1',
            headers={**HEADERS, 'Prefer': 'count=exact'},
            timeout=10
        )
        count = r.headers.get('content-range', '?')
        print(f'  {table}: {count}')

if __name__ == '__main__':
    main()

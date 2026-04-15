"""Setoworks Full Production QA"""
import sys,json,urllib.request,ssl,subprocess,os,glob
sys.stdout.reconfigure(encoding='utf-8')
ctx=ssl.create_default_context()

SK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2Rydnpjd2VtaGp0Y2hmZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY3MzUsImV4cCI6MjA5MTczMjczNX0.ULkKqm_9FlXvq5h3CGcI82-d-ePO2cTEjfnjQDFn6BU'
SB='https://skcdrvzcwemhjtchfdtt.supabase.co'
LIVE='https://setoworks-jellop.vercel.app'
results,total,passed=[],0,0

def sb(table,q=''):
    req=urllib.request.Request(f'{SB}/rest/v1/{table}?select=*{q}',headers={'apikey':SK,'Authorization':f'Bearer {SK}'})
    return json.loads(urllib.request.urlopen(req,timeout=15,context=ctx).read())

def sb_count(table):
    req=urllib.request.Request(f'{SB}/rest/v1/{table}?select=id&limit=0',headers={'apikey':SK,'Authorization':f'Bearer {SK}','Prefer':'count=exact'})
    r=urllib.request.urlopen(req,timeout=10,context=ctx)
    cr=r.headers.get('content-range','*/*')
    return int(cr.split('/')[-1]) if '/' in cr and cr.split('/')[-1]!='*' else 0

def fetch_page(path):
    req=urllib.request.Request(f'{LIVE}{path}')
    return urllib.request.urlopen(req,timeout=10,context=ctx).read().decode('utf-8')

def http_status(url):
    try:
        req=urllib.request.Request(url)
        return urllib.request.urlopen(req,timeout=10,context=ctx).status
    except Exception as e: return str(e)[:50]

def check(section,name,cond,detail=''):
    global total,passed
    total+=1
    if cond:
        passed+=1
        results.append(('PASS',section,name))
    else:
        sev='CRITICAL' if any(k in name.lower() for k in ['crawl','items','project_count']) else 'HIGH' if any(k in name.lower() for k in ['primary','font','palette','supabase']) else 'MEDIUM'
        results.append(('FAIL',section,name,detail,sev))

print('='*60)
print('SETOWORKS PRODUCTION QA REPORT')
print('='*60)

# ─── 1. DB INTEGRITY ───
print('\n[1] SUPABASE DB INTEGRITY')
expect={'influencers':64,'contents':200,'crawled_products':530,'platforms':5,'crawl_categories':97,'crawl_jobs':0,'projects':0,'categories':0,'collect_logs':0}
for t,exp in expect.items():
    try:
        cnt=sb_count(t)
        check('DB',f'{t}: {cnt} rows (>={exp})',cnt>=exp,f'got {cnt}')
    except Exception as e:
        check('DB',f'{t} exists',False,str(e)[:60])

# ─── 2. CRAWLING ───
print('\n[2] CRAWLING SYSTEM')
try:
    data=json.dumps({'platform_id':'wadiz','status':'pending','triggered_by':'qa-auto','items_per_category':5}).encode()
    req=urllib.request.Request(f'{SB}/rest/v1/crawl_jobs',data=data,headers={'apikey':SK,'Authorization':f'Bearer {SK}','Content-Type':'application/json','Prefer':'return=representation'},method='POST')
    jr=json.loads(urllib.request.urlopen(req,timeout=10,context=ctx).read())
    check('CRAWL','job created',len(jr)>0)

    req2=urllib.request.Request(f'{SB}/functions/v1/crawl-worker',headers={'Authorization':f'Bearer {SK}'})
    wr=json.loads(urllib.request.urlopen(req2,timeout=90,context=ctx).read())
    check('CRAWL',f'worker processed={wr.get("processed",0)}',wr.get('processed',0)>0,json.dumps(wr)[:120])
    check('CRAWL',f'items crawled={wr.get("totalItems",0)}',wr.get('totalItems',0)>0,'0 items=CRITICAL')
    check('CRAWL','log present',bool(wr.get('log')),'no log array')
except Exception as e:
    check('CRAWL','system',False,str(e)[:80])

# ─── 3. LIVE PAGES ───
print('\n[3] LIVE PAGES')
for name,path in {'portal':'/','deck':'/deck.html','db-infra':'/db-infra.html','influencer':'/influencer-admin.html','crawl-monitor':'/crawl-monitor.html','dashboard':'/index.html'}.items():
    code=http_status(f'{LIVE}{path}')
    check('PAGES',f'{name}: {code}',code==200,f'got {code}')

# ─── 4. PORTAL ───
print('\n[4] PORTAL')
try:
    s=fetch_page('/portal.html')
    card_count=s.count('class="card"')
    check('PORTAL','5 card links',card_count>=5,f'found {card_count}')
    check('PORTAL','no overflow:auto','overflow:auto' not in s)
    check('PORTAL','SETOWORKS','SETOWORKS' in s)
    check('PORTAL','crawl-monitor link','crawl-monitor' in s)
except Exception as e:
    check('PORTAL','fetch',False,str(e)[:60])

# ─── 5. DECK ───
print('\n[5] DECK')
try:
    s=fetch_page('/deck.html')
    css=s.split('</style>')[0] if '</style>' in s else ''
    check('DECK','TOTAL=22','TOTAL=22' in s,f'found TOTAL={s[s.find("TOTAL=")+6:s.find("TOTAL=")+8] if "TOTAL=" in s else "?"}')
    check('DECK','no overflow:auto in CSS','overflow:auto' not in css)
    css_no_vars=css.replace('--brand-red:#ff003b','')
    check('DECK','no #ff003b in CSS (except CSS var)','ff003b' not in css_no_vars)
    check('DECK','no 우리',s.count('우리')==0,f'found {s.count("우리")} occurrences')
    check('DECK','5개 수익원','5개 수익원' in s or '5 수익원' in s)
    check('DECK','sreal slide','id="sreal"' in s)
    check('DECK','seco slide','id="seco"' in s)
    check('DECK','brand-corner z-index>=200','z-index:200' in s)
    check('DECK','inactive brand hidden','slide:not(.active) .brand-corner' in s)
    slide_cnt=s.count('class="slide')
    check('DECK','22 slides',slide_cnt==22,f'found {slide_cnt}')
except Exception as e:
    check('DECK','fetch',False,str(e)[:60])

# ─── 6. DB-INFRA ───
print('\n[6] DB-INFRA')
try:
    s=fetch_page('/db-infra.html')
    check('DBINFRA','TOTAL=15','TOTAL=15' in s)
    check('DBINFRA','sdeploy','id="sdeploy"' in s)
    check('DBINFRA','84개 배포','84' in s)
    sc=s.count('class="slide')
    check('DBINFRA','15 slides',sc==15,f'found {sc}')
except Exception as e:
    check('DBINFRA','fetch',False,str(e)[:60])

# ─── 7. INFLUENCER ADMIN ───
print('\n[7] INFLUENCER ADMIN')
try:
    s=fetch_page('/influencer-admin.html')
    check('INFADM','primary #3b5bdb','3b5bdb' in s)
    check('INFADM','no #ff003b','ff003b' not in s)
    check('INFADM','Inter font',"'Inter'" in s)
    check('INFADM','no #212121','#212121' not in s)
    check('INFADM','no #fff5f7','fff5f7' not in s)
    check('INFADM','Supabase fetch','supabase.co' in s)
    check('INFADM','goToChannelDetail','goToChannelDetail' in s)
    # PALETTE check
    pal_idx=s.find('PALETTE')
    if pal_idx>0:
        pal_line=s[pal_idx:pal_idx+200]
        colors=[c.strip().strip("'\"") for c in pal_line.split('[')[1].split(']')[0].split(',')][:2]
        check('INFADM',f'PALETTE 1,2 diverse: {colors}',colors[0]!=colors[1] and not(colors[0].startswith('#3') and colors[1].startswith('#1')))
except Exception as e:
    check('INFADM','fetch',False,str(e)[:60])

# ─── 8. CRAWL MONITOR ───
print('\n[8] CRAWL MONITOR')
try:
    s=fetch_page('/crawl-monitor.html')
    check('MONITOR','dark #0a0a0a','#0a0a0a' in s)
    check('MONITOR','emerald #3ECF8E','3ECF8E' in s or '3ecf8e' in s)
    check('MONITOR','5 platforms',all(p in s for p in ['kickstarter','indiegogo','makuake','wadiz','zeczec']))
    check('MONITOR','triggerCrawl','triggerCrawl' in s)
    check('MONITOR','runWorker','runWorker' in s)
    check('MONITOR','30s refresh','30000' in s)
    check('MONITOR','equalizer','eq-tag' in s)
    check('MONITOR','Edge Function URL','functions/v1/crawl-worker' in s)
except Exception as e:
    check('MONITOR','fetch',False,str(e)[:60])

# ─── 9. QA SCRIPT ───
print('\n[9] QA CHECK SCRIPT')
try:
    r=subprocess.run([sys.executable,'qa_check.py'],capture_output=True,text=True,encoding='utf-8',errors='replace',cwd=os.path.dirname(__file__) or '.')
    check('QASCRIPT','39/39 PASS','39/39 PASS' in r.stdout,r.stdout[-100:].strip())
    check('QASCRIPT','exit code 0',r.returncode==0,f'exit {r.returncode}')
except Exception as e:
    check('QASCRIPT','run',False,str(e)[:60])

# ─── 10. BUILD ───
print('\n[10] VITE BUILD')
try:
    r=subprocess.run(['npx','vite','build'],capture_output=True,text=True,encoding='utf-8',errors='replace',shell=True,cwd=os.path.dirname(__file__) or '.',timeout=120)
    check('BUILD','success',r.returncode==0,r.stderr[-100:].strip() if r.returncode!=0 else '')
    dist=os.path.join(os.path.dirname(__file__) or '.','dist')
    for f in ['index.html','portal.html','deck.html','db-infra.html','influencer-admin.html','crawl-monitor.html']:
        check('BUILD',f'dist/{f}',os.path.exists(os.path.join(dist,f)))
except Exception as e:
    check('BUILD','run',False,str(e)[:60])

# ─── REPORT ───
print('\n'+'='*60)
print(f'TOTAL: {passed}/{total} PASSED')
print('='*60)

fails=[r for r in results if r[0]=='FAIL']
if fails:
    print(f'\n❌ FAILURES ({len(fails)}):')
    for f in fails:
        sev=f[4] if len(f)>4 else 'MEDIUM'
        print(f'  [{sev}] {f[1]}/{f[2]}: {f[3]}')
    crits=[f for f in fails if len(f)>4 and f[4]=='CRITICAL']
    highs=[f for f in fails if len(f)>4 and f[4]=='HIGH']
    print(f'\n  CRITICAL: {len(crits)}, HIGH: {len(highs)}, MEDIUM: {len(fails)-len(crits)-len(highs)}')
else:
    print('\n✅ ALL CHECKS PASSED — PRODUCTION READY')

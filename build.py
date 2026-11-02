"""Builds the photographer's site from /content into /dist.

Netlify runs this on every change made in the admin panel (/admin).
Locally:  python3 build.py   (needs Pillow and Node.js)
"""
import json, os, re, shutil, subprocess, datetime, glob
from PIL import Image, ImageOps

BASE = os.environ.get('SITE_URL', 'https://valeriaphoto.netlify.app').rstrip('/')
# Netlify sets URL to the primary domain; prefer it when a custom domain is added
if os.environ.get('URL') and os.environ.get('CONTEXT') == 'production':
    BASE = os.environ['URL'].rstrip('/')
ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')
MAX_W = 1200


def load(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return json.load(f)


def fail(msg):
    raise SystemExit('\n*** ПОМИЛКА В КОНТЕНТІ: ' + msg + '\n')


shutil.rmtree(DIST, ignore_errors=True)
os.makedirs(DIST + '/img')

# ---------- content ----------
home = load('content/site/home.json')
about = load('content/site/about.json')
prices = load('content/site/prices.json')
contacts = load('content/site/contacts.json')
for k in ('telegram', 'instagram', 'threads'):
    contacts[k] = re.sub(r'^(https?://)?(www\.)?(t\.me/|instagram\.com/|threads\.(net|com)/)?@?', '', contacts.get(k, '').strip()).strip('/')

CAT_NAMES = {'p': 'Персональні', 'f': 'Сімейні', 'e': 'Івенти'}
shoots = []
for fp in sorted(glob.glob(os.path.join(ROOT, 'content/shoots/*.json'))):
    with open(fp, encoding='utf-8') as f:
        s = json.load(f)
    if s.get('hidden'):
        continue
    name = s.get('title') or os.path.basename(fp)
    if s.get('category') not in CAT_NAMES:
        fail(f'«{name}»: не обрано категорію')
    s['photos'] = [p for p in (s.get('photos') or []) if p.get('image')]
    if not 4 <= len(s['photos']) <= 6:
        fail(f'«{name}»: потрібно від 4 до 6 фото, зараз {len(s["photos"])}')
    prev = [p for p in (s.get('preview') or []) if p]
    if len(prev) != 4:
        # main-page collage: 4 or 5 photos work as is, 6 -> first four
        prev = [p['image'] for p in s['photos'][:4]] if len(s['photos']) == 6 else None
    s['preview'] = prev
    s['_name'] = os.path.basename(fp)  # file names are creation timestamps
    shoots.append(s)
# newest first inside each category
shoots.sort(key=lambda s: s['_name'], reverse=True)
shoots.sort(key=lambda s: s['category'])

featured = {}
for c in CAT_NAMES:
    lst = [s for s in shoots if s['category'] == c]
    if not lst:
        fail(f'у категорії «{CAT_NAMES[c]}» немає жодної видимої зйомки')
    # the one marked «Показувати на головній» (newest if several); if none is marked, the oldest,
    # so a freshly added shoot never takes over the home page by itself
    featured[c] = next((i for i, s in enumerate(lst) if s.get('featured')), len(lst) - 1)

# ---------- images: /media/* -> /img/*.webp (max 1200px wide) ----------
done = {}


def img(path):
    if not path:
        return path
    if path in done:
        return done[path]
    src = os.path.join(ROOT, path.lstrip('/'))
    if not os.path.exists(src):
        fail(f'немає файлу {path}')
    stem = re.sub(r'[^A-Za-z0-9_-]+', '-', os.path.splitext(os.path.basename(src))[0]).strip('-') or 'photo'
    out, n = stem, 1
    while out in done.values() or os.path.exists(f'{DIST}/img/{out}.webp'):
        n += 1; out = f'{stem}-{n}'
    dst = f'{DIST}/img/{out}.webp'
    im = Image.open(src)
    if im.format == 'WEBP' and im.width <= MAX_W:
        shutil.copyfile(src, dst)
    else:
        im = ImageOps.exif_transpose(im).convert('RGB')
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=80, method=4)
    done[path] = f'/img/{out}.webp'
    return done[path]


for s in shoots:
    for p in s['photos']:
        p['image'] = img(p['image'])
    if s['preview']:
        s['preview'] = [img(p) for p in s['preview']]
for blk in (home['hero'], home['small'], about['photo'], about['photo2']):
    blk['image'] = img(blk['image'])

CONTENT = {
    'shoots': [{k: s.get(k) for k in ('title', 'category', 'location', 'description', 'photos', 'preview')} for s in shoots],
    'featured': featured, 'home': home, 'about': about, 'prices': prices, 'contacts': contacts,
}
with open(os.path.join(ROOT, 'src/app.js'), encoding='utf-8') as f:
    appjs = 'window.CONTENT=' + json.dumps(CONTENT, ensure_ascii=False) + ';\n' + f.read()
with open(DIST + '/app.js', 'w', encoding='utf-8') as f:
    f.write(appjs)

# ---------- SEO head ----------
all_prices = [int(re.sub(r'\D', '', t['p']) or 0) for k in ('ind', 'fam', 'evt') for t in prices[k]['tariffs']]
all_prices = [p for p in all_prices if p] or [0]
for k in ('ind', 'fam', 'evt'):
    if not (prices.get(k) or {}).get('tariffs'):
        fail('у цінах порожній блок ' + k)
min_of = lambda key: min([int(re.sub(r'\D', '', t['p']) or 0) for t in prices[key]['tariffs']] or [0])
phone_digits = re.sub(r'[^\d+]', '', contacts['phone'])
LD = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "additionalType": "https://schema.org/ProfessionalService",
    "name": "Фотограф Валерія",
    "description": "Персональні, сімейні фотосесії та зйомка подій у Чорноморську й Одесі.",
    "image": BASE + "/og.jpg", "url": BASE + "/", "telephone": phone_digits,
    "priceRange": f"{min(all_prices)}–{max(all_prices)} грн", "currenciesAccepted": "UAH",
    "address": {"@type": "PostalAddress", "addressLocality": "Чорноморськ", "addressRegion": "Одеська область", "addressCountry": "UA"},
    "areaServed": [{"@type": "City", "name": "Чорноморськ"}, {"@type": "City", "name": "Одеса"}],
    "sameAs": [f"https://www.instagram.com/{contacts['instagram']}/", f"https://www.threads.com/@{contacts['threads']}", f"https://t.me/{contacts['telegram']}"],
    "knowsLanguage": ["uk"],
    "makesOffer": [
        {"@type": "Offer", "name": "Персональна фотосесія", "price": str(min_of('ind')), "priceCurrency": "UAH"},
        {"@type": "Offer", "name": "Сімейна фотосесія", "price": str(min_of('fam')), "priceCurrency": "UAH"},
        {"@type": "Offer", "name": "Фотозйомка події", "price": str(min_of('evt')), "priceCurrency": "UAH"}],
}


def esc(t):
    return t.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def head(url, title, desc):
    t, d = esc(title), esc(desc)
    return (f'<title>{t}</title>\n'
            f'<meta name="description" content="{d}">\n'
            '<meta name="theme-color" content="#1F1E1B">\n'
            '<meta name="robots" content="index, follow">\n'
            '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
            '<meta property="og:type" content="website">\n'
            '<meta property="og:site_name" content="Фотограф Валерія">\n'
            f'<meta property="og:title" content="{t}">\n'
            f'<meta property="og:description" content="{d}">\n'
            f'<link rel="canonical" href="{url}">\n'
            f'<meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{BASE}/og.jpg">\n'
            '<meta property="og:image:width" content="1200">\n'
            '<meta property="og:image:height" content="630">\n'
            '<meta property="og:locale" content="uk_UA">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:image" content="{BASE}/og.jpg">\n'
            '<script type="application/ld+json">' + json.dumps(LD, ensure_ascii=False).replace('</', '<\\/') + '</script>')


PAGES = {
    'index.html': ('/', 'Фотограф Валерія — Чорноморськ та Одеса',
                   'Фотограф Валерія: персональні, сімейні фотосесії та зйомка подій у Чорноморську й Одесі. Живі емоції, тепле світло, готові фото до 7 днів.'),
    'portfolio/index.html': ('/portfolio/', 'Портфоліо — Фотограф Валерія, Чорноморськ та Одеса',
                             'Портфоліо фотографа Валерії: персональні, сімейні фотосесії та зйомки подій у Чорноморську й Одесі.'),
}
with open(os.path.join(ROOT, 'src/template.html'), encoding='utf-8') as f:
    TPL = f.read()
for fn, (path, title, desc) in PAGES.items():
    html = subprocess.run(['node', os.path.join(ROOT, 'prerender.mjs'), DIST + '/app.js', path],
                          check=True, capture_output=True, text=True).stdout
    if len(html) < 2000:
        fail('пререндер сторінки ' + path + ' не вдався')
    page = TPL.replace('%%HEAD%%', head(BASE + path, title, desc)).replace('<div id="app"></div>', '<div id="app">' + html + '</div>')
    os.makedirs(os.path.dirname(f'{DIST}/{fn}') or DIST, exist_ok=True)
    with open(f'{DIST}/{fn}', 'w', encoding='utf-8') as f:
        f.write(page)

# ---------- robots, sitemap, og image, static ----------
today = datetime.date.today().isoformat()
with open(DIST + '/robots.txt', 'w') as f:
    f.write(f'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: {BASE}/sitemap.xml\n')
with open(DIST + '/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + ''.join(f'  <url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n'
                      for u, p in [('/', '1.0'), ('/portfolio/', '0.8')]) + '</urlset>\n')
og = Image.open(DIST + home['hero']['image']).convert('RGB')
w, h = og.size; th = round(w * 630 / 1200)
og.crop((0, max(0, (h - th) // 3), w, max(0, (h - th) // 3) + th)).resize((1200, 630), Image.LANCZOS).save(DIST + '/og.jpg', 'JPEG', quality=82)
shutil.copytree(os.path.join(ROOT, 'static'), DIST, dirs_exist_ok=True)

print(f'OK: {len(shoots)} зйомок, {len(done)} фото, сайт: {BASE}')

# Сайт фотографа Валерії

Статичний сайт + адмін-панель (Decap CMS) на Netlify.

- `content/shoots/*.json` — зйомки портфоліо (одна зйомка = один файл)
- `content/site/*.json` — ціни, «Про мене», фото головної, контакти
- `media/` — фото (сюди ж потрапляє все, що завантажують в адмінці)
- `src/template.html`, `src/app.js` — дизайн і логіка сайту
- `static/` — копіюється на сайт як є (`admin/`, `_headers`, favicon)
- `build.py` — збирає `dist/`: стискає фото у WebP 1200px, вшиває контент, робить SEO-пререндер, sitemap
- `prerender.mjs` — рендер сторінок для пошуковиків (Node, без залежностей)

Адмінка: `/admin/` (вхід через Netlify Identity + Git Gateway).

Локально: `pip install Pillow && python3 build.py`, потім відкрити `dist/`.
Свій домен: Netlify сам підставляє його в SEO-посилання під час збірки.

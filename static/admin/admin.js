/* Попередній перегляд в адмінці: показує зйомку так, як на сайті */
(function () {
  if (!window.CMS) return;
var SMALLN = {4:['1 / 1 / 4 / 3','1 / 3 / 3 / 5','3 / 3 / 4 / 4','3 / 4 / 4 / 5'], 5:['1 / 1 / 4 / 3','1 / 3 / 3 / 4','1 / 4 / 3 / 5','3 / 3 / 4 / 4','3 / 4 / 4 / 5']};
var BIGN = {4:['1 / 1 / 5 / 3','1 / 3 / 5 / 5','1 / 5 / 3 / 7','3 / 5 / 5 / 7'], 5:['1 / 1 / 5 / 3','1 / 3 / 5 / 5','1 / 5 / 3 / 6','1 / 6 / 3 / 7','3 / 5 / 5 / 7'], 6:['1 / 1 / 5 / 3','1 / 3 / 3 / 4','1 / 4 / 3 / 5','3 / 3 / 5 / 5','1 / 5 / 3 / 7','3 / 5 / 5 / 7']};
var PREV_ORDER = {4:[0,2,1,3], 5:[1,3,2,4,0]};
  var BADGE = {p:'ПЕРСОНАЛЬНА', f:'СІМЕЙНА', e:'ІВЕНТ'};
  var base = (document.currentScript && document.currentScript.src) || location.href;
  function url(rel) { return new URL(rel, base).href; }
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  CMS.registerPreviewStyle(url('preview.css'));

  function js(v) { return v && v.toJS ? v.toJS() : (v || []); }
  function safe(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { return h('pre', {style: {padding: '16px', whiteSpace: 'pre-wrap'}}, 'Попередній перегляд недоступний: ' + e.message); } }; }
  function tile(src, pos, area, getAsset, key) {
    return h('div', {className: 'pic', key: key, style: {gridArea: area}},
      src ? h('img', {src: String(getAsset(src)), alt: '', style: {objectPosition: pos || '50% 50%'}}) : null);
  }

  var ShootPreview = createClass({
    render: safe(function () {
      var d = this.props.entry.get('data'), getAsset = this.props.getAsset;
      var photos = js(d.get('photos')).filter(function (p) { return p && p.image; });
      var n = photos.length, ok = n >= 4 && n <= 6;
      var posOf = {}; photos.forEach(function (p) { posOf[p.image] = p.pos; });
      var collage = ok
        ? h('div', {className: 'collage'}, photos.map(function (p, i) { return tile(p.image, p.pos, BIGN[n][i], getAsset, i); }))
        : h('div', {className: 'warn'}, 'Додайте від 4 до 6 фото — зараз ' + n + '. Тоді тут з’явиться колаж, як на сайті.');
      var prev = js(d.get('preview')).filter(Boolean), mini = null;
      if (ok) {
        var pl, ord;
        if (prev.length === 4) { pl = prev; ord = [0, 1, 2, 3]; }
        else if (n === 6) { pl = photos.slice(0, 4).map(function (p) { return p.image; }); ord = PREV_ORDER[4]; }
        else { pl = photos.map(function (p) { return p.image; }); ord = PREV_ORDER[n]; }
        mini = h('div', {className: 'mini'}, ord.map(function (k, j) { return tile(pl[k], posOf[pl[k]], SMALLN[pl.length][j], getAsset, j); }));
      }
      return h('div', {},
        d.get('hidden') ? h('div', {className: 'hiddenNote'}, 'Ця зйомка схована — на сайті її не видно.') : null,
        h('div', {className: 'cap'}, 'ПОРТФОЛІО — ТАК ЗЙОМКА ВИГЛЯДАЄ В КАРУСЕЛІ'),
        h('div', {className: 'dark'}, h('div', {className: 'works'},
          h('div', {className: 'info'},
            h('div', {className: 'badge'}, BADGE[d.get('category')] || 'КАТЕГОРІЯ?'),
            h('h2', {className: 'oswald'}, d.get('title') || 'Назва зйомки'),
            h('p', {}, d.get('description') || ''),
            h('dl', {}, h('dt', {}, 'ЛОКАЦІЯ'), h('dd', {style: {margin: 0}}, String(d.get('location') || '').toUpperCase()))),
          collage)),
        mini ? h('div', {className: 'cap'}, d.get('featured') ? 'ГОЛОВНА — МАЛИЙ КОЛАЖ' : 'ГОЛОВНА — МАЛИЙ КОЛАЖ (якщо позначити «Показувати на головній»)') : null,
        mini ? h('div', {style: {margin: '0 16px 32px'}}, mini) : null
      );
    })
  });
  CMS.registerPreviewTemplate('shoots', ShootPreview);

  var PricesPreview = createClass({
    render: safe(function () {
      var d = this.props.entry.get('data');
      var groups = ['ind','fam','evt'].map(function (k) { return js(d.get(k)) || {}; }), pp = js(d.get('prepay'));
      return h('div', {},
        h('div', {className: 'cap'}, 'ЗАПИС — ТАК ЦІНИ ВИГЛЯДАЮТЬ НА САЙТІ'),
        groups.map(function (g, gi) {
          return h('div', {className: 'grp', key: gi},
            h('h3', {className: 'oswald'}, g.tab),
            h('p', {className: 'note'}, g.note),
            h('div', {className: 'services'}, (g.tariffs || []).map(function (t, i) {
              return h('div', {className: 'svc', key: i},
                h('div', {className: 'n'}, '0' + (i + 1)),
                h('div', {className: 'nm oswald'}, t.d),
                h('div', {className: 'price oswald'}, (t.p || '') + ' ', h('small', {}, 'грн')),
                h('ul', {}, (t.items || []).map(function (x, k) { return h('li', {key: k}, x); })));
            })));
        }),
        pp && pp.title ? h('div', {className: 'prepay'}, h('b', {}, pp.title), ' ', pp.text) : null);
    })
  });
  CMS.registerPreviewTemplate('prices', PricesPreview);
})();

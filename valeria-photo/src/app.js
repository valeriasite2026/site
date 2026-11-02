
(function(){
'use strict';
if(/(invite|recovery|confirmation|email_change)_token=/.test(location.hash)){location.replace('/admin/'+location.hash);return;}

/* ---------- data ---------- */
var T = {
  p:{tab:'ПЕРСОНАЛЬНІ',badge:'ПЕРСОНАЛЬНА',cta:'ХОЧУ ПЕРСОНАЛЬНУ ЗЙОМКУ',acc:'персональну зйомку',num:'01',name:'Персональна зйомка',desc:'Портрети для себе, особистого бренду, соцмереж і сайту.'},
  f:{tab:'СІМЕЙНІ',badge:'СІМЕЙНА',cta:'ХОЧУ СІМЕЙНУ ЗЙОМКУ',acc:'сімейну зйомку',num:'02',name:'Сімейна зйомка',desc:'Тепло вашої родини — вдома, на природі чи в студії.'},
  e:{tab:'ІВЕНТИ',badge:'ІВЕНТ',cta:'ХОЧУ ЗЙОМКУ ІВЕНТУ',acc:'зйомку івенту',num:'03',name:'Зйомка івентів',desc:'Дні народження, хрестини та інші свята — живий репортаж без постановок.'}
};
var BIG = [
  ['1 / 1 / 5 / 3','1 / 3 / 3 / 5','1 / 5 / 2 / 7','2 / 5 / 4 / 7','3 / 3 / 5 / 4','3 / 4 / 5 / 5','4 / 5 / 5 / 7'],
  ['1 / 1 / 3 / 4','1 / 4 / 5 / 6','1 / 6 / 3 / 7','3 / 1 / 5 / 2','3 / 2 / 5 / 4','3 / 6 / 5 / 7'],
  ['1 / 1 / 3 / 3','1 / 3 / 2 / 5','2 / 3 / 3 / 5','1 / 5 / 3 / 7','3 / 1 / 5 / 2','3 / 2 / 5 / 4','3 / 4 / 5 / 6','3 / 6 / 5 / 7'],
  ['1 / 1 / 2 / 3','2 / 1 / 5 / 3','1 / 3 / 5 / 5','1 / 5 / 3 / 6','1 / 6 / 3 / 7','3 / 5 / 5 / 7']
];
var SMALL = [
  ['1 / 1 / 4 / 3','1 / 3 / 2 / 5','2 / 3 / 4 / 4','2 / 4 / 3 / 5','3 / 4 / 4 / 5'],
  ['1 / 1 / 3 / 3','1 / 3 / 4 / 5','3 / 1 / 4 / 2','3 / 2 / 4 / 3'],
  ['1 / 1 / 2 / 3','2 / 1 / 4 / 2','2 / 2 / 4 / 3','1 / 3 / 3 / 5','3 / 3 / 4 / 4','3 / 4 / 4 / 5']
];
var SMALLN = {4:['1 / 1 / 4 / 3','1 / 3 / 3 / 5','3 / 3 / 4 / 4','3 / 4 / 4 / 5'], 5:['1 / 1 / 4 / 3','1 / 3 / 3 / 4','1 / 4 / 3 / 5','3 / 3 / 4 / 4','3 / 4 / 4 / 5']};
var BIGN = {4:['1 / 1 / 5 / 3','1 / 3 / 5 / 5','1 / 5 / 3 / 7','3 / 5 / 5 / 7'], 5:['1 / 1 / 5 / 3','1 / 3 / 5 / 5','1 / 5 / 3 / 6','1 / 6 / 3 / 7','3 / 5 / 5 / 7'], 6:['1 / 1 / 5 / 3','1 / 3 / 3 / 4','1 / 4 / 3 / 5','3 / 3 / 5 / 5','1 / 5 / 3 / 7','3 / 5 / 5 / 7']};
var MOBN = {
  4:[['1 / 1 / 3 / 4','3 / 1 / 5 / 2','3 / 2 / 5 / 3','3 / 3 / 5 / 4'],
     ['1 / 1 / 3 / 3','1 / 3 / 3 / 4','3 / 1 / 5 / 2','3 / 2 / 5 / 4']],
  5:[['1 / 1 / 3 / 3','1 / 3 / 3 / 4','3 / 1 / 5 / 2','3 / 2 / 5 / 3','3 / 3 / 5 / 4'],
     ['1 / 1 / 3 / 2','1 / 2 / 3 / 4','3 / 1 / 5 / 3','3 / 3 / 4 / 4','4 / 3 / 5 / 4']],
  6:[['1 / 1 / 3 / 3','1 / 3 / 2 / 4','2 / 3 / 3 / 4','3 / 1 / 5 / 2','3 / 2 / 5 / 3','3 / 3 / 5 / 4'],
     ['1 / 1 / 5 / 2','1 / 2 / 3 / 4','3 / 2 / 4 / 3','3 / 3 / 4 / 4','4 / 2 / 5 / 3','4 / 3 / 5 / 4']]
};
var PREV_ORDER = {4:[0,2,1,3], 5:[1,3,2,4,0]};
var KIND={p:'персональна фотосесія',f:'сімейна фотосесія',e:'фотозйомка події'};
function cap(t){t=String(t).toLowerCase();return t.charAt(0).toUpperCase()+t.slice(1);}
function altFor(r,cat,i){return r[0].replace(/\u00a0/g,' ')+' — '+KIND[cat]+', '+cap(r[1])+', фото '+(i+1)+'. Фотограф Валерія';}
function photo(key,alt){return '<img src="'+IMG[key]+'" alt="'+(alt||'')+'" loading="lazy" decoding="async" style="object-position:'+(POS[key]||'50% 50%')+'">';}
var PAL = [['#CFCABE','#C4BFB2','#D5D1C5','#BDB8AB'],['#C9C4B7','#D9D5CA','#BFBAAE','#CFCABE'],['#D5D1C5','#C2BDB0','#CBC6B9','#B8B3A6']];

/* ---------- content (from /content via build) ---------- */
var C = window.CONTENT;
function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function nb(t){return esc(t).replace(/(^|[\s ])([А-Яа-яІіЇїЄєҐґ]{1,2}) /g,'$1$2 ');}
var IMG = {}, POS = {};
function reg(src,pos){IMG[src]=src;if(pos)POS[src]=pos;return src;}
var DATA = {p:[],f:[],e:[]};
C.shoots.forEach(function(sh){
  var keys=sh.photos.map(function(ph){return reg(ph.image,ph.pos);});
  var row=[nb(sh.title),esc(String(sh.location||'').toUpperCase()),'',0,esc(sh.description),keys];
  if(sh.preview)row.push(sh.preview.map(function(x){return reg(x);}));
  DATA[sh.category].push(row);
});
var PREVIEWS = ['p','f','e'].map(function(c){return [c,C.featured[c]||0];});
var CT = C.contacts;
var MESSENGERS = [
  {id:'tg',label:'TELEGRAM',mode:'open',app:'Telegram',url:'https://t.me/'+CT.telegram},
  {id:'ig',label:'INSTAGRAM',mode:'copy',app:'Instagram',url:'https://ig.me/m/'+CT.instagram},
  {id:'th',label:'THREADS',mode:'copy',app:'Threads',url:'https://www.threads.com/@'+CT.threads}
];

/* ---------- state ---------- */
var S = {page:'main', cat:'p', idx:0, svc:'ind', tar:0, msg:''};

/* ---------- helpers ---------- */
function pad(v){return v<10?'0'+v:''+v;}
function kadr(k){var a=k%10,b=k%100;if(a===1&&b!==11)return k+' КАДР';if(a>=2&&a<=4&&(b<12||b>14))return k+' КАДРИ';return k+' КАДРІВ';}
function icon(fill,inner){fill=fill||'#BDB8AB';inner=inner||'#E4E0D6';
  return '<svg viewBox="0 0 64 48" aria-hidden="true"><rect x="1" y="1" width="62" height="46" fill="'+fill+'"/><path d="M8 40 L24 22 L34 32 L42 25 L56 40 Z" fill="'+inner+'"/><circle cx="46" cy="13" r="5" fill="'+inner+'"/></svg>';}
function arrow(){return '<span aria-hidden="true">→</span>';}
function message(){var g=PRICE[S.svc],t=g.tariffs[S.tar||0];return 'Вітаю! Мені дуже сподобалося ваше портфоліо, хотіла б записатися на '+g.msg+': '+t.d+' — '+t.p+' грн.';}

/* ---------- shared blocks ---------- */
function logoMark(){return '<svg class="lm" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="118 10.8" transform="rotate(-30 22 22)"/><circle cx="36.5" cy="7.5" r="1.7" fill="currentColor"/><text x="22" y="29.6" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="21" fill="currentColor">В</text></svg>';}
function logo(){return logoMark()+'<span class="lw"><b>ВАЛЕРІЯ</b><i>ФОТОГРАФ</i></span>';}
function header(active){
  var isP = active==='portfolio';
  var chev='<svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 1 L7 7 L13 1"/></svg>';
  var go='<span aria-hidden="true">→</span>';
  return '<header class="header">'+
    '<a class="logo" href="/" data-go="main" data-to="top" aria-label="Валерія, фотограф — на головну">'+logo()+'<span class="rule"></span></a>'+
    '<button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="mnav-'+active+'" aria-label="Відкрити меню"><span class="logo-in">'+logo()+'</span>'+chev+'</button>'+
    '<nav class="mnav" id="mnav-'+active+'" aria-label="Мобільне меню">'+
      '<a href="/" data-go="main" data-to="top"'+(active==='main'?' aria-current="page"':'')+'>ГОЛОВНА '+go+'</a>'+
      '<a href="/portfolio/" data-go="portfolio"'+(isP?' aria-current="page"':'')+'>ПОРТФОЛІО '+go+'</a>'+
      '<a href="/" data-go="main" data-to="about">ПРО МЕНЕ '+go+'</a>'+
      '<a href="/" data-go="main" data-to="process">ЯК ПРОХОДИТЬ ЗАПИС '+go+'</a>'+
      '<a href="#" data-go="'+active+'" data-to="contacts">КОНТАКТИ '+go+'</a>'+
    '</nav>'+
    '<nav class="nav" aria-label="Головне меню">'+
      '<a href="/portfolio/" data-go="portfolio"'+(isP?' class="on" aria-current="page"':'')+'>ПОРТФОЛІО</a>'+
      '<a href="/" data-go="main" data-to="about">ПРО МЕНЕ</a>'+
      '<a href="/" data-go="main" data-to="process">ЯК ПРОХОДИТЬ ЗАПИС</a>'+
    '</nav>'+
    '<a class="btn" href="#" data-go="'+active+'" data-to="booking">ЗАПИСАТИСЯ '+arrow()+'</a>'+
  '</header>';
}

function footer(){
  return '<footer class="dark footer" id="contacts">'+
    '<div class="fgrid">'+
      '<div><a href="/" class="logo" data-go="main" data-to="top" aria-label="Валерія, фотограф — на головну">'+logo()+'</a><p style="margin-top:22px;font-size:13px;letter-spacing:.14em;line-height:1.8;color:#C9C5B9">ПЕРСОНАЛЬНІ, СІМЕЙНІ<br>ЗЙОМКИ ТА ІВЕНТИ<br>ЧОРНОМОРСЬК / ОДЕСА</p></div>'+
      '<div><div class="fh">МЕНЮ</div><nav class="flist"><a href="/portfolio/" data-go="portfolio">ПОРТФОЛІО</a><a href="/" data-go="main" data-to="about">ПРО МЕНЕ</a><a href="/" data-go="main" data-to="process">ЯК ПРОХОДИТЬ ЗАПИС</a><a href="#" data-go="'+S.page+'" data-to="booking">ЗАПИСАТИСЯ</a></nav></div>'+
      '<div><div class="fh">КОНТАКТИ</div><div class="flist" style="letter-spacing:.06em"><a href="tel:'+CT.phone.replace(/[^\d+]/g,'')+'">'+esc(CT.phone)+'</a></div></div>'+
      '<div><div class="fh">СОЦМЕРЕЖІ</div><div class="flist"><a href="https://www.instagram.com/'+CT.instagram+'/" target="_blank" rel="noopener">INSTAGRAM ↗</a><a href="https://www.threads.com/@'+CT.threads+'" target="_blank" rel="noopener">THREADS ↗</a><a href="https://t.me/'+CT.telegram+'" target="_blank" rel="noopener">TELEGRAM ↗</a></div></div>'+
    '</div>'+
    '<div class="mark oswald">Валерія</div>'+
    '<div class="fbottom"><span>© '+new Date().getFullYear()+' ВАЛЕРІЯ</span><span>НАТУРАЛЬНО — ОСОБИСТО — З ЛЮБОВ’Ю</span></div>'+
  '</footer>';
}

var PMSG = {ind:'персональну зйомку',fam:'сімейну зйомку',evt:'зйомку події'};
var PRICE = {};
['ind','fam','evt'].forEach(function(k){var g=C.prices[k];PRICE[k]={tab:esc(g.tab),msg:PMSG[k],note:esc(g.note),tariffs:g.tariffs.map(function(t){return {d:esc(t.d),p:esc(t.p),items:(t.items||[]).map(esc)};})};});
function grpOf(k){return k==='e'||k==='evt'?'evt':(k==='f'||k==='fam'?'fam':'ind');}
function bookingInner(){
  var g=PRICE[S.svc], ti=S.tar||0;
  var gtabs=['ind','fam','evt'].map(function(id){var on=id===S.svc;return '<button type="button" class="gtab'+(on?' on':'')+'" data-grp="'+id+'" aria-pressed="'+on+'">'+PRICE[id].tab+'</button>';}).join('');
  var cards=g.tariffs.map(function(t,i){
    var on=i===ti;
    var list=t.items?'<ul class="tlist">'+t.items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>':'<p class="tnote">Склад пакета — [уточнити]</p>';
    return '<button type="button" class="svc'+(on?' on':'')+'" data-tar="'+i+'" aria-pressed="'+on+'">'+
      '<span class="top"><span>0'+(i+1)+'</span><span class="dot"></span></span>'+
      '<span class="nm oswald">'+t.d+'</span>'+
      '<span class="price oswald">'+t.p+' <small>грн</small></span>'+list+
    '</button>';
  }).join('');
  var mb = MESSENGERS.map(function(m){
    return '<button type="button" class="mbtn'+(m.id===S.msg?' on':'')+'" data-msg="'+m.id+'">'+m.label+'</button>';
  }).join('');
  var hint='Оберіть месенджер — повідомлення підставиться автоматично.';
  var ch = MESSENGERS.filter(function(m){return m.id===S.msg;})[0];
  if(ch&&ch.url&&ch.mode==='open') hint='Відкрився чат у '+ch.app+' — текст уже набраний, залишилося натиснути «Надіслати».';
  if(ch&&ch.url&&ch.mode==='copy') hint='Текст скопійовано ✓ Відкрився '+ch.app+' — вставте повідомлення в особисті й надішліть.';
  if(ch&&!ch.url) hint=ch.app+' поки не підключено — це приклад кнопки.';
  return '<div class="gtabs" role="group" aria-label="Тип зйомки">'+gtabs+'</div>'+
    '<p class="gnote">'+g.note+'</p><div class="services" role="group" aria-label="Тривалість">'+cards+'</div>'+
    (C.prices.prepay&&C.prices.prepay.title?'<div class="prepay"><b>'+esc(C.prices.prepay.title)+'</b> '+esc(C.prices.prepay.text)+'</div>':'')+
    '<div class="msgbox">'+
      '<div style="flex:1 1 420px;min-width:0"><div style="font-size:12px;letter-spacing:.22em">ВАШЕ ПОВІДОМЛЕННЯ ФОТОГРАФУ</div><div class="bubble">'+message()+'</div><div style="margin-top:14px;font-size:12px;line-height:1.7;color:var(--muted)">Текст підставляється автоматично — змінюється разом з обраним пакетом.</div></div>'+
      '<div style="flex:1 1 360px;min-width:0;display:flex;flex-direction:column;gap:14px"><div style="font-size:12px;letter-spacing:.22em">НАПИСАТИ В МЕСЕНДЖЕР</div><div class="mgrid">'+mb+'</div><div class="hint" role="status">'+hint+'</div></div>'+
    '</div>';
}
function booking(num){
  return '<section class="sec" id="booking">'+
    '<div class="label">'+(num?num+' — ':'')+'ЗАПИС <span class="rule"></span></div>'+
    '<h2 class="h2 oswald">Оберіть<br>свою зйомку</h2>'+
    '<div id="booking-inner">'+bookingInner()+'</div>'+
  '</section>';
}

/* ---------- main page ---------- */
function pageMain(){
  var previews = PREVIEWS.map(function(p,i){
    var r=DATA[p[0]][p[1]], t=T[p[0]];
    var pl = r[6] || r[5], ord = r[6] ? pl.map(function(_,k){return k;}) : (pl ? PREV_ORDER[pl.length] : null);
    var tiles = pl ? ord.map(function(k,j){return '<button type="button" class="zoom pic" data-zoom aria-label="Збільшити фото" style="grid-area:'+SMALLN[pl.length][j]+'">'+photo(pl[k],altFor(r,p[0],j))+'</button>';}).join('')
      : SMALL[i].map(function(a,j){return '<button type="button" class="zoom" data-zoom aria-label="Збільшити фото" style="grid-area:'+a+';background:'+PAL[0][(i+j)%4]+'"></button>';}).join('');
    return '<article style="display:flex;flex-direction:column">'+
      '<div class="mini" data-zoom-title="'+r[0]+'">'+tiles+'</div>'+
      '<div class="badge" style="margin-top:22px">'+t.badge+'</div>'+
      '<h3 class="oswald" style="margin-top:16px;font-size:36px;line-height:1">'+r[0]+'</h3>'+
      '<p style="margin-top:12px;font-size:13px;line-height:1.7;color:var(--soft)">'+r[4]+'</p>'+
      '<div class="meta-row"><span>'+r[1]+'</span></div>'+
      '<a href="#" class="tlink" style="margin-top:10px;font-size:12px;letter-spacing:.18em" data-book="'+p[0]+'">'+t.cta+' '+arrow()+'</a>'+
    '</article>';
  }).join('');

  return '<div class="wrap" id="top">'+
  '<div class="card">'+
    '<section class="hero">'+header('main')+
      '<div class="hero-body">'+
        '<div class="hero-left">'+
          '<div class="label" style="margin-top:20px">ФОТОГРАФ <span class="rule"></span></div>'+
          '<h1 class="hero-name oswald"><span class="sr">Фотограф </span>Валерія</h1>'+
          '<p style="margin-top:22px;font-size:15px;letter-spacing:.18em;line-height:1.5">ПЕРСОНАЛЬНІ, СІМЕЙНІ<br>ЗЙОМКИ ТА ІВЕНТИ</p>'+
          '<div class="pic m-photo">'+'<img src="'+C.home.hero.image+'" alt="'+esc(C.home.hero.alt)+'" style="object-position:'+(C.home.hero.pos||'50% 50%')+'">'+'</div>'+
          '<a href="/" class="tlink" style="margin-top:36px" data-go="main" data-to="portfolio">ДИВИТИСЯ ПОРТФОЛІО '+arrow()+'</a>'+
          '<a href="/" class="pic video" aria-label="Дивитися портфоліо" data-go="main" data-to="portfolio"><img src="'+C.home.small.image+'" alt="'+esc(C.home.small.alt)+'" style="object-position:'+(C.home.small.pos||'50% 50%')+'"></a>'+
          '<div class="hero-ctas">'+
            '<a href="/" class="btn lg" data-go="main" data-to="booking">ЗАПИСАТИСЯ НА ЗЙОМКУ '+arrow()+'</a>'+
            '<a href="/" style="display:inline-flex;align-items:center;gap:22px" data-go="main" data-to="about"><span class="circle"><svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="#1F1E1B" stroke-width="1.3" aria-hidden="true"><path d="M7 1 V17 M1 11 L7 17 L13 11"/></svg></span><span style="font-size:12px;letter-spacing:.2em;line-height:1.6">БІЛЬШЕ<br>ПРО МЕНЕ</span></a>'+
          '</div>'+
        '</div>'+
        '<a href="/" class="pic hero-photo" aria-label="Дивитися портфоліо" data-go="main" data-to="portfolio">'+'<img src="'+C.home.hero.image+'" alt="'+esc(C.home.hero.alt)+'" style="object-position:'+(C.home.hero.pos||'50% 50%')+'">'+'</a>'+
      '</div>'+
      '<div class="vert"><span class="ln"></span><span class="t">НАТУРАЛЬНО — ОСОБИСТО — З ЛЮБОВ’Ю</span><span class="ln"></span></div>'+
    '</section>'+
    '<section class="sec about" id="about">'+
      '<div class="about-photos"><div class="pic about-main"><img src="'+C.about.photo.image+'" alt="'+esc(C.about.photo.alt)+'" style="object-position:'+(C.about.photo.pos||'50% 50%')+'"></div><div class="pic about-small"><img src="'+C.about.photo2.image+'" alt="'+esc(C.about.photo2.alt)+'" style="object-position:'+(C.about.photo2.pos||'50% 50%')+'"></div></div>'+
      '<div class="about-text">'+
        '<div class="label">02 — ПРО МЕНЕ <span class="rule"></span></div>'+
        '<h2 class="h2 oswald">Привіт,<br>я Валерія</h2>'+
        C.about.paragraphs.map(function(t,i){return '<p style="margin-top:'+(i?18:36)+'px;max-width:560px;font-size:16px;line-height:1.8">'+esc(t)+'</p>';}).join('')+
        '<div class="facts path"><div class="fact"><b>01</b><span>ТЕЛЕФОН<br>ПЕРШІ КАДРИ</span></div><div class="fact"><b>02</b><span>КОНТЕНТ-<br>МЕЙКЕРКА</span></div><div class="fact"><b>03</b><span>ФОТОГРАФ<br>З КАМЕРОЮ</span></div></div>'+
        '<a href="/" class="tlink" style="margin-top:44px" data-go="main" data-to="portfolio">ДИВИТИСЯ МОЇ РОБОТИ '+arrow()+'</a>'+
      '</div>'+
    '</section>'+
  '</div>'+

  '<section class="dark" id="portfolio" style="padding:100px 5.4% 90px">'+
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:32px">'+
      '<div><div class="label">03 — ПОРТФОЛІО <span class="rule"></span></div><h2 class="h2 oswald">Мої зйомки</h2></div>'+
      '<p class="lead" style="max-width:380px;color:var(--soft)">По одній історії з кожного напряму. Більше робіт — на сторінці портфоліо.</p>'+
    '</div>'+
    '<div class="previews">'+previews+'</div>'+
    '<div style="display:flex;justify-content:center;margin-top:64px"><a href="/portfolio/" class="btn lg light" data-go="portfolio">ПОДИВИТИСЯ БІЛЬШЕ РОБІТ '+arrow()+'</a></div>'+
  '</section>'+

  '<div class="card">'+
    '<section class="sec" id="process">'+
      '<div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:32px">'+
        '<div><div class="label">04 — ЯК МИ ПРАЦЮЄМО <span class="rule"></span></div><h2 class="h2 oswald">Як проходить<br>запис</h2></div>'+
        '<p class="lead" style="max-width:380px">П’ять простих кроків — від першого повідомлення до готової галереї.</p>'+
      '</div>'+
      '<ol class="steps">'+
        '<li><div class="n">01</div><div class="t">ЗАЯВКА</div><p>Обираєте формат зйомки та пишете мені у зручний месенджер.</p></li>'+
        '<li><div class="n">02</div><div class="t">ОБГОВОРЕННЯ</div><p>Узгоджуємо дату, локацію, образи та настрій. Дату бронюю після передоплати 50%.</p></li>'+
        '<li><div class="n">03</div><div class="t">ЗЙОМКА</div><p>Від 1 години у спокійному темпі — я підкажу, як рухатися та стати.</p></li>'+
        '<li><div class="n">04</div><div class="t">ОБРОБКА</div><p>Відбираю найкращі кадри й обробляю їх — готові фото до 7 днів.</p></li>'+
        '<li><div class="n">05</div><div class="t">ГОТОВІ ФОТО</div><p>Отримуєте онлайн-галерею, яку зручно завантажити й поділитися.</p></li>'+
      '</ol>'+
    '</section>'+
    booking('05')+
  '</div>'+
  footer()+
  '</div>';
}

/* ---------- portfolio page ---------- */
function worksInner(){
  var list=DATA[S.cat], n=list.length, idx=Math.min(S.idx,n-1), r=list[idx], t=T[S.cat];
  var tabs=['p','f','e'].map(function(id){
    var on=id===S.cat;
    return '<button type="button" role="tab" class="tab'+(on?' on':'')+'" aria-selected="'+on+'" data-cat="'+id+'"><span>'+T[id].tab+'</span></button>';
  }).join('');
  var pal=PAL[idx%3];
  var tiles=r[5] ? r[5].map(function(key,i){return '<button type="button" class="ph zoom pic" data-zoom aria-label="Збільшити фото" style="grid-area:'+BIGN[r[5].length][i]+';--ma:'+MOBN[r[5].length][idx%2][i]+';animation-delay:'+(i*40)+'ms">'+photo(key,altFor(r,S.cat,i))+'</button>';}).join('') : BIG[idx%4].map(function(a,i){return '<button type="button" class="ph zoom" data-zoom aria-label="Збільшити фото" style="grid-area:'+a+';background:'+pal[(i+idx)%4]+';animation-delay:'+(i*40)+'ms">'+icon('#9E998C','#D5D1C5')+'</button>';}).join('');
  var prog='<div class="prog" role="progressbar" aria-label="Позиція в каруселі" aria-valuemin="1" aria-valuemax="'+n+'" aria-valuenow="'+(idx+1)+'"><span style="width:'+((idx+1)/n*100)+'%"></span></div>';
  return '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:24px;padding-bottom:28px;border-bottom:1px solid var(--rule)">'+
      '<div class="tabs" role="tablist" aria-label="Категорії зйомок">'+tabs+'</div>'+
    '</div>'+
    '<div class="works">'+
      '<div class="info">'+
        '<div>'+
          '<div class="badge" style="min-height:32px;padding:0 16px">'+t.badge+'</div>'+
          '<h2 class="oswald">'+r[0]+'</h2>'+
          '<p style="margin-top:22px;font-size:14px;line-height:1.8;color:var(--soft)">'+r[4]+'</p>'+
          '<dl><div><dt>ЛОКАЦІЯ</dt><dd>'+r[1]+'</dd></div></dl>'+
        '</div>'+
        '<a href="#" class="btn wide" data-book="'+S.cat+'">'+t.cta+' '+arrow()+'</a>'+
      '</div>'+
      '<div class="stage">'+
        '<div class="collage" data-zoom-title="'+r[0]+'">'+tiles+'</div>'+
        '<div class="controls">'+prog+'<div style="display:flex;gap:10px"><button type="button" class="arrow" data-step="-1" aria-label="Попередня зйомка">←</button><button type="button" class="arrow fill" data-step="1" aria-label="Наступна зйомка">→</button></div></div>'+
      '</div>'+
    '</div>';
}
function pagePortfolio(){
  return '<div class="wrap" id="top">'+
  '<div class="card" style="padding:26px 5.4% 80px">'+header('portfolio')+
    '<div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:56px;font-size:12px;letter-spacing:.2em"><span><a href="/" class="tlink" style="font-size:12px;min-height:0" data-go="main" data-to="top">ГОЛОВНА</a> / ПОРТФОЛІО</span><a href="/" class="tlink" style="font-size:12px;min-height:0" data-go="main" data-to="top">← НА ГОЛОВНУ</a></div>'+
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:32px;margin-top:40px">'+
      '<h1 class="oswald hero-name" style="margin:0;font-size:clamp(52px,13vw,140px);max-width:100%;overflow-wrap:anywhere;line-height:.9">Портфоліо<span class="sr"> фотографа Валерії</span></h1>'+
      '<p class="lead" style="max-width:400px">Оберіть напрям і гортайте історії — кожна зі своїм коротким описом, локацією та сезоном.</p>'+
    '</div>'+
  '</div>'+
  '<section class="dark" id="works" style="padding:56px 5.4% 72px"><div id="works-inner">'+worksInner()+'</div></section>'+
  '<div class="card">'+booking('')+'</div>'+
  footer()+
  '</div>';
}

/* ---------- render & routing ---------- */
var app=document.getElementById('app');
function fitTitles(){document.querySelectorAll('.info h2').forEach(function(h){h.style.fontSize='';var fs=parseFloat(getComputedStyle(h).fontSize);while(h.scrollWidth>h.clientWidth+1&&fs>26){fs-=2;h.style.fontSize=fs+'px';}});}
function render(){app.innerHTML = S.page==='portfolio'?pagePortfolio():pageMain();fitTitles();}
function refresh(id,fn){var el=document.getElementById(id);if(el){el.innerHTML=fn();fitTitles();}}
window.addEventListener('resize',fitTitles);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitTitles);
function scrollTo(id,smooth){
  var el=document.getElementById(id);
  if(!el||id==='top'){window.scrollTo({top:0,behavior:smooth?'smooth':'auto'});return;}
  el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});
}
function go(page,to,noPush){
  if(page!==S.page){S.page=page;if(!noPush)history.pushState({p:page},'',page==='portfolio'?'/portfolio/':'/');render();
    if(to&&to!=='top'){requestAnimationFrame(function(){scrollTo(to,false);});}else{window.scrollTo(0,0);}
  } else { scrollTo(to||'top',true); }
}

function copyText(t){
  function fallback(){try{var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);}catch(e){}}
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).catch(fallback);}else{fallback();}
}
function closeMenus(){document.querySelectorAll('.header.open').forEach(function(h){h.classList.remove('open');var b=h.querySelector('.menu-btn');if(b){b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Відкрити меню');}});}
document.addEventListener('click',function(e){
  var mb=e.target.closest('[data-menu]');
  if(mb){var h=mb.closest('.header');var o=h.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.setAttribute('aria-label',o?'Закрити меню':'Відкрити меню');return;}
  if(!e.target.closest('.mnav'))closeMenus();
  var el=e.target.closest('[data-go],[data-book],[data-cat],[data-i],[data-step],[data-grp],[data-tar],[data-msg]');
  if(!el)return;
  if(el.tagName==='A')e.preventDefault();
  var d=el.dataset;
  if(d.go){closeMenus();go(d.go,d.to);return;}
  if(d.book){S.svc=grpOf(d.book);S.tar=0;S.msg='';refresh('booking-inner',bookingInner);scrollTo('booking',true);return;}
  if(d.cat){S.cat=d.cat;S.idx=0;S.svc=grpOf(d.cat);S.tar=0;S.msg='';refresh('works-inner',worksInner);refresh('booking-inner',bookingInner);return;}
  if(d.i){S.idx=+d.i;refresh('works-inner',worksInner);return;}
  if(d.step){var n=DATA[S.cat].length;S.idx=(S.idx+(+d.step)+n)%n;refresh('works-inner',worksInner);return;}
  if(d.grp){S.svc=d.grp;S.tar=0;S.msg='';refresh('booking-inner',bookingInner);return;}
  if(d.tar){S.tar=+d.tar;S.msg='';refresh('booking-inner',bookingInner);return;}
  if(d.msg){S.msg=d.msg;
    var m=MESSENGERS.filter(function(x){return x.id===d.msg;})[0];
    if(m&&m.url){
      var txt=message();
      if(m.mode==='copy')copyText(txt);
      window.open(m.mode==='open'?m.url+'?text='+encodeURIComponent(txt):m.url,'_blank','noopener');
    }
    refresh('booking-inner',bookingInner);return;}
});
document.addEventListener('keydown',function(e){
  if(S.page!=='portfolio')return;
  var t=e.target.tagName; if(t==='INPUT'||t==='TEXTAREA')return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=DATA[S.cat].length;S.idx=(S.idx+(e.key==='ArrowRight'?1:-1)+n)%n;refresh('works-inner',worksInner);}
});

/* ---------- lightbox ---------- */
var LB = {items:[], i:0, title:'', last:null};
var lb = document.createElement('div');
lb.className='lb'; lb.hidden=true;
lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-label','Перегляд фото');
lb.innerHTML='<button type="button" class="lb-btn lb-close" aria-label="Закрити">×</button>'+
  '<button type="button" class="lb-btn lb-prev" aria-label="Попереднє фото">←</button>'+
  '<figure class="lb-fig"><div class="lb-stage"></div><figcaption class="lb-cap"></figcaption></figure>'+
  '<button type="button" class="lb-btn lb-next" aria-label="Наступне фото">→</button>';
document.body.appendChild(lb);
var lbStage=lb.querySelector('.lb-stage'), lbCap=lb.querySelector('.lb-cap');
function lbShow(){
  var el=LB.items[LB.i], img=el.querySelector('img');
  if(img){ lbStage.innerHTML='<img src="'+img.src+'" alt="'+(img.alt||'')+'">'; }
  else {
    var r=el.getBoundingClientRect(), ratio=r.width/r.height;
    var maxW=Math.min(window.innerWidth-(window.innerWidth>900?176:24), 1100), maxH=window.innerHeight-(window.innerWidth>900?160:190);
    var w=maxW, h=w/ratio; if(h>maxH){h=maxH;w=h*ratio;}
    lbStage.innerHTML='<div class="lb-ph" style="width:'+Math.round(w)+'px;height:'+Math.round(h)+'px;background:'+getComputedStyle(el).backgroundColor+'">'+icon('#9E998C','#D5D1C5')+'</div>';
  }
  lbStage.style.animation='none'; void lbStage.offsetWidth; lbStage.style.animation='';
  lbCap.textContent=LB.title;
  var many=LB.items.length>1;
  lb.querySelector('.lb-prev').style.display=many?'':'none';
  lb.querySelector('.lb-next').style.display=many?'':'none';
}
function lbOpen(el){
  var box=el.parentElement;
  LB.items=[].slice.call(box.querySelectorAll('[data-zoom]'));
  LB.i=LB.items.indexOf(el); LB.title=box.getAttribute('data-zoom-title')||''; LB.last=el;
  lb.hidden=false; document.body.style.overflow='hidden';
  lbShow(); lb.querySelector('.lb-close').focus();
}
function lbClose(){ lb.hidden=true; document.body.style.overflow=''; if(LB.last&&document.body.contains(LB.last))LB.last.focus(); }
function lbStep(d){ var n=LB.items.length; LB.i=(LB.i+d+n)%n; lbShow(); }
lb.addEventListener('click',function(e){
  e.stopPropagation();
  if(e.target.closest('.lb-close')){lbClose();return;}
  if(e.target.closest('.lb-prev')){lbStep(-1);return;}
  if(e.target.closest('.lb-next')){lbStep(1);return;}
  if(!e.target.closest('.lb-stage img,.lb-ph'))lbClose();
});
var tx=null;
lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
lb.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50)lbStep(dx<0?1:-1);});
document.addEventListener('click',function(e){
  var z=e.target.closest('[data-zoom]'); if(!z)return;
  e.stopImmediatePropagation(); lbOpen(z);
},true);
document.addEventListener('keydown',function(e){
  if(lb.hidden)return;
  if(e.key==='Escape'){lbClose();}
  else if(e.key==='ArrowRight'){lbStep(1);}
  else if(e.key==='ArrowLeft'){lbStep(-1);}
  else if(e.key==='Tab'){var f=[].slice.call(lb.querySelectorAll('button')).filter(function(b){return b.style.display!=='none';});var a=f.indexOf(document.activeElement);if(e.shiftKey&&a<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&a===f.length-1){e.preventDefault();f[0].focus();}return;}
  else return;
  e.preventDefault(); e.stopImmediatePropagation();
},true);

function isPf(){return location.pathname.indexOf('/portfolio')===0||location.hash==='#portfolio-page';}
if(isPf())S.page='portfolio';
window.addEventListener('popstate',function(){go(isPf()?'portfolio':'main','top',true);});
render();
})();

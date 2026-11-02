/* Перефарбовує Decap CMS у палітру сайту: підміняє його кольори та шрифт
   ще до того, як стилі потрапляють на сторінку. Підключати ДО decap-cms.js */
(function () {
  var MAP = [
    [/#3a69c7/gi, '#6B6B4A'],                  // активний синій -> олива
    [/#e8f5fe/gi, '#E8E6D6'],                  // світло-синій фон -> світла олива
    [/#eff0f4/gi, '#ECE8DF'],                  // фон -> теплий беж
    [/#313d3e/gi, '#1F1E1B'],                  // темні кнопки й текст -> чорнило
    [/#798291/gi, '#77736A'],                  // сірий текст -> теплий сірий
    [/#dfdfe3/gi, '#D9D4C7'],                  // рамки полів
    [/#5d626f/gi, '#4A4740'],                  // підписи полів
    [/#17a2b8/gi, '#6B6B4A'], [/#117888/gi, '#5A5A3D'], [/#ddf5f9/gi, '#E8E6D6'],
    [/#ffffff(?![0-9a-f])/gi, '#FBF9F4'], [/#fff(?![0-9a-f])/gi, '#FBF9F4'],
    [/font-family:\s*system-ui[^;}]*/gi, "font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace"]
  ];
  function fix(css) {
    for (var i = 0; i < MAP.length; i++) css = css.replace(MAP[i][0], MAP[i][1]);
    return css;
  }
  var ins = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule, index) {
    try { rule = fix(rule); } catch (e) {}
    return ins.call(this, rule, index);
  };
  // на випадок, якщо стилі вставляються текстом
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.tagName === 'STYLE' && n.textContent && !n.__fixed) { n.__fixed = 1; n.textContent = fix(n.textContent); }
      });
    });
  }).observe(document.head || document.documentElement, { childList: true });
})();

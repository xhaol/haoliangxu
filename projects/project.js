(() => {
  const languageButton = document.getElementById('language');
  let language = 'zh';
  try { if (localStorage.getItem('hx-language') === 'en') language = 'en'; } catch (_) {}
  let activeFigure = null;
  function captionFor(link) { return link.closest('figure').querySelector('figcaption').textContent; }
  function applyLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = el.dataset[language]; });
    languageButton.textContent = language === 'zh' ? 'EN ↔' : '中文 ↔';
    languageButton.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
    document.title = language === 'zh' ? 'BiDexGen · 许浩良' : 'BiDexGen · Haoliang Xu';
    document.querySelectorAll('[data-figure]').forEach(link => {
      const caption = captionFor(link);
      link.setAttribute('aria-label', (language === 'zh' ? '放大查看：' : 'Enlarge: ') + caption);
      link.querySelector('img').alt = caption;
    });
    if (activeFigure) {
      document.getElementById('figure-title').textContent = captionFor(activeFigure);
      document.getElementById('figure-large').alt = captionFor(activeFigure);
    }
  }
  languageButton.addEventListener('click', () => {
    language = language === 'zh' ? 'en' : 'zh';
    applyLanguage();
    try { localStorage.setItem('hx-language', language); } catch (_) {}
  });
  const dialog = document.getElementById('figure-dialog');
  const largeImage = document.getElementById('figure-large');
  document.querySelectorAll('[data-figure]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    activeFigure = link;
    largeImage.src = link.href;
    largeImage.alt = captionFor(link);
    document.getElementById('figure-title').textContent = captionFor(link);
    dialog.showModal();
    document.body.classList.add('viewer-open');
  }));
  document.getElementById('close-figure').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    if (activeFigure) activeFigure.focus();
    activeFigure = null;
  });
  applyLanguage();
})();

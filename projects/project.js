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
    document.title = (document.body.dataset.project || 'BiDexGen') + (language === 'zh' ? ' · 许浩良' : ' · Haoliang Xu');
    document.querySelectorAll('[data-figure]').forEach(link => {
      const localizedSource = link.getAttribute('data-src-' + language);
      if (localizedSource) {
        link.setAttribute('href', localizedSource);
        link.querySelector('img').setAttribute('src', localizedSource);
      }
      const caption = captionFor(link);
      link.setAttribute('aria-label', (language === 'zh' ? '放大查看：' : 'Enlarge: ') + caption);
      link.querySelector('img').alt = caption;
    });
    document.querySelectorAll('video[data-label-zh]').forEach(video => video.setAttribute('aria-label', video.getAttribute('data-label-' + language)));
    if (activeFigure) {
      document.getElementById('figure-large').src = activeFigure.href;
      document.getElementById('figure-title').textContent = captionFor(activeFigure);
      document.getElementById('figure-large').alt = captionFor(activeFigure);
    }
  }
  languageButton.addEventListener('click', () => {
    language = language === 'zh' ? 'en' : 'zh';
    applyLanguage();
    try { localStorage.setItem('hx-language', language); } catch (_) {}
  });
  document.querySelectorAll('video').forEach(video => {
    video.muted = true;
    video.setAttribute('controlslist', 'nodownload');
    video.addEventListener('contextmenu', event => event.preventDefault());
    video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => {
      if (other !== video) other.pause();
    }));
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

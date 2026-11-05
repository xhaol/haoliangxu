(() => {
  const toggle = document.getElementById('language');
  const elements = document.querySelectorAll('[data-zh][data-en]');
  let language = 'zh';
  try { if (localStorage.getItem('hx-language') === 'en') language = 'en'; } catch (_) {}
  function applyLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    elements.forEach(element => { element.textContent = element.dataset[language]; });
    toggle.textContent = language === 'zh' ? 'EN ↔' : '中文 ↔';
    toggle.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
    document.title = language === 'zh' ? '许浩良 · Haoliang Xu' : 'Haoliang Xu · 许浩良';
    document.querySelectorAll('video[data-label-zh]').forEach(v => v.setAttribute('aria-label', v.getAttribute('data-label-' + language)));
  }
  toggle.addEventListener('click', () => {
    language = language === 'zh' ? 'en' : 'zh';
    applyLanguage();
    try { localStorage.setItem('hx-language', language); } catch (_) {}
  });
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const video = gallery.querySelector('video');
    gallery.querySelectorAll('[data-video]').forEach(button => {
      button.addEventListener('click', () => {
        gallery.querySelectorAll('[data-video]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        video.pause();
        video.poster = 'assets/videos/' + button.dataset.video + '.jpg';
        video.src = 'assets/videos/' + button.dataset.video + '.mp4';
        video.setAttribute('data-label-zh',button.dataset.zh);
        video.setAttribute('data-label-en',button.dataset.en);
        video.setAttribute('aria-label',button.dataset[language]);
        video.load();
      });
    });
  });
  document.querySelectorAll('video').forEach(video => {
    video.muted = true;
    video.setAttribute('controlslist', 'nodownload');
    video.addEventListener('contextmenu', event => event.preventDefault());
    video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => {
      if (other !== video) other.pause();
    }));
  });
  applyLanguage();
})();

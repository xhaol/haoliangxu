(() => {
  const toggle = document.getElementById('language');
  const elements = document.querySelectorAll('[data-zh][data-en]');
  const dialog = document.getElementById('video-dialog');
  const dialogPlayer = document.getElementById('dialog-player');
  let activeMoment = null;
  let sourceVideo = null;
  const fullscreenButton = document.getElementById('fullscreen-video');
  let language = 'zh';
  try { if (localStorage.getItem('hx-language') === 'en') language = 'en'; } catch (_) {}
  function applyLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    elements.forEach(element => { element.textContent = element.dataset[language]; });
    toggle.textContent = language === 'zh' ? 'EN ↔' : '中文 ↔';
    toggle.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
    document.title = language === 'zh' ? '许浩良 · Haoliang Xu' : 'Haoliang Xu · 许浩良';
    document.querySelectorAll('video[data-label-zh]').forEach(v => v.setAttribute('aria-label', v.getAttribute('data-label-' + language)));
    document.querySelectorAll('[data-open-video]').forEach(b => b.setAttribute('aria-label',b.getAttribute('data-title-' + language)));
    if (activeMoment) document.getElementById('video-dialog-title').textContent = activeMoment.getAttribute('data-title-' + language);
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
        const expand = gallery.querySelector('[data-open-video]');
        if (expand) {
          expand.dataset.openVideo = button.dataset.video;
          expand.setAttribute('data-title-zh', button.dataset.zh);
          expand.setAttribute('data-title-en', button.dataset.en);
          expand.setAttribute('aria-label', button.dataset[language]);
        }
        video.load();
      });
    });
  });
  document.querySelectorAll('video').forEach(video => {
    video.muted = true;
    video.setAttribute('controlslist', 'nodownload');
    video.addEventListener('contextmenu', event => event.preventDefault());
    video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }));
  });
  function closePlayer() {
    if (typeof dialog.close === 'function') dialog.close();
    else {
      dialog.removeAttribute('open');
      finishClose();
    }
  }
  function finishClose() {
    if (document.fullscreenElement === dialog && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement === dialog && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    dialogPlayer.onloadedmetadata = null;
    const time = dialogPlayer.currentTime;
    dialogPlayer.pause();
    if (sourceVideo && Number.isFinite(time)) {
      try { sourceVideo.currentTime = time; } catch (_) {}
    }
    dialogPlayer.removeAttribute('src');
    dialogPlayer.load();
    document.body.classList.remove('modal-open');
    if (activeMoment) activeMoment.focus();
  }
  function openPlayer(button) {
    activeMoment = button;
    sourceVideo = button.closest('.project-media').querySelector('video');
    const time = sourceVideo.currentTime || 0;
    sourceVideo.pause();
    document.getElementById('video-dialog-title').textContent = button.getAttribute('data-title-' + language);
    dialogPlayer.src = sourceVideo.getAttribute('src');
    dialogPlayer.poster = sourceVideo.poster;
    dialogPlayer.loop = sourceVideo.loop;
    dialogPlayer.muted = true;
    dialogPlayer.onloadedmetadata = () => {
      if (Number.isFinite(time) && time > 0) dialogPlayer.currentTime = time;
    };
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('modal-open');
    fullscreenButton.hidden = !(
      dialog.requestFullscreen || dialog.webkitRequestFullscreen || dialogPlayer.webkitEnterFullscreen
    );
    dialogPlayer.play().catch(() => {});
  }
  document.querySelectorAll('[data-open-video]').forEach(button => {
    button.addEventListener('click', () => openPlayer(button));
    const inlineVideo = button.closest('.project-media').querySelector('video');
    inlineVideo.addEventListener('dblclick', event => {
      event.preventDefault();
      openPlayer(button);
    });
  });
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (dialog.requestFullscreen) await dialog.requestFullscreen();
      else if (dialog.webkitRequestFullscreen) dialog.webkitRequestFullscreen();
      else if (dialogPlayer.webkitEnterFullscreen) dialogPlayer.webkitEnterFullscreen();
    } catch (_) {
      // Keep the viewport-sized player open if the browser denies native fullscreen.
    }
  });
  document.getElementById('close-video').addEventListener('click', closePlayer);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closePlayer();
    }
  });
  dialog.addEventListener('close', finishClose);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.hasAttribute('open') && typeof dialog.showModal !== 'function') closePlayer();
  });
  applyLanguage();
})();

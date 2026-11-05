(() => {
  const sources = [...document.querySelectorAll('video')];
  if (!sources.length) return;
  const icon = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M9 3H3v6M15 3h6v6M21 15v6h-6M9 21H3v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const dialog = document.createElement('dialog');
  dialog.id = 'site-video-dialog';
  dialog.setAttribute('aria-labelledby', 'site-video-title');
  dialog.innerHTML = '<div class="video-dialog-toolbar"><h2 id="site-video-title"></h2><button type="button" class="video-dialog-close"></button></div><div class="video-frame video-dialog-frame"><video controls controlslist="nodownload" muted playsinline preload="none"></video><button type="button" class="video-overlay-control video-fullscreen">' + icon + '</button></div>';
  document.body.append(dialog);
  const player = dialog.querySelector('video');
  const title = dialog.querySelector('h2');
  const close = dialog.querySelector('.video-dialog-close');
  const fullscreen = dialog.querySelector('.video-fullscreen');
  let active = null;
  let trigger = null;
  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const label = v => v.getAttribute('data-label-' + language()) || v.getAttribute('aria-label') || (language() === 'zh' ? '视频' : 'Video');
  function localize() {
    const zh = language() === 'zh';
    sources.forEach(v => {
      const b = v.parentElement.querySelector('[data-video-expand]');
      const name = (zh ? '放大播放：' : 'Expand video: ') + label(v);
      b.setAttribute('aria-label', name);
      b.title = name;
    });
    close.textContent = zh ? '关闭 ×' : 'Close ×';
    const isFull = document.fullscreenElement === dialog || document.webkitFullscreenElement === dialog;
    const fullLabel = zh ? (isFull ? '退出全屏' : '全屏播放') : (isFull ? 'Exit fullscreen' : 'Fullscreen');
    fullscreen.setAttribute('aria-label', fullLabel);
    fullscreen.title = fullLabel;
    if (active) { title.textContent = label(active); player.setAttribute('aria-label', label(active)); }
  }
  function finishClose() {
    if (!active) return;
    if (document.fullscreenElement === dialog && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (document.webkitFullscreenElement === dialog && document.webkitExitFullscreen) document.webkitExitFullscreen();
    player.onloadedmetadata = null;
    player.pause();
    if (Number.isFinite(player.currentTime)) { try { active.currentTime = player.currentTime; } catch (_) {} }
    player.removeAttribute('src');
    player.load();
    document.body.classList.remove('video-viewer-open');
    const focusTarget = trigger;
    active = null;
    trigger = null;
    if (focusTarget) focusTarget.focus();
  }
  function closePlayer() {
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); finishClose(); }
  }
  function openPlayer(video, button) {
    active = video;
    trigger = button;
    const time = video.currentTime || 0;
    video.pause();
    player.src = video.currentSrc || video.src;
    player.poster = video.poster;
    player.loop = video.loop;
    player.muted = true;
    player.onloadedmetadata = () => { if (time > 0) { try { player.currentTime = time; } catch (_) {} } };
    localize();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('video-viewer-open');
    fullscreen.hidden = !(dialog.requestFullscreen || dialog.webkitRequestFullscreen || player.webkitEnterFullscreen);
    close.focus();
    const playing = player.play();
    if (playing && playing.catch) playing.catch(() => {});
  }
  sources.forEach(video => {
    const frame = document.createElement('div');
    frame.className = 'video-frame';
    video.before(frame);
    frame.append(video);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'video-overlay-control';
    button.setAttribute('data-video-expand', '');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.innerHTML = icon;
    frame.append(button);
    button.addEventListener('click', () => openPlayer(video, button));
    video.addEventListener('dblclick', event => { event.preventDefault(); openPlayer(video, button); });
  });
  [...sources, player].forEach(video => {
    video.muted = true;
    video.setAttribute('controlslist', 'nodownload');
    video.addEventListener('contextmenu', event => event.preventDefault());
    video.addEventListener('play', () => [...sources, player].forEach(other => { if (other !== video) other.pause(); }));
  });
  close.addEventListener('click', closePlayer);
  dialog.addEventListener('close', finishClose);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closePlayer();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.hasAttribute('open')) { event.preventDefault(); closePlayer(); }
  });
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (dialog.requestFullscreen) await dialog.requestFullscreen();
      else if (dialog.webkitRequestFullscreen) dialog.webkitRequestFullscreen();
      else if (player.webkitEnterFullscreen) player.webkitEnterFullscreen();
    } catch (_) { /* The enlarged player remains available when fullscreen is denied. */ }
  });
  document.addEventListener('fullscreenchange', localize);
  document.addEventListener('webkitfullscreenchange', localize);
  const observer = new MutationObserver(localize);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  sources.forEach(v => observer.observe(v, { attributes: true, attributeFilter: ['src', 'data-label-zh', 'data-label-en'] }));
  localize();
})();

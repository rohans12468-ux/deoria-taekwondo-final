/* Lightweight gallery lightbox — no external zoom library.
   Expects: #galleryGrid, #popup, #popupImg, #closeBtn, #prevBtn, #nextBtn, #imgCounter
   and a global imageList array of image URLs. */
(function () {
  const galleryGrid = document.getElementById('galleryGrid');
  const popup = document.getElementById('popup');
  const popupImg = document.getElementById('popupImg');
  const closeBtn = document.getElementById('closeBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('imgCounter');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  const images = window.imageList;
  if (!galleryGrid || !popup || !popupImg || !Array.isArray(images) || !images.length) return;

  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTrigger = null;

  galleryGrid.querySelectorAll('.gallery-card').forEach((card, index) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Open photo ' + (index + 1));
  });

  function setImage(index) {
    currentIndex = (index + images.length) % images.length;
    popupImg.classList.add('changing');
    popupImg.src = images[currentIndex];
    popupImg.alt = 'Taekwondo gallery photo ' + (currentIndex + 1) + ' of ' + images.length;
    if (counter) counter.textContent = (currentIndex + 1) + ' / ' + images.length;
    requestAnimationFrame(() => requestAnimationFrame(() => popupImg.classList.remove('changing')));
    [currentIndex + 1, currentIndex - 1].forEach((indexToPreload) => {
      const preload = new Image();
      preload.src = images[(indexToPreload + images.length) % images.length];
    });
  }

  function syncFullscreenButton() {
    const isFullscreen = document.fullscreenElement === popup || document.webkitFullscreenElement === popup;
    if (!fullscreenBtn) return;
    fullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Exit full screen' : 'Enter full screen');
    fullscreenBtn.title = isFullscreen ? 'Exit full screen' : 'Enter full screen';
    fullscreenBtn.innerHTML = '<i class="fas ' + (isFullscreen ? 'fa-compress' : 'fa-expand') + '" aria-hidden="true"></i>';
  }

  async function toggleFullscreen() {
    try {
      const isFullscreen = document.fullscreenElement === popup || document.webkitFullscreenElement === popup;
      if (isFullscreen) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (popup.requestFullscreen) {
        await popup.requestFullscreen();
      } else if (popup.webkitRequestFullscreen) {
        popup.webkitRequestFullscreen();
      }
    } catch (error) {
      // Fullscreen can be unavailable in embedded browsers; the viewer remains usable.
    }
    syncFullscreenButton();
  }

  function openPopup(index) {
    setImage(index);
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    lastTrigger = galleryGrid.querySelector('.gallery-card[data-index="' + currentIndex + '"]');
    document.body.classList.add('lightbox-open');
    if (closeBtn) closeBtn.focus();
  }

  function closePopup() {
    if (document.fullscreenElement === popup && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (document.webkitFullscreenElement === popup && document.webkitExitFullscreen) document.webkitExitFullscreen();
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastTrigger) lastTrigger.focus();
  }

  galleryGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (!card) return;
    openPopup(parseInt(card.dataset.index, 10) || 0);
  });

  galleryGrid.addEventListener('keydown', (e) => {
    const card = e.target.closest('.gallery-card');
    if (!card || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    openPopup(parseInt(card.dataset.index, 10) || 0);
  });

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); setImage(currentIndex + 1); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); setImage(currentIndex - 1); });
  document.addEventListener('fullscreenchange', syncFullscreenButton);
  document.addEventListener('webkitfullscreenchange', syncFullscreenButton);

  popup.addEventListener('click', (e) => {
    if (e.target === popup || e.target.classList.contains('popup-inner')) closePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (!popup.classList.contains('active')) return;
    if (e.key === 'Tab') {
      const controls = popup.querySelectorAll('button:not([disabled])');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); setImage(currentIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setImage(currentIndex - 1); }
    if (e.key === 'Escape') closePopup();
  });

  popup.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  popup.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) setImage(currentIndex + 1);
    else setImage(currentIndex - 1);
  }, { passive: true });
})();

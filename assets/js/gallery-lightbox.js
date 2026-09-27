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

  const images = window.imageList;
  if (!galleryGrid || !popup || !popupImg || !Array.isArray(images) || !images.length) return;

  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function setImage(index) {
    currentIndex = (index + images.length) % images.length;
    popupImg.src = images[currentIndex];
    popupImg.alt = 'Gallery image ' + (currentIndex + 1);
    if (counter) counter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  function openPopup(index) {
    setImage(index);
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function closePopup() {
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  galleryGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (!card) return;
    openPopup(parseInt(card.dataset.index, 10) || 0);
  });

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); setImage(currentIndex + 1); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); setImage(currentIndex - 1); });

  popup.addEventListener('click', (e) => {
    if (e.target === popup || e.target.classList.contains('popup-inner')) closePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (!popup.classList.contains('active')) return;
    if (e.key === 'ArrowRight') setImage(currentIndex + 1);
    if (e.key === 'ArrowLeft') setImage(currentIndex - 1);
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

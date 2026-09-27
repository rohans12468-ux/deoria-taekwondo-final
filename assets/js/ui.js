/* ════════════════════════════════════════════════════════════
   UI.JS — Visual effects for the homepage.
   Nothing in this file talks to any database or AI.
   ════════════════════════════════════════════════════════════ */

/* ---------- 1. CUSTOM CURSOR (optional — only if markup exists) ---------- */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (cursorDot && cursorRing) {
  document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .program-card, .gallery-arrow, .ls-opt').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width = '60px';
      cursorRing.style.height = '60px';
      cursorRing.style.borderColor = 'rgba(200,16,46,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'rgba(240,180,41,0.5)';
    });
  });
}

/* ---------- 2. HEADER BACKGROUND ON SCROLL ---------- */
const headerEl = document.getElementById('header');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (headerEl) headerEl.classList.toggle('scrolled', window.scrollY > 60);
  if (scrollTopBtn) scrollTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
});

/* ---------- 3. MOBILE HAMBURGER MENU ---------- */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach((link) =>
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- 4. "BACK TO TOP" BUTTON ---------- */
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- 5. FADE-IN ANIMATIONS WHEN SCROLLING DOWN ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => revealObserver.observe(el));

/* ════════════════════════════════════════════════════════════
   6. 3D PHOTO GALLERY (the spinning carousel on the homepage)
   ════════════════════════════════════════════════════════════ */
const GALLERY_IMGS = [
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/Priyankatkd.jpeg', label: 'Sparring Session', sub: 'Kyorugi Training' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/WhatsApp%20Image%202025-11-22%20at%2014.58.19_c498ec69.jpg', label: 'Forms Practice', sub: 'Poomsae Discipline' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/harsh%20tkd.PNG', label: 'Championship Ready', sub: 'Competition Prep' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/abhiskek%20tkd.jpeg', label: 'Academy Training', sub: 'Daily Workout' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/mithun%20tkd.jpeg', label: 'Team Practice', sub: 'Group Training' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/madhav.jpg', label: 'Our Champions', sub: 'Deoria Academy' },
];

const track = document.getElementById('galleryTrack');
const dotsContainer = document.getElementById('galleryDots');
const galleryWrap = document.getElementById('gallery3d');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

if (track && dotsContainer && galleryWrap && galleryPrev && galleryNext) {
  const totalSlides = GALLERY_IMGS.length;
  let currentIdx = 0;
  let autoTimer;

  GALLERY_IMGS.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.className = 'gallery-3d-slide';
    slide.innerHTML = `
      <img src="${img.src}" alt="${img.label}" loading="lazy">
      <div class="slide-label">
        <h4>${img.label}</h4>
        <p>${img.sub}</p>
      </div>`;
    slide.addEventListener('click', () => {
      if (currentIdx === i) {
        openHomeLightbox(img.src, img.label);
        return;
      }
      currentIdx = i;
      renderGallery();
    });
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', 'Show photo ' + (i + 1));
    dot.addEventListener('click', () => {
      currentIdx = i;
      renderGallery();
    });
    dotsContainer.appendChild(dot);
  });

  function renderGallery() {
    const slides = track.querySelectorAll('.gallery-3d-slide');
    const dots = dotsContainer.querySelectorAll('.gallery-dot');
    const angle = 360 / totalSlides;

    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 340 : 480;
    const cardW = isMobile ? 220 : 280;
    const cardH = isMobile ? 340 : 420;

    track.style.width = cardW + 'px';
    track.style.height = cardH + 'px';

    slides.forEach((slide, i) => {
      slide.style.width = cardW + 'px';
      slide.style.height = cardH + 'px';
      const theta = angle * (i - currentIdx);
      const rad = (theta * Math.PI) / 180;
      const x = Math.sin(rad) * radius;
      const z = Math.cos(rad) * radius - radius;
      const rotY = -theta;
      const scale = i === currentIdx ? 1 : 0.75;
      const opacity = Math.abs(i - currentIdx) <= 2 || Math.abs(i - currentIdx) >= totalSlides - 2 ? 1 : 0;
      const blur = i === currentIdx ? 0 : 2;

      slide.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;
      slide.style.opacity = opacity;
      slide.style.filter = `blur(${blur}px) brightness(${i === currentIdx ? 1 : 0.6})`;
      slide.style.zIndex = i === currentIdx ? 5 : 1;
      slide.style.border = i === currentIdx ? '1px solid rgba(240,180,41,0.4)' : '1px solid rgba(255,255,255,0.07)';
    });

    dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
    resetAutoPlay();
  }

  function showPrevSlide() {
    currentIdx = (currentIdx - 1 + totalSlides) % totalSlides;
    renderGallery();
  }
  function showNextSlide() {
    currentIdx = (currentIdx + 1) % totalSlides;
    renderGallery();
  }

  galleryPrev.addEventListener('click', showPrevSlide);
  galleryNext.addEventListener('click', showNextSlide);

  let touchStartX = 0;
  galleryWrap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  galleryWrap.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? showNextSlide() : showPrevSlide(); }
  });

  function resetAutoPlay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(showNextSlide, 4000);
  }

  renderGallery();
  window.addEventListener('resize', renderGallery);
}

/* ---------- Homepage image lightbox (3D gallery) ---------- */
const homeLightbox = document.getElementById('imgLightbox');
const homeLightboxImg = document.getElementById('imgLightboxPhoto');
const homeLightboxClose = document.getElementById('imgLightboxClose');

function openHomeLightbox(src, label) {
  if (!homeLightbox || !homeLightboxImg) return;
  homeLightboxImg.src = src;
  homeLightboxImg.alt = label || 'Gallery photo';
  homeLightbox.classList.add('active');
  homeLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
}

function closeHomeLightbox() {
  if (!homeLightbox) return;
  homeLightbox.classList.remove('active');
  homeLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
}

if (homeLightbox) {
  if (homeLightboxClose) homeLightboxClose.addEventListener('click', closeHomeLightbox);
  homeLightbox.addEventListener('click', (e) => {
    if (e.target === homeLightbox) closeHomeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && homeLightbox.classList.contains('active')) closeHomeLightbox();
  });
}

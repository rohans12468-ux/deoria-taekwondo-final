/* ════════════════════════════════════════════════════════════
   UI.JS — All the visual "feel good" effects for the website.
   Nothing in this file talks to any database or AI, so there
   is nothing secret here. Safe to edit freely.
   ════════════════════════════════════════════════════════════ */

/* ---------- 1. CUSTOM CURSOR (the gold dot + ring that follows your mouse) ---------- */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

document.addEventListener('mousemove', (e) => {
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top = e.clientY + 'px';
  cursorRing.style.left = e.clientX + 'px';
  cursorRing.style.top = e.clientY + 'px';
});

// Make the ring grow a little when hovering clickable things
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

/* ---------- 2. HEADER BACKGROUND ON SCROLL ---------- */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('scrollTop').style.display = window.scrollY > 400 ? 'flex' : 'none';
});

/* ---------- 3. MOBILE HAMBURGER MENU ---------- */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
// Close the menu automatically once a link is tapped
document.querySelectorAll('.nav-links a').forEach((link) =>
  link.addEventListener('click', () => navLinks.classList.remove('active'))
);

/* ---------- 4. "BACK TO TOP" BUTTON ---------- */
document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

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
   ════════════════════════════════════════════════════════════
   TIP: To add/remove/replace a photo, just edit the list below.
   "label" and "sub" are the two lines of text shown on hover. */
const GALLERY_IMGS = [
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/Priyankatkd.jpeg', label: 'Sparring Session', sub: 'Kyorugi Training' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/WhatsApp%20Image%202025-11-22%20at%2014.58.19_c498ec69.jpg', label: 'Forms Practice', sub: 'Poomsae Discipline' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/harsh%20tkd.PNG  ', label: 'Championship Ready', sub: 'Competition Prep' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/abhiskek%20tkd.jpeg', label: 'Academy Training', sub: 'Daily Workout' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/mithun%20tkd.jpeg', label: 'Team Practice', sub: 'Group Training' },
  { src: 'https://raw.githubusercontent.com/RohanTkd-ux/web-Photos/refs/heads/main/madhav.jpg', label: 'Our Champions', sub: 'Deoria Academy' },
];

const totalSlides = GALLERY_IMGS.length;
const track = document.getElementById('galleryTrack');
const dotsContainer = document.getElementById('galleryDots');
let currentIdx = 0;
let autoTimer;

// Build one slide + one dot per photo
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
    currentIdx = i;
    renderGallery();
  });
  track.appendChild(slide);

  const dot = document.createElement('div');
  dot.className = 'gallery-dot';
  dot.addEventListener('click', () => {
    currentIdx = i;
    renderGallery();
  });
  dotsContainer.appendChild(dot);
});

// Positions every slide around the 3D circle based on which one is "active"
function renderGallery() {
  const slides = track.querySelectorAll('.gallery-3d-slide');
  const dots = dotsContainer.querySelectorAll('.gallery-dot');
  const angle = 360 / totalSlides;

  // Smaller circle on phones so it still fits the screen
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

document.getElementById('galleryPrev').addEventListener('click', showPrevSlide);
document.getElementById('galleryNext').addEventListener('click', showNextSlide);

// Swipe support for phones/tablets
let touchStartX = 0;
const galleryWrap = document.getElementById('gallery3d');
galleryWrap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
galleryWrap.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? showNextSlide() : showPrevSlide(); }
});

// Auto-rotate every 4 seconds, and restart the timer whenever the user interacts
function resetAutoPlay() {
  clearInterval(autoTimer);
  autoTimer = setInterval(showNextSlide, 4000);
}

renderGallery();
window.addEventListener('resize', renderGallery);

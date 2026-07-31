/* script.js — Interacciones y animaciones premium
   - IntersectionObserver para reveal
   - Navbar scroll behavior y sección activa
   - Menú hamburguesa accesible
   - Slider de proyectos (drag, flechas, indicadores)
   - Modal de video con controles básicos (preload metadata, lazy src)
   - Carrusel de testimonios (auto)
   - FAB WhatsApp y Back-to-top
   - Comentarios en español para mantener / ampliar
*/

/* ===========================
   Helpers y selectores
   =========================== */
const doc = document;
const body = doc.body;

/* ===========================
   IntersectionObserver: Reveal sections
   =========================== */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

doc.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===========================
   NAV: scroll behavior + active link
   =========================== */
const header = doc.getElementById('site-header');
const navLinks = Array.from(doc.querySelectorAll('.nav-link'));

// sticky header class toggle
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  // highlight section in view
  highlightSection();
  // back-to-top visibility
  toggleBackToTop();
});

// determine active section by viewport center
function highlightSection() {
  const center = window.innerHeight * 0.45 + window.scrollY;
  let current = null;
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#','');
    const section = doc.getElementById(id);
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = top + rect.height;
    if (center >= top && center <= bottom) current = link;
  });
  navLinks.forEach(l => l.classList.remove('active'));
  if (current) current.classList.add('active');
}

/* ===========================
   Mobile menu toggle (hamburger)
   =========================== */
const hamburger = doc.getElementById('hamburger');
const nav = doc.getElementById('nav');

function toggleMenu(){
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('show');
}
hamburger.addEventListener('click', toggleMenu);
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('show')) {
    nav.classList.remove('show'); hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ===========================
   HERO canvas (partículas muy sutiles)
   =========================== */
(function heroCanvas(){
  const canvas = doc.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const qty = Math.round(Math.max(10, Math.min(40, innerWidth / 90)));

  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; init(); }
  window.addEventListener('resize', resize);

  function init(){
    particles = [];
    for (let i=0;i<qty;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.6 + 0.8,
        vx: (Math.random()-0.5)*0.2,
        vy: (Math.random()-0.5)*0.2,
        alpha: Math.random()*0.4 + 0.06
      });
    }
  }
  function render(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,"+p.alpha+")";
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x<0) p.x=w; if (p.x>w) p.x=0;
      if (p.y<0) p.y=h; if (p.y>h) p.y=0;
    });
    requestAnimationFrame(render);
  }
  init(); render();
})();

/* ===========================
   Slider: Proyectos Destacados
   - Drag, arrows, indicators, responsive 3/2/1 visible
   - Lazy-load video src only on modal open
   =========================== */
(function videoSlider(){
  const slider = doc.getElementById('slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prev = doc.getElementById('slider-prev');
  const next = doc.getElementById('slider-next');
  const indicatorsWrap = doc.getElementById('slider-indicators');
  let index = 0;
  let isDragging = false, startX = 0, currentTranslate = 0, prevTranslate = 0, animationID = 0;
  let slideCount = slides.length;

  // build indicators
  function buildIndicators(){
    indicatorsWrap.innerHTML = '';
    for (let i=0;i<slideCount;i++){
      const btn = doc.createElement('button');
      btn.setAttribute('aria-label','Ir al slide '+(i+1));
      if (i===0) btn.classList.add('active');
      btn.addEventListener('click', ()=> goTo(i));
      indicatorsWrap.appendChild(btn);
    }
  }

  // update visible slides via transform: we center slides based on index and viewport
  function update(){
    const vw = slider.clientWidth;
    const visible = getVisibleCount();
    const slideW = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(slider).gap || 8);
    // compute translate such that selected index is leftmost for mobile, centered for desktop when more space
    let offset = 0;
    if (visible === 1) offset = index * slideW;
    else if (visible === 2) offset = Math.max(0, (index) * slideW - (vw - slideW*2)/2);
    else offset = Math.max(0, (index) * slideW - (vw - slideW*3)/2);
    slider.style.transform = `translateX(-${offset}px)`;
    // indicators
    Array.from(indicatorsWrap.children).forEach((b,i)=> b.classList.toggle('active', i===index));
  }

  function getVisibleCount(){
    const width = window.innerWidth;
    if (width < 760) return 1;
    if (width < 1100) return 2;
    return 3;
  }

  function prevSlide(){ index = (index-1+slideCount)%slideCount; update(); }
  function nextSlide(){ index = (index+1)%slideCount; update(); }
  function goTo(i){ index = (i+slideCount)%slideCount; update(); }

  // arrow events
  prev.addEventListener('click', prevSlide);
  next.addEventListener('click', nextSlide);

  // drag
  slides.forEach((slide, i)=>{
    const mediaThumb = slide.querySelector('.media-thumb');
    mediaThumb.addEventListener('pointerdown', startDrag);
    mediaThumb.addEventListener('pointerup', endDrag);
    mediaThumb.addEventListener('pointercancel', endDrag);
    mediaThumb.addEventListener('pointermove', onDrag);
    // play button open modal
    const play = slide.querySelector('.play-btn');
    play.addEventListener('click', ()=> openVideoModal(slide.dataset.video, slide.dataset.poster));
    // also allow clicking the whole slide
    slide.addEventListener('click', (e)=>{
      // avoid triggering when dragging
      if (isDragging) return;
      if (e.target.closest('.play-btn')) return;
      openVideoModal(slide.dataset.video, slide.dataset.poster);
    });
  });

  function startDrag(e){
    isDragging = true;
    startX = e.clientX;
    slider.classList.add('grabbing');
  }
  function onDrag(e){
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 10) {
      // move slider visually while dragging
      slider.style.transform = `translateX(${dx}px)`;
    }
  }
  function endDrag(e){
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove('grabbing');
    const dx = e.clientX - startX;
    if (dx > 40) prevSlide();
    else if (dx < -40) nextSlide();
    else update();
  }

  // responsive update on resize
  window.addEventListener('resize', update);

  buildIndicators();
  update();
})();

/* ===========================
   Modal Video Player
   - src assigned when opened (lazy)
   - custom minimal controls: play/pause, progress, time
   - keyboard: Esc to close, Space to toggle
   =========================== */
(function videoModal(){
  const modal = doc.getElementById('video-modal');
  const backdrop = doc.getElementById('video-backdrop');
  const closeBtn = doc.getElementById('modal-close');
  const video = doc.getElementById('modal-video');
  const vplay = doc.getElementById('vplay');
  const vprogress = doc.getElementById('vprogress');
  const vtime = doc.getElementById('vtime');

  let currentSrc = null;

  function open(url, poster){
    if (!url) return;
    currentSrc = url;
    modal.setAttribute('aria-hidden','false');
    body.style.overflow = 'hidden';
    // assign src lazily for performance
    video.pause();
    video.removeAttribute('src');
    video.src = url;
    if (poster) video.poster = poster;
    video.load();
    // focus for accessibility
    closeBtn.focus();
    // play by user interaction? avoid autoplay — we let user press play
    updateTime();
  }

  function close(){
    modal.setAttribute('aria-hidden','true');
    body.style.overflow = '';
    video.pause();
    // remove src to free memory
    video.removeAttribute('src');
    video.load();
    currentSrc = null;
  }

  // open triggers from slider (exposed globally)
  window.openVideoModal = open;

  // events
  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  // controls
  vplay.addEventListener('click', ()=> {
    if (video.paused) video.play();
    else video.pause();
  });

  video.addEventListener('play', ()=> vplay.textContent = 'Pause');
  video.addEventListener('pause', ()=> vplay.textContent = 'Play');

  // time & progress
  video.addEventListener('timeupdate', updateTime);
  vprogress.addEventListener('input', function(){
    const pct = this.value;
    if (video.duration) video.currentTime = (pct/100) * video.duration;
  });
  function updateTime(){
    if (!video.duration) {
      vprogress.value = 0;
      vtime.textContent = '0:00 / 0:00';
      return;
    }
    const cur = formatTime(video.currentTime);
    const tot = formatTime(video.duration);
    vtime.textContent = `${cur} / ${tot}`;
    vprogress.value = (video.currentTime / video.duration) * 100;
  }
  function formatTime(sec){
    sec = Math.floor(sec || 0);
    const m = Math.floor(sec/60); const s = sec%60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  // keyboard
  window.addEventListener('keydown', (e)=>{
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') close();
      if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); if (video.paused) video.play(); else video.pause(); }
    }
  });
})();

/* ===========================
   Testimonios (auto carousel simple)
   =========================== */
(function testiCarousel(){
  const slider = doc.getElementById('testi-slider');
  if (!slider) return;
  const prev = doc.querySelector('.testi-prev');
  const next = doc.querySelector('.testi-next');
  const items = Array.from(slider.children);
  let tIndex = 0;
  function update(){ slider.style.transform = `translateX(-${tIndex * (items[0].getBoundingClientRect().width + 16)}px)` }
  prev.addEventListener('click', ()=> { tIndex = (tIndex-1+items.length)%items.length; update(); });
  next.addEventListener('click', ()=> { tIndex = (tIndex+1)%items.length; update(); });
  // autoplay gentle
  let timer = setInterval(()=> { tIndex = (tIndex+1)%items.length; update(); }, 6000);
  slider.addEventListener('mouseenter', ()=> clearInterval(timer));
  slider.addEventListener('mouseleave', ()=> timer = setInterval(()=> { tIndex = (tIndex+1)%items.length; update(); }, 6000));
  window.addEventListener('resize', update);
  update();
})();

/* ===========================
   Back to top & WhatsApp FAB behavior
   =========================== */
const backToTop = doc.getElementById('back-to-top');
function toggleBackToTop(){
  if (window.scrollY > 400) backToTop.style.display = 'flex';
  else backToTop.style.display = 'none';
}
backToTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

const whatsappFab = doc.getElementById('whatsapp-fab');
whatsappFab.addEventListener('click', (e)=>{
  // placeholder href — replace with actual phone number in HTML
  // keep link accessible; do not navigate programmatically to allow tracking later
});

/* ===========================
   Small UX: fill copyright year dynamically
   =========================== */
(function yearNow(){ const el = doc.getElementById('copyright-js'); if (el) el.textContent = `© ${new Date().getFullYear()}` })();

/* ===========================
   Accessibility helpers: focus outlines for keyboard users
   =========================== */
(function focusVisible(){
  function handleFirstTab(e){
    if (e.key === 'Tab') {
      body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();

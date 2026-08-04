/* script.js — interacciones para Área Joven (rama: area-joven)
   - menú hamburguesa
   - navbar blur en scroll
   - scroll progress bar
   - reveal on scroll
   - hero logo animation + parallax shapes
   - carrusel con autoplay y soporte táctil
   - lightbox para galería
   - contadores animados
   - smooth scroll
*/

// Helpers
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// DOM elements
const header = document.getElementById('main-header');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const progressBar = document.getElementById('progress-bar');
const logoHero = document.querySelector('.logo-hero');

// Menu hamburguesa
hamburger.addEventListener('click', ()=>{
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open');
});
// Close menu on link click (mobile)
$$('.nav-links a').forEach(a => a.addEventListener('click', ()=>{
  if(window.innerWidth < 800){
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
  }
}));

// Scroll handler: navbar style + progress bar
function onScroll(){
  const y = window.scrollY;
  if(y > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Reveal on scroll (IntersectionObserver)
const revealItems = $$('[data-reveal]');
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:0.12});
revealItems.forEach(item=>revealObserver.observe(item));

// Add data-reveal to major sections for animation
['#quienes','#mision','#proyectos','#capacitaciones','#noticias','#anuncios','#estadisticas','#galeria','#contacto'].forEach(sel=>{
  const el = document.querySelector(sel);
  if(el) el.setAttribute('data-reveal','');
});

// Logo animation
window.addEventListener('load', ()=>{
  setTimeout(()=>logoHero.classList.add('visible'), 400);
});

// Parallax shapes (simple)
const shapes = $$('.hero .shape');
window.addEventListener('mousemove', (e)=>{
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  shapes.forEach((s,i)=>{
    const depth = (i+1) * 6;
    s.style.transform = `translate3d(${x/depth}px, ${y/depth}px, 0)`;
  });
});

// Smooth scroll for anchor links
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(href.startsWith('#')){
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }
  });
});

// CAROUSEL
(function initCarousel(){
  const carousel = document.getElementById('carousel');
  if(!carousel) return;
  const slides = $$('.carousel .slide', carousel);
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const indicators = carousel.querySelector('.carousel-indicators');
  let current = slides.findIndex(s=>s.classList.contains('active'));
  if(current < 0) current = 0;
  // build indicators
  slides.forEach((s,i)=>{
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Ir al slide ' + (i+1));
    if(i===current) btn.classList.add('active');
    btn.addEventListener('click', ()=> goTo(i));
    indicators.appendChild(btn);
  });

  function update(){
    slides.forEach((s,i)=> s.classList.toggle('active', i===current));
    Array.from(indicators.children).forEach((b,i)=> b.classList.toggle('active', i===current));
  }

  function goTo(i){ current = (i + slides.length) % slides.length; update(); }
  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // autoplay
  let autoplayInterval = 5000;
  let autoplay = setInterval(next, autoplayInterval);
  carousel.addEventListener('mouseenter', ()=> clearInterval(autoplay));
  carousel.addEventListener('mouseleave', ()=> autoplay = setInterval(next, autoplayInterval));

  // touch support
  let startX = 0;
  carousel.addEventListener('touchstart', e=> startX = e.changedTouches[0].clientX);
  carousel.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 40) dx < 0 ? next() : prev();
  });

})();

// LIGHTBOX for gallery
(function initLightbox(){
  const items = $$('.gallery-item');
  const lb = document.getElementById('lightbox');
  if(!lb) return;
  const lbImg = lb.querySelector('img');
  const lbCaption = lb.querySelector('.lb-caption');
  const lbClose = lb.querySelector('.lb-close');

  items.forEach(item=>{
    item.addEventListener('click', ()=>{
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      lbCaption.textContent = item.querySelector('figcaption')?.textContent || '';
      lb.classList.add('active');
      lb.setAttribute('aria-hidden','false');
    });
  });
  lbClose.addEventListener('click', closeLB);
  lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLB(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLB(); });
  function closeLB(){ lb.classList.remove('active'); lb.setAttribute('aria-hidden','true'); }
})();

// CONTADORES animados
(function initCounters(){
  const nums = $$('.num');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target; const target = +el.dataset.target || 0;
        animateCount(el, target, 1500);
        obs.unobserve(el);
      }
    });
  },{threshold:0.2});
  nums.forEach(n=>obs.observe(n));

  function animateCount(el, to, duration){
    const start = 0; const startTime = performance.now();
    function frame(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * (to - start) + start);
      el.textContent = value.toLocaleString();
      if(progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();

// ANUNCIOS: mostrar mensaje si no hay anuncios
(function checkAnnouncements(){
  const container = document.querySelector('.announcements');
  if(!container) return;
  if(container.querySelectorAll('.announcement').length === 0){
    const p = document.createElement('p');
    p.className = 'no-announcements';
    p.textContent = 'No hay anuncios disponibles por el momento.';
    p.style.color = '#6b7280';
    container.appendChild(p);
  }
})();

// Small enhancement: render lucide icons from data-icon attributes
if(window.lucide){
  document.querySelectorAll('[data-icon]').forEach(el=>{
    try{ const iconName = el.getAttribute('data-icon'); const svg = lucide.createIcon(iconName); if(svg) el.appendChild(svg); }catch(e){}
  });
}

// Accessibility: back to top
const backBtn = document.getElementById('back-to-top');
if(backBtn) backBtn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));


/* script.js
   Funcionalidades:
   - Navbar: fondo negro + blur al hacer scroll
   - Hero: canvas con partículas sutiles (cinemáticas)
   - Carousel: carrusel de proyectos con drag, touch, flechas, indicadores, loop infinito
   - Modal: reproducción de video centrada con fondo blur
   - Lazy loading de videos (preload metadata)
   - IntersectionObserver: animaciones fade/slide
   - Testimonios: autoplay carousel
*/

/* ===========================
   Datos de ejemplo (ajustar)
   =========================== */
const PROJECTS = [
  {
    id: 'p1',
    title: 'Motion Graphic Publicitario',
    category: 'Videos publicitarios',
    desc: 'Estilo minimalista para promoción de emprendimiento.',
    thumb: '/assets/images/animacion_cerveza.png',
    src: '/assets/videos/cervezas.mp4'
  },
  {
    id: 'p2',
    title: 'Brand Motion',
    category: 'Animación de logos',
    desc: 'Animación de identidad y apertura para plataforma digital.',
    thumb: '/assets/images/proyecto2.jpg',
    src: '/assets/videos/proyecto2.mp4'
  },
  {
    id: 'p3',
    title: 'Explainer Cinematic',
    category: 'Motion Graphics',
    desc: 'Explicación de servicio con dinamismo visual.',
    thumb: '/assets/images/proyecto3.jpg',
    src: '/assets/videos/proyecto3.mp4'
  },
  // Añadir más proyectos conforme sea necesario
];

/* -----------------------------------------
   Utilities
------------------------------------------*/
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

/* ===========================
   NAVBAR: scroll effect
   =========================== */
(function navbarScroll(){
  const header = $('#siteHeader');
  const hero = $('#home');
  const changeAt = 60; // px

  function onScroll(){
    if(window.scrollY > changeAt) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // mobile drawer
  const btn = $('#btnHamburger');
  const drawer = $('#mobileDrawer');
  btn.addEventListener('click', ()=>{
    const open = drawer.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  });
})();

/* ===========================
   HERO: Partículas sutiles
   =========================== */
(function heroParticles(){
  const canvas = document.getElementById('heroParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h,particles=[];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function rand(min,max){ return Math.random()*(max-min)+min; }

  function init(){
    particles = [];
    const count = Math.max(12, Math.floor((w*h)/150000)); // few particles
    for(let i=0;i<count;i++){
      particles.push({
        x: rand(0,w), y: rand(0,h),
        r: rand(0.8,2.6),
        vx: rand(-0.2,0.2),
        vy: rand(-0.15,0.15),
        alpha: rand(0.06,0.15)
      });
    }
  }

  function render(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#ffffff';
    particles.forEach(p=>{
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.ellipse(p.x,p.y,p.r,p.r,0,0,Math.PI*2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      // wrap
      if(p.x < -10) p.x = w + 10;
      if(p.x > w + 10) p.x = -10;
      if(p.y < -10) p.y = h + 10;
      if(p.y > h + 10) p.y = -10;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  function start(){
    resize();
    init();
    render();
  }

  window.addEventListener('resize', ()=>{
    resize(); init();
  }, {passive:true});

  start();
})();

/* ===========================
   CAROUSEL: proyectos
   - Crea slides dinamicamente
   - Drag & touch & arrows
   - Loop infinito (duplicados)
   - Indicadores
   - Lazy loading de video al hacer click/modal
   =========================== */
(function projectsCarousel(){
  const track = $('#carouselTrack');
  const viewport = $('#carouselViewport');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const indicators = $('#carouselIndicators');

  // function to create a slide element
  function createSlide(p){
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('role','listitem');
    slide.dataset.id = p.id;

    const thumb = document.createElement('div');
    thumb.className = 'slide-thumb';
    thumb.style.backgroundImage = `url("${p.thumb}")`;
    thumb.setAttribute('aria-hidden','true');

    // play overlay
    const playWrap = document.createElement('div');
    playWrap.className = 'play-btn';
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '▶';
    playBtn.title = `Reproducir ${p.title}`;
    playBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      openModal(p.src);
    });
    playWrap.appendChild(playBtn);
    thumb.appendChild(playWrap);

    const meta = document.createElement('div');
    meta.className = 'slide-meta';
    meta.innerHTML = `<div class="project-title">${escapeHtml(p.title)}</div>
                      <div class="project-cat">${escapeHtml(p.category)}</div>
                      <div class="project-desc">${escapeHtml(p.desc)}</div>`;

    slide.appendChild(thumb);
    slide.appendChild(meta);

    // click anywhere opens modal
    slide.addEventListener('click', ()=> openModal(p.src));

    return slide;
  }

  // escape basic HTML
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  // populate
  function populate(){
    track.innerHTML = '';
    // for infinite loop technique duplicate first/last slides
    const nodes = [];
    PROJECTS.forEach(p => nodes.push(createSlide(p)));

    // duplicate for loop effect: add clones at end/start
    const clonesBefore = nodes.slice(-2).map(n => n.cloneNode(true));
    const clonesAfter = nodes.slice(0,2).map(n => n.cloneNode(true));

    clonesBefore.forEach(n => track.appendChild(n));
    nodes.forEach(n => track.appendChild(n));
    clonesAfter.forEach(n => track.appendChild(n));

    // indicators
    indicators.innerHTML = '';
    PROJECTS.forEach((p,i)=>{
      const dot = document.createElement('button');
      dot.className = 'indicator';
      dot.setAttribute('aria-label', `Proyecto ${i+1}`);
      dot.addEventListener('click', ()=> goToIndex(i));
      indicators.appendChild(dot);
    });
    updateIndicators(0);
  }

  // sizing and slide calculations
  let slideWidth = 0, position = 0, index = 0, slidesCount=0;
  function recalc(){
    const slides = track.children;
    slidesCount = slides.length;
    // compute visible count based on viewport width
    const vw = viewport.clientWidth;
    let visible = 3;
    if(window.innerWidth <= 768) visible = 1;
    else if(window.innerWidth <= 1024) visible = 2;
    // slide width is viewport minus gaps divided by visible
    const gapTotal = 18 * (visible - 1);
    slideWidth = (viewport.clientWidth - gapTotal) / visible;
    // apply min-width to each slide for layout
    Array.from(slides).forEach(s => s.style.minWidth = `${slideWidth}px`);
    // start position: offset by the clonesBefore (length of clonesBefore = 2)
    position = -slideWidth * 2; // show starting real first
    setTranslate(position);
  }

  function setTranslate(x){
    track.style.transform = `translateX(${x}px)`;
  }

  function updateIndicators(active){
    const dots = Array.from(indicators.children);
    dots.forEach(d=>d.classList.remove('active'));
    dots[active]?.classList.add('active');
  }

  // go to index in PROJECTS
  function goToIndex(i){
    index = i;
    // visible offset: clonesBefore = 2
    position = -slideWidth * (i + 2);
    setTranslate(position);
    updateIndicators(i);
  }

  // next/prev with animation
  function next(){
    index = (index + 1) % PROJECTS.length;
    animateToIndex(index);
  }
  function prev(){
    index = (index - 1 + PROJECTS.length) % PROJECTS.length;
    animateToIndex(index);
  }
  function animateToIndex(i){
    position = -slideWidth * (i + 2);
    setTranslate(position);
    updateIndicators(i);
  }

  // drag handling (pointer events)
  function dragSetup(){
    let startX=0, currentX=0, dragging=false, lastPos=position;
    const onPointerDown = (e)=>{
      dragging=true;
      startX = e.clientX || e.touches && e.touches[0].clientX;
      lastPos = position;
      track.style.transition = 'none';
    };
    const onPointerMove = (e)=>{
      if(!dragging) return;
      currentX = e.clientX || e.touches && e.touches[0].clientX;
      const dx = currentX - startX;
      position = lastPos + dx;
      setTranslate(position);
    };
    const onPointerUp = (e)=>{
      if(!dragging) return;
      dragging=false;
      track.style.transition = '';
      // determine nearest index
      const offset = -position - slideWidth*2;
      const rawIndex = Math.round(offset / slideWidth);
      index = ((rawIndex % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
      animateToIndex(index);
    };

    // desktop
    viewport.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    // touch fallback
    viewport.addEventListener('touchstart', onPointerDown, {passive:true});
    viewport.addEventListener('touchmove', onPointerMove, {passive:true});
    viewport.addEventListener('touchend', onPointerUp);
  }

  // basic autoplay (optional)
  let autoplayInterval;
  function startAutoplay(){
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(()=> next(), 7000);
  }

  // initialize
  populate();
  recalc();
  dragSetup();
  window.addEventListener('resize', recalc);

  prevBtn.addEventListener('click', ()=>{ prev(); startAutoplay(); });
  nextBtn.addEventListener('click', ()=>{ next(); startAutoplay(); });

  // initial autoplay
  startAutoplay();

  // prevent pointer events on play buttons to allow proper dragging
  // handled on play buttons themselves

})();

/* ===========================
   MODAL: reproducir video
   - Lazy set src al abrir
   - Close behavior
   =========================== */
(function videoModal(){
  const modal = $('#videoModal');
  const modalBg = $('#modalBg');
  const modalClose = $('#modalClose');
  const modalVideo = $('#modalVideo');

  function openModal(src){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    // set source lazily
    modalVideo.pause();
    modalVideo.innerHTML = '';
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    modalVideo.appendChild(source);
    modalVideo.load();
    modalVideo.play().catch(()=>{ /* autoplay may be blocked */ });
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.innerHTML = '';
    document.body.style.overflow = '';
  }

  // attach to global for carousel to call
  window.openModal = openModal;

  modalBg.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // escape key
  window.addEventListener('keydown', (e)=> {
    if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

/* ===========================
   IntersectionObserver: animaciones al aparecer
   - Fade in, slide up
   =========================== */
(function revealOnScroll(){
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});

  // select sections/cards to reveal
  const toReveal = document.querySelectorAll('.service-card, .section-title, .section-lead, .timeline-item, .about-text, .testimonial-card, .contact-grid');
  toReveal.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'opacity 600ms ease, transform 600ms ease';
    observer.observe(el);
  });

  // CSS class applied when in view
  const style = document.createElement('style');
  style.innerHTML = `.in-view{ opacity:1 !important; transform:none !important }`;
  document.head.appendChild(style);
})();

/* ===========================
   TESTIMONIALS: autoplay simple
   =========================== */
(function testimonials(){
  const el = $('#testiTrack');
  if(!el) return;
  // example testimonials
  const DATA = [
    {name:'Geronimo Goris', company:'Barberia Doble G', text:'Le sumo aires urbanos a los flyers, videos y más. Valio más que una IA'},
    {name:'Jorge Ramírez', company:'NS Studio', text:'Maqueta de cuenta profesional 100% adaptada a lo pedido.'},
  ];

  DATA.forEach(d=>{
    const c = document.createElement('div');
    c.className = 'testi-card';
    c.innerHTML = `<div class="testi-name">${d.name}</div>
                   <div class="testi-company">${d.company}</div>
                   <div class="testi-text">${d.text}</div>`;
    el.appendChild(c);
  });

  // simple autoplay scroll
  let pos = 0;
  function next(){
    pos = (pos + 1) % DATA.length;
    const shift = -pos * (el.children[0].clientWidth + 18);
    el.style.transform = `translateX(${shift}px)`;
  }
  setInterval(next, 6000);
})();

/* ===========================
   CONTACT FORM: simple validacion y mailto fallback
   =========================== */
(function contactForm(){
  const form = $('#contactForm');
  if(!form) return;
  const status = $('#formStatus');

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const company = data.get('company') || '';
    const service = data.get('service');
    const message = data.get('message');

    if(!name || !service || !message){
      status.textContent = 'Por favor completá los campos requeridos.';
      return;
    }

    // Aquí podés conectar con endpoint real (API). Por ahora, mailto fallback:
    const subject = encodeURIComponent(`Presupuesto: ${service} — ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmpresa: ${company}\nServicio: ${service}\n\nMensaje:\n${message}`);
    const mailto = `mailto:contacto@axvisuals.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    status.textContent = 'Abrirás tu cliente de correo para enviar la consulta.';
  });
})();

/* ===========================
   Small utilities
   =========================== */
(function misc(){
  // Year in footer
  const year = new Date().getFullYear();
  const yEl = $('#year');
  if(yEl) yEl.textContent = year;

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const target = document.querySelector(a.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
})();

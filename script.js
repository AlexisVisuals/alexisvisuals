// script.js
// Interacciones y animaciones:
// - IntersectionObserver para revelar secciones al hacer scroll
// - Menu hamburguesa responsive
// - Cerrar menú al navegar
// Código limpio y sin dependencias.

/* =========================
   Helpers y selectores
   ========================= */
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -10% 0px', // empezar un poco antes
  threshold: 0.08
};

const reveals = document.querySelectorAll('.reveal');

// IntersectionObserver para animar elementos cuando entran en el viewport
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      // si no queremos volver a animar al salir, lo desobservamos
      obs.unobserve(entry.target);
    }
  });
}, observerOptions);

revealObserver.observe(document.querySelector('.hero')); // priorizar hero
reveals.forEach(el => revealObserver.observe(el));

/* =========================
   Mobile menu toggle
   ========================= */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

function toggleMenu(){
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('show');
}
hamburger.addEventListener('click', toggleMenu);

// Cerrar menu al hacer click en un enlace (mobile)
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* =========================
   Optional: small UX polish
   - Añadir clase al header cuando se hace scroll para sombra
   ========================= */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

/* =========================
   Accessibility & Keyboard
   - cerrar menú con Escape
   ========================= */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('show')) {
    nav.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }
});

/* =========================
   Conclusión:
   - Las secciones tienen la clase .reveal para la animación de entrada.
   - El menú es accesible y se cierra automáticamente al navegar o presionar Escape.
   - Para personalizar timings o añadir más animaciones, editar revealObserver o agregar clases adicionales.
   ========================= */
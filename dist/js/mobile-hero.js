function initHeroTextSlider() {
  const hero = document.querySelector('.hero');
  const controls = document.querySelector('.hero-controls');
  const prev = document.querySelector('.hero-slide-prev');
  const next = document.querySelector('.hero-slide-next');

  if (!hero || !prev || !next || hero.dataset.heroSliderReady === 'true') {
    return;
  }

  hero.dataset.heroSliderReady = 'true';

  const slides = Array.from(hero.querySelectorAll('.hero-main, .hero-side'));
  if (slides.length < 2) {
    if (controls) controls.hidden = true;
    return;
  }

  let currentSlide = hero.classList.contains('is-slide-2') ? 1 : 0;

  function setSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    hero.classList.toggle('is-slide-2', currentSlide === 1);
    prev.setAttribute('aria-disabled', 'false');
    next.setAttribute('aria-disabled', 'false');
  }

  function go(direction) {
    setSlide(currentSlide + direction);
  }

  prev.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    go(-1);
  });

  next.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    go(1);
  });

  let touchStartX = 0;

  hero.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  hero.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const distance = touchEndX - touchStartX;

    if (Math.abs(distance) < 45) {
      return;
    }

    go(distance < 0 ? 1 : -1);
  }, { passive: true });

  setSlide(currentSlide);
}

window.addEventListener('DOMContentLoaded', initHeroTextSlider);
document.addEventListener('partialsLoaded', initHeroTextSlider);

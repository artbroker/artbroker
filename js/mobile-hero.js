function initHeroTextSlider() {
  const hero = document.querySelector('.hero');
  const prev = document.querySelector('.hero-slide-prev');
  const next = document.querySelector('.hero-slide-next');

  if (!hero || !prev || !next || hero.dataset.heroSliderReady === 'true') {
    return;
  }

  hero.dataset.heroSliderReady = 'true';
  let currentSlide = 0;

  function setSlide(index) {
    currentSlide = index === 1 ? 1 : 0;
    hero.classList.toggle('is-slide-2', currentSlide === 1);
  }

  function go(direction) {
    setSlide(currentSlide + direction > 0 ? 1 : 0);
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  let touchStartX = 0;
  let touchEndX = 0;

  hero.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  hero.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const distance = touchEndX - touchStartX;

    if (Math.abs(distance) < 45) {
      return;
    }

    if (distance < 0) {
      setSlide(1);
    } else {
      setSlide(0);
    }
  }, { passive: true });
}

window.addEventListener('DOMContentLoaded', initHeroTextSlider);
document.addEventListener('partialsLoaded', initHeroTextSlider);


function initAboutMediaSlideshow() {
  const slideshow = document.querySelector('.media-slideshow');
  const viewport = document.querySelector('.media-slide-viewport');
  const slides = Array.from(document.querySelectorAll('.media-slide'));
  const prevButton = document.querySelector('[data-media-slide="prev"]');
  const nextButton = document.querySelector('[data-media-slide="next"]');
  const lightbox = document.getElementById('media-lightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('.media-lightbox-image') : null;
  const closeButtons = lightbox ? lightbox.querySelectorAll('[data-lightbox-close]') : [];

  if (!slideshow || !viewport || !slides.length || slideshow.dataset.ready === 'true') {
    return;
  }

  slideshow.dataset.ready = 'true';

  let activeIndex = 0;
  let timer = null;
  let lastActiveElement = null;
  const intervalMs = 4500;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
  }

  function nextSlide() {
    showSlide(activeIndex + 1);
  }

  function previousSlide() {
    showSlide(activeIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = window.setInterval(nextSlide, intervalMs);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function openLightbox() {
    const activeSlide = slides[activeIndex];

    if (!lightbox || !lightboxImage || !activeSlide) {
      return;
    }

    lastActiveElement = document.activeElement;
    stopAutoPlay();
    lightboxImage.src = activeSlide.dataset.lightboxSrc;
    lightboxImage.alt = activeSlide.dataset.lightboxAlt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) {
      return;
    }

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');
    lightboxImage.removeAttribute('src');
    startAutoPlay();

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus({ preventScroll: true });
    }
  }

  prevButton?.addEventListener('click', () => {
    previousSlide();
    startAutoPlay();
  });

  nextButton?.addEventListener('click', () => {
    nextSlide();
    startAutoPlay();
  });

  viewport.addEventListener('dblclick', openLightbox);

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      openLightbox();
    }

    if (event.key === 'ArrowLeft') {
      previousSlide();
      startAutoPlay();
    }

    if (event.key === 'ArrowRight') {
      nextSlide();
      startAutoPlay();
    }
  });

  slideshow.addEventListener('mouseenter', stopAutoPlay);
  slideshow.addEventListener('mouseleave', startAutoPlay);
  slideshow.addEventListener('focusin', stopAutoPlay);
  slideshow.addEventListener('focusout', startAutoPlay);

  let touchStartX = null;

  viewport.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    stopAutoPlay();
  }, { passive: true });

  viewport.addEventListener('touchend', (event) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) > 40) {
      if (difference > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }

    touchStartX = null;
    startAutoPlay();
  }, { passive: true });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  showSlide(0);
  startAutoPlay();
}

window.addEventListener('DOMContentLoaded', initAboutMediaSlideshow);
document.addEventListener('partialsLoaded', initAboutMediaSlideshow);

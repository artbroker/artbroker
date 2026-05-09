function initAboutMediaSlideshow() {
  const slideshow = document.querySelector('.media-slideshow');
  const viewport = document.querySelector('.media-slide-viewport');
  const prevButton = document.querySelector('[data-media-slide="prev"]');
  const nextButton = document.querySelector('[data-media-slide="next"]');
  const lightbox = document.getElementById('media-lightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('.media-lightbox-image') : null;
  const closeButtons = lightbox ? lightbox.querySelectorAll('[data-lightbox-close]') : [];

  if (!slideshow || !viewport || slideshow.dataset.ready === 'true') {
    return;
  }

  slideshow.dataset.ready = 'true';

  let slides = [];
  let activeIndex = 0;
  let timer = null;
  let lastActiveElement = null;
  const intervalMs = 4500;
  const folder = slideshow.dataset.bunnyFolder || 'krantenartikelen';

  function setLoading() {
    viewport.innerHTML = '<div class="media-slide-loading">Afbeeldingen laden…</div>';
  }

  function setError(message) {
    viewport.innerHTML = `<div class="media-slide-error">${message}</div>`;
  }

  function normalAlt(item, index) {
    return item.title || item.name?.replace(/\.[^.]+$/, '') || `Archief afbeelding ${index + 1}`;
  }

  function createSlides(images) {
    viewport.innerHTML = '';

    images.forEach((item, index) => {
      const slide = document.createElement('div');
      slide.className = `media-slide${index === 0 ? ' is-active' : ''}`;
      slide.dataset.lightboxSrc = item.url;
      slide.dataset.lightboxAlt = normalAlt(item, index);

      const img = document.createElement('img');
      img.src = item.url;
      img.alt = normalAlt(item, index);
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.draggable = false;

      slide.appendChild(img);
      viewport.appendChild(slide);
    });

    slides = Array.from(document.querySelectorAll('.media-slide'));
    showSlide(0);
  }

  function showSlide(index) {
    if (!slides.length) return;

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
    if (slides.length > 1) {
      timer = window.setInterval(nextSlide, intervalMs);
    }
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

  async function loadSlidesFromBunny() {
    setLoading();

    try {
      const response = await fetch(`/.netlify/functions/bunny-gallery?folder=${encodeURIComponent(folder)}`);
      const images = await response.json();

      if (!response.ok) {
        throw new Error(images.error || 'Bunny map kon niet worden geladen.');
      }

      if (!Array.isArray(images) || images.length === 0) {
        setError('Geen afbeeldingen gevonden in deze Bunny map.');
        return;
      }

      createSlides(images);
      startAutoPlay();
    } catch (error) {
      console.error(error);
      setError('Afbeeldingen konden niet worden geladen.');
    }
  }

  loadSlidesFromBunny();
}

window.addEventListener('DOMContentLoaded', initAboutMediaSlideshow);
document.addEventListener('partialsLoaded', initAboutMediaSlideshow);

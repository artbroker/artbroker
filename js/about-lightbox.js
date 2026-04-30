function initMediaLightbox() {
  const lightbox = document.getElementById('media-lightbox');

  if (!lightbox || lightbox.dataset.ready === 'true') {
    return;
  }

  lightbox.dataset.ready = 'true';

  const image = lightbox.querySelector('.media-lightbox-image');
  const closeButton = lightbox.querySelector('.media-lightbox-close');
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerMoved = false;

  function openLightbox(src, alt) {
    if (!src) return;

    image.src = src;
    image.alt = alt || 'Vergroot krantenartikel';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');

    if (closeButton) {
      closeButton.focus({ preventScroll: true });
    }
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');
    image.removeAttribute('src');
  }

  document.addEventListener('pointerdown', (event) => {
    const card = event.target.closest('[data-lightbox-image]');

    if (!card) return;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerMoved = false;
  }, true);

  document.addEventListener('pointermove', (event) => {
    const card = event.target.closest('[data-lightbox-image]');

    if (!card) return;

    const deltaX = Math.abs(event.clientX - pointerStartX);
    const deltaY = Math.abs(event.clientY - pointerStartY);

    if (deltaX > 10 || deltaY > 10) {
      pointerMoved = true;
    }
  }, true);

  document.addEventListener('click', (event) => {
    const card = event.target.closest('[data-lightbox-image]');

    if (!card) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (pointerMoved || card.dataset.dragged === 'true') {
      card.dataset.dragged = 'false';
      pointerMoved = false;
      return;
    }

    const img = card.querySelector('img');
    const src = card.dataset.lightboxSrc || card.getAttribute('href') || (img ? img.src : '');
    const alt = img ? img.alt : card.getAttribute('aria-label');

    openLightbox(src, alt);
  }, true);

  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

window.addEventListener('DOMContentLoaded', initMediaLightbox);
document.addEventListener('partialsLoaded', initMediaLightbox);

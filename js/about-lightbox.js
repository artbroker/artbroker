function initMediaLightbox() {
  const lightbox = document.getElementById('media-lightbox');

  if (!lightbox || lightbox.dataset.ready === 'true') {
    return;
  }

  lightbox.dataset.ready = 'true';

  const image = lightbox.querySelector('.media-lightbox-image');
  const closeButtons = lightbox.querySelectorAll('[data-lightbox-close]');
  let lastActiveElement = null;

  function openLightbox(src, alt) {
    if (!src || !image) return;

    lastActiveElement = document.activeElement;
    image.src = src;
    image.alt = alt || 'Vergroot krantenartikel';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');
    image.removeAttribute('src');

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus({ preventScroll: true });
    }
  }

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.media-card[data-lightbox-src]');

    if (!card) return;

    const carousel = card.closest('[data-drag-scroll]');

    if (carousel && carousel.dataset.justDragged === 'true') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    openLightbox(card.dataset.lightboxSrc, card.dataset.lightboxAlt || card.getAttribute('aria-label'));
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

window.addEventListener('DOMContentLoaded', initMediaLightbox);
document.addEventListener('partialsLoaded', initMediaLightbox);

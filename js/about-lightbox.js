
function initMediaLightbox() {
  const lightbox = document.getElementById('media-lightbox');
  const image = lightbox ? lightbox.querySelector('.media-lightbox-image') : null;
  const closeButtons = lightbox ? lightbox.querySelectorAll('[data-lightbox-close]') : [];

  if (!lightbox || !image || lightbox.dataset.ready === 'true') {
    return;
  }

  lightbox.dataset.ready = 'true';
  let lastActiveElement = null;

  function openLightbox(src, alt) {
    lastActiveElement = document.activeElement;
    image.src = src;
    image.alt = alt || '';
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

    if (!card) {
      return;
    }

    event.preventDefault();
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

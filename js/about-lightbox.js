function initMediaLightbox() {
  const lightbox = document.getElementById('media-lightbox');

  if (!lightbox || lightbox.dataset.ready === 'true') {
    return;
  }

  lightbox.dataset.ready = 'true';

  const image = lightbox.querySelector('.media-lightbox-image');
  const closeButton = lightbox.querySelector('.media-lightbox-close');

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

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-lightbox-image]');

    if (!link) {
      return;
    }

    if (link.dataset.dragged === 'true') {
      event.preventDefault();
      link.dataset.dragged = 'false';
      return;
    }

    event.preventDefault();
    const img = link.querySelector('img');
    openLightbox(link.getAttribute('href'), img ? img.alt : link.getAttribute('aria-label'));
  });

  closeButton.addEventListener('click', closeLightbox);

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

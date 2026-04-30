function initMediaLightbox() {
  const lightbox = document.getElementById('media-lightbox');

  if (!lightbox || lightbox.dataset.ready === 'true') {
    return;
  }

  lightbox.dataset.ready = 'true';

  const image = lightbox.querySelector('.media-lightbox-image');
  const closeButton = lightbox.querySelector('.media-lightbox-close');

  function openLightbox(src, alt) {
    image.src = src;
    image.alt = alt || 'Vergroot krantenartikel';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
    closeButton.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');
    image.src = '';
  }

  document.querySelectorAll('[data-lightbox-image]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      const img = link.querySelector('img');
      openLightbox(link.href, img ? img.alt : link.getAttribute('aria-label'));
    });
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

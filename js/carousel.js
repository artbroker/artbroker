const carouselIds = {
  artists: 'artists-carousel'
};

function setupInfiniteCarousel(carousel) {
  if (!carousel || carousel.dataset.infiniteReady === 'true') {
    return;
  }

  carousel.dataset.infiniteReady = 'true';

  const originalItems = Array.from(carousel.children);

  originalItems.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    carousel.appendChild(clone);
  });

  let paused = false;
  let speed = 0.22;

  const getLoopWidth = () => carousel.scrollWidth / 2;

  function normalizeScroll() {
    const loopWidth = getLoopWidth();

    if (carousel.scrollLeft >= loopWidth) {
      carousel.scrollLeft -= loopWidth;
    }

    if (carousel.scrollLeft < 0) {
      carousel.scrollLeft += loopWidth;
    }
  }

  function tick() {
    if (!paused) {
      carousel.scrollLeft += speed;
      normalizeScroll();
    }

    requestAnimationFrame(tick);
  }

  const wrapper = carousel.closest('.carousel-wrap') || carousel;

  wrapper.addEventListener('mouseenter', () => {
    paused = true;
  });

  wrapper.addEventListener('mouseleave', () => {
    paused = false;
  });

  wrapper.addEventListener('focusin', () => {
    paused = true;
  });

  wrapper.addEventListener('focusout', () => {
    paused = false;
  });

  tick();
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((button) => {
    button.addEventListener('click', () => {
      const carousel = document.getElementById(carouselIds[button.dataset.carousel]);

      if (!carousel) {
        return;
      }

      const direction = Number(button.dataset.dir);
      const amount = Math.min(carousel.clientWidth * 0.82, 560);

      carousel.scrollBy({
        left: amount * direction,
        behavior: 'smooth'
      });
    });
  });

  Object.values(carouselIds).forEach((id) => {
    setupInfiniteCarousel(document.getElementById(id));
  });
}

window.addEventListener('DOMContentLoaded', initCarousels);
document.addEventListener('partialsLoaded', initCarousels);

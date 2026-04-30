const carouselIds = {
  artists: 'artists-carousel',
  media: 'media-carousel'
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

  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { paused = false; });
  wrapper.addEventListener('focusin', () => { paused = true; });
  wrapper.addEventListener('focusout', () => { paused = false; });

  tick();
}

function setupDragScroll(carousel) {
  if (!carousel || carousel.dataset.dragReady === 'true') {
    return;
  }

  carousel.dataset.dragReady = 'true';

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;

  carousel.addEventListener('pointerdown', (event) => {
    isDown = true;
    moved = false;
    startX = event.clientX;
    scrollLeft = carousel.scrollLeft;
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener('pointermove', (event) => {
    if (!isDown) return;

    const delta = event.clientX - startX;

    if (Math.abs(delta) > 5) {
      moved = true;
    }

    carousel.scrollLeft = scrollLeft - delta;
  });

  function endDrag(event) {
    if (!isDown) return;
    isDown = false;

    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
  }

  carousel.addEventListener('pointerup', endDrag);
  carousel.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('mouseleave', () => { isDown = false; });

  carousel.addEventListener('click', (event) => {
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((button) => {
    if (button.dataset.carouselReady === 'true') {
      return;
    }

    button.dataset.carouselReady = 'true';

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

  setupInfiniteCarousel(document.getElementById('artists-carousel'));

  document.querySelectorAll('[data-drag-scroll="true"]').forEach(setupDragScroll);
}

window.addEventListener('DOMContentLoaded', initCarousels);
document.addEventListener('partialsLoaded', initCarousels);

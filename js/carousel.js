const carouselIds = {
  artists: 'artists-carousel'
};

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
}

window.addEventListener('DOMContentLoaded', initCarousels);

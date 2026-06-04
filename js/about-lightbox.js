function initAboutMediaSlideshow() {
  const slideshow = document.querySelector('.media-slideshow');
  const viewport = document.querySelector('.media-slide-viewport');
  const prevButton = document.querySelector('[data-media-slide="prev"]');
  const nextButton = document.querySelector('[data-media-slide="next"]');
  const categoryRail = document.querySelector('.media-category-rail');
  const categoryTiles = Array.from(document.querySelectorAll('.media-category-tile[data-bunny-folder]'));
  const categoryScrollButtons = document.querySelectorAll('[data-category-scroll]');
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
  let activeFolder = slideshow.dataset.bunnyFolder || categoryTiles[0]?.dataset.bunnyFolder || 'krantenartikelen';
  let loadRequestId = 0;
  const intervalMs = 4500;

  function setLoading() {
    viewport.classList.add('is-loading');
    viewport.classList.remove('has-active-video');
    viewport.innerHTML = '<div class="media-slide-loading">Media laden...</div>';
  }

  function setError(message) {
    viewport.classList.remove('is-loading');
    viewport.classList.remove('has-active-video');
    viewport.innerHTML = `<div class="media-slide-error">${message}</div>`;
  }

  function normalAlt(item, index) {
    return item.title || item.name?.replace(/\.[^.]+$/, '') || `Archief media ${index + 1}`;
  }

  function isVideoSlide(slide) {
    return slide?.dataset.mediaType === 'video';
  }

  function createImageSlide(item, index) {
    const slide = document.createElement('div');
    slide.className = `media-slide${index === 0 ? ' is-active' : ''}`;
    slide.dataset.mediaType = 'image';
    slide.dataset.lightboxSrc = item.url;
    slide.dataset.lightboxAlt = normalAlt(item, index);

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = normalAlt(item, index);
    img.loading = index === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.draggable = false;

    slide.appendChild(img);
    return slide;
  }

  function createVideoSlide(item, index) {
    const slide = document.createElement('div');
    slide.className = `media-slide media-slide-video${index === 0 ? ' is-active' : ''}`;
    slide.dataset.mediaType = 'video';

    const video = document.createElement('video');
    video.src = item.url;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.title = normalAlt(item, index);

    video.addEventListener('play', stopAutoPlay);

    slide.appendChild(video);
    return slide;
  }

  function createSlides(mediaItems) {
    viewport.classList.remove('is-loading');
    viewport.innerHTML = '';

    mediaItems.forEach((item, index) => {
      const slide = item.type === 'video'
        ? createVideoSlide(item, index)
        : createImageSlide(item, index);

      viewport.appendChild(slide);
    });

    slides = Array.from(viewport.querySelectorAll('.media-slide'));
    showSlide(0);
  }

  function showSlide(index) {
    if (!slides.length) return;

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const video = slide.querySelector('video');
      const isActive = slideIndex === activeIndex;

      slide.classList.toggle('is-active', isActive);

      if (!isActive && video) {
        video.pause();
      }
    });

    viewport.classList.toggle('has-active-video', isVideoSlide(slides[activeIndex]));

    if (isVideoSlide(slides[activeIndex])) {
      stopAutoPlay();
    }
  }

  function nextSlide() {
    showSlide(activeIndex + 1);
  }

  function previousSlide() {
    showSlide(activeIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (slides.length > 1 && !isVideoSlide(slides[activeIndex])) {
      timer = window.setInterval(nextSlide, intervalMs);
    }
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function setActiveCategory(folder) {
    categoryTiles.forEach((tile) => {
      const isActive = tile.dataset.bunnyFolder === folder;
      tile.classList.toggle('is-active', isActive);
      tile.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (isActive) {
        tile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  async function fetchBunnyMedia(folder) {
    const response = await fetch(`/.netlify/functions/bunny-gallery?folder=${encodeURIComponent(folder)}`);
    const media = await response.json();

    if (!response.ok) {
      throw new Error(media.error || 'Bunny map kon niet worden geladen.');
    }

    return media;
  }

  function openLightbox() {
    const activeSlide = slides[activeIndex];

    if (!lightbox || !lightboxImage || !activeSlide || isVideoSlide(activeSlide)) {
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

  async function loadSlidesFromBunny(folder = activeFolder) {
    const requestId = ++loadRequestId;
    activeFolder = folder;
    slideshow.dataset.bunnyFolder = folder;
    setActiveCategory(folder);
    stopAutoPlay();
    setLoading();

    try {
      const mediaItems = await fetchBunnyMedia(folder);

      if (requestId !== loadRequestId) {
        return;
      }

      if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
        setError('Geen media gevonden in deze Bunny map.');
        return;
      }

      createSlides(mediaItems);
      startAutoPlay();
    } catch (error) {
      console.error(error);
      setError('Media kon niet worden geladen.');
    }
  }

  categoryTiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const nextFolder = tile.dataset.bunnyFolder;

      if (!nextFolder || nextFolder === activeFolder) {
        return;
      }

      loadSlidesFromBunny(nextFolder);
    });
  });

  categoryScrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!categoryRail) {
        return;
      }

      const direction = Number(button.dataset.categoryScroll) || 1;
      categoryRail.scrollBy({
        left: direction * Math.min(categoryRail.clientWidth * 0.78, 520),
        behavior: 'smooth'
      });
    });
  });

  categoryRail?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    const activeTileIndex = categoryTiles.findIndex((tile) => tile.dataset.bunnyFolder === activeFolder);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTile = categoryTiles[activeTileIndex + direction];

    if (nextTile) {
      event.preventDefault();
      nextTile.focus();
      nextTile.click();
    }
  });

  categoryTiles.forEach(async (tile) => {
    const cover = tile.querySelector('.media-category-cover');

    if (!cover) {
      return;
    }

    try {
      const mediaItems = await fetchBunnyMedia(tile.dataset.bunnyFolder);
      const firstImage = Array.isArray(mediaItems) ? mediaItems.find((item) => item.type !== 'video') : null;

      if (firstImage?.url) {
        cover.style.backgroundImage = `url("${firstImage.url}")`;
        tile.classList.add('has-cover');
      }
    } catch (error) {
      tile.classList.add('has-no-cover');
    }
  });

  loadSlidesFromBunny(activeFolder);
}

window.addEventListener('DOMContentLoaded', initAboutMediaSlideshow);
document.addEventListener('partialsLoaded', initAboutMediaSlideshow);

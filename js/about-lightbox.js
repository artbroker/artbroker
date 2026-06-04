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
  const supplementalMediaByFolder = {
    'krantenartikelen/Onze oude gallerij': [
      {
        type: 'tiktok',
        title: 'Onze oude gallerij video 1',
        videoId: '7349549427138252064',
        cite: 'https://www.tiktok.com/@art.broker/video/7349549427138252064',
        musicTitle: 'origineel geluid - Artbroker',
        musicUrl: 'https://www.tiktok.com/music/origineel-geluid-7349549453970574113?refer=embed'
      },
      {
        type: 'tiktok',
        title: 'Onze oude gallerij video 2',
        videoId: '7139593020826979590',
        cite: 'https://www.tiktok.com/@art.broker/video/7139593020826979590',
        musicTitle: 'Back In Black - AC/DC',
        musicUrl: 'https://www.tiktok.com/music/Back-In-Black-6715195986316101634?refer=embed'
      }
    ]
  };

  function setLoading() {
    viewport.classList.add('is-loading');
    viewport.innerHTML = '<div class="media-slide-loading">Media laden...</div>';
  }

  function setError(message) {
    viewport.classList.remove('is-loading');
    viewport.innerHTML = `<div class="media-slide-error">${message}</div>`;
  }

  function normalAlt(item, index) {
    return item.title || item.name?.replace(/\.[^.]+$/, '') || `Archief afbeelding ${index + 1}`;
  }

  function isVideoSlide(slide) {
    return slide?.dataset.mediaType === 'tiktok';
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

  function createTikTokSlide(item, index) {
    const slide = document.createElement('div');
    slide.className = `media-slide media-slide-video${index === 0 ? ' is-active' : ''}`;
    slide.dataset.mediaType = 'tiktok';

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'tiktok-embed';
    blockquote.cite = item.cite;
    blockquote.dataset.videoId = item.videoId;

    const section = document.createElement('section');
    const profileLink = document.createElement('a');
    profileLink.target = '_blank';
    profileLink.rel = 'noopener noreferrer';
    profileLink.title = '@art.broker';
    profileLink.href = 'https://www.tiktok.com/@art.broker?refer=embed';
    profileLink.textContent = '@art.broker';

    const caption = document.createElement('p');
    const musicLink = document.createElement('a');
    musicLink.target = '_blank';
    musicLink.rel = 'noopener noreferrer';
    musicLink.title = item.musicTitle;
    musicLink.href = item.musicUrl;
    musicLink.textContent = `♬ ${item.musicTitle}`;

    section.appendChild(profileLink);
    section.appendChild(caption);
    section.appendChild(musicLink);
    blockquote.appendChild(section);
    slide.appendChild(blockquote);
    return slide;
  }

  function refreshTikTokEmbeds() {
    if (!viewport.querySelector('.tiktok-embed')) {
      return;
    }

    const existingScript = document.querySelector('script[data-about-tiktok-embed]');

    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    script.dataset.aboutTiktokEmbed = 'true';
    document.body.appendChild(script);
  }

  function createSlides(mediaItems) {
    viewport.classList.remove('is-loading');
    viewport.innerHTML = '';

    mediaItems.forEach((item, index) => {
      const slide = item.type === 'tiktok'
        ? createTikTokSlide(item, index)
        : createImageSlide(item, index);

      viewport.appendChild(slide);
    });

    slides = Array.from(viewport.querySelectorAll('.media-slide'));
    showSlide(0);
    refreshTikTokEmbeds();
  }

  function showSlide(index) {
    if (!slides.length) return;

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
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

  async function fetchBunnyImages(folder) {
    const response = await fetch(`/.netlify/functions/bunny-gallery?folder=${encodeURIComponent(folder)}`);
    const images = await response.json();

    if (!response.ok) {
      throw new Error(images.error || 'Bunny map kon niet worden geladen.');
    }

    return images;
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
      const images = await fetchBunnyImages(folder);

      if (requestId !== loadRequestId) {
        return;
      }

      const supplementalMedia = supplementalMediaByFolder[folder] || [];
      const mediaItems = [
        ...(Array.isArray(images) ? images : []),
        ...supplementalMedia
      ];

      if (mediaItems.length === 0) {
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
      const images = await fetchBunnyImages(tile.dataset.bunnyFolder);
      const firstImage = Array.isArray(images) ? images[0] : null;

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

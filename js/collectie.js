document.addEventListener("DOMContentLoaded", () => {
  const panels = Array.from(document.querySelectorAll(".artist-panel"));

  const animatePanel = (panel, shouldOpen, instant = false) => {
    const content = panel.querySelector(".artist-panel-content");
    if (!content) {
      panel.open = shouldOpen;
      return;
    }

    if (instant) {
      panel.open = shouldOpen;
      content.style.height = "";
      content.style.opacity = "";
      content.style.transition = "";
      return;
    }

    panel.classList.add("is-animating");
    content.style.overflow = "hidden";
    content.style.transition = "height 360ms ease, opacity 260ms ease";

    if (shouldOpen) {
      panel.open = true;
      content.style.height = "0px";
      content.style.opacity = "0";

      requestAnimationFrame(() => {
        content.style.height = `${content.scrollHeight}px`;
        content.style.opacity = "1";
      });

      window.setTimeout(() => {
        content.style.height = "auto";
        content.style.overflow = "";
        panel.classList.remove("is-animating");
      }, 380);
    } else {
      content.style.height = `${content.scrollHeight}px`;
      content.style.opacity = "1";

      requestAnimationFrame(() => {
        content.style.height = "0px";
        content.style.opacity = "0";
      });

      window.setTimeout(() => {
        panel.open = false;
        content.style.height = "";
        content.style.opacity = "";
        content.style.overflow = "";
        panel.classList.remove("is-animating");
      }, 380);
    }
  };

  panels.forEach((panel) => {
    const summary = panel.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      animatePanel(panel, !panel.open);
    });
  });

  const openPanelFromHash = () => {
    const hash = window.location.hash;
    if (!hash) return;

    const panel = document.querySelector(hash);
    if (!panel || panel.tagName.toLowerCase() !== "details") return;

    animatePanel(panel, true, true);

    window.setTimeout(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const makeTitle = (image, fallbackArtist) => {
    if (image.title && image.title.length > 1) return image.title;
    return fallbackArtist || image.name || "Kunstwerk";
  };

  const renderGallery = (grid, images) => {
    const artistName = grid.dataset.artistName || "Kunstwerk";
    grid.innerHTML = "";

    if (!images.length) {
      grid.innerHTML = '<p class="collection-loading">Er zijn nog geen afbeeldingen gevonden voor deze collectie.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    images.forEach((image) => {
      const title = makeTitle(image, artistName);
      const figure = document.createElement("figure");
      figure.className = "collection-work-card";

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = title;
      img.loading = "lazy";
      img.decoding = "async";

      const caption = document.createElement("figcaption");
      caption.textContent = title;

      figure.append(img, caption);
      fragment.appendChild(figure);
    });

    grid.appendChild(fragment);

    const openPanel = grid.closest("details[open]");
    const content = openPanel?.querySelector(".artist-panel-content");
    if (content && content.style.height && content.style.height !== "auto") {
      content.style.height = `${content.scrollHeight}px`;
    }
  };

  const loadGallery = async (grid) => {
    const folder = grid.dataset.bunnyFolder;
    if (!folder) return;

    try {
      const response = await fetch(`/.netlify/functions/bunny-gallery?folder=${encodeURIComponent(folder)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const images = await response.json();
      renderGallery(grid, Array.isArray(images) ? images : []);
    } catch (error) {
      console.error("Bunny gallery load failed:", error);
      grid.innerHTML = '<p class="collection-loading collection-error">De collectie kon niet automatisch worden geladen. Controleer de Bunny/Netlify instellingen.</p>';
    }
  };

  document.querySelectorAll(".collection-work-grid[data-bunny-folder]").forEach(loadGallery);

  const jumpToTopButton = document.querySelector(".jump-to-top");

  if (jumpToTopButton) {
    const toggleJumpButton = () => {
      jumpToTopButton.classList.toggle("is-visible", window.scrollY > 420);
    };

    jumpToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    toggleJumpButton();
    window.addEventListener("scroll", toggleJumpButton, { passive: true });
  }

  openPanelFromHash();
  window.addEventListener("hashchange", openPanelFromHash);
});

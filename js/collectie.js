document.addEventListener("DOMContentLoaded", () => {
  const openPanelFromHash = () => {
    const hash = window.location.hash;
    if (!hash) return;

    const panel = document.querySelector(hash);
    if (!panel || panel.tagName.toLowerCase() !== "details") return;

    panel.open = true;

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

  openPanelFromHash();
  window.addEventListener("hashchange", openPanelFromHash);
});

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

  openPanelFromHash();
  window.addEventListener("hashchange", openPanelFromHash);
});

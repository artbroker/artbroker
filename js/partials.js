async function loadPartials() {
  const partialTargets = document.querySelectorAll('[data-partial]');

  await Promise.all(
    Array.from(partialTargets).map(async (target) => {
      const file = target.getAttribute('data-partial');

      try {
        const response = await fetch(file);

        if (!response.ok) {
          throw new Error(`Could not load ${file}`);
        }

        target.innerHTML = await response.text();
      } catch (error) {
        console.error(error);
        target.innerHTML = '<!-- Partial kon niet worden geladen. -->';
      }
    })
  );

  document.dispatchEvent(new CustomEvent('partialsLoaded'));
}

window.addEventListener('DOMContentLoaded', loadPartials);

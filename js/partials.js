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

  initMobileMenu();
  setActiveNavLink();
  document.dispatchEvent(new CustomEvent('partialsLoaded'));
}


function setActiveNavLink() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-links a');

  links.forEach((link) => {
    const linkFile = new URL(link.getAttribute('href'), window.location.href).pathname.split('/').pop() || 'index.html';

    if (linkFile === currentFile) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function initMobileMenu() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  if (!header || !toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-menu-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('is-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menu openen');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      header.classList.remove('is-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menu openen');
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      header.classList.remove('is-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menu openen');
    }
  });
}

window.addEventListener('DOMContentLoaded', loadPartials);

function encodeFormData(formData) {
  return new URLSearchParams(formData).toString();
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    status.classList.remove('error');
    status.textContent = 'Bericht wordt verstuurd...';

    const formData = new FormData(form);

    if (!formData.get('form-name')) {
      formData.set('form-name', form.getAttribute('name') || 'contact');
    }

    try {
      const response = await fetch(form.getAttribute('action') || window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData(formData)
      });

      if (!response.ok) {
        throw new Error('Formulier kon niet worden verstuurd.');
      }

      form.reset();
      status.textContent = 'Dankjewel, je mail is verstuurd.';
    } catch (error) {
      status.classList.add('error');
      status.textContent = 'Er ging iets mis. Probeer het opnieuw of mail naar info@artbroker-int.nl.';
    }
  });
}

window.addEventListener('DOMContentLoaded', initContactForm);

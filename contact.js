const form = document.getElementById('contact-form');
const statusBox = document.getElementById('form-status');

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = 'form-status' + (type ? ' ' + type : '');
}

function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text().then(function (text) {
    return { error: text };
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  showStatus('Envoi en cours...');

  const formData = new FormData(form);
  const payload = {};

  for (const pair of formData.entries()) {
    payload[pair[0]] = pair[1];
  }

  fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(parseResponse)
    .then(function (data) {
      if (!data || data.error) {
        throw new Error((data && data.error) || 'Le message n\'a pas pu être envoyé.');
      }

      form.reset();
      showStatus('Message envoyé, je te répondrai dès que possible.', 'success');
    })
    .catch(function (error) {
      showStatus(error.message, 'error');
    });
});

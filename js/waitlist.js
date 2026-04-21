// js/waitlist.js
// Attaches submit handlers to any <form class="waitlist-form"> on the page.
// Each form must declare data-source="pricing" or data-source="download".

(function () {
  'use strict';

  const config = window.SOUNDSENSE_CONFIG;
  if (!config || !config.supabaseUrl || !config.supabasePublishableKey) {
    console.error('SoundSense: config.js is missing or incomplete.');
    return;
  }

  const endpoint = config.supabaseUrl + '/rest/v1/waitlist';
  const headers = {
    'Content-Type': 'application/json',
    'apikey': config.supabasePublishableKey,
    'Authorization': 'Bearer ' + config.supabasePublishableKey,
    'Prefer': 'return=minimal'
  };

  function setStatus(form, message, tone) {
    const status = form.querySelector('.waitlist-status');
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-tone', tone || 'neutral');
  }

  function setBusy(form, busy) {
    const button = form.querySelector('.waitlist-button');
    const input = form.querySelector('.waitlist-input');
    if (button) button.disabled = busy;
    if (input) input.disabled = busy;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function submit(form) {
    const input = form.querySelector('.waitlist-input');
    const email = ((input && input.value) || '').trim().toLowerCase();
    const source = form.getAttribute('data-source') || 'unknown';

    if (!isValidEmail(email)) {
      setStatus(form, 'That does not look like a valid email.', 'error');
      return;
    }

    setBusy(form, true);
    setStatus(form, 'Adding you...', 'neutral');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email: email, source: source })
      });

      if (res.status === 201) {
        form.reset();
        setStatus(form, 'You are on the list.', 'success');
      } else if (res.status === 409) {
        setStatus(form, 'You are already on the list.', 'success');
      } else {
        const text = await res.text();
        console.error('Waitlist signup failed', res.status, text);
        setStatus(form, 'Something went wrong. Please try again or contact us.', 'error');
      }
    } catch (err) {
      console.error('Waitlist network error', err);
      setStatus(form, 'Network error. Please try again.', 'error');
    } finally {
      setBusy(form, false);
    }
  }

  function init() {
    const forms = document.querySelectorAll('form.waitlist-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submit(form);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// AI Opportunities custom order fix
// Forces custom order details to submit to Netlify Forms before sending customers to Stripe.
(function () {
  const stripeDepositUrl = 'https://buy.stripe.com/aFa9AS5k55eZ3vJcV78Zq0c';

  function encodeFormData(form) {
    const data = new FormData(form);
    if (!data.get('form-name') && form.getAttribute('name')) {
      data.append('form-name', form.getAttribute('name'));
    }
    return new URLSearchParams(data).toString();
  }

  function showStatus(message) {
    const success = document.getElementById('formSuccess');
    if (success) {
      success.style.display = 'block';
      success.innerText = message;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('orderForm');
    if (!form) return;

    const stripeLinks = form.querySelectorAll('a[href*="buy.stripe.com"]');
    stripeLinks.forEach(function (link) {
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = link.className || 'stripe-button';
      btn.textContent = 'Submit Order & Pay $5 Deposit';
      link.replaceWith(btn);
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const estimateInput = document.getElementById('estimatedPriceInput');
      const estimateText = document.getElementById('estimateText');
      const servicesInput = document.getElementById('servicesInput');
      const details = document.getElementById('details');

      if (servicesInput && details && !servicesInput.value) {
        servicesInput.value = details.value;
      }

      if (estimateInput && estimateText && !estimateInput.value) {
        estimateInput.value = estimateText.innerText || 'Manual review needed';
      }

      showStatus('Sending your order details first...');

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeFormData(form)
        });

        if (!response.ok) throw new Error('Netlify form submission failed');

        showStatus('Order details sent. Sending you to the $5 deposit page...');
        window.location.href = stripeDepositUrl;
      } catch (error) {
        console.error(error);
        showStatus('Order details did not send. Please try again before paying.');
        alert('Order details did not send. Please try again before paying so your request is not lost.');
      }
    }, true);
  });
})();

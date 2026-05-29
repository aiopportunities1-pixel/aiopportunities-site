exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripeDepositUrl = 'https://buy.stripe.com/aFa9AS5k55eZ3vJcV78Zq0c';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, stripeUrl: stripeDepositUrl })
  };
};

// utils/jazzcash.js
import Jazzcash from 'jazzcash-checkout';

Jazzcash.credentials({
  config: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID,
    password: process.env.JAZZCASH_PASSWORD,
    hashKey: process.env.JAZZCASH_HASH_KEY,
  },
  environment: 'sandbox', // Change to 'live' in production
});

const JC = {
  pay: (data, callback) => {
    Jazzcash.setData(data);
    Jazzcash.createRequest('PAY').then(res => {
      callback(res); // no need to parse
    }).catch(err => {
      console.error("JazzCash PAY error:", err);
      callback({ error: true, message: 'Payment request failed', details: err });
    });
  },
};

export default JC;

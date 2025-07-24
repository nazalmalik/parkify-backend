// utils/jazzcash.js
import Jazzcash from 'jazzcash-checkout';

Jazzcash.credentials({
  config: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID,
    password: process.env.JAZZCASH_PASSWORD,
    integritySalt: process.env.INTEGRITY_SALT,
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
      if (!process.env.JAZZCASH_MERCHANT_ID || !process.env.JAZZCASH_PASSWORD || !process.env.INTEGRITY_SALT) {
        console.error("❌ JazzCash ENV variables missing");
      }
    });
  },
};

export default JC;

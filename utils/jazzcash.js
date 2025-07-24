// utils/jazzcash.js
import Jazzcash from 'jazzcash-checkout';

if (!process.env.JAZZCASH_MERCHANT_ID || !process.env.JAZZCASH_PASSWORD || !process.env.INTEGRITY_SALT) {
  console.error("❌ Missing JazzCash credentials in ENV");
}

Jazzcash.credentials({
  config: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID,
    password: process.env.JAZZCASH_PASSWORD,
    integritySalt: process.env.INTEGRITY_SALT,
  },
  environment: 'sandbox',
});

const JC = {
  pay: async (data) => {
    try {
      Jazzcash.setData(data);
      const res = await Jazzcash.createRequest('PAY');
      return res;
    } catch (err) {
      console.error("❌ JazzCash PAY error:", err);
      return {
        error: true,
        message: 'JazzCash payment request failed',
        details: err.message || err,
      };
    }
  },
};

export default JC;

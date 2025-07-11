// utils/qrCodeGenerator.js
import QRCode from 'qrcode';

/**
 * Generates a base64-encoded QR code image string
 * @param {string} data - The data to encode into the QR code
 * @returns {Promise<string>} - Base64-encoded QR image
 */
export async function generateQRCode(data) {
  try {
    const qrCodeBase64 = await QRCode.toDataURL(data);
    return qrCodeBase64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

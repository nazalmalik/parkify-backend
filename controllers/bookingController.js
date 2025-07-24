import Booking from '../models/Booking.js';
import Spot from '../models/Spot.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';
import { v4 as uuidv4 } from 'uuid';
import JC from '../utils/jazzcash.js';
import mongoose from 'mongoose'; // ✅ Add this to use ObjectId

// 1. Create a booking
export async function createBooking(req, res) {
  try {
    console.log("Incoming booking request:", req.body); // 🪵 log this
    const {
      userId,
      spotId,
      vehicleType,
      licensePlate,
      bookingDate,
      startTime,
      endTime,
    } = req.body;

    // ✅ Validate presence of required fields
    if (!userId || !spotId || !vehicleType || !licensePlate || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Convert userId to ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!userObjectId) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const endDateTime = new Date(`${bookingDate}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const spot = await Spot.findOne({ spotId });

    if (!spot || !spot.isAvailable || (spot.isReserved && spot.reservedUntil > startDateTime)) {
      return res.status(400).json({ message: 'Spot is not available for booking' });
    }

    const durationInHours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    const totalPrice = durationInHours * spot.pricePerHour;

    // ✅ Update spot reservation
    spot.isReserved = true;
    spot.isAvailable = false;
    spot.reservedUntil = endDateTime;
    await spot.save();

    const bookingId = uuidv4();

    const newBooking = new Booking({
      bookingId,
      userId: userObjectId, // ✅ use the converted ObjectId
      spotId,
      vehicleType,
      licensePlate,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      totalPrice,
      isPaid: false,
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Booking confirmed. Proceed to payment.',
      bookingId: newBooking.bookingId,
      totalPrice,
    });
  } catch (error) {
    console.error("Create Booking Error:", error); // ✅ helpful log
    res.status(500).json({ message: 'Error creating booking', error });
  }
}


// Helper to format datetime for JazzCash
function formatDateTime(date = new Date()) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// Helper to generate reference
function generateTxnRef() {
  return 'T' + Date.now();
}

//2. JazzCash Checkout
export async function createJazzCashPayment(req, res) {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const txnDateTime = formatDateTime();
    const expiryDateTime = formatDateTime(new Date(Date.now() + 60 * 60 * 1000));

    const data = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
      pp_Password: process.env.JAZZCASH_PASSWORD,
      pp_TxnRefNo: generateTxnRef(),
      pp_Amount: `${Math.round(booking.totalPrice * 100)}`,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: booking.bookingId,
      pp_Description: `Parking spot: ${booking.spotId}`,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_ReturnURL: `${process.env.JAZZCASH_RETURN_URL}?bookingId=${booking.bookingId}`,
    };

    console.log("JazzCash Request Data:", data);

    const response = await JC.pay(data);

    if (!response || response.error) {
      console.error("JazzCash Error:", response);
      return res.status(500).json({
        success: false,
        message: 'JazzCash payment failed',
        error: response.details || 'Unknown error',
      });
    }

    if (response.pp_ResponseCode === '000') {
      return res.status(200).json({
        success: true,
        url: response.pp_PaymentURL,
      });
    } else {
      console.error("JazzCash API rejected the request:", response);
      return res.status(500).json({
        success: false,
        message: 'JazzCash rejected the request',
        response,
      });
    }

  } catch (error) {
    console.error("JazzCash Exception:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}



// 3. Mark Booking as Paid
export async function markBookingAsPaid(req, res) {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.isPaid) {
      return res.status(200).json({ message: 'Already marked as paid' });
    }

    const qrData = `booking:${bookingId}`;
    const qrCodeBase64 = await generateQRCode(qrData);

    booking.isPaid = true;
    booking.qrCodeData = qrCodeBase64;
    await booking.save();

    res.status(200).json({ message: 'Booking marked as paid', qrCode: qrCodeBase64 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark booking as paid', error });
  }
}

// 4. Mark QR Scanned
export async function markQRScanned(req, res) {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.qrScanned = true;
    booking.scanTimestamp = new Date();
    await booking.save();

    res.status(200).json({ message: 'QR scan recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update scan status', error });
  }
}

// 5. Check QR Scan Status
export async function checkQRScanStatus(req, res) {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId }, 'qrScanned scanTimestamp');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.status(200).json({
      qrScanned: booking.qrScanned,
      scanTimestamp: booking.scanTimestamp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check scan status', error });
  }
}

// 6. Get Booking by ID
export async function getBookingById(req, res) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
}

// 7. Get Bookings of Current Logged-In User
export async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user bookings', error });
  }
}
// 8. Admin: Approve Booking to Allow Navigation
export async function approveBookingByAdmin(req, res) {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.qrScanned) {
      return res.status(200).json({ message: "Booking already approved for navigation" });
    }

    booking.qrScanned = true;
    booking.scanTimestamp = new Date();
    await booking.save();

    res.status(200).json({ message: "Booking approved. Navigation allowed." });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve booking", error });
  }
}

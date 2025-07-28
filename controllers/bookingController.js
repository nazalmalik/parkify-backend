//controllers/bookingController.js
import Booking from '../models/Booking.js';
import Spot from '../models/Spot.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Create a booking
export async function createBooking(req, res) {
  try {
    const {
      userId: bodyUserId,
      spotId,
      vehicleType,
      licensePlate,
      bookingDate,
      startTime,
      endTime,
    } = req.body;

    const userId = req.user?.id || bodyUserId;

    const isGoogleUser = !!req.user;

    // Allow Google-auth users with missing fields to continue
    if (!userId || (!isGoogleUser && (!spotId || !vehicleType || !licensePlate || !bookingDate || !startTime || !endTime))) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Assign default values for Google users
    const finalSpotId = spotId || "google-default-spot";
    const finalVehicleType = vehicleType || "car";
    const finalLicensePlate = licensePlate || "G-LOGIN";
    const finalBookingDate = bookingDate || new Date().toISOString().split("T")[0];
    const finalStartTime = startTime || "10:00";
    const finalEndTime = endTime || "11:00";

    const startDateTime = new Date(`${finalBookingDate}T${finalStartTime}:00`);
    const endDateTime = new Date(`${finalBookingDate}T${finalEndTime}:00`);

    if (endDateTime <= startDateTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    let spot = await Spot.findOne({ spotId: finalSpotId });

    // If spot doesn't exist and it's not a Google fallback, return error
    if (!spot && !isGoogleUser) {
      return res.status(400).json({ message: 'Spot is not available for booking' });
    }

    // For normal users: check if spot is reserved
    if (spot && !spot.isAvailable || (spot.isReserved && spot.reservedUntil > startDateTime)) {
      return res.status(400).json({ message: 'Spot is not available for booking' });
    }

    const durationInHours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    const totalPrice = spot ? durationInHours * spot.pricePerHour : 50; // Default price for fallback spot

    // If spot exists, mark it as reserved
    if (spot) {
      spot.isReserved = true;
      spot.isAvailable = false;
      spot.reservedUntil = endDateTime;
      await spot.save();
    }

    const bookingId = uuidv4();
    const newBooking = new Booking({
      bookingId,
      userId,
      spotId: finalSpotId,
      vehicleType: finalVehicleType,
      licensePlate: finalLicensePlate,
      bookingDate: new Date(finalBookingDate),
      startTime: finalStartTime,
      endTime: finalEndTime,
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
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Error creating booking', error });
  }
}


// 2. Create Stripe Checkout Session
export async function createStripeCheckoutSession(req, res) {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Convert PKR to minimum USD cents (assuming 1 USD =  294.8296 PKR)
    const conversionRate =   294.8279 ;
    const convertedAmount = Math.max(50, Math.round((booking.totalPrice / conversionRate) * 100)); // cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
               name: `Parking Spot - ${booking.spotId}`,
            description: `Converted from Rs. ${booking.totalPrice} (PKR)`, // ✅ Add this line
            },
            unit_amount: convertedAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?bookingId=${booking.bookingId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    res.status(200).json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Stripe session error:', error.message);
    res.status(500).json({ message: 'Error creating Stripe session', error: error.message });
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

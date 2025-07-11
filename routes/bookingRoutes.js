//routes/bookingRoute.js
import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  createStripeCheckoutSession,
  markBookingAsPaid,
  markQRScanned,
  checkQRScanStatus,
  getMyBookings,
  approveBookingByAdmin // ✅ Add this
} from '../controllers/bookingController.js';
import Booking from '../models/Booking.js';

import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateUser } = authMiddleware;

const router = Router();

// Routes
router.get('/my-bookings', authenticateUser, getMyBookings); // get current user's bookings
router.post('/book', createBooking); // create a new booking
router.post('/stripe', createStripeCheckoutSession); // Stripe checkout
router.post('/paid', markBookingAsPaid); // mark booking as paid
router.get('/:bookingId', getBookingById); // get booking by ID
router.post('/:bookingId/scan', markQRScanned); // QR scan
router.get('/:bookingId/scan-status', checkQRScanStatus); // QR scan status
// Admin: Approve booking to start navigation
router.post('/:bookingId/approve', approveBookingByAdmin);
router.get('/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error });
  }
});
// Delete a booking by admin
router.delete('/admin/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await Booking.findOneAndDelete({ bookingId });

    if (!result) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete booking', error: err.message });
  }
});



export default router;

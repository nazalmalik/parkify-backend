import { Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true, // ✅ Important for delete/findOne/approve
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  spotId: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike'],
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  qrCodeData: {
    type: String,
  },
  qrScanned: {
    type: Boolean,
    default: false,
  },
  scanTimestamp: {
    type: Date,
  }
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt automatically
});

export default model('Booking', bookingSchema);

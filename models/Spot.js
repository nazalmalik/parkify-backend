// models/Spot.js
import { Schema, model } from 'mongoose';

const spotSchema = new Schema({
  spotId: {
    type: String,
    required: true,
    unique: true,
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike'], // Extend if needed
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  location: {
    x: Number,
    y: Number,
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
  reservedUntil: {
    type: Date,  // The timestamp until which the spot is reserved
    default: null,
  },
});

export default model('Spot', spotSchema);

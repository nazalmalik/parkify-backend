import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Spot from './models/Spot.js'; // Adjust the path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load parkingMapData.json
const parkingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/parkingMap.json'), 'utf-8')
);

// Transform spots into Spot model format
const spotDocs = parkingData.spots.map((spot) => ({
  spotId: spot.id,
  vehicleType: spot.type,
  isAvailable: true,
  isReserved: false,
  location: { x: spot.x, y: spot.y },
  pricePerHour: spot.type === 'car' ? 20 : 10, // Custom price logic
}));

// Seed database
async function seedSpots() {
  try {
    await mongoose.connect('mongodb+srv://zainabqadeer13:130357Scorpion.@cluster0.u14pv.mongodb.net/parkify?retryWrites=true&w=majority'); // Change DB name if needed
    console.log('Connected to MongoDB');

    await Spot.deleteMany(); // Optional: Clear existing spots
    await Spot.insertMany(spotDocs);
    console.log(`Inserted ${spotDocs.length} spots successfully.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedSpots();

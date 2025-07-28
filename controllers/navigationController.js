// controllers/navigationController.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pathfinding from '../utils/pathfinding.js';
import Booking from '../models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mapGraph.json'), 'utf8'));
const { nodes, edges } = mapData; // ✅ required for pathfinding

// 🧭 1. Existing: Pathfinding API
const getNavigationPath = (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: 'Start and end points are required.' });
  }

  try {
    const result = pathfinding.getPath(start, end);

    if (!edges[start] || !nodes[end]) {
      return res.status(400).json({ message: 'Invalid start or end node.' });
    }

    if (!result.distance) {
      return res.status(404).json({ message: 'No direct path found between the given points.' });
    }

    res.status(200).json({
      message: 'Path found successfully.',
      ...result,
    });

  } catch (err) {
    console.error('Error in navigationController:', err);
    res.status(500).json({ message: 'Server error while calculating path.' });
  }
};

// 🚗 2. NEW: Return vehicleType and spotId from booking
const getNavigationData = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      vehicleType: booking.vehicleType,
      spotId: booking.spotId,
    });
  } catch (error) {
    console.error('Error in getNavigationData:', error);
    res.status(500).json({ message: 'Error fetching navigation data', error });
  }
};

// Export both functions
export default {
  getNavigationPath,
  getNavigationData,
};

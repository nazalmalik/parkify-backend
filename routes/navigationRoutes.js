// routes/navigationRoutes.js

import express from 'express';
import navigationController from '../controllers/navigationController.js';

const router = express.Router();

// 🧭 Route to get navigation path between two points
router.get('/path', navigationController.getNavigationPath);

// 🚗 Route to get vehicleType and spotId from bookingId
router.get('/:bookingId', navigationController.getNavigationData);

export default router;

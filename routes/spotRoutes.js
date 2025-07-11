// routes/spotRoutes.js
import { Router } from 'express';
const router = Router();
import { getAvailableSpots, reserveSpot, releaseSpot } from '../controllers/spotController.js';

// GET available spots filtered by vehicle type
router.get('/available', getAvailableSpots);

// POST reserve a spot temporarily before payment
router.post('/reserve', reserveSpot);

// POST release a reserved spot (on cancel or timeout)
router.post('/release', releaseSpot);

export default router;

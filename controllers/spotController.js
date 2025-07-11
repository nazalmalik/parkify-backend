// controllers/spotController.js
import Spot from '../models/Spot.js';

// Helper function to check if spot reservation expired
function isReservationExpired(spot) {
  return spot.reservedUntil && spot.reservedUntil < new Date();
}

// GET all spots filtered by vehicle type and availability
export async function getAvailableSpots(req, res) {
  try {
    const { vehicleType } = req.query;

    // Include spots that are either available or reserved but reservation expired
    const spots = await Spot.find({
      vehicleType,
      $or: [
        { isAvailable: true, isReserved: false },
        {
          isReserved: true,
          reservedUntil: { $lte: new Date() },  // Reservation expired
        },
      ],
    });

    // For spots with expired reservation, clear reservation flags
    for (const spot of spots) {
      if (spot.isReserved && isReservationExpired(spot)) {
        spot.isReserved = false;
        spot.isAvailable = true;
        spot.reservedUntil = null;
        await spot.save();
      }
    }

    res.status(200).json(spots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spots', error });
  }
}

// POST reserve a spot temporarily (before payment)
export async function reserveSpot(req, res) {
  try {
    const { spotId, reservationDurationMinutes = 10 } = req.body; // default 10 min reservation

    const spot = await Spot.findOne({ spotId });

    if (
      !spot ||
      !spot.isAvailable ||
      (spot.isReserved && !isReservationExpired(spot))
    ) {
      return res.status(404).json({ message: 'Spot not available' });
    }

    spot.isReserved = true;
    spot.isAvailable = false;
    spot.reservedUntil = new Date(Date.now() + reservationDurationMinutes * 60 * 1000);
    await spot.save();

    res.status(200).json({ message: 'Spot marked as reserved', reservedUntil: spot.reservedUntil });
  } catch (error) {
    res.status(500).json({ message: 'Error reserving spot', error });
  }
}

// POST release a reserved spot (on cancel or timeout)
export async function releaseSpot(req, res) {
  try {
    const { spotId } = req.body;

    const spot = await Spot.findOne({ spotId });

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    spot.isReserved = false;
    spot.isAvailable = true;
    spot.reservedUntil = null;
    await spot.save();

    res.status(200).json({ message: 'Spot released successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error releasing spot', error });
  }
}

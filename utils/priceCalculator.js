// utils/priceCalculator.js

// Example: Price per hour (can be dynamic based on spot or location)
const PRICE_PER_HOUR = 10; // Assume 10 currency units per hour

// Function to calculate the total price based on start and end time
export function calculatePrice(startTime, endTime) {
  const durationInMillis = new Date(endTime) - new Date(startTime);
  const durationInHours = durationInMillis / (1000 * 60 * 60); // Convert ms to hours

  if (durationInHours <= 0) {
    throw new Error('End time must be later than start time');
  }

  const totalPrice = durationInHours * PRICE_PER_HOUR;
  return totalPrice;
}

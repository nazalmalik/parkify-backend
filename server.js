import 'dotenv/config';
import express from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

import spotRoutes from './routes/spotRoutes.js';
import authRoutes from './routes/authRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// ✅ CORS - allow your frontend
app.use(cors({
  origin: 'https://parkify-frontend-rouge.vercel.app',
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/spots', spotRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.send('🚗 Smart Parking Backend is running...');
});

app.use(errorHandler);

// ✅ MongoDB connection
let isConnected = false;
async function connectToMongo() {
  if (!isConnected) {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  }
}

await connectToMongo();

// ✅ Export the Express app (no app.listen)
export default app;

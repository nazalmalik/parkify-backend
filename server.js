import 'dotenv/config';
import express from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';

// ✅ Local files
import './config/passport.js'; // 👈 Add this line for Google Strategy setup
import spotRoutes from './routes/spotRoutes.js';
import authRoutes from './routes/authRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();

// ✅ Middlewares
app.use(cors({
  origin: 'https://parkify-frontend-rouge.vercel.app/', // React frontend origin
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session middleware (must be before passport)
app.use(session({
  secret: 'yourSecretKey', // 🔒 Use strong secret in production
  resave: false,
  saveUninitialized: true
}));

// ✅ Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/contact', contactRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('🚗 Smart Parking Backend is running...');
});

// Error Handling
app.use(errorHandler);

// ✅ MongoDB Connection
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

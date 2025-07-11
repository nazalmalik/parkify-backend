# Online Smart Parking System for Shopping Malls- Backend

This is the backend of the Online Smart Parking System, built using Node.js and Express with MongoDB as the database.

## Project Structure
```
/parkify
│── /config
│── /controllers
│── /models
│── /routes
│── /middlewares
│── /services
│── /utils
│── /tests
│── server.js
│── package.json
│── .env
│── README.md
```

## Setup & Installation
1. Navigate to the backend directory:
   ```sh
   cd parking-app/backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```sh
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints
- **Authentication:** `/api/auth`
- **Bookings:** `/api/bookings`
- **Payments:** `/api/payments`

## Tech Stack
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication

## Features
- User authentication (JWT-based)
- Booking and payment handling
- QR Code generation and validation


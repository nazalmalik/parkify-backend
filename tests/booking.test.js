const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

describe('Booking API Tests', () => {
    let testUser, authToken, testSlot;

    beforeAll(async () => {
        await User.deleteMany();
        await Booking.deleteMany();
        await ParkingSlot.deleteMany();

        testUser = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password123' });
        testSlot = await ParkingSlot.create({ slotNumber: 1, status: 'available' });

        const loginResponse = await request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'password123'
        });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Should create a new booking', async () => {
        const response = await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                user: testUser._id,
                slot: testSlot._id,
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
                amountPaid: 5.0
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('booking');
    });

    test('Should retrieve user bookings', async () => {
        const response = await request(app)
            .get('/api/bookings')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    test('Should cancel a booking', async () => {
        const booking = await Booking.findOne({ user: testUser._id });

        const response = await request(app)
            .delete(`/api/bookings/${booking._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Booking cancelled successfully');
    });
});

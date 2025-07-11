const request = require('supertest');
const app = require('../server.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');

describe('Authentication API Tests', () => {
    let testUser;

    beforeAll(async () => {
        await User.deleteMany(); // Clear users before tests
        testUser = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password123' });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Should register a new user', async () => {
        const response = await request(app).post('/api/auth/register').send({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'securepassword'
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    test('Should log in an existing user', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'password123'
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('Should reject login with incorrect password', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword'
        });

        expect(response.status).toBe(401);
    });
});

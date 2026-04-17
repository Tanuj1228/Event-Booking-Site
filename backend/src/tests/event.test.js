const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

let adminToken;
let testEventId;

beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventease_test';
    await mongoose.connect(mongoUri);

    const admin = await User.create({
        name: 'Test Admin',
        email: 'admin_test@eventease.com',
        password: 'password123',
        role: 'admin'
    });

    const res = await request(app).post('/api/auth/login').send({
        email: 'admin_test@eventease.com',
        password: 'password123'
    });
    
    adminToken = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Event API Endpoints', () => {
    it('should allow admin to create a new event', async () => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Standup Comedy',
                venue: 'Main Auditorium',
                date: new Date().toISOString(),
                category: 'Comedy',
                price: 500,
                totalSeats: 100
            });
            
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toEqual('Test Standup Comedy');
        expect(res.body.seats.length).toEqual(100);
        
        testEventId = res.body._id;
    });

    it('should fetch all events without seat details', async () => {
        const res = await request(app).get('/api/events');
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).not.toHaveProperty('seats');
    });

    it('should fetch a single event by ID with seat details', async () => {
        const res = await request(app).get(`/api/events/${testEventId}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('seats');
        expect(res.body.seats[0]).toHaveProperty('seatNumber');
        expect(res.body.seats[0]).toHaveProperty('isAvailable');
    });

    it('should not allow non-admins to create events', async () => {
        const userRes = await request(app).post('/api/auth/register').send({
            name: 'Regular User',
            email: 'user@eventease.com',
            password: 'password123'
        });
        
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${userRes.body.token}`)
            .send({
                name: 'Unauthorized Event',
                venue: 'Nowhere',
                date: new Date().toISOString(),
                category: 'Other',
                price: 100,
                totalSeats: 10
            });
            
        expect(res.statusCode).toEqual(403);
    });
});
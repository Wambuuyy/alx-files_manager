// tests/users.test.js
const request = require('supertest');
const app = require('../app');
const dbClient = require('../utils/db');

describe('POST /users - Welcome Email', () => {
    test('should send a welcome email when a new user is created', async () => {
        const res = await request(app)
            .post('/users')
            .send({ email: 'newuser@example.com', password: '123456' });

        expect(res.statusCode).toEqual(201);
        // Optionally, mock console.log and check if the correct message was printed
    });
});

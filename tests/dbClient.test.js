// tests/dbClient.test.js
const dbClient = require('../utils/db');

describe('dbClient', () => {
    beforeAll(async () => {
        await dbClient.connect();
    });

    test('should connect to MongoDB', () => {
        expect(dbClient.isAlive()).toBe(true);
    });

    test('should retrieve a document from a collection', async () => {
        const user = await dbClient.collection('users').findOne({ email: 'test@example.com' });
        expect(user).not.toBeNull();
    });

    afterAll(async () => {
        await dbClient.client.close();
    });
});

// tests/redisClient.test.js
const redisClient = require('../utils/redis');

describe('redisClient', () => {
    beforeAll(() => {
        redisClient.connect();
    });

    test('should connect to Redis server', () => {
        expect(redisClient.isAlive()).toBe(true);
    });

    test('should store and retrieve a key', async () => {
        await redisClient.set('testKey', 'testValue', 10);
        const value = await redisClient.get('testKey');
        expect(value).toBe('testValue');
    });

    afterAll(() => {
        redisClient.quit();
    });
});

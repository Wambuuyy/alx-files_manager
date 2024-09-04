import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  isAlive() {
    return new Promise((resolve) => {
      this.client.ping((err, res) => resolve(err ? false : res === 'PONG'));
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => (err ? reject(err) : resolve(reply)));
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err) => (err ? reject(err) : resolve()));
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => (err ? reject(err) : resolve()));
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;

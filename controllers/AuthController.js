import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic' || !credentials) return res.status(401).json({ error: 'Unauthorized' });

    const [email, password] = Buffer.from(credentials, 'base64').toString().split(':');
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    
    const db = await dbClient.connect();
    const user = await db.collection('users').findOne({ email, password: hashedPassword });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = await dbClient.connect();
    const user = await db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

export default AuthController;

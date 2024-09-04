import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['file', 'image', 'folder'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    if (parentId !== 0) {
      const db = await dbClient.connect();
      const parent = await db.collection('files').findOne({ _id: new mongodb.ObjectId(parentId) });
      if (!parent) return res.status(400).json({ error: 'Parent not found' });
      if (parent.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const newFile = {
      userId,
      name,
      type,
      parentId,
      isPublic,
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const filePath = path.join(folderPath, `${uuidv4()}`);
      fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      newFile.localPath = filePath;
    }

    const db = await dbClient.connect();
    const result = await db.collection('files').insertOne(newFile);

    res.status(201).json({ id: result.insertedId.toString(), ...newFile });
  }
}

export default FilesController;

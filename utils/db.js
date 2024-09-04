import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.dbName = database;
  }

  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
    return this.client.db(this.dbName);
  }

  async isAlive() {
    try {
      await this.connect();
      return true;
    } catch {
      return false;
    }
  }

  async nbUsers() {
    const db = await this.connect();
    return db.collection('users').countDocuments();
  }

  async nbFiles() {
    const db = await this.connect();
    return db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;

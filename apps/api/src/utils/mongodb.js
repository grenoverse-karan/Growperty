import mongoose from 'mongoose';
import logger from './logger.js';

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  await mongoose.connect(uri, { dbName: 'growperty_db' });
  isConnected = true;
  logger.info('MongoDB connected to growperty_db');

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });
}

import mongoose from 'mongoose';
import logger from './logger.js';

// Promise cache prevents parallel cold-start requests from opening multiple connections
let _connectionPromise = null;

export async function connectMongoDB() {
  // Already connected (warm invocation) — return immediately
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (!_connectionPromise) {
    _connectionPromise = mongoose.connect(uri, {
      dbName: 'growperty_db',
      maxPoolSize: 1,              // Serverless: one connection per instance
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      bufferCommands: false,
    }).then(() => {
      logger.info('MongoDB connected to growperty_db');
      mongoose.connection.on('error', (err) => logger.error('MongoDB connection error:', err));
    }).catch((err) => {
      _connectionPromise = null;  // Allow retry on next request
      throw err;
    });
  }

  await _connectionPromise;
}

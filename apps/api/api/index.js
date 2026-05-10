import { connectMongoDB } from '../src/utils/mongodb.js';
import app from '../src/app.js';

export default async function handler(req, res) {
  await connectMongoDB();
  return app(req, res);
}

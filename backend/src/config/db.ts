import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resultflow';
  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
}

import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/apexhire';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected (Cloud Atlas): ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB Connection Warning] Primary DB connection failed (${error.message}). Falling back to local MongoDB...`);
    try {
      const conn = await mongoose.connect(localUri);
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`[DB Connection Error] Both Primary and Local DB connections failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;

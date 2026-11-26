import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URI;
  if (!mongoUrl) {
    throw new Error("Missing required environment variable MONGO_URI");
  }

  await mongoose.connect(mongoUrl);
  console.log("MongoDB connected");
};

export default connectDB;

import mongoose from "mongoose";

/**
 * Create a new MongoDB connection.
 */
export function createMongoConnection() {
  mongoose.connect(process.env.MONGO_URI as string, {}, (error) => {
    error
      ? console.log(error)
      : console.log("Connected to MongoDB successfully");
  });
}

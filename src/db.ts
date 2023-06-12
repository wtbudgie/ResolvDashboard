import mongoose, { ConnectOptions } from "mongoose";

const connection = {
  isConnected: false,
};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions
    );

    // @ts-ignore
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

export default dbConnect;

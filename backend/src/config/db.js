import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected Successfully!`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error details:', error);
    process.exit(1);
  }
};

// Add connection event listeners
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully");
});

mongoose.connection.on("open", () => {
  console.log("MongoDB connection opened and ready");
});

export default connectDB;

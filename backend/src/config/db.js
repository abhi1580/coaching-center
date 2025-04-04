import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected Successfully!`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Test the connection by creating a test document
    try {
      const testCollection = mongoose.connection.collection("test");
      await testCollection.insertOne({ test: "connection" });
      await testCollection.deleteOne({ test: "connection" });
    } catch (testError) {
      console.error("Database write test failed:", testError);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error("Error Details:", error);
    process.exit(1);
  }
};

// Add connection event listeners
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("connected", () => {
  // console.log("MongoDB connected");
});

mongoose.connection.on("open", () => {
  // console.log("MongoDB connection opened");
});

export default connectDB;

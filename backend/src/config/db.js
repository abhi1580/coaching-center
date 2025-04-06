import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected Successfully!`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    process.exit(1);
  }
};

// Add connection event listeners
mongoose.connection.on("error", (err) => {
  // Error handled silently
});

mongoose.connection.on("disconnected", () => {
  // Connection disconnected
});

mongoose.connection.on("connected", () => {
  // Connection established
});

mongoose.connection.on("open", () => {
  // Connection opened
});

export default connectDB;

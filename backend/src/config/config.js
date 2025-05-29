import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "development"
    ? ".env.development"
    : ".env";

// Load the environment file
const result = dotenv.config({ path: envFile });

if (result.error) {
  console.error(`Error loading ${envFile}:`, result.error);
  throw new Error(`Failed to load environment variables from ${envFile}`);
}

console.log(`Loaded environment from ${envFile}`);

// Required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRE", "PORT"];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
  clientBaseUrl: process.env.CLIENT_BASE_URL,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  uploadPath: process.env.UPLOAD_PATH || "uploads",
  logLevel: process.env.LOG_LEVEL || "info",
  corsOptions: {
    origin: process.env.CLIENT_BASE_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token"],
  },
};

// Ensure sensitive values are not exposed in development logs
if (process.env.NODE_ENV === "development") {
  console.log("Environment:", config.env);
  console.log("Port:", config.port);
  console.log("MongoDB URI:", config.mongoUri ? "***" : "Not set");
  console.log("JWT Secret:", config.jwtSecret ? "***" : "Not set");
}

export default config;

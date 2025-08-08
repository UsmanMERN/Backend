import mongoose from "mongoose";
import { db } from "../config.js";
import logger from "../core/Logger.js";

const dbURI = `mongodb://${db.user}:${encodeURIComponent(db.password)}@${db.host}:${db.port}/${db.name}`;

const options = {
  autoIndex: true,
  minPoolSize: db.minPoolSize,
  maxPoolSize: db.maxPoolSize,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

// Centralized function for graceful shutdown
const gracefulShutdown = (signal: string) => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}. Closing MongoDB connection...`);
    await mongoose.connection.close();
    logger.info("MongoDB connection closed due to app termination.");
    process.exit(0);
  });
};

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, options);
    logger.info("MongoDB Connected");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

mongoose.connection.on("connected", () => {
  logger.debug(`Mongoose default connection open to ${dbURI}`);
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose default connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  logger.info("Mongoose default connection disconnected");
});

// Set runValidators for all update operations
mongoose.plugin((schema: any) => {
  schema.pre("findOneAndUpdate", function (this: mongoose.Query<any, any>) {
    this.setOptions({ runValidators: true });
  });
  schema.pre("updateMany", function (this: mongoose.Query<any, any>) {
    this.setOptions({ runValidators: true });
  });
  schema.pre("updateOne", function (this: mongoose.Query<any, any>) {
    this.setOptions({ runValidators: true });
  });
});

// Listen for SIGINT and SIGTERM signals for graceful shutdown
["SIGINT", "SIGTERM"].forEach((signal) => gracefulShutdown(signal));

export default connectDB;
#!/usr/bin/env node
const path = require("path");
const { spawn } = require("child_process");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "../..");
const envPath = path.resolve(rootDir, ".env");
const envLocalPath = path.resolve(rootDir, ".env.local");

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const MAX_RETRIES = parseInt(process.env.DB_CONNECTION_RETRIES || "5", 10);
const RETRY_DELAY_MS = parseInt(
  process.env.DB_CONNECTION_RETRY_DELAY_MS || "2000",
  10,
);

if (!MONGODB_URI || !MONGODB_DB_NAME) {
  console.error(
    "ERROR: MONGODB_URI and MONGODB_DB_NAME are required before starting the frontend/backend.",
  );
  process.exit(1);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry() {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const conn = await mongoose.connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });

      console.log(
        `✅ MongoDB connection successful on attempt ${attempt}. Database: ${conn.connection.name}`,
      );
      return conn;
    } catch (error) {
      lastError = error;
      console.error(
        `⚠️ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`,
        error.message || error,
      );
      if (attempt < MAX_RETRIES) {
        console.log(
          `Waiting ${RETRY_DELAY_MS}ms before retrying database connection...`,
        );
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  console.error("❌ MongoDB connection failed after maximum retries.");
  throw lastError;
}

(async () => {
  try {
    await connectWithRetry();

    const nextProcess = spawn("npm", ["run", "dev"], {
      cwd: path.resolve(__dirname, ".."),
      stdio: "inherit",
      shell: true,
    });

    nextProcess.on("exit", (code) => {
      process.exit(code);
    });
  } catch (error) {
    console.error(
      "❌ Failed to start frontend/backend due to database connection issues.",
      error,
    );
    process.exit(1);
  }
})();

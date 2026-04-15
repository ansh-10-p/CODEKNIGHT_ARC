import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function resolveDatabaseName(uri: string) {
  const envDbName = process.env.MONGODB_DB_NAME?.trim();
  if (envDbName) {
    return envDbName;
  }

  try {
    const parsed = new URL(uri);
    const dbNameFromPath = parsed.pathname.replace(/^\//, "").trim();
    return dbNameFromPath || null;
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(uri: string, dbName: string) {
  const maxRetries = Number(process.env.DB_CONNECTION_RETRIES ?? 5);
  const retryDelayMs = Number(process.env.DB_CONNECTION_RETRY_DELAY_MS ?? 2000);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const instance = await mongoose.connect(uri, {
        dbName,
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });

      console.log(
        `✅ MongoDB connected to database: ${instance.connection.name} (attempt ${attempt})`,
      );
      return instance;
    } catch (error) {
      lastError = error;
      console.error(
        `⚠️ MongoDB connection attempt ${attempt}/${maxRetries} failed.`,
        error,
      );
      if (attempt < maxRetries) {
        console.log(`Retrying database connection in ${retryDelayMs}ms...`);
        await delay(retryDelayMs);
      }
    }
  }

  throw lastError;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
      throw new Error(
        "Missing MONGODB_URI. Add it to .env.local or .env and restart the server.",
      );
    }

    const dbName = resolveDatabaseName(uri);

    if (!dbName) {
      throw new Error(
        "MongoDB database name is missing. Add MONGODB_DB_NAME to .env.local or include the database name in MONGODB_URI.",
      );
    }

    cached.promise = connectWithRetry(uri, dbName);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

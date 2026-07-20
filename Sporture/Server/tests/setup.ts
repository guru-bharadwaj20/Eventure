import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Must be set before test files are imported, because importing app.ts loads
// config/env.ts, which validates these at module load time.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test-bootstrap";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-that-is-definitely-long-enough-to-pass-validation";
process.env.CLIENT_ORIGINS = process.env.CLIENT_ORIGINS || "http://localhost:5173";
process.env.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

let mem: MongoMemoryServer;

beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri();

  await mongoose.connect(mem.getUri());
});

// Isolate tests from each other without paying to restart the server.
afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mem?.stop();
});

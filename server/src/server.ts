import { config } from "./config/env";
import { connectDB } from "./config/db";
import app from "./app";

async function start() {
  // Connect to MongoDB
  await connectDB();

  // Start server
  app.listen(config.port, () => {
    console.log(`🚀 Turismo API running on http://localhost:${config.port}`);
    console.log(`📫 Environment: ${config.nodeEnv}`);
  });
}

start().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
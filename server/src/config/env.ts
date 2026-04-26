import dotenv from "dotenv";
dotenv.config();

/**
 * Helper to get environment variables with validation
 */
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: getEnv("MONGODB_URI"),
  mistralApiKey: getEnv("MISTRAL_API_KEY"),
  jwtSecret: getEnv("JWT_SECRET"),
  nodeEnv: getEnv("NODE_ENV", "development"),
  osrmBaseUrl: getEnv("OSRM_BASE_URL", "https://router.project-osrm.org"),
  nominatimBaseUrl: getEnv(
    "NOMINATIM_BASE_URL",
    "https://nominatim.openstreetmap.org"
  ),
  ip: getEnv("IP", "0.0.0.0"),
};

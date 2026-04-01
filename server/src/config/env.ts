import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/turismo",
  mistralApiKey: process.env.MISTRAL_API_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  nodeEnv: process.env.NODE_ENV || "development",
  osrmBaseUrl: process.env.OSRM_BASE_URL || "https://router.project-osrm.org",
  nominatimBaseUrl:
    process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org",
  ip: process.env.IP || "0.0.0.0",
};

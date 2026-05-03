import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.route";
import recommendRoutes from "./modules/recommend/recommend.route";
import itineraryRoutes from "./modules/itinerary/itinerary.route";
import geocodeRoutes from "./modules/geocode/geocode.route";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/geocode", geocodeRoutes);

app.get("/", (_req, res) => {
  res.send("Turismo AI Server is Live");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// error handler
app.use(errorMiddleware);

export default app;
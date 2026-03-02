import express from "express";
import cors from "cors";
import recommendRoutes from "./routes/recommend";
import itineraryRoutes from "./routes/itinerary";
import geocodeRoutes from "./routes/geocode";

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use("/api/recommend", recommendRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/geocode", geocodeRoutes);

// ── Health check ──
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "turismo-api" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
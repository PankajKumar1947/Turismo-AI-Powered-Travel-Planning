import mongoose, { Schema, type Document } from "mongoose";
import type { AggregatedResponse, RecommendRequest, PlaceRecommendation } from "../types";

export interface ISavedItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  city: string;
  itinerary: AggregatedResponse;
  request: RecommendRequest;
  places: PlaceRecommendation[];
  createdAt: Date;
}

const savedItinerarySchema = new Schema<ISavedItinerary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    city: { type: String, required: true },
    itinerary: { type: Schema.Types.Mixed, required: true },
    request: { type: Schema.Types.Mixed, required: true },
    places: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export const SavedItinerary = mongoose.model<ISavedItinerary>(
  "SavedItinerary",
  savedItinerarySchema
);

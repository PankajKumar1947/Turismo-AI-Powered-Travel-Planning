import { SavedItinerary } from "./itinerary.model";
import { ApiError } from "../../utils/ApiError";

export class ItineraryService {
  static async saveItinerary(userId: string, data: any) {
    const saved = await SavedItinerary.create({
      userId,
      city: data.city,
      itinerary: data.itinerary,
      request: data.request,
      places: data.places || [],
    });
    return saved;
  }

  static async getUserItineraries(userId: string) {
    const itineraries = await SavedItinerary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return itineraries;
  }

  static async getItineraryById(userId: string, id: string) {
    const itinerary = await SavedItinerary.findOne({
      _id: id,
      userId,
    });
    if (!itinerary) {
      throw ApiError.notFound("Itinerary not found");
    }
    return itinerary;
  }

  static async deleteItinerary(userId: string, id: string) {
    const result = await SavedItinerary.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!result) {
      throw ApiError.notFound("Itinerary not found");
    }
    return true;
  }
}

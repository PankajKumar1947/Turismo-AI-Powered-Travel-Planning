import { axiosInstance } from "../services/api";
import { itineraryQueries } from "../react-query/itinerary.queries";
import type { 
  ItinerariesResponse, 
  SaveItineraryRequest, 
  SaveItineraryResponse, 
  DeleteItineraryResponse 
} from "../interfaces/itinerary.interface";

export async function getItineraries(userId: string) {
  const response = await axiosInstance.get<ItinerariesResponse>(
    itineraryQueries.list.endpoint.replace(":userId", userId)
  );
  return response.data;
}

export async function saveItinerary(data: SaveItineraryRequest) {
  const response = await axiosInstance.post<SaveItineraryResponse>(
    itineraryQueries.save.endpoint,
    data
  );
  return response.data;
}

export async function deleteItinerary(id: string) {
  const response = await axiosInstance.delete<DeleteItineraryResponse>(
    itineraryQueries.delete.endpoint.replace(":id", id)
  );
  return response.data;
}

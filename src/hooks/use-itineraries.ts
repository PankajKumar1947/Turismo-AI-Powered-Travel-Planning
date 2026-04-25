import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itineraryQueries } from "@/react-query/itinerary.queries";
import {
  getItineraries,
  saveItinerary,
  deleteItinerary
} from "@/routes/itinerary.route";
import type {
  ItinerariesResponse,
  SaveItineraryRequest,
  SaveItineraryResponse,
  DeleteItineraryResponse
} from "@/interfaces/itinerary.interface";

export function useMyItineraries(userId?: string) {
  return useQuery<ItinerariesResponse, Error>({
    queryKey: [...itineraryQueries.list.key, userId],
    queryFn: () => getItineraries(userId!),
    enabled: !!userId,
  });
}
export function useSaveItinerary() {
  const queryClient = useQueryClient();
  return useMutation<SaveItineraryResponse, Error, SaveItineraryRequest>({
    mutationFn: saveItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itineraryQueries.list.key });
    },
  });
}

export function useDeleteItinerary() {
  const queryClient = useQueryClient();
  return useMutation<DeleteItineraryResponse, Error, string>({
    mutationFn: deleteItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itineraryQueries.list.key });
    },
  });
}

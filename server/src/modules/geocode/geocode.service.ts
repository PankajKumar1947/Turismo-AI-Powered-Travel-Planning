import { forwardGeocode, reverseGeocode } from "../../services/osrm.service";
import { ApiError } from "../../utils/ApiError";

export class GeocodeService {
  static async forward(query: string) {
    const result = await forwardGeocode(query);
    if (!result) {
      throw ApiError.notFound("Location not found");
    }
    return result;
  }

  static async reverse(lat: number, lng: number) {
    const cityName = await reverseGeocode(lat, lng);
    return cityName;
  }
}

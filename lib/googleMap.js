import { getJson } from "serpapi";

const ApiKey = process.env.GOOGLEMAP_API_KEY || "";

export async function searchNearbyPlaces(keyword = "cafe") {
  const params = {
    engine: "google_maps",
    type: "search",
    google_domain: "google.com",
    q: keyword,
    ll: `@${16.07532073894757},${108.22268965344279},14z`,
    api_key: ApiKey,
  };
  const data = await getJson(params);

  const results = (data.local_results || []).slice(0, 5);

  return results.map((place) => ({
    ten: place.title,
    danh_gia: place.rating,
    dia_chi: place.address,
    so_danh_gia: place.reviews,
    hinh_anh: place.thumbnail,
    toa_do: place.gps_coordinates,
  }));
}

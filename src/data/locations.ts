import type { LocationInfo } from "@/types";

export const LOCATIONS: LocationInfo[] = [
  { id: "pune", name: "Pune", region: "Maharashtra", country: "India", lat: 18.5196, lon: 73.8554, coastal: false },
  { id: "mumbai", name: "Mumbai", region: "Maharashtra", country: "India", lat: 19.076, lon: 72.8777, coastal: true },
  { id: "delhi", name: "Delhi", region: "Delhi", country: "India", lat: 28.6139, lon: 77.209, coastal: false },
  { id: "bengaluru", name: "Bengaluru", region: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946, coastal: false },
  { id: "chennai", name: "Chennai", region: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707, coastal: true },
  { id: "kolkata", name: "Kolkata", region: "West Bengal", country: "India", lat: 22.5726, lon: 88.3639, coastal: true },
  { id: "goa", name: "Goa", region: "Goa", country: "India", lat: 15.4909, lon: 73.8278, coastal: true },
  { id: "london", name: "London", region: "England", country: "UK", lat: 51.5074, lon: -0.1278, coastal: false },
];

export const LOCATION_MAP: Record<string, LocationInfo> = LOCATIONS.reduce(
  (acc, l) => ({ ...acc, [l.id]: l }),
  {} as Record<string, LocationInfo>,
);

export function getLocation(id: string): LocationInfo {
  return LOCATION_MAP[id] ?? LOCATIONS[0];
}

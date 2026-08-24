import type { LocationInfo } from "@/types";

export const LOCATIONS: LocationInfo[] = [
  { id: "pune", name: "Pune", region: "Maharashtra", country: "India", lat: 18.52, lon: 73.85 },
  { id: "mumbai", name: "Mumbai", region: "Maharashtra", country: "India", lat: 19.07, lon: 72.87 },
  { id: "delhi", name: "Delhi", region: "Delhi", country: "India", lat: 28.61, lon: 77.2 },
  { id: "bengaluru", name: "Bengaluru", region: "Karnataka", country: "India", lat: 12.97, lon: 77.59 },
  { id: "chennai", name: "Chennai", region: "Tamil Nadu", country: "India", lat: 13.08, lon: 80.27 },
  { id: "kolkata", name: "Kolkata", region: "West Bengal", country: "India", lat: 22.57, lon: 88.36 },
  { id: "goa", name: "Goa", region: "Goa", country: "India", lat: 15.49, lon: 73.82 },
  { id: "london", name: "London", region: "England", country: "UK", lat: 51.5, lon: -0.12 },
];

export const LOCATION_MAP: Record<string, LocationInfo> = LOCATIONS.reduce(
  (acc, l) => ({ ...acc, [l.id]: l }),
  {} as Record<string, LocationInfo>,
);

export function getLocation(id: string): LocationInfo {
  return LOCATION_MAP[id] ?? LOCATIONS[0];
}

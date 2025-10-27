export interface Restaurant {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  todaysMenu: string[];
}
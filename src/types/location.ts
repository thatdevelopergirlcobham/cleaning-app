export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  address: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}
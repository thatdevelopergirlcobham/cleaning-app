// utils/locationUtils.ts

type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class?: string;
  importance?: number;
  icon?: string;
};

type LocationResult = {
  lat: number;
  lng: number;
  address: string;
};

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5&accept-language=en`,
      {
        headers: {
          'User-Agent': 'CleaningApp/1.0', // Required by OSM usage policy
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    const data: LocationSuggestion[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<LocationResult> => {
  return new Promise<LocationResult>((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Reverse geocode to get readable address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();

          const address = data.display_name || 'Unknown location';

          resolve({ lat, lng, address });
        } catch (error) {
          console.error('Error getting address:', error);
          resolve({ lat, lng, address: 'Unknown location' });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
};

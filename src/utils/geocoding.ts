interface GeoLocation {
  lat: number;
  lng: number;
}

interface NominatimResponse {
  display_name: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
    [key: string]: string | undefined;
  };
}

// Cache geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, string>();

export async function reverseGeocode(coords: GeoLocation): Promise<string> {
  const cacheKey = `${coords.lat},${coords.lng}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CleanCal/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = (await response.json()) as NominatimResponse;
    
    // Try to create a simplified address string
    const addr = data.address;
    let locationText = '';
    
    if (addr.city || addr.state || addr.country) {
      const parts = [addr.city, addr.state, addr.country].filter(Boolean);
      locationText = parts.join(', ');
    } else {
      // Fallback to full display name but try to keep it concise
      locationText = data.display_name.split(',').slice(0, 3).join(',');
    }

    // Cache the result
    geocodeCache.set(cacheKey, locationText);
    return locationText;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  }
}
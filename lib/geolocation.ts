/**
 * Geolocation utilities — extracted from LocationStep for testability.
 *
 * All browser-API-dependent code is injectable, so the pure logic
 * can be unit-tested without a DOM.
 */

export interface Coords {
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  address: string;
  coords: Coords;
}

/**
 * Get the user's current position via the browser geolocation API.
 * The `getPosition` param mirrors `navigator.geolocation.getCurrentPosition`.
 * Throws an Error with a human-friendly message on failure.
 */
export async function getCurrentCoords(
  getPosition: (
    success: (pos: { coords: { latitude: number; longitude: number } }) => void,
    error: (err: { code: number; message: string }) => void,
  ) => void,
): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof getPosition !== 'function') {
      reject(new Error('Geolocation not supported by your browser.'));
      return;
    }
    getPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) {
          reject(new Error('Location access denied. Please enter your address manually.'));
        } else if (err.code === 2) {
          reject(new Error('Location unavailable. Please enter your address manually.'));
        } else if (err.code === 3) {
          reject(new Error('Location request timed out. Please try again.'));
        } else {
          reject(new Error('Could not get your location. Please enter your address manually.'));
        }
      },
    );
  });
}

/**
 * Format coordinates as a fallback address string.
 */
export function formatCoords(coords: Coords): string {
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
}

/**
 * Reverse-geocode coordinates to a human-readable address using the
 * Google Maps Geocoder API. Falls back to raw coordinates on failure.
 */
export async function reverseGeocode(
  coords: Coords,
  geocoder: {
    geocode: (
      request: { location: Coords },
      callback: (
        results: Array<{ formatted_address: string }> | null,
        status: string,
      ) => void,
    ) => void;
  },
): Promise<ReverseGeocodeResult> {
  return new Promise((resolve) => {
    geocoder.geocode(
      { location: coords },
      (results, status) => {
        if (status === 'OK' && results && results.length > 0 && results[0].formatted_address) {
          resolve({ address: results[0].formatted_address, coords });
        } else {
          resolve({ address: formatCoords(coords), coords });
        }
      },
    );
  });
}

/**
 * Full geolocation flow: get position → reverse geocode → return address.
 * Falls back to raw coordinates if geocoding fails or Google Maps isn't loaded.
 */
export async function geolocateUser(
  getPosition: (
    success: (pos: { coords: { latitude: number; longitude: number } }) => void,
    error: (err: { code: number; message: string }) => void,
  ) => void,
  geocoder?: {
    geocode: (
      request: { location: Coords },
      callback: (
        results: Array<{ formatted_address: string }> | null,
        status: string,
      ) => void,
    ) => void;
  },
): Promise<ReverseGeocodeResult> {
  const coords = await getCurrentCoords(getPosition);

  if (!geocoder) {
    return { address: formatCoords(coords), coords };
  }

  return reverseGeocode(coords, geocoder);
}
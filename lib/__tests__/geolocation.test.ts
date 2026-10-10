import {
  getCurrentCoords,
  formatCoords,
  reverseGeocode,
  geolocateUser,
  type Coords,
} from '../geolocation';

// ─── formatCoords ──────────────────────────────────────────────

describe('formatCoords', () => {
  it('formats positive coordinates to 5 decimal places', () => {
    expect(formatCoords({ lat: 33.749, lng: -84.388 })).toBe('33.74900, -84.38800');
  });

  it('formats whole numbers with trailing zeros', () => {
    expect(formatCoords({ lat: 40, lng: -74 })).toBe('40.00000, -74.00000');
  });

  it('truncates beyond 5 decimal places', () => {
    expect(formatCoords({ lat: 33.749001234, lng: -84.387999 })).toBe('33.74900, -84.38800');
  });
});

// ─── getCurrentCoords ───────────────────────────────────────────

describe('getCurrentCoords', () => {
  it('resolves with coordinates on success', async () => {
    const mockGetPosition = (
      success: (pos: { coords: { latitude: number; longitude: number } }) => void,
    ) => {
      success({ coords: { latitude: 33.749, longitude: -84.388 } });
    };

    const result = await getCurrentCoords(mockGetPosition as any);
    expect(result).toEqual({ lat: 33.749, lng: -84.388 });
  });

  it('rejects with "denied" message on code 1', async () => {
    const mockGetPosition = (
      _success: any,
      error: (err: { code: number; message: string }) => void,
    ) => {
      error({ code: 1, message: 'Permission denied' });
    };

    await expect(getCurrentCoords(mockGetPosition as any)).rejects.toThrow(
      'Location access denied. Please enter your address manually.',
    );
  });

  it('rejects with "unavailable" message on code 2', async () => {
    const mockGetPosition = (
      _success: any,
      error: (err: { code: number; message: string }) => void,
    ) => {
      error({ code: 2, message: 'Position unavailable' });
    };

    await expect(getCurrentCoords(mockGetPosition as any)).rejects.toThrow(
      'Location unavailable. Please enter your address manually.',
    );
  });

  it('rejects with "timed out" message on code 3', async () => {
    const mockGetPosition = (
      _success: any,
      error: (err: { code: number; message: string }) => void,
    ) => {
      error({ code: 3, message: 'Timeout' });
    };

    await expect(getCurrentCoords(mockGetPosition as any)).rejects.toThrow(
      'Location request timed out. Please try again.',
    );
  });

  it('rejects with generic message on unknown error code', async () => {
    const mockGetPosition = (
      _success: any,
      error: (err: { code: number; message: string }) => void,
    ) => {
      error({ code: 99, message: 'Unknown' });
    };

    await expect(getCurrentCoords(mockGetPosition as any)).rejects.toThrow(
      'Could not get your location. Please enter your address manually.',
    );
  });

  it('rejects when getPosition is not a function', async () => {
    await expect(getCurrentCoords(null as any)).rejects.toThrow(
      'Geolocation not supported by your browser.',
    );
  });
});

// ─── reverseGeocode ─────────────────────────────────────────────

describe('reverseGeocode', () => {
  const coords: Coords = { lat: 33.749, lng: -84.388 };

  it('returns formatted address on OK status', async () => {
    const mockGeocoder = {
      geocode: (
        _req: any,
        cb: (results: any[], status: string) => void,
      ) => {
        cb(
          [{ formatted_address: '123 Main St, Atlanta, GA 30303' }],
          'OK',
        );
      },
    };

    const result = await reverseGeocode(coords, mockGeocoder as any);
    expect(result.address).toBe('123 Main St, Atlanta, GA 30303');
    expect(result.coords).toEqual(coords);
  });

  it('falls back to raw coordinates when no results', async () => {
    const mockGeocoder = {
      geocode: (_req: any, cb: (results: any[], status: string) => void) => {
        cb([], 'OK');
      },
    };

    const result = await reverseGeocode(coords, mockGeocoder as any);
    expect(result.address).toBe('33.74900, -84.38800');
  });

  it('falls back to raw coordinates on non-OK status', async () => {
    const mockGeocoder = {
      geocode: (_req: any, cb: (results: any[], status: string) => void) => {
        cb(null, 'ZERO_RESULTS');
      },
    };

    const result = await reverseGeocode(coords, mockGeocoder as any);
    expect(result.address).toBe('33.74900, -84.38800');
  });

  it('falls back when results have no formatted_address', async () => {
    const mockGeocoder = {
      geocode: (_req: any, cb: (results: any[], status: string) => void) => {
        cb([{}], 'OK');
      },
    };

    const result = await reverseGeocode(coords, mockGeocoder as any);
    expect(result.address).toBe('33.74900, -84.38800');
  });
});

// ─── geolocateUser ──────────────────────────────────────────────

describe('geolocateUser', () => {
  it('returns address from reverse geocode when geocoder provided', async () => {
    const mockGetPosition = (
      success: (pos: { coords: { latitude: number; longitude: number } }) => void,
    ) => {
      success({ coords: { latitude: 33.749, longitude: -84.388 } });
    };

    const mockGeocoder = {
      geocode: (
        _req: any,
        cb: (results: any[], status: string) => void,
      ) => {
        cb([{ formatted_address: '456 Oak St, Atlanta, GA 30309' }], 'OK');
      },
    };

    const result = await geolocateUser(mockGetPosition as any, mockGeocoder as any);
    expect(result.address).toBe('456 Oak St, Atlanta, GA 30309');
    expect(result.coords).toEqual({ lat: 33.749, lng: -84.388 });
  });

  it('returns raw coords as address when no geocoder provided', async () => {
    const mockGetPosition = (
      success: (pos: { coords: { latitude: number; longitude: number } }) => void,
    ) => {
      success({ coords: { latitude: 40.0, longitude: -74.0 } });
    };

    const result = await geolocateUser(mockGetPosition as any);
    expect(result.address).toBe('40.00000, -74.00000');
  });

  it('propagates geolocation permission errors', async () => {
    const mockGetPosition = (
      _success: any,
      error: (err: { code: number; message: string }) => void,
    ) => {
      error({ code: 1, message: 'denied' });
    };

    await expect(
      geolocateUser(mockGetPosition as any),
    ).rejects.toThrow('Location access denied');
  });
});
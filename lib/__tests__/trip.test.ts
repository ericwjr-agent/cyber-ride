import {
  validateTripEndpoints,
  validateSchedule,
  formatScheduleLabel,
  ASAP_WAIT_MINUTES,
  type EndpointLocation,
} from '../trip';

const addr = (overrides: Partial<EndpointLocation> = {}): EndpointLocation => ({
  kind: 'address',
  address: '123 Main St, Atlanta, GA',
  lat: 33.7,
  lng: -84.3,
  ...overrides,
});

const airport = (terminal?: 'domestic' | 'international'): EndpointLocation => ({
  kind: 'airport',
  address: 'ATL Airport',
  lat: 33.6407,
  lng: -84.4277,
  terminal,
});

describe('validateTripEndpoints', () => {
  it('accepts airport pickup with terminal + address destination', () => {
    expect(validateTripEndpoints(airport('domestic'), addr())).toEqual({ valid: true });
  });

  it('accepts address pickup + airport destination with terminal', () => {
    expect(validateTripEndpoints(addr(), airport('international'))).toEqual({ valid: true });
  });

  it('rejects airport-to-airport trips', () => {
    const result = validateTripEndpoints(airport('domestic'), airport('international'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/both be the airport/i);
  });

  it('rejects empty pickup address', () => {
    const result = validateTripEndpoints(addr({ address: '  ' }), airport('domestic'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/pickup address/i);
  });

  it('rejects empty destination address', () => {
    const result = validateTripEndpoints(airport('domestic'), addr({ address: '' }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/destination address/i);
  });

  it('rejects airport pickup missing terminal', () => {
    const result = validateTripEndpoints(airport(undefined), addr());
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/terminal for pickup/i);
  });

  it('rejects airport destination missing terminal', () => {
    const result = validateTripEndpoints(addr(), airport(undefined));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/terminal for drop-off/i);
  });
});

describe('validateSchedule', () => {
  const now = new Date('2026-10-10T12:00:00Z');

  it('accepts "now" mode regardless of dateTime', () => {
    expect(validateSchedule({ mode: 'now' }, now)).toEqual({ valid: true });
  });

  it('rejects scheduled mode with no dateTime', () => {
    const result = validateSchedule({ mode: 'scheduled' }, now);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/choose a pickup date/i);
  });

  it('rejects invalid dateTime string', () => {
    const result = validateSchedule({ mode: 'scheduled', dateTime: 'not-a-date' }, now);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/valid pickup date/i);
  });

  it('rejects a dateTime in the past', () => {
    const result = validateSchedule(
      { mode: 'scheduled', dateTime: '2026-10-10T10:00:00Z' },
      now,
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/must be in the future/i);
  });

  it('accepts a future dateTime', () => {
    const result = validateSchedule(
      { mode: 'scheduled', dateTime: '2026-10-11T10:00:00Z' },
      now,
    );
    expect(result.valid).toBe(true);
  });

  it('allows a small grace window to avoid rejecting "right now" edge cases', () => {
    const result = validateSchedule(
      { mode: 'scheduled', dateTime: '2026-10-10T11:59:45Z' },
      now,
      60_000,
    );
    expect(result.valid).toBe(true);
  });
});

describe('formatScheduleLabel', () => {
  it('formats "now" mode with the ASAP wait time', () => {
    expect(formatScheduleLabel({ mode: 'now' })).toBe(
      `As soon as possible (~${ASAP_WAIT_MINUTES} min wait)`,
    );
  });

  it('formats a scheduled date into a readable string', () => {
    const label = formatScheduleLabel({ mode: 'scheduled', dateTime: '2026-12-25T15:30:00' });
    expect(label).toMatch(/Dec/);
    expect(label).toMatch(/25/);
  });

  it('returns a fallback when dateTime is missing in scheduled mode', () => {
    expect(formatScheduleLabel({ mode: 'scheduled' })).toBe('Not scheduled');
  });

  it('returns a fallback for invalid dateTime', () => {
    expect(formatScheduleLabel({ mode: 'scheduled', dateTime: 'garbage' })).toBe('Invalid date');
  });
});

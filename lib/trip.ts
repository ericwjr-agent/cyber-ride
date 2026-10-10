// Pure, DOM-free trip validation + formatting logic — kept separate from
// components so it can be unit-tested directly (no browser/Maps mocks needed).

export type EndpointKind = 'airport' | 'address';
export type TerminalType = 'domestic' | 'international';
export type ScheduleMode = 'now' | 'scheduled';

export interface EndpointLocation {
  kind: EndpointKind;
  address: string;
  lat: number;
  lng: number;
  terminal?: TerminalType;
}

export interface ScheduleInfo {
  mode: ScheduleMode;
  dateTime?: string; // ISO-ish datetime-local string, required when mode === 'scheduled'
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Minutes a "right now" booking should expect to wait for pickup. */
export const ASAP_WAIT_MINUTES = 60;

/**
 * Validate that pickup/destination endpoints make sense together.
 * - At least one of pickup/destination should generally be the airport for
 *   this service, but we only hard-block the nonsensical airport→airport case.
 * - Address-kind endpoints must have non-empty text.
 */
export function validateTripEndpoints(
  pickup: EndpointLocation,
  destination: EndpointLocation,
): ValidationResult {
  if (pickup.kind === 'airport' && destination.kind === 'airport') {
    return { valid: false, error: "Pickup and destination can't both be the airport. Please choose a different destination." };
  }
  if (pickup.kind === 'address' && !pickup.address.trim()) {
    return { valid: false, error: 'Please enter a pickup address.' };
  }
  if (destination.kind === 'address' && !destination.address.trim()) {
    return { valid: false, error: 'Please enter a destination address.' };
  }
  if (pickup.kind === 'airport' && !pickup.terminal) {
    return { valid: false, error: 'Please select a terminal for pickup.' };
  }
  if (destination.kind === 'airport' && !destination.terminal) {
    return { valid: false, error: 'Please select a terminal for drop-off.' };
  }
  return { valid: true };
}

/**
 * Validate a scheduled pickup date/time.
 * `now` and `graceMs` are injectable for deterministic unit testing.
 */
export function validateSchedule(
  schedule: ScheduleInfo,
  now: Date = new Date(),
  graceMs: number = 60_000,
): ValidationResult {
  if (schedule.mode === 'now') {
    return { valid: true };
  }

  const dateTime = schedule.dateTime?.trim();
  if (!dateTime) {
    return { valid: false, error: 'Please choose a pickup date & time.' };
  }

  const chosen = new Date(dateTime);
  if (Number.isNaN(chosen.getTime())) {
    return { valid: false, error: 'Please choose a valid pickup date & time.' };
  }

  if (chosen.getTime() < now.getTime() - graceMs) {
    return { valid: false, error: 'Pickup time must be in the future.' };
  }

  return { valid: true };
}

/** Human-readable label for the chosen schedule, used in quote/summary/emails. */
export function formatScheduleLabel(schedule: ScheduleInfo): string {
  if (schedule.mode === 'now') {
    return `As soon as possible (~${ASAP_WAIT_MINUTES} min wait)`;
  }
  if (!schedule.dateTime) return 'Not scheduled';

  const parsed = new Date(schedule.dateTime);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';

  return parsed.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Resolve the address string Google Maps APIs should use for an endpoint. */
export function resolveEndpointAddress(endpoint: EndpointLocation): string {
  return endpoint.address;
}

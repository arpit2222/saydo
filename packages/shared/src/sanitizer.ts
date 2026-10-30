import { NetworkCapturedEvent } from './types.js';

const SENSITIVE_KEY_REGEX = /token|secret|password|authorization|cookie|otp|card|aadhaar|pan/i;
const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const MAX_RESPONSE_BYTES = 8192; // 8 KB cap per strategy

export function sanitizeValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;

  if (typeof val === 'string') {
    // Mask emails: keep first character and domain
    let masked = val.replace(EMAIL_REGEX, (match) => {
      const [user, domain] = match.split('@');
      const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
      return `${maskedUser}@${domain}`;
    });

    // Mask phone numbers: keep last 4 digits
    masked = masked.replace(PHONE_REGEX, (match) => {
      const clean = match.replace(/\D/g, '');
      if (clean.length >= 7) {
        return `+XX-XXXX-${clean.slice(-4)}`;
      }
      return match;
    });

    return masked;
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeValue(item));
  }

  if (typeof val === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeValue(value);
      }
    }
    return sanitizedObj;
  }

  return val;
}

export function sanitizeCapturedEvent(event: NetworkCapturedEvent): NetworkCapturedEvent {
  let sanitizedResponse = sanitizeValue(event.responseBody);

  // Enforce 8 KB response cap to prevent prompt pollution and token bloat
  if (sanitizedResponse !== undefined && sanitizedResponse !== null) {
    try {
      const serialized = JSON.stringify(sanitizedResponse);
      if (serialized.length > MAX_RESPONSE_BYTES) {
        sanitizedResponse = {
          _truncated: true,
          sample: typeof sanitizedResponse === 'object' && sanitizedResponse !== null
            ? (Array.isArray(sanitizedResponse) ? sanitizedResponse.slice(0, 3) : Object.fromEntries(Object.entries(sanitizedResponse).slice(0, 5)))
            : '[Large payload truncated]',
          total_bytes: serialized.length,
        };
      }
    } catch {
      // Keep as-is if serialization fails
    }
  }

  return {
    method: event.method,
    path: event.path,
    query: event.query ? (sanitizeValue(event.query) as Record<string, string>) : undefined,
    requestBody: event.requestBody ? sanitizeValue(event.requestBody) : undefined,
    status: event.status,
    responseBody: sanitizedResponse,
    ts: event.ts || Date.now(),
  };
}

export function sanitizeEvents(events: NetworkCapturedEvent[]): NetworkCapturedEvent[] {
  return events.map(sanitizeCapturedEvent);
}

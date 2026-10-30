import { describe, it, expect } from 'vitest';
import { sanitizeValue, sanitizeCapturedEvent } from './sanitizer.js';
import { NetworkCapturedEvent } from './types.js';

describe('Client-Side Data Sanitizer (packages/shared/sanitizer.ts)', () => {
  it('redacts sensitive keys in request and response objects', () => {
    const sensitivePayload = {
      user: 'arpitchauhan',
      token: 'jwt_secret_token_12345',
      authorization: 'Bearer super_secret',
      password: 'mypassword123',
      cookie: 'session_id=xyz',
      nested: {
        otp: '987654',
        credit_card: '4111-2222-3333-4444',
        public_data: 'safe_value',
      },
    };

    const sanitized: any = sanitizeValue(sensitivePayload);

    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.authorization).toBe('[REDACTED]');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.cookie).toBe('[REDACTED]');
    expect(sanitized.nested.otp).toBe('[REDACTED]');
    expect(sanitized.nested.credit_card).toBe('[REDACTED]');
    expect(sanitized.nested.public_data).toBe('safe_value');
    expect(sanitized.user).toBe('arpitchauhan');
  });

  it('masks email addresses and phone numbers in response strings', () => {
    const rawText = 'Contact support at developer@example.com or user.test+filter@sub.domain.org or call +91-9876543210';
    const sanitized = sanitizeValue(rawText) as string;

    expect(sanitized).not.toContain('developer@example.com');
    expect(sanitized).toMatch(/d\*\*\*r@example\.com/);
    expect(sanitized).toMatch(/\+XX-XXXX-3210/);
  });

  it('sanitizes complete captured network events and drops sensitive headers', () => {
    const event: NetworkCapturedEvent = {
      method: 'POST',
      path: '/api/dehix/projects',
      query: { auth_token: 'secret_query' },
      requestBody: {
        name: 'Website Revamp',
        budget: 200000,
        secret_key: 'top_secret',
      },
      status: 201,
      responseBody: {
        project_id: 'proj_123',
        owner_email: 'lead@company.com',
        admin_token: 'bearer_token_xyz',
      },
      ts: Date.now(),
    };

    const sanitized: any = sanitizeCapturedEvent(event);

    expect(sanitized.requestBody.secret_key).toBe('[REDACTED]');
    expect(sanitized.requestBody.name).toBe('Website Revamp');
    expect(sanitized.responseBody.admin_token).toBe('[REDACTED]');
    expect(sanitized.responseBody.project_id).toBe('proj_123');
    expect(sanitized.responseBody.owner_email).toContain('@company.com');
    expect(sanitized.responseBody.owner_email).not.toBe('lead@company.com');
  });

  it('caps oversized response bodies at 8 KB to prevent prompt bloat', () => {
    const largeArray = Array.from({ length: 500 }, (_, i) => ({
      id: `item-${i}`,
      description: 'A'.repeat(50),
    }));

    const event: NetworkCapturedEvent = {
      method: 'GET',
      path: '/api/dehix/projects',
      query: {},
      status: 200,
      responseBody: largeArray,
      ts: Date.now(),
    };

    const sanitized = sanitizeCapturedEvent(event);
    expect(sanitized.responseBody).toHaveProperty('_truncated', true);
    expect(sanitized.responseBody).toHaveProperty('sample');
  });
});

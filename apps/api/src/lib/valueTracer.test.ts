import { describe, it, expect } from 'vitest';
import { traceValueDependencies } from './valueTracer.js';
import { NetworkCapturedEvent } from '@saydo/shared';

describe('Value Tracer (Deterministic Dependency Extraction)', () => {
  it('detects invite_member.project_id <- create_project.id from response', () => {
    const events: NetworkCapturedEvent[] = [
      {
        method: 'POST',
        path: '/api/dehix/projects',
        requestBody: {
          name: 'Website Revamp',
          budget: 200000,
        },
        status: 201,
        responseBody: {
          message: 'Project created successfully',
          project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        },
        ts: 1000,
      },
      {
        method: 'POST',
        path: '/api/dehix/members',
        requestBody: {
          project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
          email: 'sarah@dehix.org',
          role: 'editor',
        },
        status: 201,
        responseBody: {
          message: 'Invited sarah@dehix.org',
          member_id: 'mem-998877',
        },
        ts: 2000,
      },
    ];

    const edges = traceValueDependencies(events);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toEqual({
      from_event: 0,
      from_path: 'project_id',
      to_event: 1,
      to_field: 'project_id',
      value: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    });
  });

  it('detects nested response id used in downstream GET query param', () => {
    const events: NetworkCapturedEvent[] = [
      {
        method: 'POST',
        path: '/api/dehix/projects',
        status: 201,
        responseBody: {
          project: {
            id: 'proj-beta-90210',
            name: 'Mobile App Beta',
          },
        },
        ts: 1000,
      },
      {
        method: 'GET',
        path: '/api/dehix/projects/get',
        query: {
          id: 'proj-beta-90210',
        },
        status: 200,
        responseBody: {
          project: { id: 'proj-beta-90210' },
        },
        ts: 2000,
      },
    ];

    const edges = traceValueDependencies(events);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      from_event: 0,
      from_path: 'project.id',
      to_event: 1,
      to_field: 'id',
      value: 'proj-beta-90210',
    });
  });

  it('ignores noisy statuses and short strings', () => {
    const events: NetworkCapturedEvent[] = [
      {
        method: 'POST',
        path: '/api/dehix/projects',
        status: 201,
        responseBody: {
          status: 'active',
          code: 1,
        },
        ts: 1000,
      },
      {
        method: 'POST',
        path: '/api/dehix/tasks',
        requestBody: {
          status: 'active',
          code: 1,
        },
        status: 200,
        ts: 2000,
      },
    ];

    const edges = traceValueDependencies(events);
    expect(edges).toHaveLength(0);
  });
});

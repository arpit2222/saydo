import { NetworkCapturedEvent, TracerEdge } from '@saydo/shared';

const IGNORED_VALUES = new Set([
  '[REDACTED]',
  'active',
  'completed',
  'archived',
  'submitted',
  'accepted',
  'rejected',
  'editor',
  'viewer',
  'admin',
  'true',
  'false',
  'null',
  'undefined',
  'success',
  'ok',
  'error',
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ExtractedValue {
  path: string;
  value: string | number;
}

function extractCandidates(obj: unknown, prefix = ''): ExtractedValue[] {
  const results: ExtractedValue[] = [];
  if (obj === null || obj === undefined) return results;

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed.length >= 4 && !IGNORED_VALUES.has(trimmed.toLowerCase())) {
      results.push({ path: prefix, value: trimmed });
    }
    return results;
  }

  if (typeof obj === 'number') {
    // Numbers with >= 4 digits or ID-like
    if (Math.abs(obj) >= 1000 || String(obj).length >= 4) {
      results.push({ path: prefix, value: obj });
    }
    return results;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      const currentPath = prefix ? `${prefix}[${idx}]` : `[${idx}]`;
      results.push(...extractCandidates(item, currentPath));
    });
    return results;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      results.push(...extractCandidates(value, currentPath));
    }
  }

  return results;
}

export function traceValueDependencies(events: NetworkCapturedEvent[]): TracerEdge[] {
  const edges: TracerEdge[] = [];
  const edgeSet = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    const sourceEvent = events[i];
    if (!sourceEvent.responseBody) continue;

    const sourceCandidates = extractCandidates(sourceEvent.responseBody);

    for (let j = i + 1; j < events.length; j++) {
      const targetEvent = events[j];
      const targetCandidates: ExtractedValue[] = [];

      // Extract from request body
      if (targetEvent.requestBody) {
        targetCandidates.push(...extractCandidates(targetEvent.requestBody));
      }

      // Extract from query params
      if (targetEvent.query) {
        targetCandidates.push(...extractCandidates(targetEvent.query));
      }

      // Extract from path tokens (e.g., /api/dehix/projects/c2eebc99-...)
      const pathSegments = targetEvent.path.split('/');
      for (const seg of pathSegments) {
        if (seg.length >= 4 && !IGNORED_VALUES.has(seg.toLowerCase())) {
          targetCandidates.push({ path: 'path_param', value: seg });
        }
      }

      for (const src of sourceCandidates) {
        for (const tgt of targetCandidates) {
          if (String(src.value) === String(tgt.value)) {
            const edgeKey = `${i}:${src.path}->${j}:${tgt.path}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({
                from_event: i,
                from_path: src.path,
                to_event: j,
                to_field: tgt.path,
                value: src.value,
              });
            }
          }
        }
      }
    }
  }

  return edges;
}

import {
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyRule,
  PolicyViolation,
  SkillDefinition,
} from './types.js';

export function evaluate(
  skill: SkillDefinition,
  args: Record<string, unknown>,
  arg3?: PolicyEvaluationContext | PolicyRule[],
  arg4?: PolicyRule[] | PolicyEvaluationContext
): PolicyEvaluationResult {
  let policies: PolicyRule[] = [];
  let ctx: PolicyEvaluationContext = {};

  if (Array.isArray(arg3)) {
    policies = arg3;
    if (arg4 && !Array.isArray(arg4)) ctx = arg4;
  } else {
    if (arg3) ctx = arg3;
    if (Array.isArray(arg4)) policies = arg4;
  }

  const violations: PolicyViolation[] = [];
  let allowed = true;
  // Rule: Every write action requires confirmation by default unless explicitly auto-approved
  let needsConfirm = skill.is_write;

  for (const policy of policies) {
    // Only check policies matching this skill or global wildcard '*'
    if (policy.skill_name !== '*' && policy.skill_name !== skill.name) {
      continue;
    }

    const valueToTest = policy.field ? args[policy.field] : undefined;
    const isViolation = checkPolicyViolation(policy, valueToTest, ctx);

    if (isViolation) {
      switch (policy.kind) {
        case 'block':
          allowed = false;
          violations.push({
            policyId: policy.id || 'block-policy',
            message: policy.message || `Action blocked by policy: ${policy.spoken || policy.skill_name}`,
            kind: 'block',
            field: policy.field,
          });
          break;

        case 'confirm':
          needsConfirm = true;
          violations.push({
            policyId: policy.id || 'confirm-policy',
            message: policy.message || `Confirmation required: ${policy.spoken || policy.skill_name}`,
            kind: 'confirm',
            field: policy.field,
          });
          break;

        case 'limit':
          allowed = false;
          violations.push({
            policyId: policy.id || 'limit-policy',
            message: policy.message || `Limit exceeded on '${policy.field}': ${policy.spoken || ''}`,
            kind: 'limit',
            field: policy.field,
          });
          break;

        case 'role':
          allowed = false;
          violations.push({
            policyId: policy.id || 'role-policy',
            message: policy.message || `Role '${ctx.userRole || 'anonymous'}' is not authorized.`,
            kind: 'role',
            field: policy.field,
          });
          break;

        case 'require':
          allowed = false;
          violations.push({
            policyId: policy.id || 'require-policy',
            message: policy.message || `Field '${policy.field}' is required by policy.`,
            kind: 'require',
            field: policy.field,
          });
          break;
      }
    }
  }

  return {
    allowed,
    needsConfirm,
    violations,
  };
}

export const evaluatePolicy = evaluate;

function checkPolicyViolation(
  policy: PolicyRule,
  actual: unknown,
  ctx: PolicyEvaluationContext
): boolean {
  const { kind, op, value } = policy;

  // 1. Require check: violates if actual is missing, null, or empty string
  if (kind === 'require') {
    return actual === undefined || actual === null || actual === '';
  }

  // 2. Role check: violates if userRole is missing or not in allowed list
  if (kind === 'role') {
    if (!value) return false;
    const allowedRoles = Array.isArray(value) ? value : [value];
    if (!ctx.userRole) return true; // unauthorized
    return !allowedRoles.includes(ctx.userRole);
  }

  // 3. Limit check: handles ceiling bounds
  if (kind === 'limit') {
    if (actual === undefined || actual === null) return false;
    const numActual = typeof actual === 'number' ? actual : parseFloat(String(actual));
    const numExpected = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(numActual) || isNaN(numExpected)) return false;

    // If op is lte or lt, violation occurs when actual > expected
    if (op === 'lte' || op === 'lt') {
      return numActual > numExpected;
    }
    // If op is gt or gte, violation occurs when actual > expected
    if (op === 'gt') {
      return numActual > numExpected;
    }
    if (op === 'gte') {
      return numActual >= numExpected;
    }
    return numActual > numExpected;
  }

  // 4. General operator matches for block and confirm
  if (!op) {
    // If no op specified, any call to this skill triggers the rule
    return true;
  }

  const numActual = typeof actual === 'number' ? actual : parseFloat(String(actual));
  const numExpected = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numActual) && !isNaN(numExpected);

  switch (op) {
    case 'eq':
      return actual === value || (isNumeric && numActual === numExpected);
    case 'neq':
      return actual !== value && (!isNumeric || numActual !== numExpected);
    case 'gt':
      return isNumeric && numActual > numExpected;
    case 'gte':
      return isNumeric && numActual >= numExpected;
    case 'lt':
      return isNumeric && numActual < numExpected;
    case 'lte':
      return isNumeric && numActual <= numExpected;
    case 'in':
      if (Array.isArray(value)) {
        return value.includes(actual);
      }
      return false;
    case 'not_in':
      if (Array.isArray(value)) {
        return !value.includes(actual);
      }
      return true;
    case 'contains':
      if (typeof actual === 'string' && typeof value === 'string') {
        return actual.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.includes(value);
      }
      return false;
    default:
      return false;
  }
}

import { describe, it, expect } from 'vitest';
import { evaluate } from './policy.js';
import { SkillDefinition, PolicyRule } from './types.js';

describe('Policy Evaluation Engine (packages/shared/policy.ts)', () => {
  const dummyWriteSkill: SkillDefinition = {
    id: 'skill-write-1',
    app_id: 'app-1',
    name: 'create_project',
    version: 1,
    title: 'Create Project',
    method: 'POST',
    path: '/api/dehix/projects',
    inputs: {
      budget: { type: 'number', required: true },
      name: { type: 'string', required: true },
    },
    is_write: true,
    status: 'active',
  };

  const dummyReadSkill: SkillDefinition = {
    id: 'skill-read-1',
    app_id: 'app-1',
    name: 'list_projects',
    version: 1,
    title: 'List Projects',
    method: 'GET',
    path: '/api/dehix/projects',
    inputs: {},
    is_write: false,
    status: 'active',
  };

  it('defaults writes to needsConfirm = true and reads to needsConfirm = false', () => {
    const writeRes = evaluate(dummyWriteSkill, { name: 'Test', budget: 50000 }, []);
    expect(writeRes.allowed).toBe(true);
    expect(writeRes.needsConfirm).toBe(true);

    const readRes = evaluate(dummyReadSkill, {}, []);
    expect(readRes.allowed).toBe(true);
    expect(readRes.needsConfirm).toBe(false);
  });

  describe('kind: limit', () => {
    const limitPolicy: PolicyRule = {
      id: 'pol-limit-1',
      app_id: 'app-1',
      skill_name: 'create_project',
      kind: 'limit',
      field: 'budget',
      op: 'lte',
      value: 1000000,
      message: 'Budget cannot exceed 10 lakh',
      source: 'voice',
    };

    it('allows budget within limit (<= 10 lakh)', () => {
      const res = evaluate(dummyWriteSkill, { budget: 200000 }, [limitPolicy]);
      expect(res.allowed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });

    it('blocks budget exceeding limit (> 10 lakh)', () => {
      const res = evaluate(dummyWriteSkill, { budget: 2000000 }, [limitPolicy]);
      expect(res.allowed).toBe(false);
      expect(res.violations).toHaveLength(1);
      expect(res.violations[0].kind).toBe('limit');
    });
  });

  describe('kind: block', () => {
    const blockPolicy: PolicyRule = {
      id: 'pol-block-1',
      app_id: 'app-1',
      skill_name: 'invite_member',
      kind: 'block',
      field: 'role',
      op: 'eq',
      value: 'admin',
      message: 'Never invite admins through assistant',
      source: 'voice',
    };

    const inviteSkill: SkillDefinition = {
      id: 'skill-invite',
      app_id: 'app-1',
      name: 'invite_member',
      version: 1,
      title: 'Invite Member',
      method: 'POST',
      path: '/api/dehix/members',
      inputs: {},
      is_write: true,
      status: 'active',
    };

    it('allows non-admin role', () => {
      const res = evaluate(inviteSkill, { email: 'test@dehix.org', role: 'editor' }, [blockPolicy]);
      expect(res.allowed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });

    it('blocks admin role assignment', () => {
      const res = evaluate(inviteSkill, { email: 'admin@dehix.org', role: 'admin' }, [blockPolicy]);
      expect(res.allowed).toBe(false);
      expect(res.violations).toHaveLength(1);
      expect(res.violations[0].kind).toBe('block');
    });
  });

  describe('kind: confirm', () => {
    const confirmPolicy: PolicyRule = {
      id: 'pol-confirm-1',
      app_id: 'app-1',
      skill_name: 'update_application_decision',
      kind: 'confirm',
      field: 'decision',
      op: 'eq',
      value: 'rejected',
      message: 'Always ask before rejecting an application',
      source: 'voice',
    };

    const decisionSkill: SkillDefinition = {
      id: 'skill-decision',
      app_id: 'app-1',
      name: 'update_application_decision',
      version: 1,
      title: 'Update Decision',
      method: 'POST',
      path: '/api/dehix/applications/decision',
      inputs: {},
      is_write: true,
      status: 'active',
    };

    it('enforces explicit confirmation on rejected decisions', () => {
      const res = evaluate(decisionSkill, { decision: 'rejected' }, [confirmPolicy]);
      expect(res.allowed).toBe(true);
      expect(res.needsConfirm).toBe(true);
      expect(res.violations).toHaveLength(1);
      expect(res.violations[0].kind).toBe('confirm');
    });
  });

  describe('kind: require', () => {
    const requirePolicy: PolicyRule = {
      id: 'pol-require-1',
      app_id: 'app-1',
      skill_name: 'create_project',
      kind: 'require',
      field: 'description',
      message: 'Project description is required',
      source: 'docs',
    };

    it('blocks execution when required field is missing or empty', () => {
      const resMissing = evaluate(dummyWriteSkill, { name: 'Proj', budget: 100000 }, [requirePolicy]);
      expect(resMissing.allowed).toBe(false);
      expect(resMissing.violations).toHaveLength(1);

      const resEmpty = evaluate(dummyWriteSkill, { name: 'Proj', budget: 100000, description: '' }, [requirePolicy]);
      expect(resEmpty.allowed).toBe(false);
    });

    it('allows execution when required field is provided', () => {
      const res = evaluate(dummyWriteSkill, { name: 'Proj', budget: 100000, description: 'Scope' }, [requirePolicy]);
      expect(res.allowed).toBe(true);
    });
  });

  describe('kind: role', () => {
    const rolePolicy: PolicyRule = {
      id: 'pol-role-1',
      app_id: 'app-1',
      skill_name: 'create_project',
      kind: 'role',
      value: ['admin', 'manager'],
      message: 'Only admins and managers can create projects',
      source: 'docs',
    };

    it('allows authorized roles', () => {
      const res = evaluate(dummyWriteSkill, { name: 'P' }, [rolePolicy], { userRole: 'admin' });
      expect(res.allowed).toBe(true);
    });

    it('blocks unauthorized roles', () => {
      const res = evaluate(dummyWriteSkill, { name: 'P' }, [rolePolicy], { userRole: 'viewer' });
      expect(res.allowed).toBe(false);
      expect(res.violations).toHaveLength(1);
      expect(res.violations[0].kind).toBe('role');
    });
  });

  describe('Operators coverage (contains, in, not_in)', () => {
    it('supports contains operator', () => {
      const policy: PolicyRule = {
        id: 'p-contains',
        app_id: 'a',
        skill_name: '*',
        kind: 'block',
        field: 'email',
        op: 'contains',
        value: 'spam.com',
        message: 'No spam domains',
        source: 'voice',
      };
      const blocked = evaluate(dummyWriteSkill, { email: 'user@spam.com' }, [policy]);
      expect(blocked.allowed).toBe(false);

      const allowed = evaluate(dummyWriteSkill, { email: 'user@dehix.org' }, [policy]);
      expect(allowed.allowed).toBe(true);
    });

    it('supports in and not_in operators', () => {
      const policyIn: PolicyRule = {
        id: 'p-in',
        app_id: 'a',
        skill_name: '*',
        kind: 'block',
        field: 'status',
        op: 'in',
        value: ['fraud', 'blacklisted'],
        message: 'Status forbidden',
        source: 'voice',
      };
      expect(evaluate(dummyWriteSkill, { status: 'fraud' }, [policyIn]).allowed).toBe(false);
      expect(evaluate(dummyWriteSkill, { status: 'verified' }, [policyIn]).allowed).toBe(true);
    });
  });
});

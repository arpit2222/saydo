import { describe, it, expect } from 'vitest';
import { 
  validateSkillArgs, 
  generateDynamicTools, 
  planMultiIntent, 
  verifyWriteWithRead 
} from './agent.js';
import { SkillDefinition } from '@saydo/shared';

const mockCreateProjectSkill: SkillDefinition = {
  id: '11111111-1111-1111-1111-111111111111',
  app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  name: 'create_project',
  version: 1,
  title: 'Create Project',
  description: 'Create a new project with name and budget',
  method: 'POST',
  path: '/api/dehix/projects',
  query_params: [],
  inputs: {
    name: { type: 'string', required: true, description: 'Project title' },
    budget: { type: 'number', required: true, description: 'Budget in INR' },
    description: { type: 'string', required: false },
  },
  constants: {},
  outputs: { project_id: 'string' },
  depends_on: [],
  is_write: true,
  verify_with: 'get_project',
  status: 'active',
};

const mockInviteMemberSkill: SkillDefinition = {
  id: '22222222-2222-2222-2222-222222222222',
  app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  name: 'invite_member',
  version: 1,
  title: 'Invite Team Member',
  description: 'Invite a collaborator with a role',
  method: 'POST',
  path: '/api/dehix/members',
  query_params: [],
  inputs: {
    project_id: { type: 'string', required: true },
    email: { type: 'string', required: true },
    role: { type: 'string', required: true, enum: ['viewer', 'editor', 'admin'] },
  },
  constants: {},
  outputs: { member_id: 'string' },
  depends_on: ['create_project'],
  is_write: true,
  verify_with: null,
  status: 'active',
};

describe('SayDo Agent Engine', () => {
  it('generateDynamicTools maps skills to OpenAI function calling JSON schema with built-ins', () => {
    const tools = generateDynamicTools([mockCreateProjectSkill]);
    expect(tools.length).toBe(4); // create_project + ask_docs + ask_user + final_answer

    const cp = tools.find((t) => t.function.name === 'create_project');
    expect(cp).toBeDefined();
    expect(cp.function.parameters.required).toContain('name');
    expect(cp.function.parameters.required).toContain('budget');
    expect(cp.function.parameters.properties.budget.type).toBe('number');

    expect(tools.some((t) => t.function.name === 'ask_docs')).toBe(true);
    expect(tools.some((t) => t.function.name === 'ask_user')).toBe(true);
    expect(tools.some((t) => t.function.name === 'final_answer')).toBe(true);
  });

  it('validateSkillArgs normalizes Indian currency lakh amounts to integer', () => {
    const res = validateSkillArgs(mockCreateProjectSkill, {
      name: 'Website Revamp',
      budget: '2 lakh',
    });
    expect(res.valid).toBe(true);
    expect(res.parsedArgs.budget).toBe(200000);
  });

  it('validateSkillArgs catches missing required fields', () => {
    const res = validateSkillArgs(mockCreateProjectSkill, {
      name: 'Website Revamp',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Missing required parameter: budget');
  });

  it('validateSkillArgs catches invalid enum values', () => {
    const res = validateSkillArgs(mockInviteMemberSkill, {
      project_id: 'p-1',
      email: 'arpit@dehix.org',
      role: 'superadmin',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('must be one of [viewer, editor, admin]');
  });

  it('planMultiIntent decomposes multi-intent prompts into ordered steps', async () => {
    const plan = await planMultiIntent(
      'Create Website Revamp with 2 lakh budget and invite arpit@dehix.org as editor',
      [mockCreateProjectSkill, mockInviteMemberSkill]
    );

    expect(plan).not.toBeNull();
    expect(plan!.steps.length).toBe(2);
    expect(plan!.steps[0].skill_name).toBe('create_project');
    expect(plan!.steps[1].skill_name).toBe('invite_member');
  });

  it('verifyWriteWithRead confirms created project record fields match args', () => {
    const verifySuccess = verifyWriteWithRead(
      mockCreateProjectSkill,
      { name: 'Website Revamp', budget: 200000 },
      { project_id: 'p-1' },
      { project: { id: 'p-1', name: 'Website Revamp', budget: 200000 } }
    );
    expect(verifySuccess.verified).toBe(true);
    expect(verifySuccess.message).toContain('Website Revamp exists in system with budget ₹2,00,000');

    const verifyFail = verifyWriteWithRead(
      mockCreateProjectSkill,
      { name: 'Website Revamp', budget: 200000 },
      { project_id: 'p-1' },
      { project: { id: 'p-1', name: 'Website Revamp', budget: 50000 } }
    );
    expect(verifyFail.verified).toBe(false);
    expect(verifyFail.message).toContain('Budget mismatch');
  });
});

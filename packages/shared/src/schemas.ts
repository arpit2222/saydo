import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export const PolicyKindSchema = z.enum(['confirm', 'block', 'limit', 'require', 'role']);

export const PolicyOperatorSchema = z.enum([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'not_in',
  'contains',
]);

export const PolicySourceSchema = z.enum(['voice', 'docs', 'compile']);

export const PolicyRuleSchema = z.object({
  id: z.string().uuid().optional(),
  app_id: z.string().uuid().optional(),
  skill_name: z.string(),
  kind: PolicyKindSchema,
  field: z.string().nullable().optional(),
  op: PolicyOperatorSchema.nullable().optional(),
  value: z.any().optional(),
  message: z.string(),
  spoken: z.string().nullable().optional(),
  source: PolicySourceSchema.default('voice'),
  created_at: z.string().optional(),
});

export const SkillInputParamSchema = z.object({
  type: z.string(),
  required: z.boolean().default(false),
  enum: z.array(z.string()).optional(),
  description: z.string().optional(),
  default: z.any().optional(),
});

export const SkillDefinitionSchema = z.object({
  id: z.string().uuid().optional(),
  app_id: z.string().uuid().optional(),
  name: z.string().regex(/^[a-z0-9_]+$/i, 'Skill name must be alphanumeric with underscores'),
  version: z.number().int().default(1),
  title: z.string(),
  description: z.string().optional(),
  method: HttpMethodSchema,
  path: z.string(),
  query_params: z.array(z.string()).default([]),
  inputs: z.record(SkillInputParamSchema).default({}),
  constants: z.record(z.any()).default({}),
  outputs: z.record(z.any()).default({}),
  depends_on: z.array(z.string()).default([]),
  is_write: z.boolean().default(false),
  verify_with: z.string().nullable().optional(),
  source_recording: z.string().uuid().nullable().optional(),
  narration: z.string().nullable().optional(),
  status: z.enum(['active', 'drifted', 'disabled']).default('active'),
});

export const NetworkCapturedEventSchema = z.object({
  method: HttpMethodSchema,
  path: z.string(),
  query: z.record(z.string()).optional(),
  requestBody: z.any().optional(),
  status: z.number().int(),
  responseBody: z.any().optional(),
  ts: z.number(),
});

export const TracerEdgeSchema = z.object({
  from_event: z.number().int(),
  from_path: z.string(),
  to_event: z.number().int(),
  to_field: z.string(),
  value: z.union([z.string(), z.number()]),
});

export const LLMCompileOutputSchema = z.object({
  skills: z.array(SkillDefinitionSchema),
  suggested_policies: z.array(PolicyRuleSchema).default([]),
});

export const CompileResultSchema = z.object({
  skills: z.array(SkillDefinitionSchema),
  suggested_policies: z.array(PolicyRuleSchema).default([]),
  tracer_edges: z.array(TracerEdgeSchema).default([]),
});

export const AgentPlanStepSchema = z.object({
  idx: z.number().int(),
  skill_name: z.string(),
  description: z.string(),
  args: z.record(z.any()).default({}),
});

export const AgentPlanSchema = z.object({
  steps: z.array(AgentPlanStepSchema),
  summary: z.string(),
});

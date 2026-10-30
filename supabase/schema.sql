-- ============================================================================
-- SayDo Core Schema
-- Multi-tenant agent architecture for web applications
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apps registered under an Organization
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    public_key TEXT NOT NULL UNIQUE,
    allowed_origins TEXT[] NOT NULL DEFAULT '{}',
    docs_url TEXT,
    changelog_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Network & Narration Recordings
CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    narration TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compiled Typed Skills
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    method TEXT NOT NULL, -- GET, POST, PUT, DELETE, PATCH
    path TEXT NOT NULL,
    query_params TEXT[] DEFAULT '{}',
    inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    constants JSONB NOT NULL DEFAULT '{}'::jsonb,
    outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    depends_on TEXT[] DEFAULT '{}',
    is_write BOOLEAN NOT NULL DEFAULT false,
    verify_with TEXT, -- Name of read skill used to verify write
    source_recording UUID REFERENCES recordings(id) ON DELETE SET NULL,
    narration TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'drifted' | 'disabled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_app_skill_version UNIQUE (app_id, name, version)
);

-- Spoken / Generated Policies
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    kind TEXT NOT NULL, -- 'confirm' | 'block' | 'limit' | 'require' | 'role'
    field TEXT,
    op TEXT, -- 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains'
    value JSONB,
    message TEXT NOT NULL,
    spoken TEXT,
    source TEXT NOT NULL DEFAULT 'voice', -- 'voice' | 'docs' | 'compile'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suggestions (from Tavily Discover & compiler)
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    kind TEXT NOT NULL, -- 'skill' | 'policy'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quote TEXT,
    source_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'dismissed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Execution Runs
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'running', -- 'running' | 'completed' | 'failed' | 'blocked'
    model_agent TEXT NOT NULL,
    model_reason TEXT,
    total_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual Steps within an Agent Run
CREATE TABLE IF NOT EXISTS run_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    idx INT NOT NULL,
    skill_name TEXT NOT NULL,
    args JSONB NOT NULL DEFAULT '{}'::jsonb,
    policy_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    confirmed BOOLEAN NOT NULL DEFAULT false,
    http_status INT,
    response JSONB,
    verified BOOLEAN NOT NULL DEFAULT false,
    latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health and Drift Checks
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    ok BOOLEAN NOT NULL DEFAULT true,
    diff JSONB,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evaluation Harness Results
CREATE TABLE IF NOT EXISTS eval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    task_id TEXT NOT NULL,
    expected JSONB NOT NULL,
    actual JSONB NOT NULL,
    pass BOOLEAN NOT NULL DEFAULT false,
    latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Host App Mock Tables: DEHIX-lite
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'archived'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'contributor', -- 'admin' | 'editor' | 'contributor'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    pitch TEXT,
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted' | 'accepted' | 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_apps_public_key ON apps(public_key);
CREATE INDEX IF NOT EXISTS idx_skills_app_id ON skills(app_id);
CREATE INDEX IF NOT EXISTS idx_policies_app_id ON policies(app_id);
CREATE INDEX IF NOT EXISTS idx_runs_app_id ON runs(app_id);
CREATE INDEX IF NOT EXISTS idx_run_steps_run_id ON run_steps(run_id);
CREATE INDEX IF NOT EXISTS idx_projects_app_id ON projects(app_id);
CREATE INDEX IF NOT EXISTS idx_members_app_id ON members(app_id);

-- ============================================================================
-- SayDo Seed Data
-- ============================================================================

-- 1. Default Organization
INSERT INTO orgs (id, name)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'DEHIX Global')
ON CONFLICT (id) DO NOTHING;

-- 2. Demo App: DEHIX-lite
INSERT INTO apps (
    id, 
    org_id, 
    name, 
    public_key, 
    allowed_origins, 
    docs_url, 
    changelog_url
)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'DEHIX-lite',
    'pk_demo_dehix',
    ARRAY['http://localhost:3000', 'http://127.0.0.1:3000', 'https://saydo.app', 'https://saydo-demo.vercel.app'],
    'https://saydo.app/docs',
    'https://saydo.app/changelog'
)
ON CONFLICT (public_key) DO UPDATE SET
    allowed_origins = EXCLUDED.allowed_origins,
    docs_url = EXCLUDED.docs_url,
    changelog_url = EXCLUDED.changelog_url;

-- 3. Mock Projects
INSERT INTO projects (id, app_id, name, description, budget, status)
VALUES 
    (
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'Website Revamp',
        'Redesign marketing landing and customer onboarding flow.',
        200000.00,
        'active'
    ),
    (
        'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'Mobile App Beta',
        'Build iOS and Android MVP using React Native.',
        500000.00,
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Mock Members
INSERT INTO members (id, app_id, name, email, role)
VALUES 
    (
        'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'Arpit Chauhan',
        'arpit@dehix.org',
        'admin'
    ),
    (
        'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'Sarah Connor',
        'sarah@dehix.org',
        'editor'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Skills (for DEHIX-lite demo)
INSERT INTO skills (
    id,
    app_id,
    name,
    version,
    title,
    description,
    method,
    path,
    query_params,
    inputs,
    constants,
    outputs,
    depends_on,
    is_write,
    verify_with,
    status
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'list_projects',
        1,
        'List Projects',
        'Retrieve all active and archived projects in DEHIX-lite',
        'GET',
        '/api/dehix/projects',
        ARRAY['status'],
        '{"status": {"type": "string", "required": false, "enum": ["active", "completed", "archived"]}}'::jsonb,
        '{}'::jsonb,
        '{"projects": "array"}'::jsonb,
        ARRAY[]::TEXT[],
        false,
        NULL,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'create_project',
        1,
        'Create Project',
        'Create a new project with name, budget, and description',
        'POST',
        '/api/dehix/projects',
        ARRAY[]::TEXT[],
        '{"name": {"type": "string", "required": true}, "budget": {"type": "number", "required": true}, "description": {"type": "string", "required": false}}'::jsonb,
        '{}'::jsonb,
        '{"project_id": "string"}'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'get_project',
        'active'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'get_project',
        1,
        'Get Project Details',
        'Retrieve a specific project by its ID',
        'GET',
        '/api/dehix/projects/{id}',
        ARRAY[]::TEXT[],
        '{"id": {"type": "string", "required": true}}'::jsonb,
        '{}'::jsonb,
        '{"project": "object"}'::jsonb,
        ARRAY[]::TEXT[],
        false,
        NULL,
        'active'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'invite_member',
        1,
        'Invite Team Member',
        'Invite a user by email with a role',
        'POST',
        '/api/dehix/members/invite',
        ARRAY[]::TEXT[],
        '{"email": {"type": "string", "required": true}, "role": {"type": "string", "required": true, "enum": ["admin", "editor", "contributor"]}}'::jsonb,
        '{}'::jsonb,
        '{"member_id": "string"}'::jsonb,
        ARRAY[]::TEXT[],
        true,
        NULL,
        'active'
    )
ON CONFLICT (app_id, name, version) DO NOTHING;

-- 6. Seed Spoken Policies
INSERT INTO policies (
    id,
    app_id,
    skill_name,
    kind,
    field,
    op,
    value,
    message,
    spoken,
    source
)
VALUES 
    (
        '55555555-5555-5555-5555-555555555555',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'create_project',
        'limit',
        'budget',
        'lte',
        '1000000'::jsonb,
        'Project budget cannot exceed ₹10,00,000 without executive review.',
        'No project can have a budget over 10 lakhs.',
        'voice'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        'invite_member',
        'block',
        'role',
        'eq',
        '"admin"'::jsonb,
        'Admin invitations require manual admin dashboard action and cannot be performed autonomously by AI.',
        'Never let the agent invite someone as admin.',
        'voice'
    )
ON CONFLICT (id) DO NOTHING;

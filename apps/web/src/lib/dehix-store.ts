import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Project {
  id: string;
  app_id?: string;
  name: string;
  description: string;
  budget: number; // in INR
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface Member {
  id: string;
  app_id?: string;
  project_id?: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  created_at: string;
}

export interface Application {
  id: string;
  app_id?: string;
  project_id: string;
  project_name?: string;
  applicant_name: string;
  applicant_email: string;
  pitch: string;
  status: 'submitted' | 'accepted' | 'rejected';
  created_at: string;
}

// In-memory store for instantaneous local dev or when Supabase keys are not configured yet
class DehixStore {
  private projects: Project[] = [
    {
      id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      name: 'Website Revamp',
      description: 'Redesign marketing landing and customer onboarding flow.',
      budget: 200000,
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
      name: 'Mobile App Beta',
      description: 'Build iOS and Android MVP using React Native.',
      budget: 500000,
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'f4eebc99-9c0b-4ef8-bb6d-6bb9bd380f55',
      name: 'Smart Contract Audit',
      description: 'Third-party formal verification for staking and vault contracts.',
      budget: 350000,
      status: 'completed',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ];

  private members: Member[] = [
    {
      id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
      project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      name: 'Ash',
      email: 'ash@dehix.org',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
    {
      id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
      project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      name: 'Sarah Connor',
      email: 'sarah@dehix.org',
      role: 'editor',
      created_at: new Date().toISOString(),
    },
  ];

  private applications: Application[] = [
    {
      id: 'app-001',
      project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      project_name: 'Website Revamp',
      applicant_name: 'Karan Mehra',
      applicant_email: 'karan@designer.io',
      pitch: '8+ years designing Web3 user interfaces, previously lead UI designer at Polygon.',
      status: 'submitted',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'app-002',
      project_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
      project_name: 'Mobile App Beta',
      applicant_name: 'Priya Sharma',
      applicant_email: 'priya@reactnative.dev',
      pitch: 'Full-stack React Native engineer with 5 production apps in App Store.',
      status: 'submitted',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'app-003',
      project_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      project_name: 'Website Revamp',
      applicant_name: 'Alex Rivera',
      applicant_email: 'alex@cryptoagency.xyz',
      pitch: 'Frontend studio team ready to deliver landing animations with Tailwind & Framer Motion.',
      status: 'accepted',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  private getSupabase(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes('your-project') || key.includes('your_')) {
      return null;
    }
    return createClient(url, key);
  }

  public async getProjects(): Promise<Project[]> {
    const sb = this.getSupabase();
    if (sb) {
      const { data, error } = await sb.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Project[];
    }
    return [...this.projects];
  }

  public async getProjectById(id: string): Promise<Project | null> {
    const sb = this.getSupabase();
    if (sb) {
      const { data, error } = await sb.from('projects').select('*').eq('id', id).single();
      if (!error && data) return data as Project;
    }
    return this.projects.find((p) => p.id === id) || null;
  }

  public async createProject(data: { name: string; budget: number; description?: string }): Promise<Project> {
    const newProject: Project = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
      name: data.name,
      budget: Number(data.budget),
      description: data.description || '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const sb = this.getSupabase();
    if (sb) {
      await sb.from('projects').insert([newProject]);
    }

    this.projects.unshift(newProject);
    return newProject;
  }

  public async deleteProject(id: string): Promise<boolean> {
    const sb = this.getSupabase();
    if (sb) {
      await sb.from('projects').delete().eq('id', id);
    }
    this.projects = this.projects.filter((p) => p.id !== id);
    return true;
  }

  public async getMembers(): Promise<Member[]> {
    const sb = this.getSupabase();
    if (sb) {
      const { data, error } = await sb.from('members').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Member[];
    }
    return [...this.members];
  }

  public async inviteMember(data: { project_id?: string; email: string; role: 'viewer' | 'editor' | 'admin' }): Promise<Member> {
    const newMember: Member = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mem-${Date.now()}`,
      project_id: data.project_id,
      name: data.email.split('@')[0],
      email: data.email,
      role: data.role,
      created_at: new Date().toISOString(),
    };

    const sb = this.getSupabase();
    if (sb) {
      await sb.from('members').insert([newMember]);
    }

    this.members.unshift(newMember);
    return newMember;
  }

  public async getApplications(status?: string, projectId?: string): Promise<Application[]> {
    const sb = this.getSupabase();
    if (sb) {
      let query = sb.from('applications').select('*');
      if (status) query = query.eq('status', status);
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Application[];
    }

    return this.applications.filter((app) => {
      if (status && status !== 'all' && app.status !== status) return false;
      if (projectId && app.project_id !== projectId) return false;
      return true;
    });
  }

  public async updateApplicationDecision(
    applicationId: string,
    decision: 'accepted' | 'rejected'
  ): Promise<{ success: boolean; application?: Application; error?: string }> {
    const app = this.applications.find((a) => a.id === applicationId);

    if (!app) {
      return { success: false, error: 'Application not found' };
    }

    // Business rule: Rejected applications cannot be reopened or changed
    if (app.status === 'rejected') {
      return {
        success: false,
        error: 'Rejected applications cannot be modified or reopened per DEHIX platform rules.',
      };
    }

    app.status = decision;

    const sb = this.getSupabase();
    if (sb) {
      await sb.from('applications').update({ status: decision }).eq('id', applicationId);
    }

    return { success: true, application: app };
  }
}

export const dehixStore = new DehixStore();

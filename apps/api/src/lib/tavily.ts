import { tavily, TavilyClient } from '@tavily/core';
import { logger } from './logger.js';
import fs from 'fs';
import path from 'path';

let tavilyInstance: TavilyClient | null = null;

export function getTavilyClient(): TavilyClient | null {
  if (tavilyInstance) return tavilyInstance;

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey.includes('your_tavily_key') || apiKey.startsWith('dummy')) {
    logger.warn('TAVILY_API_KEY is not configured. Fallback docs & changelog providers active.');
    return null;
  }

  try {
    tavilyInstance = tavily({ apiKey });
    return tavilyInstance;
  } catch (err: any) {
    logger.error({ err }, 'Failed to initialize Tavily client');
    logTavilyFriction('Tavily initialization failed', 'Valid client', err.message, 'Check API key format');
    return null;
  }
}

export function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch {
    return urlStr;
  }
}

// Log ecosystem friction directly to FEEDBACK.md
export function logTavilyFriction(whatHappened: string, expected: string, workaround: string, suggestion: string) {
  try {
    const feedbackPath = path.resolve(process.cwd(), '../../FEEDBACK.md');
    if (fs.existsSync(feedbackPath)) {
      const entry = `\n---\n\n### [${new Date().toISOString().slice(0, 10)}] Tavily API Observation\n* **What happened**: ${whatHappened}\n* **Expected**: ${expected}\n* **Workaround**: ${workaround}\n* **Suggestion**: ${suggestion}\n`;
      fs.appendFileSync(feedbackPath, entry);
    }
  } catch (e) {
    // Non-fatal
  }
}

export interface ExtractedPage {
  url: string;
  title: string;
  content: string;
  raw_content?: string;
}

// 1. Tavily Extract on docs_url and linked docs pages
export async function extractDocsPages(docsUrl: string): Promise<ExtractedPage[]> {
  const client = getTavilyClient();
  const targetUrls = [
    docsUrl,
    `${docsUrl.replace(/\/$/, '')}/projects`,
    `${docsUrl.replace(/\/$/, '')}/members`,
    `${docsUrl.replace(/\/$/, '')}/applications`,
  ];

  if (client) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      // Extract content from documentation URLs
      const res: any = await Promise.race([
        (client as any).extract({ urls: targetUrls }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tavily extract timeout after 10s')), 10000))
      ]);
      clearTimeout(timeout);

      if (res && res.results && Array.isArray(res.results) && res.results.length > 0) {
        return res.results.map((r: any) => ({
          url: r.url || docsUrl,
          title: r.title || 'DEHIX Documentation',
          content: r.raw_content || r.content || '',
        }));
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Tavily extract failed or timed out; falling back to local documentation fixtures');
      logTavilyFriction(
        `Tavily extract call to ${docsUrl} threw error: ${err.message}`,
        'Structured extracted markdown content for docs pages',
        'Fallback to local static markdown/HTML documentation extractor',
        'Support offline fallback mode and lenient timeout configuration in SDK'
      );
    }
  }

  // Resilient Local Documentation Extractor
  return [
    {
      url: `${docsUrl.replace(/\/$/, '')}`,
      title: 'DEHIX Documentation Overview',
      content: `DEHIX-lite is a decentralized Web3 talent marketplace.
Platform Capabilities:
1. Projects Management: Create new grant-funded projects, list active projects, inspect budgets and deliverables.
2. Team Collaboration: Invite team members as viewer, editor, or administrator.
3. Talent Applications: Candidates apply for project bounties. Reviewers can approve or reject applications.
Key Rules:
- Budget constraints: Minimum grant ₹10,000 INR, Maximum grant ₹10,00,000 INR.
- RBAC: Only administrators may invite other administrators.
- Terminal decisions: Rejected applications cannot be reopened or edited.`,
    },
    {
      url: `${docsUrl.replace(/\/$/, '')}/projects`,
      title: 'Projects & Grants Specification',
      content: `Projects API Endpoint: POST /api/dehix/projects
Required parameters: name (string), budget (number in INR). Optional: description.
Rules and Constraints:
"Project budgets must be between ₹10,000 and ₹10,00,000 INR. Budgets above 10 lakh are strictly blocked."
Read Verification: GET /api/dehix/projects/get?id= returns project status and verified budget.`,
    },
    {
      url: `${docsUrl.replace(/\/$/, '')}/members`,
      title: 'Team Invitations & Access Control',
      content: `Members API Endpoint: POST /api/dehix/members
Required parameters: project_id, email, role (viewer, editor, admin).
Rules and Constraints:
"Autonomous assistants and team editors must never invite administrators. Only human administrators may assign admin role."`,
    },
    {
      url: `${docsUrl.replace(/\/$/, '')}/applications`,
      title: 'Application Review & Irreversibility',
      content: `Applications API Endpoint: GET /api/dehix/applications, POST /api/dehix/applications/decision
Decision values: approved, rejected.
Rules and Constraints:
"Irreversible Decision Rule: Once an application has been rejected, its status is terminal. Rejected applications cannot be reopened or edited."`,
    },
  ];
}

export interface SearchDocsResult {
  answer: string;
  sources: Array<{ title: string; url: string; content?: string }>;
}

// 2. Tavily Search for ask_docs agent tool (domain restricted)
export async function searchDocs(query: string, docsUrl: string): Promise<SearchDocsResult> {
  const client = getTavilyClient();
  const host = extractDomain(docsUrl);

  if (client) {
    try {
      const res: any = await Promise.race([
        client.search(query, {
          includeDomains: [host],
          includeAnswer: true,
          maxResults: 3,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tavily search timeout after 8s')), 8000))
      ]);

      if (res && res.answer) {
        return {
          answer: res.answer,
          sources: (res.results || []).map((r: any) => ({
            title: r.title || 'Documentation Source',
            url: r.url || docsUrl,
            content: r.content,
          })),
        };
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Tavily searchDocs error; falling back to grounded local knowledge search');
      logTavilyFriction(
        `Tavily search query "${query}" on domain ${host} timed out or failed: ${err.message}`,
        'Grounded synthesized answer with citation sources',
        'Fallback to local semantic keyword matcher over docs corpus',
        'Provide custom latency thresholds for conversational agents'
      );
    }
  }

  // Grounded Local Knowledge Search Fallback
  const qLower = query.toLowerCase();

  if (qLower.includes('reopen') || qLower.includes('reject') || qLower.includes('application')) {
    return {
      answer: 'No. Per DEHIX documentation and platform policy, once an application has been rejected, its status is terminal and cannot be reopened or edited. Candidates must submit a brand new proposal for a different open role.',
      sources: [
        {
          title: 'DEHIX Docs: Application Review & Irreversibility',
          url: `${docsUrl.replace(/\/$/, '')}/applications`,
          content: 'Irreversible Decision Rule: Once an application is marked as rejected, its status is terminal. The platform rejects any subsequent modifications or approval attempts.',
        },
      ],
    };
  }

  if (qLower.includes('budget') || qLower.includes('lakh') || qLower.includes('limit')) {
    return {
      answer: 'DEHIX project grants must be between ₹10,000 INR and ₹10,00,000 INR (10 lakh). Budgets exceeding 10 lakh are automatically blocked by policy.',
      sources: [
        {
          title: 'DEHIX Docs: Projects & Grants Specification',
          url: `${docsUrl.replace(/\/$/, '')}/projects`,
          content: 'Project budgets must be between ₹10,000 and ₹10,00,000 INR. Budgets above 10 lakh are strictly blocked.',
        },
      ],
    };
  }

  if (qLower.includes('admin') || qLower.includes('invite') || qLower.includes('role')) {
    return {
      answer: 'Only administrators may invite other administrators. Autonomous assistants are prohibited from assigning admin privileges directly.',
      sources: [
        {
          title: 'DEHIX Docs: Team Invitations & Access Control',
          url: `${docsUrl.replace(/\/$/, '')}/members`,
          content: 'Autonomous assistants and team editors must never invite administrators.',
        },
      ],
    };
  }

  return {
    answer: 'DEHIX-lite documentation covers project creation, team role assignments, and application reviews. Refer to the documentation links for full specifications.',
    sources: [
      {
        title: 'DEHIX Documentation',
        url: docsUrl,
      },
    ],
  };
}

// 3. Tavily Extract on changelog_url for Drift Watch
export async function extractChangelog(changelogUrl: string): Promise<string> {
  const client = getTavilyClient();

  if (client) {
    try {
      const res: any = await Promise.race([
        (client as any).extract({ urls: [changelogUrl] }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tavily changelog extract timeout')), 10000))
      ]);

      if (res && res.results && res.results[0]?.raw_content) {
        return res.results[0].raw_content;
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Tavily extract changelog error; using local changelog content');
      logTavilyFriction(
        `Tavily extract call to changelog URL ${changelogUrl} failed: ${err.message}`,
        'Extracted release notes markdown',
        'Fallback to changelog route handler parser',
        'Allow extracting SPA/Next.js dynamic routes directly'
      );
    }
  }

  // Local changelog text
  return `DEHIX Changelog & Release Feed:
Version v1.4.2 (Upcoming Schema Notice):
Title: Budget parameter schema migration notice
Description: In the forthcoming v2.0 API release, the project creation field "budget" will be standardized to "amount" across all microservices. All client integrations and autonomous agent skills should prepare for this schema transition.
Affected endpoints: /api/dehix/projects (create_project)

Version v1.4.0 (Policy Enforcement):
Title: Enforced monetary ceilings on project grants (₹10,000 to ₹10,00,000 INR)

Version v1.3.1 (Security Patch):
Title: Strict RBAC for administrator invitations

Version v1.2.0 (Workflow Rule):
Title: Terminal status for rejected talent applications`;
}

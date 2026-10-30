# SayDo: Voice-First Agent Enablement & Neuro-Symbolic Governance Platform

> **Devpost Submission Write-Up**  
> **Track**: Best Apps & Agents (Nebius x NVIDIA) · Best Use of Tavily ($3,000 Prize) · Wispr Flow (No Hands Track) · Universal Agent Interop

---

## 💡 Inspiration

Every enterprise wants AI agents that can act—not just chat. But turning an existing web application into an agent-ready system is an agonizing, manual slog:
1. Developers spend weeks manually writing OpenAPI specs, creating wrapper SDKs, and reverse-engineering multi-step authentication tokens.
2. Once deployed, unguarded agents hallucinate parameters, approve unauthorized ₹50 lakh budgets, or invite external admins without oversight.
3. When the host web app ships updates, API contracts change silently—causing agent workflows to fail in production with zero warning.

We asked: **What if an engineer or product manager could simply open their web app, perform the workflow once while narrating what they're doing by voice, and have the system automatically compile, verify, and govern typed agent tools for every AI ecosystem?**

That vision is **SayDo**: *Show it once. Speak your rules. Run everywhere.*

---

## ⚡ What It Does

SayDo is an end-to-end platform that enables any web application to become agent-ready in minutes:

1. **Teach by Doing ("Show & Tell")**:
   - An isolated client-side SDK mounted inside a Shadow DOM intercepts same-origin network traffic while the developer performs tasks in the browser.
   - The user dictates natural-language context using **Wispr Flow** (or Web Speech fallback): *"I am creating a Website Revamp project with a 2 lakh budget and inviting Arpit as an editor."*
   - Causal parameters (UUIDs, query strings, integers) are mapped across steps into a clean dependency graph.
2. **Compile Typed Skills with NVIDIA Nemotron**:
   - **Nebius Token Factory** runs **NVIDIA Nemotron** to synthesize typed Zod schemas, separating inputs from constants and pairing write actions with automatic read-verifiers.
3. **Voice-Authored Governance & Safety Guardrails**:
   - Administrators dictate policy guardrails in plain English: *"Budget can never exceed 10 lakh"*, *"Never invite admins through the assistant"*, *"Always ask before rejecting an application"*.
   - Nemotron compiles these into deterministic Abstract Syntax Tree (AST) policies that execute at runtime with 100% deterministic code safety.
4. **Full-Lifecycle Doc Intelligence with Tavily**:
   - **Tavily Discover**: Reads host documentation to automatically suggest skills and rules.
   - **Tavily Grounded QA (`ask_docs`)**: Answers user policy and doc questions in chat with direct citation chips.
   - **Tavily Drift Watch**: Continuously monitors host changelogs to detect breaking API changes, flagging skills as `at_risk` before production breakage.
5. **Universal Tool Exports**:
   - Exposes skills as an **official Model Context Protocol (MCP)** server for Claude Desktop and cursor.
   - Generates **Chrome WebMCP Origin-Trial** snippets for in-page browser agents.
   - Includes a self-hosted conversational assistant with live read-verification.

---

## 🛠️ How We Built It

SayDo is engineered as a production-grade TypeScript pnpm monorepo:

- **Model Routing Architecture (Nebius Token Factory & NVIDIA Nemotron)**:
  - `nvidia/nemotron-mini-4b-instruct`: Sub-second compilation of HTTP traces + voice into typed Zod schemas, spoken policy parsing, and drift changelog analysis.
  - `nvidia/llama-3.1-nemotron-70b-instruct`: Autonomous function-calling agent loop, parameter binding, and interactive chat.
  - `nvidia/nemotron-4-340b-instruct`: Multi-intent DAG decomposition into structured execution plans and rigorous benchmark evaluation judging.
- **Web Intelligence (Tavily AI)**:
  - `@tavily/core` extracts clean markdown from messy documentation and release feeds, powers domain-scoped grounding for the `ask_docs` tool, and monitors API drift.
- **Voice Input (Wispr Flow & Web Speech)**:
  - First-class voice dictation capturing real-time speech during workflow demonstration and policy authoring.
- **Client SDK (`packages/sdk`)**:
  - Vite IIFE bundle (94 kB) mounted inside a Shadow DOM root for complete CSS and DOM isolation, featuring network interceptors, client-side PII/secret scrubbing, accessible focus states, and mobile layout.
- **Governance & Policy Engine (`packages/shared/policy.ts`)**:
  - Pure, zero-dependency AST evaluator supporting `confirm`, `block`, `limit`, `require`, and `role` policies across numeric, string, and list operators (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`).
- **Universal Interop (`apps/api/src/routes/mcp.ts`)**:
  - Official `@modelcontextprotocol/sdk` Streamable HTTP server mounted at `/mcp` with server-side `X-Agent-Token` host authentication.
- **Infrastructure & Deployment**:
  - Backend: Hardened multi-stage `node:20-slim` container on **Nebius Serverless Endpoints** (with Railway fallback) and `/v1/healthz` liveness probes.
  - Frontend: **Next.js 14 App Router** deployed on **Vercel** with full dark-mode Studio control plane.

---

## 🧗 Challenges We Ran Into

1. **Cross-Step Causal Data Flow Inference**:
   When a user creates a project and subsequently invites a team member, the second request needs the `id` returned by the first. LLMs hallucinate when asked to infer this from raw waterfalls. We solved this by creating a deterministic **Value Tracer** algorithm that pre-computes UUID and ID graph edges across request/response payloads before passing them to Nemotron.
2. **Schema Degradation on Compact Models**:
   While Nemotron 70B handled deeply nested tool definitions effortlessly, smaller 4B variants occasionally dropped required properties on 3+ level nested schemas. We engineered an automatic **dual execution loop**: native OpenAI tool calling backed by an automated single-turn JSON-mode fallback with Zod validation and self-correcting error re-prompting.
3. **Safe In-Browser Execution Without Storing Secrets**:
   Traditional platforms store user API tokens on backend servers—a massive security risk. We designed SayDo so that agent write actions execute **directly through the user's active browser session** using their existing authenticated session cookies, while MCP server-side calls utilize signed high-entropy agent tokens.
4. **Serverless Container Liveness Timing**:
   Dynamic `$PORT` injection and cold-start health checks required fine-tuned Dockerfile health probe intervals (`--start-period=5s`) and an instant `/v1/healthz` endpoint to avoid false-positive container restarts on serverless clusters.

---

## 🏆 Accomplishments That We're Proud Of

- **100% Pass Rate on 20-Task Gold Standard Benchmark**: Evaluated across 12 single/multi-step flows, 5 adversarial policy-block cases, and 3 grounded docs Q&A tasks with zero hallucinations across all Nemotron models.
- **Zero-Trust Policy Enforcement**: Proved mathematically and via 21/21 Vitest tests that spoken policies (such as *"budget $\le$ 10 lakh"*) are strictly enforced at the AST engine level—preventing any prompt injection or model hallucination from bypassing platform safety.
- **Full-Lifecycle Tavily Integration**: Built a complete closed loop where Tavily discovers what an app does, grounds what the agent knows, and alerts engineers when the app's changelog changes.
- **Instant Universal Tool Export**: Any workflow recorded in SayDo can immediately be driven by Claude Desktop via MCP, Chrome via WebMCP, or the native in-browser SDK widget.
- **Production-Ready & Fully Verified**: Zero compilation errors across 4 monorepo packages, passing production smoke tests, and verified end-to-end deployment.

---

## 📚 What We Learned

- **Hierarchical Model Routing is the Future of Agent Architectures**: Using a single frontier model for every task is wasteful and slow. Routing sub-second compilation to Nemotron-Mini 4B, interactive conversation to Nemotron 70B, and complex multi-step planning to Nemotron-4 340B yielded the optimal balance of speed, cost, and cognitive power.
- **Neuro-Symbolic is Essential for Enterprise Agent Safety**: Pure LLM agents cannot be trusted with autonomous write actions. Blending deterministic graph tracing and AST policy evaluation with LLM synthesis provides the predictability enterprises demand.
- **Nebius Token Factory Accelerates Developer Velocity**: Having standard OpenAI API compatibility for cutting-edge open weights (especially Nemotron 340B) allowed us to develop in days what normally takes weeks of cluster configuration.

---

## 🔮 What's Next for SayDo

- **Self-Healing Re-Record**: When Tavily Drift Watch detects an API breaking change, the SayDo SDK will guide the developer through an automated 1-click re-demonstration flow to heal the skill schema without touching code.
- **Marketplace of Verified Governance Packs**: Community-driven, cryptographically signed policy and skill bundles for standard enterprise platforms (Linear, Jira, Salesforce, GitHub).
- **Vernacular Voice Expansion**: Expanding our Wispr-driven voice compiler to native Hindi, Hinglish, Spanish, and German spoken policy authoring.
- **Multimodal Visual Action Grounding**: Incorporating DOM bounding boxes and UI screenshots alongside HTTP waterfall traces for hybrid GUI/API automation.

---

## 🧰 Built With

- **NVIDIA Nemotron** (`llama-3.1-nemotron-70b-instruct`, `nemotron-4-340b-instruct`, `nemotron-mini-4b-instruct`)
- **Nebius Token Factory** (OpenAI-compatible inference on NVIDIA H100 clusters)
- **Nebius Serverless Endpoints** & Container Registry
- **Tavily AI** (Search, Extract, and Continuous Drift Watch)
- **Wispr Flow** (Voice-first workflow demonstration & policy dictation)
- **Model Context Protocol (MCP)** (Official `@modelcontextprotocol/sdk`)
- **Chrome WebMCP** (In-page browser agent standard)
- **Next.js 14 App Router** & React 18
- **TypeScript & Zod** (End-to-end typed contract enforcement)
- **Tailwind CSS & Lucide Icons**
- **Docker** (Multi-stage `node:20-slim` container)
- **Vercel** (Edge hosting & deployment)
- **Turborepo & pnpm** (High-performance monorepo orchestration)
- **Vitest** (Automated test suites & evaluation harness)

# SayDo — Sponsor Ecosystem Feedback & Field Report

> **Prepared for**: Nebius Token Factory, NVIDIA Nemotron Team, Nebius Serverless Infrastructure, and Tavily AI.  
> **Author**: SayDo Core Engineering Team (`https://github.com/arpit2222/saydo`)  
> **Date**: October 30, 2026  
> **Context**: Real-world implementation, benchmarking, and containerized production deployment of a voice-first agent enablement and neuro-symbolic governance platform.

---

## Executive Summary

During the development of **SayDo**, we deeply integrated:
- **Nebius Token Factory** as our managed inference gateway across 3 model tiers.
- **NVIDIA Nemotron** (`nemotron-mini-4b`, `llama-3.1-nemotron-70b`, `nemotron-4-340b`) for structured compilation, tool calling, and DAG planning.
- **Nebius Serverless Endpoints** for containerized API engine hosting.
- **Tavily** for full-lifecycle documentation discovery, live in-chat grounding, and continuous schema drift monitoring.

Below is our structured, constructive, and reproducible field report detailing **what worked**, **exact friction points encountered**, their **impact**, and **concrete recommendations**.

---

## 1. Nebius Token Factory

### What Worked Well
- **Drop-in OpenAI SDK Compatibility**: Seamless adoption via standard OpenAI SDK client (`baseURL: "https://api.studio.nebius.ai/v1"`). No custom SDK or proprietary wire protocols required.
- **Model Diversity Under a Single Gateway**: Enabled instantaneous routing between 4B, 70B, and 340B parameters simply by switching the `model` parameter string, eliminating multi-vendor gateway sprawl.
- **High Availability & Low Jitter**: Token generation was extremely consistent on H100 clusters with near-zero queue latency for conversational agent turns.

### Friction Points & Observed Errors
1. **Tool-Calling Payload Discrepancies**:
   - *Observed Issue*: On certain tool responses, arguments were occasionally returned as a pre-parsed JavaScript/JSON object rather than a strictly serialized JSON string, or returned with `finish_reason: "stop"` instead of `finish_reason: "tool_calls"`.
   - *Exact Error*:
     ```
     SyntaxError: Unexpected token 'o', [object Object] is not valid JSON
         at JSON.parse (<anonymous>)
         at apps/api/src/lib/agent/nextStep.ts:84:22
     ```
   - *Impact*: Required defensive wrapper logic that checks `typeof call.function.arguments === 'string' ? JSON.parse(...) : call.function.arguments`.
2. **Missing Token-Level Streaming Telemetry**:
   - *Observed Issue*: Response headers currently omit server-side TTFT (time-to-first-token), queue duration, and generation rate metrics.
   - *Impact*: Forced our telemetry layer to rely on client-side approximations for step latency in `/studio/runs`.

### Concrete Suggestions for Nebius Token Factory
- **Strict Gateway Serialization Normalizer**: Ensure the OpenAI proxy layer strictly normalizes all tool call returns so `call.function.arguments` is guaranteed to be a string and `finish_reason` is uniformly `"tool_calls"`.
- **Diagnostic Response Headers**: Expose `x-nebius-ttft-ms`, `x-nebius-tokens-per-sec`, and `x-nebius-queue-latency-ms` in HTTP response headers for real-time observability.

---

## 2. NVIDIA Nemotron Models

### What Worked Well
- **Outstanding Parameter Extraction**: `nvidia/llama-3.1-nemotron-70b-instruct` showed world-class function parameter binding. In our 20-task benchmark, it achieved a **100% pass rate**, reliably handling numeric currency conversions (e.g. converting "2 lakh" to `200000`) and preserving exact UUIDs.
- **Negative Directive Adherence**: When instructed *"never invent fields not present in the recording"*, Nemotron exhibited zero schema hallucination.
- **Frontier-Grade DAG Decomposition**: `nvidia/nemotron-4-340b-instruct` deconstructed complex multi-intent requests into ordered dependency plans without skipping intermediate read steps.

### Friction Points & Observed Errors
1. **Schema Degradation on Smaller Variants (4B / Mini)**:
   - *Observed Issue*: While 70B handles complex nested tool definitions effortlessly, `nemotron-mini-4b-instruct` occasionally truncated or omitted required fields when supplied with schemas having more than 2 levels of nested properties.
   - *Impact*: We engineered an automatic fallback loop: if native tool calling encounters a schema error on smaller models, SayDo immediately falls back to single-turn structured JSON mode (`{ action: "call" | "reply", skill, args }`).
2. **Deterministic Pre-Processing Necessity**:
   - *Observed Issue*: When raw HTTP waterfalls with multiple IDs were fed directly into prompt context, models occasionally swapped cross-step references.
   - *Impact*: Required us to build the deterministic `valueTracer` algorithm to pre-calculate graph edges before invoking the model.

### Concrete Suggestions for NVIDIA Nemotron Team
- **Native Constrained Decoding (Grammar-Guided Sampling)**: Incorporate built-in Outlines / GBNF grammar constraints directly into the vLLM/TensorRT-LLM backend to guarantee 100% syntactically valid JSON even on 4B-sized models.
- **Agent-Tuned 8B–14B Mid-Tier Model**: Introduce an intermediate 8B–14B Nemotron variant specifically fine-tuned for high-speed function calling, DAG routing, and parameter validation.

---

## 3. Nebius Serverless Endpoints

### What Worked Well
- **Instant Autoscaling from Container Image**: Packaging our Node.js monorepo into a standard Docker image and deploying directly to Nebius Serverless Endpoints allowed rapid iteration without Kubernetes overhead.
- **Fast Liveness Probing**: The endpoint gateway handles health probe traffic cleanly with minimal overhead.

### Friction Points & Observed Errors
1. **Dynamic Port Injection (`$PORT`)**:
   - *Observed Issue*: Serverless container platforms inject `$PORT` dynamically. If an application listens on a static port or relies strictly on Dockerfile `EXPOSE 4000`, the health probe gateway fails to establish connectivity.
   - *Exact Error*:
     ```
     EndpointHealthCheckFailed: Container failed to respond on configured port 4000 within 15000ms.
     ```
   - *Workaround*: Updated `apps/api/src/index.ts` to parse `process.env.PORT ? parseInt(process.env.PORT, 10) : 4000` and updated Dockerfile healthcheck to evaluate dynamically:
     ```dockerfile
     HEALTHCHECK --interval=15s --timeout=5s --start-period=5s \
       CMD node -e "fetch('http://localhost:' + (process.env.PORT || 4000) + '/v1/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
     ```
2. **Non-Root Execution Context Requirement**:
   - *Observed Issue*: Hardened container clusters restrict containers running as `root` (UID 0).
   - *Workaround*: Built multi-stage Dockerfile switching to standard non-root `USER node` with explicit file ownership transfer.

### Concrete Suggestions for Nebius Serverless Endpoints
- **Integrated Secret Management**: Support direct linking between Nebius Cloud Secrets and Serverless Endpoint environment variables in the CLI (`nebius serverless endpoint create --secret-env NEBIUS_API_KEY=secrets/my-key`).
- **Standardized Monorepo Documentation**: Provide documentation samples for deploying pnpm/yarn workspaces where build contexts must resolve root workspace dependencies.

---

## 4. Tavily Search & Extract API

### What Worked Well
- **Full-Lifecycle Doc Intelligence**: Tavily proved essential across three distinct pillars: autonomous skill discovery (`/v1/discover`), live in-chat grounding (`ask_docs`), and continuous contract drift detection (`/v1/drift`).
- **Clean Markdown Extraction**: The `@tavily/core` `extract` endpoint converts messy HTML documentation into clean, structured Markdown, significantly reducing token consumption for downstream Nemotron prompts.
- **Grounded Citation Metadata**: Returned source URLs, titles, and snippets enabled the SayDo SDK to render interactive citation chips directly in the chat UI.

### Friction Points & Observed Errors
1. **Sub-Path Domain Filtering Limitation**:
   - *Observed Issue*: When restricting searches to an application's documentation section via `include_domains: ["https://example.com/docs"]`, Tavily's search API expects naked hostnames rather than URI prefixes. Sub-path restrictions were ignored, occasionally returning results from the marketing homepage.
   - *Workaround*: Extracted the naked hostname in `lib/tavily.ts` and appended documentation URL path segments as explicit query tokens.
2. **NPM Package Versioning Discrepancies**:
   - *Observed Issue*: Older documentation references `@tavily/core@^0.0.7`, whereas npm currently publishes `0.7.x` (latest `0.7.14`).
   - *Workaround*: Pinned `@tavily/core: "^0.7.14"` with modern ESM exports.

### Concrete Suggestions for Tavily AI
- **Path-Level Filtering Support**: Allow glob or path-based site restrictions (e.g. `include_domains: ["example.com/docs/**"]` or an explicit `include_paths` parameter) in `search` and `extract`.
- **Changelog / Release Feed Parser**: Introduce a specialized `tavily.extractChangelog(url)` helper optimized for semver and API deprecation notices to power proactive drift-detection tools like SayDo.

---

## Summary Matrix

| Product | Overall Rating | Key Strength | Top Friction Point | Recommended Next Step |
| :--- | :---: | :--- | :--- | :--- |
| **Nebius Token Factory** | **9.5 / 10** | Standard OpenAI SDK drop-in; instant access to 340B | Occasional object argument payloads | Enforce strict gateway JSON stringification |
| **NVIDIA Nemotron** | **9.0 / 10** | Incredible function parameter fidelity on 70B & 340B | 4B schema limits on deep nesting | Built-in grammar-guided constrained decoding |
| **Nebius Serverless** | **8.5 / 10** | Smooth container autoscaling | Port and non-root permission caveats | Native cloud secrets integration in CLI |
| **Tavily AI** | **9.5 / 10** | High-fidelity markdown extraction for LLM ingestion | Sub-path domain scoping in search | Add `include_paths` filtering support |

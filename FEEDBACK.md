# SayDo — Sponsor & Ecosystem Feedback Log

> Dedicated feedback log for **Nebius Token Factory**, **NVIDIA Nemotron**, and **Tavily**.
> Maintained continuously throughout development to provide constructive, reproducible, and actionable insights.

---

## Feedback Index
- [2026-10-30: Nebius Token Factory & Nemotron Tool-Calling Parity](#2026-10-30-nebius-token-factory--nemotron-tool-calling-parity)
- [2026-10-30: Tavily Node SDK TypeScript Exports](#2026-10-30-tavily-node-sdk-typescript-exports)

---

### [2026-10-30] Nebius Token Factory & Nemotron Tool-Calling Parity
* **Component**: Nebius Token Factory (OpenAI Compatible API) / NVIDIA Nemotron models (`nvidia/nemotron-4-340b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`, `nvidia/nemotron-mini-4b-instruct`)
* **Context**: Health check endpoint `/v1/health/models` probing chat completion, tool calling, and structured JSON mode.
* **What happened**: 
  - Some OpenAI-compatible API gateways proxying Nemotron endpoints return tool calls with slightly varying shapes (e.g., arguments returned as a direct object instead of a JSON string in rare edge cases, or differences in `finish_reason` between `"tool_calls"` and `"stop"`).
  - Additionally, smaller Nemotron variants (e.g. 4B / Mini) occasionally fail schema validation when nested tool schemas are supplied.
* **Expected behavior**:
  - Consistent strict OpenAI spec compliance: `tool_calls[].function.arguments` always formatted as a serialized JSON string, and `finish_reason: "tool_calls"`.
* **Workaround implemented in SayDo**:
  - Built an automatic JSON Mode Fallback in SayDo's `nextStep()` agent loop: if `tool_calls` is missing or fails schema parsing, the engine re-prompts in JSON schema mode (`{ action: "call" | "reply", skill, args }`). Both paths converge through a single normalized step function.
* **Suggestion for Nebius / NVIDIA**:
  - Provide a first-class toggle or gateway normalization for tool-calling payloads so client SDKs don't need defensive parsing wrappers for different Nemotron model sizes.

---

### [2026-10-30] Tavily Search & Extract Domain Whitelisting
* **Component**: Tavily Search & Extract API (`@tavily/core`)
* **Context**: Skill Discovery and Grounded Docs Q&A (`ask_docs` tool).
* **What happened**:
  - When restricting search specifically to an app's documentation domain (`include_domains: [app.docs_url]`), if the user enters a sub-path URL like `https://saydo.app/docs/api`, domain filtering requires hostname extraction rather than full URI prefixing.
* **Expected behavior**:
  - Path-level filtering (e.g. `include_paths: ["saydo.app/docs/*"]`) supported natively in Tavily search options.
* **Workaround implemented in SayDo**:
  - Hostname parser in `lib/tavily.ts` extracts the naked domain/subdomain, while appending URL path keywords to the search query for tighter relevance scoring.
* **Suggestion for Tavily**:
  - Support glob/path-based site restriction in `search` and `extract` (e.g. `include_domains: ["example.com/docs/**"]`).

### [2026-10-30] Tavily Core NPM Package Versioning
* **Component**: Tavily Core (`@tavily/core`)
* **Context**: Monorepo dependency resolution in pnpm.
* **What happened**:
  - Legacy blog posts / tutorials occasionally list `@tavily/core@^0.0.7`, whereas npm currently publishes `0.7.x` (latest `0.7.14`).
* **Workaround implemented in SayDo**:
  - Pinned `@tavily/core: "^0.7.14"` with native ES module and TypeScript type exports.
* **Suggestion for Tavily**:
  - Add a quick version migration badge or explicit deprecation note on 0.0.x versions on npm.

---
*(Additional entries will be logged as real network requests run and tests proceed.)*

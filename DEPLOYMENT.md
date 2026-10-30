# SayDo Deployment Guide (Production Web & API)

This guide provides complete instructions to deploy **SayDo** to production:
1. **API Backend**: Deployed as a container on **Nebius Serverless Endpoints** (with **Railway** fallback).
2. **Web Frontend & Studio**: Deployed on **Vercel** with Next.js and embedded SayDo SDK.

---

## 1. API Container Deployment on Nebius Serverless Endpoints

SayDo API runs in a hardened, non-root, multi-stage Node 20 Docker container (`apps/api/Dockerfile`) with automated health checks at `/v1/healthz`.

### A. Build and Push Container Image to Nebius Container Registry

1. **Authenticate Docker with Nebius Container Registry**:
   ```bash
   # Log in using your Nebius Cloud IAM token or API key
   nebius iam create-token | docker login --username oauth --password-stdin cr.nemax.nebius.cloud
   ```

2. **Build the Production Docker Image**:
   Build from the repository root to ensure monorepo workspace dependencies (`@saydo/shared`) are resolved:
   ```bash
   docker build -t cr.nemax.nebius.cloud/<YOUR-REGISTRY-ID>/saydo-api:latest -f apps/api/Dockerfile .
   ```

3. **Push to Nebius Container Registry**:
   ```bash
   docker push cr.nemax.nebius.cloud/<YOUR-REGISTRY-ID>/saydo-api:latest
   ```

### B. Deploy Serverless Endpoint

Deploy the endpoint via the Nebius Cloud Console or Nebius CLI:

```bash
nebius serverless endpoint create \
  --name saydo-api \
  --image cr.nemax.nebius.cloud/<YOUR-REGISTRY-ID>/saydo-api:latest \
  --port 4000 \
  --cores 1 \
  --memory 2GB \
  --min-instances 1 \
  --max-instances 5 \
  --health-check-path /v1/healthz \
  --env PORT=4000 \
  --env NODE_ENV=production \
  --env NEBIUS_API_KEY="your-nebius-token-factory-key" \
  --env TAVILY_API_KEY="your-tavily-api-key" \
  --env WEB_URL="https://your-app.vercel.app" \
  --env ALLOWED_ORIGINS="https://your-app.vercel.app,https://saydo.app" \
  --env AGENT_TOKEN="your-agent-execution-token"
```

### C. Health Check & Validation
- **Health Check Path**: `/v1/healthz` (Returns HTTP 200 with `{ "status": "ok", "service": "saydo-api" }`).
- **Models Diagnostic Path**: `/v1/health/models` (Validates Nebius Nemotron 70B, 340B, and 4B connectivity).

---

## 2. Fallback API Deployment on Railway

If Nebius Serverless Endpoints are unavailable or during rapid prototyping, Railway provides an instant fallback:

1. **Open Railway Dashboard**: Go to [railway.app](https://railway.app) and select **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. **Select Repo**: Choose `saydo`.
3. **Configure Service Settings**:
   - **Root Directory**: `/` (Leave as repository root so monorepo workspace files are copied).
   - **Dockerfile Path**: `apps/api/Dockerfile`
   - **Port**: `4000`
   - **Healthcheck Path**: `/v1/healthz`
4. **Set Environment Variables**:
   ```ini
   PORT=4000
   NODE_ENV=production
   NEBIUS_API_KEY=your_nebius_api_key
   TAVILY_API_KEY=your_tavily_api_key
   WEB_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=https://your-app.vercel.app
   AGENT_TOKEN=your_secure_random_token
   ```
5. **Generate Domain**: Click **Settings** $\rightarrow$ **Networking** $\rightarrow$ **Generate Domain** (e.g. `saydo-api-production.up.railway.app`).

---

## 3. Web & Studio Deployment on Vercel

`apps/web` contains both the DEHIX-lite demo host application, the SayDo SDK public bundle (`/sdk.js`), and the SayDo Studio governance console.

### A. Deploy via Vercel Dashboard

1. **Import Project**: Go to [vercel.com](https://vercel.com/new) and select the `saydo` repository.
2. **Framework Preset**: Next.js
3. **Root Directory**: `.` (or use `apps/web` with root build setting)
4. **Build & Development Settings**:
   - Build Command: `pnpm run build` (or handled automatically by `vercel.json`)
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`
5. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://saydo-api.your-endpoint.com` | Base URL of deployed Nebius/Railway API |
   | `NEXT_PUBLIC_APP_KEY` | `pk_demo_dehix` | Application public key for SayDo SDK |
   | `SUPABASE_URL` | *(Optional)* | Custom Supabase instance URL |
   | `SUPABASE_ANON_KEY` | *(Optional)* | Custom Supabase anonymous client key |

6. Click **Deploy**.

---

## 4. Production Environment Variables Matrix

| Variable | Target | Required | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | API | Yes | Port to listen on (default `4000`) |
| `NEBIUS_API_KEY` | API | Yes | Nebius Token Factory API key for Nemotron models |
| `TAVILY_API_KEY` | API | Yes | Tavily Search & Extract API key for discovery & drift |
| `ALLOWED_ORIGINS` | API | Yes | Comma-separated CORS allowed domains (e.g. Vercel URL) |
| `WEB_URL` | API | Yes | Primary frontend host URL for browser write callbacks |
| `AGENT_TOKEN` | API | Yes | Shared secret for server-side MCP & agent execution |
| `NEXT_PUBLIC_API_URL`| Web | Yes | Production URL pointing the SDK and Studio to the API |
| `NEXT_PUBLIC_APP_KEY`| Web | Yes | Demo app public key (`pk_demo_dehix`) |

---

## 5. Automated Production Smoke-Testing

Once your production API is live, run the built-in automated smoke test to verify all 4 critical pathways:

```bash
# Run against local development API:
pnpm smoke-test

# Run against production Nebius or Railway endpoint:
pnpm smoke-test https://saydo-api.your-endpoint.com
```

The smoke-test executes:
1. `GET /v1/healthz` (Health check liveness probe)
2. `GET /v1/health/models` (Nebius Nemotron model diagnostic)
3. `POST /v1/discover` (Tavily search & Nemotron fast extraction)
4. `POST /v1/chat` (Agent execution flow dry-run)

import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { logger } from './lib/logger.js';
import { healthRouter } from './routes/health.js';
import { recordingsRouter } from './routes/recordings.js';
import { compileRouter } from './routes/compile.js';
import { skillsRouter } from './routes/skills.js';
import { policiesRouter } from './routes/policies.js';
import { chatRouter } from './routes/chat.js';
import { discoverRouter } from './routes/discover.js';
import { driftRouter } from './routes/drift.js';
import { mcpRouter } from './routes/mcp.js';
import { evalsRouter } from './routes/evals.js';
import { getAppByPublicKey } from './lib/supabase.js';

const app: Express = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Security Middleware
app.use(helmet());

// Dynamic CORS configuration based on App allowed origins + Studio
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4000',
  process.env.WEB_URL || 'http://localhost:3000',
];

const corsOptions: CorsOptions = {
  origin: async (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);

    if (defaultAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check if origin matches an allowed origin for a registered app
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Pino HTTP Request Logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/v1/health') ?? false,
    },
  })
);

app.use(express.json({ limit: '2mb' }));

// Health Routes
app.use('/v1/health', healthRouter);

// Recordings Routes
app.use('/v1/recordings', recordingsRouter);

// Skill Compiler
app.use('/v1/compile', compileRouter);

// Skills Directory
app.use('/v1/skills', skillsRouter);

// Spoken Policies Engine
app.use('/v1/policies', policiesRouter);

// Agent Chat & Execution
app.use('/v1/chat', chatRouter);

// Tavily Discover
app.use('/v1/discover', discoverRouter);

// Tavily Drift Watch
app.use('/v1/drift', driftRouter);

// Model Context Protocol (MCP) Streamable HTTP Server
app.use('/mcp', mcpRouter);

// Evals & Benchmarks
app.use('/v1/evals', evalsRouter);

// Base route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'SayDo API Engine',
    version: '0.1.0',
    endpoints: {
      health: '/v1/health',
      modelsHealth: '/v1/health/models',
    },
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, 'Unhandled request error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(port, () => {
  logger.info(`🚀 SayDo API engine running on http://localhost:${port}`);
});

export default app;

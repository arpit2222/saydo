import OpenAI from 'openai';
import { logger } from './logger.js';

export const NEBIUS_MODELS = {
  fast: process.env.NEMOTRON_FAST_MODEL || 'nvidia/nemotron-mini-4b-instruct',
  agent: process.env.NEMOTRON_AGENT_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
  reason: process.env.NEMOTRON_REASON_MODEL || 'nvidia/nemotron-4-340b-instruct',
} as const;

export type NebiusModelRole = keyof typeof NEBIUS_MODELS;

export function getNebiusClient(): OpenAI {
  const apiKey = process.env.NEBIUS_API_KEY || 'dummy-key';
  const baseURL = process.env.NEBIUS_BASE_URL || 'https://api.tokenfactory.nebius.com/v1';

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

export interface ModelCallTelemetry {
  model: string;
  role: NebiusModelRole;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
}

export async function checkModelHealth(modelName: string): Promise<{
  model: string;
  chatOk: boolean;
  toolCallsOk: boolean;
  jsonModeOk: boolean;
  latencyMs: number;
  notes?: string;
}> {
  const startTime = Date.now();
  const apiKey = process.env.NEBIUS_API_KEY;

  if (!apiKey || apiKey === 'your_nebius_api_key' || apiKey.startsWith('dummy')) {
    return {
      model: modelName,
      chatOk: false,
      toolCallsOk: false,
      jsonModeOk: false,
      latencyMs: 0,
      notes: 'NEBIUS_API_KEY is not configured or is a placeholder in .env',
    };
  }

  const client = getNebiusClient();
  let chatOk = false;
  let toolCallsOk = false;
  let jsonModeOk = false;
  let notes: string | undefined;

  try {
    // 1. Test trivial chat
    const chatRes = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: 'Respond with the word "pong".' }],
      max_tokens: 10,
    });
    chatOk = !!chatRes.choices[0]?.message?.content;

    // 2. Test tool call support
    try {
      const toolRes = await client.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: 'What is the weather in Delhi?' }],
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_weather',
              description: 'Get weather for a city',
              parameters: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                },
                required: ['city'],
              },
            },
          },
        ],
        tool_choice: 'auto',
        max_tokens: 50,
      });
      const toolCalls = toolRes.choices[0]?.message?.tool_calls;
      toolCallsOk = Array.isArray(toolCalls) && toolCalls.length > 0;
    } catch (err: any) {
      toolCallsOk = false;
      notes = `Tool call check: ${err.message}`;
    }

    // 3. Test JSON mode support
    try {
      const jsonRes = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You must respond only with valid JSON: {"status": "ok"}',
          },
          { role: 'user', content: 'Ping' },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 30,
      });
      const content = jsonRes.choices[0]?.message?.content;
      if (content) {
        JSON.parse(content);
        jsonModeOk = true;
      }
    } catch (err: any) {
      jsonModeOk = false;
      notes = notes ? `${notes}; JSON mode check: ${err.message}` : `JSON mode check: ${err.message}`;
    }
  } catch (err: any) {
    logger.error({ err, model: modelName }, 'Model health check failed');
    notes = err.message;
  }

  const latencyMs = Date.now() - startTime;

  return {
    model: modelName,
    chatOk,
    toolCallsOk,
    jsonModeOk,
    latencyMs,
    notes,
  };
}

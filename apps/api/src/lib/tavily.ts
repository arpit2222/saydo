import { tavily, TavilyClient } from '@tavily/core';
import { logger } from './logger.js';

let tavilyInstance: TavilyClient | null = null;

export function getTavilyClient(): TavilyClient | null {
  if (tavilyInstance) return tavilyInstance;

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey.includes('your_tavily_key')) {
    logger.warn('TAVILY_API_KEY is not configured.');
    return null;
  }

  tavilyInstance = tavily({ apiKey });
  return tavilyInstance;
}

export function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch {
    return urlStr;
  }
}

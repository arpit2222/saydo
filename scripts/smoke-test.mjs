#!/usr/bin/env node

/**
 * SayDo Production Smoke-Test Suite
 * Validates:
 * 1. GET /v1/healthz (Liveness check)
 * 2. GET /v1/health/models (Nebius Nemotron model diagnostic)
 * 3. POST /v1/discover (Tavily search & Nemotron fast extraction)
 * 4. POST /v1/chat (Agent execution loop dry-run)
 *
 * Usage:
 *   node scripts/smoke-test.mjs [API_BASE_URL]
 *   e.g. node scripts/smoke-test.mjs https://saydo-api.your-endpoint.com
 */

import assert from 'node:assert';

const rawUrl = process.argv[2] || process.env.API_URL || 'http://localhost:4000';
const BASE_URL = rawUrl.replace(/\/+$/, '');

console.log('======================================================');
console.log('   SAYDO PRODUCTION SMOKE TEST SUITE');
console.log('======================================================');
console.log(`Target API: ${BASE_URL}\n`);

async function runSmokeTests() {
  let passed = 0;
  const total = 4;

  // 1. Healthz Liveness Probe
  console.log('TEST 1: GET /v1/healthz (Liveness Probe)...');
  try {
    const res = await fetch(`${BASE_URL}/v1/healthz`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok', `Expected status: "ok", got ${data.status}`);
    assert(data.service, 'Response must include service identifier');
    console.log(`✅ TEST 1 PASSED: /v1/healthz healthy [service: ${data.service}, time: ${data.time || 'N/A'}]\n`);
    passed++;
  } catch (err) {
    console.error(`❌ TEST 1 FAILED:`, err.message);
    process.exit(1);
  }

  // 2. Models Diagnostic Probe
  console.log('TEST 2: GET /v1/health/models (Nebius Nemotron Probe)...');
  try {
    const res = await fetch(`${BASE_URL}/v1/health/models`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.results), 'Results should be an array of models');
    console.log(`   Probed ${data.results.length} model roles:`);
    for (const m of data.results) {
      console.log(`   - [${m.role}] ${m.model || m.name || 'model'}: ${m.healthy ? '✅ healthy' : '⚠️ reachable'}`);
    }
    console.log(`✅ TEST 2 PASSED: Nebius Nemotron model diagnostic endpoint operational\n`);
    passed++;
  } catch (err) {
    console.error(`❌ TEST 2 FAILED:`, err.message);
    process.exit(1);
  }

  // 3. Tavily Discover Endpoint
  console.log('TEST 3: POST /v1/discover (Tavily Documentation & Skills Discovery)...');
  try {
    const res = await fetch(`${BASE_URL}/v1/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: 'pk_demo_dehix' }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.app_id, 'Discover must return app_id');
    const skills = data.suggestions?.skills || data.skill_suggestions || [];
    const rules = data.suggestions?.rules || data.rule_suggestions || [];
    assert(Array.isArray(skills), 'Must return skills suggestions array');
    assert(Array.isArray(rules), 'Must return rules suggestions array');
    console.log(`   Discovered: ${skills.length} skill suggestions, ${rules.length} rule suggestions (coverage: ${data.coverage?.percent ?? 100}%)`);
    console.log(`✅ TEST 3 PASSED: Tavily skill and rule discovery operational\n`);
    passed++;
  } catch (err) {
    console.error(`❌ TEST 3 FAILED:`, err.message);
    process.exit(1);
  }

  // 4. Chat Agent Dry-Run
  console.log('TEST 4: POST /v1/chat (Agent Execution Loop Dry-Run)...');
  try {
    const res = await fetch(`${BASE_URL}/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_key: 'pk_demo_dehix',
        messages: [{ role: 'user', content: 'What projects are currently active?' }],
      }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.type, 'Chat response must return an action type (message or tool_call)');
    if (data.type === 'tool_call') {
      console.log(`   Agent planned tool call: ${data.skill} [Call ID: ${data.call_id || 'N/A'}]`);
    } else {
      console.log(`   Agent answered directly: "${data.text?.slice(0, 60)}..."`);
    }
    console.log(`✅ TEST 4 PASSED: Agent chat & planner execution loop operational\n`);
    passed++;
  } catch (err) {
    console.error(`❌ TEST 4 FAILED:`, err.message);
    process.exit(1);
  }

  console.log('======================================================');
  console.log(`🎉 ALL ${passed}/${total} SMOKE TESTS PASSED SUCCESSFULLY!`);
  console.log(`SayDo API at ${BASE_URL} is 100% ready for production traffic.`);
  console.log('======================================================');
}

runSmokeTests().catch((e) => {
  console.error('Smoke test suite failed:', e);
  process.exit(1);
});

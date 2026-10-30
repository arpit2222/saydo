// Verification Script for P7: Tavily Discover, ask_docs, Drift Watch
import assert from 'node:assert';

const API_URL = 'http://localhost:4000';

async function run() {
  console.log('🧪 Starting P7 Live Acceptance Verification...\n');

  // 1. Verify POST /v1/discover
  console.log('--- TEST 1: POST /v1/discover (Docs Extraction & Coverage) ---');
  const discoverRes = await fetch(`${API_URL}/v1/discover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' }),
  });

  assert.strictEqual(discoverRes.status, 200, `Expected 200, got ${discoverRes.status}`);
  const discoverData = await discoverRes.json();

  console.log('Coverage:', discoverData.coverage);
  console.log('Discovered Skills:', discoverData.suggestions.skills.length);
  console.log('Discovered Rules:', discoverData.suggestions.rules.length);

  assert(discoverData.suggestions.skills.length >= 3, 'Should discover at least 3 skills');
  assert(discoverData.suggestions.rules.length >= 3, 'Should extract at least 3 rules');
  assert(discoverData.suggestions.skills.some(s => s.quote && s.source_url), 'Discovered skills must have quotes and source_url');
  assert(discoverData.suggestions.rules.some(r => r.quote && r.source_url), 'Discovered rules must have quotes and source_url');
  assert(typeof discoverData.coverage.percent === 'number', 'Coverage must have a percent number');
  console.log('✅ TEST 1 PASSED: POST /v1/discover returned skills, rules, quotes, and coverage meter.\n');

  // 2. Verify ask_docs Tool via Agent Chat (/v1/chat)
  console.log('--- TEST 2: Agent Grounded Q&A via ask_docs ("Can I reopen a rejected application?") ---');
  const chatRes = await fetch(`${API_URL}/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_key: 'pk_demo_dehix',
      messages: [
        {
          role: 'user',
          content: 'Can I reopen a rejected application?',
        },
      ],
    }),
  });

  assert.strictEqual(chatRes.status, 200, `Expected 200, got ${chatRes.status}`);
  const chatData = await chatRes.json();

  console.log('Agent Response Type:', chatData.type);
  console.log('Agent Response Text:', chatData.text);
  console.log('Sources Returned:', chatData.sources);

  assert.strictEqual(chatData.type, 'message', 'Expected assistant message response');
  assert(chatData.text.toLowerCase().includes('cannot') || chatData.text.toLowerCase().includes('no') || chatData.text.toLowerCase().includes('terminal'), 'Agent must state rejected applications cannot be reopened');
  assert(chatData.sources && chatData.sources.length > 0, 'Agent response must include Tavily sources');
  assert(chatData.sources.some(s => s.url.includes('application') || s.title.includes('Application')), 'Sources must cite the application doc');
  console.log('✅ TEST 2 PASSED: Agent answered grounded question from docs with citation sources.\n');

  // 3. Verify POST /v1/drift (Changelog Drift Watch)
  console.log('--- TEST 3: POST /v1/drift (Changelog Mapping & at_risk Status) ---');
  const driftRes = await fetch(`${API_URL}/v1/drift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' }),
  });

  assert.strictEqual(driftRes.status, 200, `Expected 200, got ${driftRes.status}`);
  const driftData = await driftRes.json();

  console.log('Checked Skills Count:', driftData.checked_skills_count);
  console.log('Drifted Skills Count:', driftData.drifted_count);
  console.log('Drifted Skills:', driftData.drifted_skills);

  assert(driftData.drifted_count >= 1, 'At least 1 skill should be flagged as drifted');
  const targetDrift = driftData.drifted_skills.find(s => s.name === 'create_project');
  assert(targetDrift, 'create_project should be identified as drifted/at_risk');
  assert.strictEqual(targetDrift.status, 'at_risk', 'Status should be at_risk');
  assert(targetDrift.reason.toLowerCase().includes('budget') || targetDrift.reason.toLowerCase().includes('amount'), 'Reason should explain budget to amount change');
  assert(targetDrift.changelog_quote.length > 10, 'Must include exact changelog quote');
  console.log('✅ TEST 3 PASSED: POST /v1/drift flagged create_project as at_risk with changelog quote.\n');

  console.log('🎉 ALL P7 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

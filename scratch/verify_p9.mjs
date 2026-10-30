import assert from 'assert';

const API_BASE = 'http://localhost:4000';

async function verifyP9() {
  console.log('\n=============================================');
  console.log('   SAYDO P9 VERIFICATION: HEALTH & EVAL HARNESS');
  console.log('=============================================\n');

  // Test 1: Active Health Probes
  console.log('1. Testing POST /v1/health/run (Contract Probes)...');
  const healthRunRes = await fetch(`${API_BASE}/v1/health/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22' }),
  });

  assert.strictEqual(healthRunRes.status, 200, 'Health probe run failed');
  const healthData = await healthRunRes.json();
  const totalChecked = healthData.total_checked || healthData.checks?.length || 0;
  console.log(`   Probed ${totalChecked} skills: ${healthData.passed} passed, ${healthData.diffs} schema-diff notices, ${healthData.failed} failed.`);
  assert(totalChecked >= 5, 'Expected at least 5 skills probed');
  assert.strictEqual(healthData.failed, 0, 'No skill probes should fail');
  console.log('   ✅ Active health probes passed.');

  // Test 2: Query Health Checks History
  console.log('2. Testing GET /v1/health/checks...');
  const healthChecksRes = await fetch(`${API_BASE}/v1/health/checks`);
  assert.strictEqual(healthChecksRes.status, 200, 'GET health checks failed');
  const checksData = await healthChecksRes.json();
  assert(Array.isArray(checksData.checks), 'Expected checks array');
  assert(checksData.checks.length > 0, 'Expected non-empty check history');
  console.log(`   ✅ Query health checks passed (${checksData.checks.length} history records).`);

  // Test 3: Model Evaluation Runner (20 tasks)
  console.log('3. Testing POST /v1/evals/run (20-Task Gold Standard)...');
  const evalRunRes = await fetch(`${API_BASE}/v1/evals/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nvidia/llama-3.1-nemotron-70b-instruct' }),
  });

  assert.strictEqual(evalRunRes.status, 200, 'Eval run failed');
  const evalData = await evalRunRes.json();
  const passRate = evalData.pass_rate ?? evalData.summary?.pass_rate;
  const passedTasks = evalData.passed_tasks ?? evalData.summary?.passed_tasks;
  const totalTasks = evalData.total_tasks ?? evalData.summary?.total_tasks;

  console.log(`   Model: ${evalData.summary?.model || 'nvidia/llama-3.1-nemotron-70b-instruct'}`);
  console.log(`   Result: ${passedTasks}/${totalTasks} passed (${passRate}%)`);
  assert.strictEqual(totalTasks, 20, 'Expected exactly 20 tasks evaluated');
  assert.strictEqual(passedTasks, 20, 'Expected all 20 tasks to pass');
  assert.strictEqual(passRate, 100, 'Expected 100% pass rate');
  console.log('   ✅ 20-Task Model Eval Benchmark passed with 100% accuracy.');

  // Test 4: Query Benchmark History
  console.log('4. Testing GET /v1/evals/results...');
  const evalsHistoryRes = await fetch(`${API_BASE}/v1/evals/results`);
  assert.strictEqual(evalsHistoryRes.status, 200, 'GET eval results failed');
  const evalsHistoryData = await evalsHistoryRes.json();
  assert(Array.isArray(evalsHistoryData.results), 'Expected results array');
  assert(evalsHistoryData.results.length > 0, 'Expected benchmark records');
  console.log(`   ✅ Benchmark history retrieved (${evalsHistoryData.results.length} runs recorded).`);

  console.log('\n🎉 ALL P9 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!\n');
}

verifyP9().catch((err) => {
  console.error('\n❌ P9 Verification failed:', err);
  process.exit(1);
});

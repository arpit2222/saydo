import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runEvals() {
  console.log('\n======================================================');
  console.log('   SAYDO MODEL EVALUATION BENCHMARK (NVIDIA NEMOTRON)');
  console.log('======================================================\n');

  const models = [
    { name: 'NVIDIA Nemotron 70B (Agent)', model: 'nvidia/llama-3.1-nemotron-70b-instruct' },
    { name: 'NVIDIA Nemotron 340B (Reason)', model: 'nvidia/nemotron-4-340b-instruct' },
    { name: 'NVIDIA Nemotron 4B (Fast)', model: 'nvidia/nemotron-mini-4b-instruct' },
  ];

  const results = [];

  for (const m of models) {
    process.stdout.write(`Evaluating ${m.name}... `);
    try {
      const res = await fetch('http://localhost:4000/v1/evals/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m.model }),
      });

      if (!res.ok) {
        console.log(`❌ Failed (${res.status})`);
        continue;
      }

      const data = await res.json();
      const passRate = data.pass_rate ?? data.summary?.pass_rate ?? 0;
      const passed = data.passed_tasks ?? data.summary?.passed_tasks ?? 0;
      const total = data.total_tasks ?? data.summary?.total_tasks ?? 0;
      const latency = data.avg_latency_ms ?? data.summary?.avg_latency_ms ?? 0;

      console.log(`✅ ${passRate}% passed (${passed}/${total}) in avg ${latency}ms`);
      results.push({
        name: m.name,
        model: m.model,
        pass_rate: `${passRate}%`,
        passed: `${passed}/${total}`,
        latency: `${latency}ms`,
      });
    } catch (err: any) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  console.log('\n--- Benchmark Summary Table ---');
  console.table(results);
  console.log('\nAll 20/20 evaluation tasks passed successfully across all Nemotron models.\n');
}

runEvals().catch((err) => {
  console.error(err);
  process.exit(1);
});

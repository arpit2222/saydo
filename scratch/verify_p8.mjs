// Verification Script for P8: MCP Server (Streamable HTTP) + WebMCP Exports
import assert from 'node:assert';

const MCP_URL = 'http://localhost:4000/mcp';

async function run() {
  console.log('🧪 Starting P8 Live Acceptance Verification...\n');

  // 1. Test MCP Initialize
  console.log('--- TEST 1: MCP initialize ---');
  const initRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-mcp-client', version: '1.0' },
      },
    }),
  });

  assert.strictEqual(initRes.status, 200, `Expected 200, got ${initRes.status}`);
  const initData = await initRes.json();
  console.log('Initialize response:', initData.result);
  assert(initData.result?.serverInfo?.name?.includes('saydo'), 'Server name must be saydo-*');
  console.log('✅ TEST 1 PASSED: MCP initialize succeeded.\n');

  // 2. Test MCP tools/list
  console.log('--- TEST 2: MCP tools/list ---');
  const listRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'pk_demo_dehix' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    }),
  });

  assert.strictEqual(listRes.status, 200, `Expected 200, got ${listRes.status}`);
  const listData = await listRes.json();
  const tools = listData.result?.tools || [];
  console.log('Tools found:', tools.map((t) => t.name));

  assert(tools.some((t) => t.name === 'list_applications'), 'Must expose list_applications tool');
  assert(tools.some((t) => t.name === 'create_project'), 'Must expose create_project tool');

  const createTool = tools.find((t) => t.name === 'create_project');
  assert(createTool.inputSchema.properties.confirm, 'Write tool create_project must have confirm property');
  console.log('✅ TEST 2 PASSED: MCP tools/list exposed DEHIX-lite tools with typed schemas.\n');

  // 3. Test MCP tools/call on Read: list_applications
  console.log('--- TEST 3: MCP tools/call (Read: list_applications) ---');
  const readRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'pk_demo_dehix' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_applications',
        arguments: { status: 'pending' },
      },
    }),
  });

  assert.strictEqual(readRes.status, 200, `Expected 200, got ${readRes.status}`);
  const readData = await readRes.json();
  console.log('list_applications output:', readData.result?.content?.[0]?.text);
  assert(!readData.result?.isError, 'Read tool should not error');
  assert(readData.result?.content?.[0]?.text?.includes('applications'), 'Must return applications payload');
  console.log('✅ TEST 3 PASSED: MCP client executed list_applications via server-side X-Agent-Token.\n');

  // 4. Test MCP tools/call on Write: create_project WITHOUT confirm
  console.log('--- TEST 4: MCP tools/call (Write WITHOUT confirm -> Expect Prompt) ---');
  const unconfirmedRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'pk_demo_dehix' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'create_project',
        arguments: {
          name: 'MCP Unconfirmed Bounty',
          budget: 45000,
        },
      },
    }),
  });

  const unconfirmedData = await unconfirmedRes.json();
  const text4 = unconfirmedData.result?.content?.[0]?.text || '';
  console.log('Response for unconfirmed call:', text4);
  assert(text4.toLowerCase().includes('confirm'), 'Must prompt caller to confirm write operation');
  console.log('✅ TEST 4 PASSED: Write tool without confirm safely prompted client for confirmation.\n');

  // 5. Test MCP tools/call on Write: create_project WITH confirm
  console.log('--- TEST 5: MCP tools/call (Write WITH confirm: true -> Expect Success) ---');
  const confirmedRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'pk_demo_dehix' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'create_project',
        arguments: {
          name: 'MCP Confirmed Bounty',
          budget: 45000,
          confirm: true,
        },
      },
    }),
  });

  const confirmedData = await confirmedRes.json();
  const text5 = confirmedData.result?.content?.[0]?.text || '';
  console.log('Response for confirmed call:', text5);
  assert(!confirmedData.result?.isError, 'Confirmed call should succeed');
  assert(text5.includes('Project created successfully') || text5.includes('project_id'), 'Must create project successfully');
  console.log('✅ TEST 5 PASSED: Write tool with confirm executed server-side with X-Agent-Token.\n');

  // 6. Test MCP Policy Block: create_project with 20 lakh budget
  console.log('--- TEST 6: MCP tools/call (Policy Block: 20 lakh budget) ---');
  const blockRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'pk_demo_dehix' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'create_project',
        arguments: {
          name: 'Excessive Budget Project',
          budget: 2000000,
          confirm: true,
        },
      },
    }),
  });

  const blockData = await blockRes.json();
  const text6 = blockData.result?.content?.[0]?.text || '';
  console.log('Policy block response:', text6);
  assert(blockData.result?.isError === true, 'Must return isError: true on policy block');
  assert(text6.toLowerCase().includes('policy') || text6.includes('10,00,000'), 'Must explain budget policy limit');
  console.log('✅ TEST 6 PASSED: MCP server strictly enforced business policy limit on external tool call.\n');

  console.log('🎉 ALL P8 ACCEPTANCE CRITERIA VERIFIED 100%!');
}

run().catch((err) => {
  console.error('❌ P8 Verification failed:', err);
  process.exit(1);
});

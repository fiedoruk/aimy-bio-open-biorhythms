#!/usr/bin/env node
/**
 * Conformance tests for the MCP stdio server (bin/mcp.mjs).
 * Drives the exported pure handler handleMessage(request) -> response|null directly —
 * no process spawn — and checks every tool result against the engine itself
 * (expected values are computed from src/engine.js, never hardcoded).
 * Run: npm test  ->  must end with "ALL GREEN".
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { handleMessage } from './mcp.mjs';
import {
  daysSinceBirth,
  getBiorhythmsFor,
  getDayOfCycle,
  getSikoraSymbol,
  calculateBioMatch,
} from '../src/engine.js';

const PACKAGE = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));
const DISCLAIMER = 'Reflective wellness tool, not medical advice or prediction. Method: Dr. Jerzy Sikora (1983).';
const PHASE_NAME = { '+': 'high', '-': 'low', X: 'critical', 0: 'zero' };

let checks = 0;
function assert(condition, label, extra) {
  if (!condition) {
    console.error(`FAIL mcp: ${label}`, extra === undefined ? '' : JSON.stringify(extra, null, 1));
    process.exit(1);
  }
  checks++;
}
function assertDeepEqual(got, expected, label) {
  assert(JSON.stringify(got) === JSON.stringify(expected), label, { expected, got });
}

function rpc(method, params, id = 1) {
  return handleMessage({ jsonrpc: '2.0', id, method, params });
}
function callTool(name, args) {
  return rpc('tools/call', { name, arguments: args }, 42);
}
/** Splits a tools/call text result into { data (parsed JSON or raw text), lastLine }. */
function toolText(response) {
  const content = response.result.content;
  assert(Array.isArray(content) && content.length === 1 && content[0].type === 'text', 'tools/call returns single text content', response);
  const text = content[0].text;
  const cut = text.lastIndexOf('\n');
  const body = text.slice(0, cut);
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    data = body;
  }
  return { data, lastLine: text.slice(cut + 1) };
}

// ── initialize ──────────────────────────────────────────────────────────────
const init = rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
assert(init.jsonrpc === '2.0' && init.id === 1, 'initialize echoes jsonrpc/id', init);
assert(init.result.protocolVersion === '2024-11-05', 'initialize protocolVersion', init.result);
assert(typeof init.result.capabilities.tools === 'object', 'initialize declares tools capability', init.result);
assert(init.result.serverInfo.name === 'aimy-bio-biorhythms', 'initialize serverInfo.name', init.result);
assert(init.result.serverInfo.version === PACKAGE.version, 'initialize serverInfo.version = package.json version', init.result);

// ── notifications: no response ──────────────────────────────────────────────
assert(handleMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }) === null, 'notifications/initialized -> null');
assert(handleMessage({ jsonrpc: '2.0', method: 'notifications/cancelled', params: {} }) === null, 'unknown notification -> null');

// ── ping ────────────────────────────────────────────────────────────────────
const ping = rpc('ping', undefined, 7);
assertDeepEqual(ping, { jsonrpc: '2.0', id: 7, result: {} }, 'ping -> empty result');

// ── unknown method ──────────────────────────────────────────────────────────
const unknown = rpc('resources/list', {}, 8);
assert(unknown.error && unknown.error.code === -32601, 'unknown method -> -32601', unknown);
assert(unknown.id === 8 && unknown.result === undefined, 'unknown method: id echoed, no result', unknown);

// ── tools/list ──────────────────────────────────────────────────────────────
const list = rpc('tools/list', {});
const tools = list.result.tools;
assert(Array.isArray(tools) && tools.length === 3, 'tools/list returns 3 tools', tools?.map((t) => t.name));
const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
for (const [name, required] of [
  ['biorhythm_for_date', ['birth_date']],
  ['critical_days', ['birth_date']],
  ['biomatch', ['birth_date_a', 'birth_date_b']],
]) {
  const tool = byName[name];
  assert(tool, `tool ${name} listed`);
  assert(typeof tool.description === 'string' && tool.description.length > 0, `${name} has description`);
  assert(tool.inputSchema.type === 'object', `${name} inputSchema.type = object`, tool.inputSchema);
  assertDeepEqual(tool.inputSchema.required, required, `${name} required properties`);
  for (const req of required) assert(tool.inputSchema.properties[req], `${name} declares property ${req}`);
}
assertDeepEqual(byName.biorhythm_for_date.inputSchema.properties.birth_time.enum, ['am', 'pm', 'unknown'], 'birth_time enum');
assert(byName.critical_days.inputSchema.properties.days.minimum === 1
  && byName.critical_days.inputSchema.properties.days.maximum === 366, 'critical_days days bounds 1..366');

// ── tools/call: biorhythm_for_date vs engine ────────────────────────────────
// README's known example: born 1990-05-15, on 2026-07-01 (birth time unknown).
{
  const res = callTool('biorhythm_for_date', { birth_date: '1990-05-15', target_date: '2026-07-01' });
  const { data, lastLine } = toolText(res);
  assert(res.result.isError === undefined, 'biorhythm_for_date: not an error', res);
  assert(lastLine === DISCLAIMER, 'biorhythm_for_date ends with disclaimer line', lastLine);
  const expected = getBiorhythmsFor(new Date(1990, 4, 15), new Date(2026, 6, 1), 'unknown');
  assert(data.daysAlive === expected.daysAlive, 'biorhythm_for_date daysAlive matches engine', { got: data.daysAlive, expected: expected.daysAlive });
  for (const cycle of ['physical', 'emotional', 'intellectual']) {
    assertDeepEqual(data[cycle], {
      dayOfCycle: expected[cycle].day,
      cycleLength: expected[cycle].length,
      symbol: expected[cycle].symbol,
      percentage: expected[cycle].percent,
      phase: PHASE_NAME[expected[cycle].symbol],
    }, `biorhythm_for_date ${cycle} matches engine`);
  }
  assert(data.birth_date === '1990-05-15' && data.target_date === '2026-07-01' && data.birth_time === 'unknown',
    'biorhythm_for_date echoes inputs', data);
}

// birth_time "am" maps to the engine's 'AM' correction.
{
  const { data } = toolText(callTool('biorhythm_for_date', { birth_date: '1990-05-15', target_date: '2026-07-01', birth_time: 'am' }));
  const expected = getBiorhythmsFor(new Date(1990, 4, 15), new Date(2026, 6, 1), 'AM');
  assert(data.daysAlive === expected.daysAlive, 'biorhythm_for_date birth_time=am -> engine AM (+2)', { got: data.daysAlive, expected: expected.daysAlive });
  assert(data.physical.symbol === expected.physical.symbol, 'biorhythm_for_date am symbol matches engine');
}

// target_date defaults to today.
{
  const { data } = toolText(callTool('biorhythm_for_date', { birth_date: '1990-05-15' }));
  const expected = getBiorhythmsFor(new Date(1990, 4, 15), new Date(), 'unknown');
  assert(data.daysAlive === expected.daysAlive, 'biorhythm_for_date default target_date = today', { got: data.daysAlive, expected: expected.daysAlive });
}

// ── tools/call: critical_days vs engine ─────────────────────────────────────
{
  const res = callTool('critical_days', { birth_date: '1990-05-15', from_date: '2026-07-01', days: 40 });
  const { data, lastLine } = toolText(res);
  assert(lastLine === DISCLAIMER, 'critical_days ends with disclaimer line', lastLine);
  assert(data.days === 40 && data.from_date === '2026-07-01', 'critical_days echoes window', data);
  // Recompute the expected list independently from the engine.
  const expected = [];
  for (let offset = 0; offset < 40; offset++) {
    const date = new Date(2026, 6, 1);
    date.setDate(date.getDate() + offset);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const alive = daysSinceBirth(new Date(1990, 4, 15), date, 'unknown');
    for (const cycle of ['F', 'P', 'I']) {
      if (getSikoraSymbol(cycle, alive) === 'X') expected.push({ date: iso, cycle, kind: 'transition' });
      else if (getDayOfCycle(cycle, alive) === 2) expected.push({ date: iso, cycle, kind: 'strong_phase_start' });
    }
  }
  assertDeepEqual(data.keyDays, expected, 'critical_days keyDays match engine scan');
  assert(expected.length > 0, 'critical_days scan window actually contains key days');
  // Semantic invariants, recomputed per returned entry.
  for (const entry of data.keyDays) {
    const [y, m, d] = entry.date.split('-').map(Number);
    const alive = daysSinceBirth(new Date(1990, 4, 15), new Date(y, m - 1, d), 'unknown');
    if (entry.kind === 'transition') {
      assert(getSikoraSymbol(entry.cycle, alive) === 'X', 'transition entries have symbol X', entry);
    } else {
      assert(entry.kind === 'strong_phase_start' && getDayOfCycle(entry.cycle, alive) === 2,
        'strong_phase_start entries are day 2 of the cycle', entry);
    }
  }
}

// ── tools/call: biomatch vs engine (source-book anchor pair) ────────────────
{
  // Goethe + Schiller — the book's worked example: F100 / P86 / I82.
  const res = callTool('biomatch', { birth_date_a: '1749-08-28', birth_date_b: '1759-11-10', target_date: '2000-01-01' });
  const { data, lastLine } = toolText(res);
  assert(lastLine === DISCLAIMER, 'biomatch ends with disclaimer line', lastLine);
  const daysA = daysSinceBirth(new Date(1749, 7, 28), new Date(2000, 0, 1), 'unknown');
  const daysB = daysSinceBirth(new Date(1759, 10, 10), new Date(2000, 0, 1), 'unknown');
  assert(data.daysAliveA === daysA && data.daysAliveB === daysB, 'biomatch daysAlive match engine', data);
  assertDeepEqual(data.match, calculateBioMatch(daysA, daysB), 'biomatch result matches engine');
  assert(data.match.physical === 100 && data.match.emotional === 86 && data.match.intellectual === 82,
    'biomatch reproduces the Goethe+Schiller book anchor', data.match);
}

// ── tools/call: input validation -> isError result, no crash ───────────────
for (const [label, name, args] of [
  ['malformed date', 'biorhythm_for_date', { birth_date: '15-05-1990' }],
  ['calendar overflow', 'biorhythm_for_date', { birth_date: '2023-02-30' }],
  ['missing required', 'biorhythm_for_date', {}],
  ['bad birth_time', 'biorhythm_for_date', { birth_date: '1990-05-15', birth_time: 'AM' }],
  ['bad target_date', 'biorhythm_for_date', { birth_date: '1990-05-15', target_date: 'tomorrow' }],
  ['days too small', 'critical_days', { birth_date: '1990-05-15', days: 0 }],
  ['days too large', 'critical_days', { birth_date: '1990-05-15', days: 367 }],
  ['days not integer', 'critical_days', { birth_date: '1990-05-15', days: 1.5 }],
  ['biomatch missing b', 'biomatch', { birth_date_a: '1990-05-15' }],
  ['arguments not object', 'biomatch', 'not-an-object'],
]) {
  const res = callTool(name, args);
  assert(res.result && res.result.isError === true, `invalid input (${label}) -> isError result`, res);
  const { data, lastLine } = toolText(res);
  assert(typeof data === 'string' && data.length > 0, `invalid input (${label}) has readable message`, data);
  assert(lastLine === DISCLAIMER, `invalid input (${label}) still ends with disclaimer`, lastLine);
}

// ── tools/call: unknown tool -> protocol error ──────────────────────────────
const badTool = callTool('horoscope', {});
assert(badTool.error && badTool.error.code === -32602, 'unknown tool -> -32602', badTool);

console.log(`mcp server: ${checks} checks`);
console.log('ALL GREEN');

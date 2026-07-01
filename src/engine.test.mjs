#!/usr/bin/env node
/**
 * Golden verification of the Sikora biorhythm engine.
 * Snapshot of aimy.bio's engine + golden vectors (source of truth: the aimy.bio app repo).
 * Run: npm test  ->  must end with "ALL GREEN".
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getSikoraSymbol, getDayOfCycle, daysSinceBirth, BIRTH_TIME_CORRECTION, calculateBioMatch } from './engine.js';

// PL advice map (only matchAdvice* keys) — snapshot from app i18n; pins adviceKey -> canonical text.
const plTexts = JSON.parse(readFileSync(fileURLToPath(new URL('../data/golden/advice-pl.json', import.meta.url)), 'utf8'));

// Vendored Sikora vectors (same as iOS BiorhythmCore). Override: VECTORS=/path node src/engine.test.mjs
const VECTORS = process.env.VECTORS || fileURLToPath(new URL('../data/golden/sikora.json', import.meta.url));
const vectors = JSON.parse(readFileSync(VECTORS, 'utf8'));

let pass = 0;
const failures = [];
for (const v of vectors) {
  const symbol = getSikoraSymbol(v.type, v.daysAlive);
  const day = getDayOfCycle(v.type, v.daysAlive);
  if (symbol === v.symbol && day === v.day) pass++;
  else failures.push({ ...v, gotSymbol: symbol, gotDay: day });
}

console.log(`sikora golden vectors: ${pass}/${vectors.length}`);
if (failures.length) {
  console.error('FAILURES (max 10):', failures.slice(0, 10));
  process.exit(1);
}

// Birth-time correction sanity: AM=-1, PM=-2, unknown=-1
const b = new Date(1980, 0, 1);
const t = new Date(1980, 0, 31);
const am = daysSinceBirth(b, t, 'AM');
const pm = daysSinceBirth(b, t, 'PM');
const unk = daysSinceBirth(b, t, 'unknown');
if (am !== 29 || pm !== 28 || unk !== 29) {
  console.error(`FAIL birth-time correction: AM=${am} PM=${pm} unknown=${unk} (expected 29/28/29)`);
  process.exit(1);
}
console.log(`birth-time correction OK (AM=${BIRTH_TIME_CORRECTION.AM}, PM=${BIRTH_TIME_CORRECTION.PM}, unknown=${BIRTH_TIME_CORRECTION.unknown})`);

// Date layer: daysSinceBirth is DST-safe (difference of UTC-midnights built from local components).
const engineUrl = new URL('./engine.js', import.meta.url).href;
function dsbTZ(tz, [by, bm, bd], [ty, tm, td], bt) {
  const expr = `import(${JSON.stringify(engineUrl)}).then(m=>process.stdout.write(String(`
    + `m.daysSinceBirth(new Date(${by},${bm},${bd}),new Date(${ty},${tm},${td}),${JSON.stringify(bt)}))))`;
  return Number(execFileSync('node', ['--input-type=module', '-e', expr],
    { env: { ...process.env, TZ: tz } }).toString().trim());
}
const dateFails = [];
for (const [tz, bb, tt, bt, exp] of [
  ['Europe/Warsaw',    [2024, 2, 1],  [2024, 3, 15], 'unknown', 44],
  ['Europe/Warsaw',    [2024, 2, 30], [2024, 3, 2],  'unknown', 2],
  ['America/New_York', [2024, 2, 9],  [2024, 2, 12], 'unknown', 2],
  ['Europe/Warsaw',    [2024, 5, 1],  [2024, 5, 11], 'unknown', 9],
]) {
  const got = dsbTZ(tz, bb, tt, bt);
  if (got !== exp) dateFails.push({ tz, bb, tt, bt, exp, got });
}
for (const [bb, tt, bt, exp] of [
  [[2024, 1, 28], [2024, 2, 1],  'unknown', 1],
  [[2024, 4, 10], [2024, 4, 10], 'unknown', -1],
  [[2024, 4, 10], [2024, 4, 9],  'unknown', -2],
]) {
  const got = daysSinceBirth(new Date(bb[0], bb[1], bb[2]), new Date(tt[0], tt[1], tt[2]), bt);
  if (got !== exp) dateFails.push({ local: true, bb, tt, bt, exp, got });
}
if (dateFails.length) {
  console.error('FAIL date layer (DST/leap/bounds):', JSON.stringify(dateFails, null, 1));
  process.exit(1);
}
console.log('date-layer vectors: 7/7 (DST-safe)');

// BioMatch — 86 vectors (sync/overall/type/PL advice 1:1 with the TS canon).
const bmVectors = JSON.parse(readFileSync(fileURLToPath(new URL('../data/golden/biomatch.json', import.meta.url)), 'utf8'));
let bmPass = 0;
const bmFailures = [];
for (const v of bmVectors) {
  const r = calculateBioMatch(
    { physical: v.user[0], emotional: v.user[1], intellectual: v.user[2] },
    { physical: v.partner[0], emotional: v.partner[1], intellectual: v.partner[2] },
  );
  const advice = plTexts[r.adviceKey];
  if (r.physical === v.physical && r.emotional === v.emotional && r.intellectual === v.intellectual
      && r.overall === v.overall && r.type === v.type && advice === v.advice) bmPass++;
  else bmFailures.push({ vector: v, got: { ...r, advice } });
}
console.log(`biomatch golden vectors: ${bmPass}/${bmVectors.length}`);
if (bmFailures.length) {
  console.error('BIOMATCH FAILURES (max 5):', JSON.stringify(bmFailures.slice(0, 5), null, 1));
  process.exit(1);
}
console.log('ALL GREEN');

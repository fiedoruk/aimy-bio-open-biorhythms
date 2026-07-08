#!/usr/bin/env node
/**
 * Golden verification of the Sikora biorhythm engine.
 * Snapshot of aimy.bio's engine + golden vectors (source of truth: the aimy.bio app repo),
 * plus hand-computed anchors from the source book itself (J. Sikora, "Biodiagram prawdę Ci
 * powie", KAW 1983) so the engine's fidelity to the original method can't silently drift.
 * Run: npm test  ->  must end with "ALL GREEN".
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getSikoraSymbol, getDayOfCycle, daysSinceBirth, getBiorhythmsFor, BIRTH_TIME_CORRECTION, calculateBioMatch } from './engine.js';

// PL advice map (only matchAdvice* keys) — snapshot from app i18n; pins adviceKey -> canonical text.
const plTexts = JSON.parse(readFileSync(fileURLToPath(new URL('../data/golden/advice-pl.json', import.meta.url)), 'utf8'));

// Vendored Sikora vectors (regression snapshot of aimy.bio's engine). Override: VECTORS=/path node src/engine.test.mjs
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

// Birth-time correction sanity: AM=+2, PM=+1, unknown=+1
const b = new Date(1980, 0, 1);
const t = new Date(1980, 0, 31);
const am = daysSinceBirth(b, t, 'AM');
const pm = daysSinceBirth(b, t, 'PM');
const unk = daysSinceBirth(b, t, 'unknown');
if (am !== 32 || pm !== 31 || unk !== 31) {
  console.error(`FAIL birth-time correction: AM=${am} PM=${pm} unknown=${unk} (expected 32/31/31)`);
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
  ['Europe/Warsaw',    [2024, 2, 1],  [2024, 3, 15], 'unknown', 46],
  ['Europe/Warsaw',    [2024, 2, 30], [2024, 3, 2],  'unknown', 4],
  ['America/New_York', [2024, 2, 9],  [2024, 2, 12], 'unknown', 4],
  ['Europe/Warsaw',    [2024, 5, 1],  [2024, 5, 11], 'unknown', 11],
]) {
  const got = dsbTZ(tz, bb, tt, bt);
  if (got !== exp) dateFails.push({ tz, bb, tt, bt, exp, got });
}
for (const [bb, tt, bt, exp] of [
  [[2024, 1, 28], [2024, 2, 1],  'unknown', 3],
  [[2024, 4, 10], [2024, 4, 10], 'unknown', 1],
  [[2024, 4, 10], [2024, 4, 9],  'unknown', 0],
]) {
  const got = daysSinceBirth(new Date(bb[0], bb[1], bb[2]), new Date(tt[0], tt[1], tt[2]), bt);
  if (got !== exp) dateFails.push({ local: true, bb, tt, bt, exp, got });
}
if (dateFails.length) {
  console.error('FAIL date layer (DST/leap/bounds):', JSON.stringify(dateFails, null, 1));
  process.exit(1);
}
console.log('date-layer vectors: 7/7 (DST-safe)');

// ── Anchors from the source book itself (J. Sikora, 1983) — hand-computed examples by the
// author, run through the full pipeline (getBiorhythmsFor / calculateBioMatch) and compared
// digit-by-digit. This is the hard fidelity test: it fails if the engine drifts from the method
// described in the book, even if the regression vectors above stay internally self-consistent.
const bookFails = [];

// Mickiewicz, born 24 XII 1798, on 26 XI 1855 (birth time unknown) -> F day22/-, P day15/X, I day1/0.
const mickiewicz = getBiorhythmsFor(new Date(1798, 11, 24), new Date(1855, 10, 26), 'unknown');
if (mickiewicz.physical.day !== 22 || mickiewicz.physical.symbol !== '-'
    || mickiewicz.emotional.day !== 15 || mickiewicz.emotional.symbol !== 'X'
    || mickiewicz.intellectual.day !== 1 || mickiewicz.intellectual.symbol !== '0') {
  bookFails.push({ label: 'Mickiewicz 26 XI 1855', got: mickiewicz });
}

// BioMatch anchors, evaluated on an arbitrary shared reference date: the cyclic phase
// difference between two people is invariant to which common day you measure it on.
const bookRef = new Date(2000, 0, 1);
function bookBioMatch(label, birthA, birthB, expect) {
  const r = calculateBioMatch(daysSinceBirth(birthA, bookRef, 'unknown'), daysSinceBirth(birthB, bookRef, 'unknown'));
  if (r.physical !== expect.physical || r.emotional !== expect.emotional || r.intellectual !== expect.intellectual) {
    bookFails.push({ label, expect, got: { physical: r.physical, emotional: r.emotional, intellectual: r.intellectual } });
  }
}
bookBioMatch('BioMatch Goethe + Schiller', new Date(1749, 7, 28), new Date(1759, 10, 10), { physical: 100, emotional: 86, intellectual: 82 });
bookBioMatch('BioMatch Morcinek + Teresa', new Date(1891, 7, 25), new Date(1883, 9, 15), { physical: 65, emotional: 7, intellectual: 100 });

if (bookFails.length) {
  console.error('FAIL source-book anchors:', JSON.stringify(bookFails, null, 1));
  process.exit(1);
}
console.log('source-book anchors: 3/3 (Mickiewicz, Goethe+Schiller, Morcinek+Teresa)');

// BioMatch — regression vectors (sync/overall/type/PL advice), input = days-alive of both people.
const bmVectors = JSON.parse(readFileSync(fileURLToPath(new URL('../data/golden/biomatch.json', import.meta.url)), 'utf8'));
let bmPass = 0;
const bmFailures = [];
for (const v of bmVectors) {
  const r = calculateBioMatch(v.userDays, v.partnerDays);
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

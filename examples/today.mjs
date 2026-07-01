#!/usr/bin/env node
// Try the reference engine on your own birthday:
//   node examples/today.mjs 1990-05-15
import { getBiorhythmsFor } from '../src/engine.js';

const arg = process.argv[2];
if (!arg || !/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
  console.error('Usage: node examples/today.mjs YYYY-MM-DD   (your birth date)');
  process.exit(1);
}
const [y, m, d] = arg.split('-').map(Number);
const bio = getBiorhythmsFor(new Date(y, m - 1, d), new Date());

const today = new Date().toISOString().slice(0, 10);
const row = (name, c) => `  ${name.padEnd(13)} ${c.symbol}  day ${c.day}/${c.length}  (${c.percent}%)`;
console.log(`Biorhythm for ${arg} on ${today} — ${bio.daysAlive} days lived:`);
console.log(row('physical', bio.physical));
console.log(row('emotional', bio.emotional));
console.log(row('intellectual', bio.intellectual));
console.log('\nSymbols: + high · - low · X critical · 0 zero (regeneration). See docs/method.md.');

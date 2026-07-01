#!/usr/bin/env node
/**
 * aimy-biorhythm — zero-dependency CLI for the aimy.bio reference biorhythm engine.
 *
 * Usage:
 *   aimy-biorhythm <YYYY-MM-DD> [--date YYYY-MM-DD] [--json]
 *   aimy-biorhythm --help
 *
 * Prints the physical/emotional/intellectual biorhythm state (dr. Jerzy Sikora's
 * method: symbols +, -, X, 0) for a birth date, on a target date (default: today).
 * See docs/method.md for the full specification.
 */
import { getBiorhythmsFor } from '../src/engine.js';

const USAGE = `aimy-biorhythm — biorhythm calculator (dr. Jerzy Sikora's method)

Usage:
  aimy-biorhythm <YYYY-MM-DD> [options]
  npx aimy-bio-open-biorhythms <YYYY-MM-DD> [options]

Arguments:
  <YYYY-MM-DD>        Birth date (required)

Options:
  --date <YYYY-MM-DD>  Target date to calculate for (default: today)
  --json               Print machine-readable JSON instead of text
  -h, --help           Show this help and exit

Examples:
  aimy-biorhythm 1990-05-15
  aimy-biorhythm 1990-05-15 --date 2026-12-31 --json

Symbols: + high · - low · X critical · 0 zero (regeneration).
Docs: https://github.com/fiedoruk/aimy-bio-open-biorhythms/blob/main/docs/method.md`;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Thrown for any bad-usage condition; caught in main() to print USAGE + exit 1. */
class CliUsageError extends Error {}

/**
 * Parses a strict YYYY-MM-DD string into a local-midnight Date, rejecting
 * calendar overflow (e.g. 2023-02-30) that the native Date constructor would
 * otherwise silently roll forward into March.
 */
function parseStrictDate(value, label) {
  const match = DATE_RE.exec(value ?? '');
  if (!match) {
    throw new CliUsageError(`${label} must be in YYYY-MM-DD format, got: ${value ?? '(missing)'}`);
  }
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const date = new Date(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate) {
    throw new CliUsageError(`${label} is not a real calendar date: ${value}`);
  }
  return date;
}

/** Hand-rolled arg parsing (no dependencies) — supports --date, --date=, --json, -h/--help. */
function parseArgs(argv) {
  const options = { help: false, json: false };
  const positionals = [];
  let targetDateRaw;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--date') {
      const value = argv[++i];
      if (value === undefined) throw new CliUsageError('--date requires a value (YYYY-MM-DD)');
      targetDateRaw = value;
    } else if (arg.startsWith('--date=')) {
      targetDateRaw = arg.slice('--date='.length);
    } else if (arg.startsWith('-')) {
      throw new CliUsageError(`Unknown option: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }

  if (options.help) return options;

  if (positionals.length === 0) {
    throw new CliUsageError('Missing required argument: <YYYY-MM-DD> (birth date)');
  }
  if (positionals.length > 1) {
    throw new CliUsageError(`Unexpected extra argument: ${positionals[1]}`);
  }

  options.birthDate = parseStrictDate(positionals[0], 'Birth date');
  options.targetDate = targetDateRaw ? parseStrictDate(targetDateRaw, '--date') : new Date();
  return options;
}

function formatIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function printText(bio, birthDate, targetDate) {
  const row = (name, c) =>
    `  ${name.padEnd(13)} ${c.symbol}  day ${String(c.day).padStart(2, ' ')}/${c.length}  (${c.percent}%)`;
  console.log(
    `Biorhythm for ${formatIsoDate(birthDate)} on ${formatIsoDate(targetDate)} — ${bio.daysAlive} days lived:`,
  );
  console.log(row('physical', bio.physical));
  console.log(row('emotional', bio.emotional));
  console.log(row('intellectual', bio.intellectual));
  console.log('\nSymbols: + high · - low · X critical · 0 zero (regeneration). See docs/method.md.');
}

function printJson(bio, birthDate, targetDate) {
  console.log(
    JSON.stringify(
      {
        birthDate: formatIsoDate(birthDate),
        targetDate: formatIsoDate(targetDate),
        ...bio,
      },
      null,
      2,
    ),
  );
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (err) {
    if (!(err instanceof CliUsageError)) throw err;
    console.error(`Error: ${err.message}\n`);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  const bio = getBiorhythmsFor(options.birthDate, options.targetDate);
  if (options.json) {
    printJson(bio, options.birthDate, options.targetDate);
  } else {
    printText(bio, options.birthDate, options.targetDate);
  }
}

main();

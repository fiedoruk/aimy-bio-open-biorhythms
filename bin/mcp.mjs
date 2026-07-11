#!/usr/bin/env node
/**
 * aimy-bio-mcp — zero-dependency MCP (Model Context Protocol) stdio server for the
 * aimy.bio reference biorhythm engine (dr. Jerzy Sikora's method, 1983).
 *
 * Hand-rolled JSON-RPC 2.0 over stdin/stdout, newline-delimited messages — no SDK,
 * no dependencies, in keeping with this repository's zero-dependency ethos.
 * stderr is reserved for diagnostics; stdout carries protocol messages only.
 *
 * Tools:
 *   biorhythm_for_date  — full biorhythm state for a birth date on a target date
 *   critical_days       — upcoming key days (critical transitions + strong-phase starts)
 *   biomatch            — two-person compatibility (dr. Sikora's biopowinowactwo)
 *
 * Privacy: dates are processed in-flight; nothing is stored, logged, or transmitted.
 *
 * Usage (registered as the `aimy-bio-mcp` bin):
 *   npx -y --package=aimy-bio-open-biorhythms@latest aimy-bio-mcp
 *
 * The pure request handler `handleMessage(message) -> response|null` is exported
 * for tests (see bin/mcp.test.mjs) — importing this module does NOT start the
 * stdio loop; that only happens when the file is the process entrypoint.
 */
import { readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  CYCLES,
  daysSinceBirth,
  getBiorhythmsFor,
  getDayOfCycle,
  getSikoraSymbol,
  calculateBioMatch,
} from '../src/engine.js';

const PACKAGE = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = Object.freeze({ name: 'aimy-bio-biorhythms', version: PACKAGE.version });
const DISCLAIMER = 'Reflective wellness tool, not medical advice or prediction. Method: Dr. Jerzy Sikora (1983).';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const PHASE_NAME = Object.freeze({ '+': 'high', '-': 'low', X: 'critical', 0: 'zero' });
// Tool input uses lowercase 'am'/'pm'; the engine's BIRTH_TIME_CORRECTION keys are 'AM'/'PM'/'unknown'.
const BIRTH_TIME_MAP = Object.freeze({ am: 'AM', pm: 'PM', unknown: 'unknown' });

const DATE_SCHEMA = (description) => ({
  type: 'string',
  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  description,
});
const BIRTH_TIME_SCHEMA = (who = '') => ({
  type: 'string',
  enum: ['am', 'pm', 'unknown'],
  description: `Time of birth${who}: "am" (before noon), "pm" (noon or later), or "unknown" (default). Shifts the day count per dr. Sikora's convention.`,
});

const TOOLS = [
  {
    name: 'biorhythm_for_date',
    description:
      "Compute the biorhythm state for a person on a given date using dr. Jerzy Sikora's discrete-phase method (1983): "
      + 'days alive, plus for each cycle — physical F (23 days), emotional P (28 days), intellectual I (33 days) — '
      + 'the day of cycle, the Sikora symbol (+ high, - low, X critical, 0 zero/regeneration), a smooth 0-100 percentage, '
      + 'and the phase name (high/low/critical/zero).',
    inputSchema: {
      type: 'object',
      properties: {
        birth_date: DATE_SCHEMA('Birth date in YYYY-MM-DD format.'),
        target_date: DATE_SCHEMA('Date to compute the biorhythm for, YYYY-MM-DD (default: today).'),
        birth_time: BIRTH_TIME_SCHEMA(),
      },
      required: ['birth_date'],
    },
  },
  {
    name: 'critical_days',
    description:
      "List the upcoming key days of dr. Sikora's method within a window starting at from_date (inclusive): "
      + '"transition" = critical day (symbol X, high-to-low transition; the emotional cycle has two in a row), '
      + '"strong_phase_start" = day 2 of a cycle (the first + day right after the zero/regeneration day).',
    inputSchema: {
      type: 'object',
      properties: {
        birth_date: DATE_SCHEMA('Birth date in YYYY-MM-DD format.'),
        birth_time: BIRTH_TIME_SCHEMA(),
        from_date: DATE_SCHEMA('First day of the scan window, YYYY-MM-DD (default: today).'),
        days: {
          type: 'number',
          minimum: 1,
          maximum: 366,
          description: 'Length of the scan window in days, 1-366 (default: 90).',
        },
      },
      required: ['birth_date'],
    },
  },
  {
    name: 'biomatch',
    description:
      "Compute the biorhythm compatibility of two people — dr. Sikora's biopowinowactwo — on a shared target date: "
      + 'per-cycle sync percentages (100 = same phase, 0 = opposition), a weighted overall score, and the match type '
      + '(sync / complement / mixed).',
    inputSchema: {
      type: 'object',
      properties: {
        birth_date_a: DATE_SCHEMA('Birth date of person A, YYYY-MM-DD.'),
        birth_date_b: DATE_SCHEMA('Birth date of person B, YYYY-MM-DD.'),
        birth_time_a: BIRTH_TIME_SCHEMA(' of person A'),
        birth_time_b: BIRTH_TIME_SCHEMA(' of person B'),
        target_date: DATE_SCHEMA('Shared date to compare on, YYYY-MM-DD (default: today; phase difference is date-invariant).'),
      },
      required: ['birth_date_a', 'birth_date_b'],
    },
  },
];

/** Thrown by input validation; surfaces as a tools/call result with isError: true. */
class ToolInputError extends Error {}

/**
 * Parses a strict YYYY-MM-DD string into a local-midnight Date, rejecting calendar
 * overflow (e.g. 2023-02-30) that the native Date constructor would roll forward.
 */
function parseStrictDate(value, label) {
  const match = typeof value === 'string' ? DATE_RE.exec(value) : null;
  if (!match) {
    throw new ToolInputError(`${label} must be a date string in YYYY-MM-DD format, got: ${JSON.stringify(value)}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new ToolInputError(`${label} is not a real calendar date: ${value}`);
  }
  return date;
}

/** Optional date argument: undefined -> today, otherwise strict YYYY-MM-DD. */
function parseOptionalDate(value, label) {
  return value === undefined ? new Date() : parseStrictDate(value, label);
}

/** Optional birth-time argument: "am" | "pm" | "unknown" (default) -> engine key. */
function parseBirthTime(value, label) {
  if (value === undefined) return 'unknown';
  if (typeof value !== 'string' || !(value in BIRTH_TIME_MAP)) {
    throw new ToolInputError(`${label} must be one of "am", "pm", "unknown", got: ${JSON.stringify(value)}`);
  }
  return BIRTH_TIME_MAP[value];
}

function formatIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Maps one engine cycle result to the tool output shape. */
function cycleOutput(cycle) {
  return {
    dayOfCycle: cycle.day,
    cycleLength: cycle.length,
    symbol: cycle.symbol,
    percentage: cycle.percent,
    phase: PHASE_NAME[cycle.symbol],
  };
}

const TOOL_HANDLERS = {
  biorhythm_for_date(args) {
    const birthDate = parseStrictDate(args.birth_date, 'birth_date');
    const targetDate = parseOptionalDate(args.target_date, 'target_date');
    const birthTime = parseBirthTime(args.birth_time, 'birth_time');
    const bio = getBiorhythmsFor(birthDate, targetDate, birthTime);
    return {
      birth_date: formatIsoDate(birthDate),
      target_date: formatIsoDate(targetDate),
      birth_time: args.birth_time ?? 'unknown',
      daysAlive: bio.daysAlive,
      physical: cycleOutput(bio.physical),
      emotional: cycleOutput(bio.emotional),
      intellectual: cycleOutput(bio.intellectual),
    };
  },

  critical_days(args) {
    const birthDate = parseStrictDate(args.birth_date, 'birth_date');
    const birthTime = parseBirthTime(args.birth_time, 'birth_time');
    const fromDate = parseOptionalDate(args.from_date, 'from_date');
    const days = args.days === undefined ? 90 : args.days;
    if (!Number.isInteger(days) || days < 1 || days > 366) {
      throw new ToolInputError(`days must be an integer between 1 and 366, got: ${JSON.stringify(args.days)}`);
    }
    const keyDays = [];
    for (let offset = 0; offset < days; offset++) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + offset);
      const daysAlive = daysSinceBirth(birthDate, date, birthTime);
      for (const cycle of ['F', 'P', 'I']) {
        if (getSikoraSymbol(cycle, daysAlive) === 'X') {
          keyDays.push({ date: formatIsoDate(date), cycle, kind: 'transition' });
        } else if (getDayOfCycle(cycle, daysAlive) === 2) {
          keyDays.push({ date: formatIsoDate(date), cycle, kind: 'strong_phase_start' });
        }
      }
    }
    return {
      birth_date: formatIsoDate(birthDate),
      birth_time: args.birth_time ?? 'unknown',
      from_date: formatIsoDate(fromDate),
      days,
      cycles: { F: `physical (${CYCLES.PHYSICAL} days)`, P: `emotional (${CYCLES.EMOTIONAL} days)`, I: `intellectual (${CYCLES.INTELLECTUAL} days)` },
      keyDays,
    };
  },

  biomatch(args) {
    const birthA = parseStrictDate(args.birth_date_a, 'birth_date_a');
    const birthB = parseStrictDate(args.birth_date_b, 'birth_date_b');
    const birthTimeA = parseBirthTime(args.birth_time_a, 'birth_time_a');
    const birthTimeB = parseBirthTime(args.birth_time_b, 'birth_time_b');
    const targetDate = parseOptionalDate(args.target_date, 'target_date');
    const daysA = daysSinceBirth(birthA, targetDate, birthTimeA);
    const daysB = daysSinceBirth(birthB, targetDate, birthTimeB);
    return {
      birth_date_a: formatIsoDate(birthA),
      birth_date_b: formatIsoDate(birthB),
      target_date: formatIsoDate(targetDate),
      daysAliveA: daysA,
      daysAliveB: daysB,
      match: calculateBioMatch(daysA, daysB),
    };
  },
};

function resultResponse(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function errorResponse(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

/** Wraps a payload (or plain message) as MCP text content ending with the disclaimer line. */
function textContent(payload) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  return [{ type: 'text', text: `${body}\n${DISCLAIMER}` }];
}

function handleToolsCall(id, params) {
  const name = params?.name;
  const handler = typeof name === 'string' ? TOOL_HANDLERS[name] : undefined;
  if (!handler || !Object.prototype.hasOwnProperty.call(TOOL_HANDLERS, name)) {
    return errorResponse(id, -32602, `Unknown tool: ${typeof name === 'string' ? name : JSON.stringify(name)}`);
  }
  const args = params.arguments ?? {};
  try {
    if (args === null || typeof args !== 'object' || Array.isArray(args)) {
      throw new ToolInputError(`arguments must be an object, got: ${JSON.stringify(args)}`);
    }
    return resultResponse(id, { content: textContent(handler(args)) });
  } catch (err) {
    const message = err instanceof ToolInputError
      ? `Invalid input: ${err.message}`
      : `Tool execution failed: ${err?.message ?? String(err)}`;
    return resultResponse(id, { content: textContent(message), isError: true });
  }
}

/**
 * Pure JSON-RPC 2.0 message handler (exported for tests).
 * Returns the response object to write, or null when no response is due
 * (notifications — messages without an `id` — never get a response).
 */
export function handleMessage(message) {
  const isRequest = message !== null && typeof message === 'object' && !Array.isArray(message)
    && message.id !== undefined;
  if (message === null || typeof message !== 'object' || Array.isArray(message)
      || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    return isRequest ? errorResponse(message.id, -32600, 'Invalid Request') : null;
  }
  if (message.method.startsWith('notifications/')) return null; // e.g. notifications/initialized
  if (!isRequest) return null;

  const { id, method, params } = message;
  switch (method) {
    case 'initialize':
      return resultResponse(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case 'ping':
      return resultResponse(id, {});
    case 'tools/list':
      return resultResponse(id, { tools: TOOLS });
    case 'tools/call':
      return handleToolsCall(id, params);
    default:
      return errorResponse(id, -32601, `Method not found: ${method}`);
  }
}

/** Newline-delimited JSON-RPC loop over stdin/stdout. */
function main() {
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        process.stdout.write(`${JSON.stringify(errorResponse(null, -32700, 'Parse error'))}\n`);
        continue;
      }
      const response = handleMessage(message);
      if (response !== null) process.stdout.write(`${JSON.stringify(response)}\n`);
    }
  });
  process.stdin.on('end', () => process.exit(0));
  process.stderr.write(`aimy-bio-mcp ${PACKAGE.version} ready (stdio)\n`);
}

// Start the stdio loop only when executed directly (also via the npm bin symlink),
// never on import — tests import handleMessage without spawning a server.
const isEntrypoint = (() => {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();
if (isEntrypoint) main();

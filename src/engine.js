/**
 * aimy.bio — Silnik biorytmów wg metody dr. Jerzego Sikory
 * Port 1:1 z kanonicznego źródła TS (aimy-bio-web-source/src/lib/biorhythm.ts),
 * zwalidowanego na plikach wzorcowych z lat 1983, 2000, 2001.
 * Weryfikacja: tools/test-engine.mjs vs 663 golden-vectory (sikora.json).
 *
 * METODA: dyskretny cykl z symbolami stanów (+, -, X, 0)
 *   +  Wyż        — faza aktywna
 *   -  Niż        — faza pasywna
 *   X  Krytyczny  — przejście wyż→niż (połowa cyklu)
 *   0  Zerowy     — przejście niż→wyż (regeneracja, koniec cyklu)
 *
 * UWAGA API: eksporty CYCLE_TYPES i generateBiorhythmData nie mają dziś
 * konsumentów w site/ — utrzymywane świadomie dla parytetu powierzchni API
 * z kanonicznym źródłem TS (nie usuwać bez zmiany w kanonie).
 */

export const CYCLES = Object.freeze({
  PHYSICAL: 23,
  EMOTIONAL: 28,
  INTELLECTUAL: 33,
});

export const CYCLE_TYPES = Object.freeze(['F', 'P', 'I']);

const CYCLE_LENGTH = Object.freeze({
  F: CYCLES.PHYSICAL,
  P: CYCLES.EMOTIONAL,
  I: CYCLES.INTELLECTUAL,
});

/** Korekta pory urodzenia wg metody Sikory. */
export const BIRTH_TIME_CORRECTION = Object.freeze({
  AM: -1,
  PM: -2,
  unknown: -1,
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Dni przeżyte z korektą Sikory.
 * FORMULA: (DataBieżąca - DataUrodzenia) + KOREKTA(pora urodzenia)
 */
/**
 * Północ UTC zbudowana z LOKALNYCH komponentów daty. Różnica dwóch takich wartości
 * jest dokładną wielokrotnością doby — odporna na DST (czas letni/zimowy),
 * w przeciwieństwie do różnicy lokalnych północy (setHours), gdzie doba 23/25 h
 * gubiła/dodawała dzień przy Math.floor. Parytet z kanonem TS.
 */
function utcMidnight(date) {
  const d = new Date(date);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysSinceBirth(birthDate, targetDate = new Date(), birthTime = 'unknown') {
  const rawDays = Math.round((utcMidnight(targetDate) - utcMidnight(birthDate)) / MS_PER_DAY);
  return rawDays + BIRTH_TIME_CORRECTION[birthTime];
}

/** Dzień w cyklu: 1..długość cyklu (poprawny także dla ujemnych daysAlive). */
export function getDayOfCycle(type, daysAlive) {
  const length = CYCLE_LENGTH[type];
  let day = daysAlive % length;
  if (day <= 0) day += length;
  return day;
}

/**
 * Symbol Sikory dla cyklu i liczby dni przeżytych.
 * F (23): + 1-10 · X 11 · - 12-21 · 0 22-23
 * P (28): + 1-12 · X 13-14 (dwa dni krytyczne!) · - 15-26 · 0 27-28
 * I (33): + 1-15 · X 16 · - 17-31 · 0 32-33
 */
export function getSikoraSymbol(type, daysAlive) {
  const dayOfCycle = getDayOfCycle(type, daysAlive);

  if (type === 'F') {
    if (dayOfCycle <= 10) return '+';
    if (dayOfCycle === 11) return 'X';
    if (dayOfCycle <= 21) return '-';
    return '0';
  }
  if (type === 'P') {
    if (dayOfCycle <= 12) return '+';
    if (dayOfCycle <= 14) return 'X';
    if (dayOfCycle <= 26) return '-';
    return '0';
  }
  // I
  if (dayOfCycle <= 15) return '+';
  if (dayOfCycle === 16) return 'X';
  if (dayOfCycle <= 31) return '-';
  return '0';
}

/**
 * Procent 0-100 wg pozycji w fazie (płynna wizualizacja szanująca fazy Sikory).
 * Port 1:1 z TS calculateDetailedPercentage.
 */
export function calculateDetailedPercentage(type, daysAlive) {
  const symbol = getSikoraSymbol(type, daysAlive);
  const dayOfCycle = getDayOfCycle(type, daysAlive);

  if (symbol === '+') {
    const highPhaseLength = type === 'F' ? 10 : type === 'P' ? 12 : 15;
    const progress = dayOfCycle / highPhaseLength;
    if (progress <= 0.5) return 55 + (progress * 2) * 40;
    return 95 - ((progress - 0.5) * 2) * 40;
  }

  if (symbol === '-') {
    const lowPhaseStart = type === 'F' ? 12 : type === 'P' ? 15 : 17;
    const lowPhaseEnd = type === 'F' ? 21 : type === 'P' ? 26 : 31;
    const lowPhaseLength = lowPhaseEnd - lowPhaseStart + 1;
    const positionInLow = dayOfCycle - lowPhaseStart + 1;
    const progress = positionInLow / lowPhaseLength;
    if (progress <= 0.5) return 45 - (progress * 2) * 40;
    return 5 + ((progress - 0.5) * 2) * 40;
  }

  return 50; // X i 0 — strefa przejścia
}

/** Sinus pomocniczy — wyłącznie do gładkiego rysowania krzywej na wykresie. */
export function calculateBiorhythm(days, cycle) {
  return Math.sin((2 * Math.PI * days) / cycle);
}

/**
 * Dane dzienne dla zakresu dat: wartości sinus (gładka krzywa)
 * + symbole Sikory (prawda o stanie dnia).
 */
export function generateBiorhythmData(birthDate, startDate, days, birthTime = 'unknown') {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayCount = daysSinceBirth(birthDate, date, birthTime);
    data.push({
      date,
      daysAlive: dayCount,
      ...getRawBiorhythms(dayCount),
      physicalSymbol: getSikoraSymbol('F', dayCount),
      emotionalSymbol: getSikoraSymbol('P', dayCount),
      intellectualSymbol: getSikoraSymbol('I', dayCount),
    });
  }
  return data;
}

/** Stan na wybrany dzień: symbole, dzień cyklu, procenty. */
export function getBiorhythmsFor(birthDate, targetDate = new Date(), birthTime = 'unknown') {
  const days = daysSinceBirth(birthDate, targetDate, birthTime);
  return {
    daysAlive: days,
    physical: {
      symbol: getSikoraSymbol('F', days),
      day: getDayOfCycle('F', days),
      length: CYCLES.PHYSICAL,
      percent: Math.round(calculateDetailedPercentage('F', days)),
    },
    emotional: {
      symbol: getSikoraSymbol('P', days),
      day: getDayOfCycle('P', days),
      length: CYCLES.EMOTIONAL,
      percent: Math.round(calculateDetailedPercentage('P', days)),
    },
    intellectual: {
      symbol: getSikoraSymbol('I', days),
      day: getDayOfCycle('I', days),
      length: CYCLES.INTELLECTUAL,
      percent: Math.round(calculateDetailedPercentage('I', days)),
    },
  };
}

/**
 * Najbliższe dni kluczowe danego cyklu (od jutra w przód):
 * następny X (krytyczny), następny 0 (zerowy), początek następnego wyżu (dzień 1).
 */
export function findNextKeyDays(type, daysAliveToday, fromDate = new Date()) {
  const length = CYCLE_LENGTH[type];
  const result = { critical: null, zero: null, highStart: null };
  for (let offset = 1; offset <= length + 2; offset++) {
    const symbol = getSikoraSymbol(type, daysAliveToday + offset);
    const dayOfCycle = getDayOfCycle(type, daysAliveToday + offset);
    const date = new Date(fromDate);
    date.setDate(date.getDate() + offset);
    if (!result.critical && symbol === 'X') result.critical = { date, inDays: offset };
    if (!result.zero && symbol === '0') result.zero = { date, inDays: offset };
    if (!result.highStart && dayOfCycle === 1) result.highStart = { date, inDays: offset };
    if (result.critical && result.zero && result.highStart) break;
  }
  return result;
}

/**
 * Usuwa emoji/piktogramy ze stringa (port 1:1 z kanonu TS lib/text.ts).
 * GUI pokazuje teksty bez emoji (zasada: tylko ikony SVG); teksty źródłowe
 * w i18n zostają kanoniczne (parytet z golden-vectorami).
 */
export function stripEmoji(input) {
  return input
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── BioMatch — dopasowanie partnerskie (port 1:1 z BioMatch.tsx) ──────────────

/** Surowe wartości sinus (-1..1) trzech cykli dla daysAlive — wejście BioMatch. */
export function getRawBiorhythms(daysAlive) {
  return {
    physical: calculateBiorhythm(daysAlive, CYCLES.PHYSICAL),
    emotional: calculateBiorhythm(daysAlive, CYCLES.EMOTIONAL),
    intellectual: calculateBiorhythm(daysAlive, CYCLES.INTELLECTUAL),
  };
}

/**
 * Kompatybilność biorytmów dwóch osób (algorytm v1.0 z kanonu TS).
 * sync per cykl = (1 - |rawA - rawB| / 2) * 100  → 100% identyczne fazy, 0% opozycja.
 * Ogólny = 0.25·fizyczny + 0.45·emocjonalny + 0.30·intelektualny
 * (emocje ważą najwięcej — wymiar partnerski/miłosny).
 * Typ: ≥70 sync · ≤40 complement (opozycja = komplementarność, nie zło) · inaczej mixed.
 * adviceKey wybierany na NIEZAOKRĄGLONYCH sync (jak w TS); teksty porad w i18n.
 */
export function calculateBioMatch(rawA, rawB) {
  const physicalSync = (1 - Math.abs(rawA.physical - rawB.physical) / 2) * 100;
  const emotionalSync = (1 - Math.abs(rawA.emotional - rawB.emotional) / 2) * 100;
  const intellectualSync = (1 - Math.abs(rawA.intellectual - rawB.intellectual) / 2) * 100;

  const overall = Math.round(physicalSync * 0.25 + emotionalSync * 0.45 + intellectualSync * 0.30);
  const type = overall >= 70 ? 'sync' : overall <= 40 ? 'complement' : 'mixed';

  let adviceKey;
  if (type === 'sync') {
    if (emotionalSync > 80) adviceKey = 'matchAdviceSyncEmo';
    else if (physicalSync > 80) adviceKey = 'matchAdviceSyncPhys';
    else adviceKey = 'matchAdviceSync';
  } else if (type === 'complement') {
    adviceKey = emotionalSync < 40 ? 'matchAdviceCompEmo' : 'matchAdviceComp';
  } else {
    adviceKey = 'matchAdviceMixed';
  }

  return {
    overall,
    physical: Math.round(physicalSync),
    emotional: Math.round(emotionalSync),
    intellectual: Math.round(intellectualSync),
    type,
    adviceKey,
  };
}

/** Specyfikacja metody — referencja/parytet z TS (tabela faz w index.html jest statyczna dla SEO/no-JS). */
export const SIKORA_ALGORITHM = Object.freeze({
  version: '1.0',
  status: 'ZWALIDOWANY',
  source: 'Pliki wzorcowe z lat 1983, 2000, 2001',
  author: 'dr Jerzy Sikora',
  phases: Object.freeze({
    F: Object.freeze({ length: 23, high: [1, 10], critical: [11, 11], low: [12, 21], zero: [22, 23] }),
    P: Object.freeze({ length: 28, high: [1, 12], critical: [13, 14], low: [15, 26], zero: [27, 28] }),
    I: Object.freeze({ length: 33, high: [1, 15], critical: [16, 16], low: [17, 31], zero: [32, 33] }),
  }),
});

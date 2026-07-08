/**
 * aimy.bio — Silnik biorytmów wg metody dr. Jerzego Sikory (reference implementation)
 * Zrekonstruowany ze ŹRÓDŁA PIERWOTNEGO: J. Sikora, „Biodiagram prawdę Ci powie", KAW 1983.
 * To jest publiczna, samodzielna implementacja referencyjna silnika stojącego za aimy.bio.
 * Weryfikacja: src/engine.test.mjs vs golden (data/golden/sikora.json — wektory regresyjne tabeli
 * faz, data/golden/biomatch.json — pary biopowinowactwa) + KOTWICE ZE ŹRÓDŁA wpisane wprost w
 * teście (ręczne przykłady autora: Mickiewicz, BioMatch Goethe+Schiller, Morcinek+Teresa).
 *
 * METODA: dyskretny cykl ze stanami (+, -, X, 0). Dzień 1 = ZEROWY (w chwili urodzenia wszystkie
 * trzy cykle startują od zera). X = środek cyklu (przejście wyż→niż). Tabela faz (bioliczba 1..N):
 *   F(23): 0=1 · + 2–11 · X 12 · − 13–23
 *   P(28): 0=1 · + 2–13 · X 14–15 (DWA dni krytyczne) · − 16–28
 *   I(33): 0=1 · + 2–16 · X 17 · − 18–33
 * (Zgodne z tabelą „rozrzutu" i głębią niżu z książki; „X=środek" ~połowa cyklu.)
 *
 * DAY-COUNT: dni_przeżyte = interwał(target−urodzenie) + 1 (INKLUZYWNIE: dzień urodzenia = 1)
 *   + (ur.≤12:00 → +1). Sikora sam jest ±1 niespójny w książce (metoda pamięciowa dolicza
 *   inkluzywny dzień, tabelowa nie) — przyjmujemy konwencję pamięciową (odtwarza flagowy przykład
 *   Mickiewicza), resztę traktujemy jako ±1 „rozrzut", który autor jawnie dopuszcza.
 *
 * UWAGA API: eksporty CYCLE_TYPES i generateBiorhythmData nie mają dziś konsumentów w bin/cli.mjs
 * ani examples/ w tym repo — utrzymywane świadomie dla parytetu powierzchni API z aplikacją
 * aimy.bio (źródło prawdy metody).
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

/**
 * Korekta pory urodzenia wg Sikory = liczba dodawana do INTERWAŁU (target−urodzenie):
 *   +1 inkluzywnie (dzień urodzenia liczony jako 1) oraz +1 dodatkowo, gdy ur. przed południem.
 *   AM (przed 12:00) = +2 · PM (po 12:00) = +1 · nieznana = +1 (baza jak PM).
 */
export const BIRTH_TIME_CORRECTION = Object.freeze({
  AM: 2,
  PM: 1,
  unknown: 1,
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Północ UTC zbudowana z LOKALNYCH komponentów daty. Różnica dwóch takich wartości
 * jest dokładną wielokrotnością doby — odporna na DST (czas letni/zimowy),
 * w przeciwieństwie do różnicy lokalnych północy (setHours), gdzie doba 23/25 h
 * gubiła/dodawała dzień przy Math.floor.
 */
function utcMidnight(date) {
  const d = new Date(date);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Dni przeżyte wg Sikory (inkluzywnie + korekta pory urodzenia).
 * FORMULA: (target − urodzenie) w dniach + KOREKTA(pora urodzenia)
 * W chwili urodzenia (interwał 0, nieznana pora) = 1 → dzień 1 = zerowy każdego cyklu.
 */
export function daysSinceBirth(birthDate, targetDate = new Date(), birthTime = 'unknown') {
  const interval = Math.round((utcMidnight(targetDate) - utcMidnight(birthDate)) / MS_PER_DAY);
  return interval + BIRTH_TIME_CORRECTION[birthTime];
}

/** Dzień w cyklu: 1..długość cyklu (poprawny także dla ujemnych daysAlive). */
export function getDayOfCycle(type, daysAlive) {
  const length = CYCLE_LENGTH[type];
  let day = daysAlive % length;
  if (day <= 0) day += length;
  return day;
}

/**
 * Symbol Sikory dla cyklu i liczby dni przeżytych (tabela faz — patrz nagłówek pliku).
 * F(23): 0=1 · + 2–11 · X 12 · − 13–23
 * P(28): 0=1 · + 2–13 · X 14–15 · − 16–28
 * I(33): 0=1 · + 2–16 · X 17 · − 18–33
 */
export function getSikoraSymbol(type, daysAlive) {
  const d = getDayOfCycle(type, daysAlive);

  if (type === 'F') {
    if (d === 1) return '0';
    if (d <= 11) return '+';
    if (d === 12) return 'X';
    return '-';
  }
  if (type === 'P') {
    if (d === 1) return '0';
    if (d <= 13) return '+';
    if (d <= 15) return 'X';
    return '-';
  }
  // I
  if (d === 1) return '0';
  if (d <= 16) return '+';
  if (d === 17) return 'X';
  return '-';
}

/**
 * Procent 0-100 wg pozycji w fazie (płynna wizualizacja szanująca fazy Sikory).
 * Wyż: F 2–11, P 2–13, I 2–16. Niż: F 13–23, P 16–28, I 18–33. X i 0 = strefa przejścia (50).
 */
export function calculateDetailedPercentage(type, daysAlive) {
  const symbol = getSikoraSymbol(type, daysAlive);
  const dayOfCycle = getDayOfCycle(type, daysAlive);

  if (symbol === '+') {
    const highPhaseLength = type === 'F' ? 10 : type === 'P' ? 12 : 15;
    const progress = (dayOfCycle - 1) / highPhaseLength; // wyż zaczyna się od dnia 2
    if (progress <= 0.5) return 55 + (progress * 2) * 40;
    return 95 - ((progress - 0.5) * 2) * 40;
  }

  if (symbol === '-') {
    const lowPhaseStart = type === 'F' ? 13 : type === 'P' ? 16 : 18;
    const lowPhaseEnd = type === 'F' ? 23 : type === 'P' ? 28 : 33;
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
 * następny X (krytyczny), następny 0 (zerowy), początek następnego wyżu (dzień 2 = pierwszy dzień „+").
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
    if (!result.highStart && dayOfCycle === 2) result.highStart = { date, inDays: offset };
    if (result.critical && result.zero && result.highStart) break;
  }
  return result;
}

/**
 * Usuwa emoji/piktogramy ze stringa.
 * GUI aimy.bio pokazuje teksty bez emoji (zasada: tylko ikony SVG); teksty źródłowe
 * w i18n zostają kanoniczne (parytet z golden-vectorami).
 */
export function stripEmoji(input) {
  return input
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── BioMatch — dopasowanie partnerskie (biopowinowactwo Sikory) ────────────────

/** Surowe wartości sinus (-1..1) trzech cykli dla daysAlive — do gładkiej krzywej wykresu. */
export function getRawBiorhythms(daysAlive) {
  return {
    physical: calculateBiorhythm(daysAlive, CYCLES.PHYSICAL),
    emotional: calculateBiorhythm(daysAlive, CYCLES.EMOTIONAL),
    intellectual: calculateBiorhythm(daysAlive, CYCLES.INTELLECTUAL),
  };
}

/**
 * Biopowinowactwo Sikory dwóch osób (wejście = dni przeżyte każdej osoby na TEN SAM dzień).
 * sync per cykl = (1 − foldedDiff / (N/2)) × 100, foldedDiff = cykliczna różnica bioliczb
 *   (min(|dA−dB|, N−|dA−dB|)) — 100% = ta sama faza (ten sam dzień cyklu), 0% = opozycja (pół cyklu).
 * (Zweryfikowane na książce: Goethe+Schiller F100/P86/I82, Morcinek+Teresa F65/P7/I100 — patrz
 *   kotwice w src/engine.test.mjs.)
 * Ogólny = 0.25·fizyczny + 0.45·emocjonalny + 0.30·intelektualny (emocje ważą najwięcej —
 *   Sikora: dla par kluczowe F i P; wzoru „overall" nie podał — to świadoma operacjonalizacja aimy.bio).
 * Typ: ≥70 sync · ≤40 complement (opozycja = komplementarność, nie zło) · inaczej mixed.
 * Zwraca też `drivingCycle` = cykl najdalej od zgodności (najniższy sync) — pomocny przy poradach.
 */
export function calculateBioMatch(daysA, daysB) {
  const syncOf = (type) => {
    const N = CYCLE_LENGTH[type];
    const diff = Math.abs(getDayOfCycle(type, daysA) - getDayOfCycle(type, daysB));
    const folded = Math.min(diff, N - diff);
    return Math.max(0, (1 - folded / (N / 2)) * 100);
  };
  const physicalSync = syncOf('F');
  const emotionalSync = syncOf('P');
  const intellectualSync = syncOf('I');

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

  const drivingCycle =
    physicalSync <= emotionalSync && physicalSync <= intellectualSync ? 'physical'
      : emotionalSync <= intellectualSync ? 'emotional' : 'intellectual';

  return {
    overall,
    physical: Math.round(physicalSync),
    emotional: Math.round(emotionalSync),
    intellectual: Math.round(intellectualSync),
    type,
    adviceKey,
    drivingCycle,
  };
}

/** Specyfikacja metody — parytet z tabelą faz (przydatna do własnych statycznych renderów bez importu silnika). */
export const SIKORA_ALGORITHM = Object.freeze({
  version: '2.0',
  status: 'ZWALIDOWANY',
  source: 'J. Sikora, „Biodiagram prawdę Ci powie", KAW 1983 (kotwice: ręczne przykłady autora)',
  author: 'dr Jerzy Sikora',
  phases: Object.freeze({
    F: Object.freeze({ length: 23, zero: [1, 1], high: [2, 11], critical: [12, 12], low: [13, 23] }),
    P: Object.freeze({ length: 28, zero: [1, 1], high: [2, 13], critical: [14, 15], low: [16, 28] }),
    I: Object.freeze({ length: 33, zero: [1, 1], high: [2, 16], critical: [17, 17], low: [18, 33] }),
  }),
});

export type DOB = { month: number; day: number; year: number };

const sumDigits = (n: number): number => {
  let s = 0;
  let x = Math.abs(n);
  while (x > 0) {
    s += x % 10;
    x = Math.floor(x / 10);
  }
  return s;
};

const MASTERS = new Set([11, 22, 33]);
const KARMIC = new Set([13, 14, 16, 19]);

export const reduceKeepMaster = (n: number): number => {
  let x = n;
  while (x > 9 && !MASTERS.has(x)) x = sumDigits(x);
  return x;
};

export const reduceFull = (n: number): number => {
  let x = n;
  while (x > 9) x = sumDigits(x);
  return x;
};

// ─── Pythagorean letter values ────────────────────────────────────────────
const LETTER_VALUE: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const cleanName = (name: string) =>
  name.toUpperCase().replace(/[^A-Z]/g, "");

const sumLetters = (
  name: string,
  filter: (ch: string) => boolean = () => true,
): number => {
  let total = 0;
  for (const ch of cleanName(name)) {
    if (filter(ch)) total += LETTER_VALUE[ch] ?? 0;
  }
  return total;
};

// ─── Core numbers ─────────────────────────────────────────────────────────
export function lifePath(dob: DOB): number {
  const m = reduceKeepMaster(dob.month);
  const d = reduceKeepMaster(dob.day);
  const y = reduceKeepMaster(dob.year);
  return reduceKeepMaster(m + d + y);
}

export function karmicDebt(dob: DOB): number | null {
  const m = reduceFull(dob.month);
  const d = reduceFull(dob.day);
  const y = reduceFull(dob.year);
  let total = m + d + y;
  while (total > 9) {
    if (KARMIC.has(total)) return total;
    total = sumDigits(total);
  }
  return null;
}

export function expressionNumber(fullName: string): number {
  return reduceKeepMaster(sumLetters(fullName));
}

export function soulUrgeNumber(fullName: string): number {
  return reduceKeepMaster(sumLetters(fullName, (ch) => VOWELS.has(ch)));
}

export function personalityNumber(fullName: string): number {
  return reduceKeepMaster(sumLetters(fullName, (ch) => !VOWELS.has(ch)));
}

export function birthDayNumber(dob: DOB): number {
  return reduceKeepMaster(dob.day);
}

export function maturityNumber(dob: DOB, fullName: string): number {
  return reduceKeepMaster(lifePath(dob) + expressionNumber(fullName));
}

/** Karmic lessons = digits 1-9 missing from the name's letter values. */
export function karmicLessons(fullName: string): number[] {
  const present = new Set<number>();
  for (const ch of cleanName(fullName)) {
    const v = LETTER_VALUE[ch];
    if (v) present.add(v);
  }
  const missing: number[] = [];
  for (let i = 1; i <= 9; i++) if (!present.has(i)) missing.push(i);
  return missing;
}

// ─── Cycles ───────────────────────────────────────────────────────────────
export function personalYear(dob: DOB, calendarYear: number): number {
  return reduceFull(reduceFull(dob.month) + reduceFull(dob.day) + reduceFull(calendarYear));
}

export function personalMonth(dob: DOB, calendarYear: number, calendarMonth: number): number {
  return reduceFull(personalYear(dob, calendarYear) + reduceFull(calendarMonth));
}

export function personalDay(
  dob: DOB,
  calendarYear: number,
  calendarMonth: number,
  calendarDay: number,
): number {
  return reduceFull(personalMonth(dob, calendarYear, calendarMonth) + reduceFull(calendarDay));
}

export type PinnacleCycle = { number: number; startAge: number; endAge: number; startYear: number; endYear: number };

export function pinnacles(dob: DOB): PinnacleCycle[] {
  const m = reduceFull(dob.month);
  const d = reduceFull(dob.day);
  const y = reduceFull(dob.year);
  const lp = lifePath(dob);

  const p1 = reduceKeepMaster(m + d);
  const p2 = reduceKeepMaster(d + y);
  const p3 = reduceKeepMaster(reduceFull(p1) + reduceFull(p2));
  const p4 = reduceKeepMaster(m + y);

  const firstEnd = 36 - reduceFull(lp);
  const ages = [
    [0, firstEnd],
    [firstEnd + 1, firstEnd + 9],
    [firstEnd + 10, firstEnd + 18],
    [firstEnd + 19, 99],
  ] as const;

  return [p1, p2, p3, p4].map((num, i) => ({
    number: num,
    startAge: ages[i][0],
    endAge: ages[i][1],
    startYear: dob.year + ages[i][0],
    endYear: dob.year + ages[i][1],
  }));
}

export type ChallengeCycle = { number: number; startAge: number; endAge: number };

export function challenges(dob: DOB): ChallengeCycle[] {
  const m = reduceFull(dob.month);
  const d = reduceFull(dob.day);
  const y = reduceFull(dob.year);
  const lp = lifePath(dob);

  const c1 = Math.abs(m - d);
  const c2 = Math.abs(d - y);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(m - y);

  const firstEnd = 36 - reduceFull(lp);
  const ages = [
    [0, firstEnd],
    [firstEnd + 1, firstEnd + 9],
    [firstEnd + 10, firstEnd + 18],
    [firstEnd + 19, 99],
  ] as const;

  return [c1, c2, c3, c4].map((num, i) => ({
    number: num,
    startAge: ages[i][0],
    endAge: ages[i][1],
  }));
}

// ─── Energetic Windows ────────────────────────────────────────────────────
export type EnergeticWindow = {
  date: Date;
  personalDay: number;
  theme: "wealth" | "love" | "decision" | "rest";
  score: number;
};

const THEME_BY_NUMBER: Record<number, EnergeticWindow["theme"]> = {
  1: "decision",
  2: "love",
  3: "love",
  4: "wealth",
  5: "decision",
  6: "love",
  7: "rest",
  8: "wealth",
  9: "rest",
};

/** Generate top energetic windows over `days` days from `start`. */
export function energeticWindows(
  dob: DOB,
  start: Date,
  days = 90,
  topN = 20,
): EnergeticWindow[] {
  const lp = reduceFull(lifePath(dob));
  const all: EnergeticWindow[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const pd = personalDay(dob, d.getFullYear(), d.getMonth() + 1, d.getDate());
    // affinity score: matching life path or harmonic relationship
    const diff = Math.abs(pd - lp);
    const score = pd === lp ? 10 : diff === 3 || diff === 6 ? 7 : diff === 0 ? 8 : 10 - diff;
    all.push({ date: d, personalDay: pd, theme: THEME_BY_NUMBER[pd] ?? "decision", score });
  }
  return all.sort((a, b) => b.score - a.score).slice(0, topN).sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ─── Compatibility ────────────────────────────────────────────────────────
export const COMPATIBILITY: Record<number, { harmony: number[]; growth: number[]; tension: number[] }> = {
  1: { harmony: [3, 5, 6], growth: [1, 9], tension: [4, 7, 8] },
  2: { harmony: [6, 8, 9], growth: [2, 4], tension: [1, 5, 7] },
  3: { harmony: [1, 5, 9], growth: [3, 6], tension: [4, 7, 8] },
  4: { harmony: [2, 7, 8], growth: [4, 6], tension: [1, 3, 5] },
  5: { harmony: [1, 3, 7], growth: [5, 9], tension: [2, 4, 6] },
  6: { harmony: [1, 2, 8, 9], growth: [3, 6], tension: [5, 7] },
  7: { harmony: [4, 5], growth: [7, 9], tension: [1, 2, 3, 6] },
  8: { harmony: [2, 4, 6], growth: [8, 1], tension: [3, 5, 7] },
  9: { harmony: [1, 2, 3, 6], growth: [5, 9], tension: [4, 7, 8] },
  11: { harmony: [2, 6, 9], growth: [11, 22], tension: [4, 8] },
  22: { harmony: [4, 6, 8], growth: [22, 11], tension: [3, 5] },
  33: { harmony: [6, 9, 11], growth: [33, 22], tension: [5, 7] },
};

// ─── Date helpers ─────────────────────────────────────────────────────────
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

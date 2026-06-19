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

/** Reduce to a single digit, preserving master numbers 11/22/33. */
const reduceKeepMaster = (n: number): number => {
  let x = n;
  while (x > 9 && !MASTERS.has(x)) x = sumDigits(x);
  return x;
};

/** Reduce fully to a single digit (used for karmic-debt scan). */
const reduceFull = (n: number): number => {
  let x = n;
  while (x > 9) x = sumDigits(x);
  return x;
};

/**
 * Life Path: reduce month, day, year independently (preserving master numbers),
 * sum them, then reduce again preserving masters.
 */
export function lifePath(dob: DOB): number {
  const m = reduceKeepMaster(dob.month);
  const d = reduceKeepMaster(dob.day);
  const y = reduceKeepMaster(dob.year);
  return reduceKeepMaster(m + d + y);
}

/**
 * Karmic Debt: components are reduced to single digits, summed,
 * and we walk the reduction chain looking for 13/14/16/19.
 */
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

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

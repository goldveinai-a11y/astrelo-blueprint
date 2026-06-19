export type DOB = { month: number; day: number; year: number };

const sumDigits = (n: number): number => {
  let s = 0;
  while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
  return s;
};

const reduce = (n: number): number => {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = sumDigits(n);
  return n;
};

export function lifePath(dob: DOB): number {
  return reduce(sumDigits(dob.month) + sumDigits(dob.day) + sumDigits(dob.year));
}

const KARMIC = [13, 14, 16, 19] as const;
export function karmicDebt(dob: DOB): number | null {
  const total = sumDigits(dob.month) + sumDigits(dob.day) + sumDigits(dob.year);
  let n = total;
  while (n > 33) {
    if ((KARMIC as readonly number[]).includes(n)) return n;
    n = sumDigits(n);
  }
  return (KARMIC as readonly number[]).includes(n) ? n : null;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

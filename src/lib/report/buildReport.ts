import {
  type DOB,
  lifePath,
  karmicDebt,
  expressionNumber,
  soulUrgeNumber,
  personalityNumber,
  birthDayNumber,
  maturityNumber,
  karmicLessons,
  personalYear,
  personalMonth,
  pinnacles,
  challenges,
  energeticWindows,
  COMPATIBILITY,
  type EnergeticWindow,
  type PinnacleCycle,
  type ChallengeCycle,
} from "@/lib/quiz/numerology";
import {
  LIFE_PATH_COPY,
  KARMIC_DEBT_COPY,
  KARMIC_LESSON_COPY,
  PERSONAL_YEAR_COPY,
} from "./copy";

export type ReportInput = {
  fullName: string;
  dob: DOB;
  email?: string;
  generatedAt?: Date;
};

export type Report = {
  meta: { fullName: string; dob: DOB; generatedAt: Date };
  core: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
    birthDay: number;
    maturity: number;
  };
  karmic: { debt: number | null; lessons: number[] };
  cycles: {
    personalYear: number;
    currentMonth: number;
    months: { month: number; label: string; number: number; theme: string }[];
    pinnacles: PinnacleCycle[];
    challenges: ChallengeCycle[];
  };
  windows: { wealth: EnergeticWindow[]; love: EnergeticWindow[]; decision: EnergeticWindow[] };
  compatibility: { harmony: number[]; growth: number[]; tension: number[] };
  copy: {
    lifePath: typeof LIFE_PATH_COPY[number];
    karmicDebt: typeof KARMIC_DEBT_COPY[13] | null;
    karmicLessons: { number: number; text: string }[];
    personalYear: typeof PERSONAL_YEAR_COPY[number];
  };
};

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function buildReport(input: ReportInput): Report {
  const generatedAt = input.generatedAt ?? new Date();
  const calYear = generatedAt.getFullYear();
  const calMonth = generatedAt.getMonth() + 1;

  const lp = lifePath(input.dob);
  const exp = expressionNumber(input.fullName);
  const soul = soulUrgeNumber(input.fullName);
  const pers = personalityNumber(input.fullName);
  const bd = birthDayNumber(input.dob);
  const mat = maturityNumber(input.dob, input.fullName);

  const debt = karmicDebt(input.dob);
  const lessons = karmicLessons(input.fullName);

  const py = personalYear(input.dob, calYear);
  const pm = personalMonth(input.dob, calYear, calMonth);

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = ((calMonth - 1 + i) % 12) + 1;
    const yearOffset = Math.floor((calMonth - 1 + i) / 12);
    const number = personalMonth(input.dob, calYear + yearOffset, m);
    return {
      month: m,
      label: `${MONTH_LABELS[m - 1]} ${calYear + yearOffset}`,
      number,
      theme: PERSONAL_YEAR_COPY[number]?.title ?? "",
    };
  });

  const allWindows = energeticWindows(input.dob, generatedAt, 90, 30);
  const wealth = allWindows.filter((w) => w.theme === "wealth").slice(0, 6);
  const love = allWindows.filter((w) => w.theme === "love").slice(0, 6);
  const decision = allWindows.filter((w) => w.theme === "decision").slice(0, 6);

  const compat = COMPATIBILITY[lp] ?? COMPATIBILITY[1];

  return {
    meta: { fullName: input.fullName, dob: input.dob, generatedAt },
    core: { lifePath: lp, expression: exp, soulUrge: soul, personality: pers, birthDay: bd, maturity: mat },
    karmic: { debt, lessons },
    cycles: {
      personalYear: py,
      currentMonth: pm,
      months,
      pinnacles: pinnacles(input.dob),
      challenges: challenges(input.dob),
    },
    windows: { wealth, love, decision },
    compatibility: compat,
    copy: {
      lifePath: LIFE_PATH_COPY[lp] ?? LIFE_PATH_COPY[1],
      karmicDebt: debt ? KARMIC_DEBT_COPY[debt] : null,
      karmicLessons: lessons.map((n) => ({ number: n, text: KARMIC_LESSON_COPY[n] ?? "" })),
      personalYear: PERSONAL_YEAR_COPY[py] ?? PERSONAL_YEAR_COPY[1],
    },
  };
}

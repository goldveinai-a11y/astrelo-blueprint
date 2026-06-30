import type { DOB } from "./numerology";

export type Answers = {
  dob?: DOB;
  gender?: string;
  relationship?: string;
  focus?: string;
  anxiety?: string;
  financialStress?: number;
  energy?: number;
  purpose?: number;
  block?: string;
  uphill?: string;
  finHabit?: string;
  signs?: string;
  fear?: string;
  focusEase?: string;
  empathy?: string;
  intuition?: string;
  lastHappy?: string;
  readiness?: string;
  occupation?: string;
  precision?: string;
  karma?: string;
  name?: string;
  email?: string;
  partnerName?: string;
  birthTime?: string;
  birthTimeUnknown?: boolean;
  birthPlace?: GeoPoint;
};

export type GeoPoint = {
  name: string;
  lat: number;
  lng: number;
};

// partnerName added via quiz step
// birthTime/birthTimeUnknown/birthPlace added for Human Design & Gene Keys chapters

// Content blocks per number. Concise but real — 2-3 sentences each.
// Used by the report builder to assemble personalised text.

export type NumberCopy = {
  title: string;
  essence: string;
  strengths: string[];
  shadows: string[];
  guidance: string;
};

export const LIFE_PATH_COPY: Record<number, NumberCopy> = {
  1: {
    title: "The Pioneer",
    essence:
      "You came in to lead, not to follow. Your blueprint is wired for original thought, independent action, and breaking ground where others hesitate.",
    strengths: ["Initiative", "Self-reliance", "Decisiveness", "Innovation"],
    shadows: ["Stubbornness", "Isolation", "Impatience with weakness"],
    guidance:
      "When you doubt yourself you stall — and stalling is the one thing your number cannot tolerate. Move first, refine later.",
  },
  2: {
    title: "The Diplomat",
    essence:
      "Your power is in connection. You read people, harmonise opposites, and bring quiet stability to chaotic rooms.",
    strengths: ["Sensitivity", "Cooperation", "Patience", "Tact"],
    shadows: ["Indecision", "Codependence", "Hidden resentment"],
    guidance:
      "Stop apologising for needing time and tenderness — that's where your influence comes from, not what blocks it.",
  },
  3: {
    title: "The Communicator",
    essence:
      "Self-expression is your fuel. You're built to inspire, entertain, and translate emotion into language others can finally feel.",
    strengths: ["Charisma", "Creativity", "Optimism", "Social ease"],
    shadows: ["Scattered focus", "Surface charm", "Mood drops"],
    guidance:
      "Pick one creative voice and follow it long enough to be recognised. Range without depth is your most expensive habit.",
  },
  4: {
    title: "The Builder",
    essence:
      "You came to construct what lasts. Systems, foundations, families, businesses — anything that needs reliable bones bears your fingerprint.",
    strengths: ["Discipline", "Loyalty", "Practicality", "Endurance"],
    shadows: ["Rigidity", "Workaholism", "Joy-deferral"],
    guidance:
      "Your discipline is your gift, but rest is part of the work. Without it the foundation cracks from the inside.",
  },
  5: {
    title: "The Free Spirit",
    essence:
      "Movement, variety and freedom are non-negotiable for you. You learn through experience and teach through story.",
    strengths: ["Adaptability", "Curiosity", "Magnetism", "Courage"],
    shadows: ["Restlessness", "Avoidance of commitment", "Excess"],
    guidance:
      "Freedom isn't the absence of structure — it's choosing structure that serves your expansion. Build the cage, then leave the door open.",
  },
  6: {
    title: "The Nurturer",
    essence:
      "You are wired for care, beauty and responsibility. Home, family and chosen community are where your number breathes.",
    strengths: ["Compassion", "Healing presence", "Aesthetic sense", "Reliability"],
    shadows: ["Over-giving", "Martyr complex", "Perfectionism"],
    guidance:
      "Saying no is the highest form of love your number can offer. The people you serve don't need a depleted version of you.",
  },
  7: {
    title: "The Seeker",
    essence:
      "You came to think, study, and look behind the curtain. Truth, not approval, is your compass.",
    strengths: ["Analytical mind", "Spiritual depth", "Independence", "Insight"],
    shadows: ["Cynicism", "Withdrawal", "Over-thinking"],
    guidance:
      "Solitude is medicine until it becomes hiding. Test your insights against reality — share them with one trusted person at a time.",
  },
  8: {
    title: "The Executive",
    essence:
      "Power, money and material mastery are your training ground. You're here to learn how to wield resources with integrity.",
    strengths: ["Authority", "Strategic vision", "Resilience", "Ambition"],
    shadows: ["Control", "Workaholism", "Money fear cycles"],
    guidance:
      "Money flows when you stop confusing self-worth with net worth. Lead from purpose; the numbers follow.",
  },
  9: {
    title: "The Humanitarian",
    essence:
      "You came to complete cycles and serve something larger than yourself. Your reach is global, even when your stage is small.",
    strengths: ["Compassion", "Wisdom", "Generosity", "Big-picture vision"],
    shadows: ["Emotional overwhelm", "Resentment", "Self-erasure"],
    guidance:
      "You can't pour from a closed heart. Letting go is your superpower — practice it on what no longer serves before life forces it.",
  },
  11: {
    title: "The Illuminator (Master)",
    essence:
      "You carry the high voltage of the 2 amplified. Intuition, vision and inspiration arrive through you for others to receive.",
    strengths: ["Visionary intuition", "Inspirational presence", "Sensitivity"],
    shadows: ["Anxiety", "Self-doubt", "Nervous overload"],
    guidance:
      "Your nervous system is an instrument, not a flaw. Protect it like a musician protects their hands.",
  },
  22: {
    title: "The Master Builder",
    essence:
      "You're here to manifest big visions in concrete form — institutions, movements, structures that outlive you.",
    strengths: ["Practical vision", "Leadership", "Manifestation power"],
    shadows: ["Pressure paralysis", "Self-imposed limits"],
    guidance:
      "Stop waiting for permission. Your number was built for the scale you keep dismissing as 'too much'.",
  },
  33: {
    title: "The Master Teacher",
    essence:
      "Compassion as a discipline. You're here to elevate others through embodied service — love made into method.",
    strengths: ["Healing presence", "Selfless service", "Spiritual authority"],
    shadows: ["Martyr patterns", "Burnout", "Boundary collapse"],
    guidance:
      "Your service is only sustainable when your own well is full. Tend to yourself first — that's not selfish, it's structural.",
  },
};

export const KARMIC_DEBT_COPY: Record<number, { title: string; theme: string; lesson: string }> = {
  13: {
    title: "Karmic Debt 13 — The Discipline Debt",
    theme: "Avoidance of hard work, shortcuts that collapsed.",
    lesson:
      "This life rewards consistency, not bursts. Show up daily for the boring work and the breakthrough is mathematical.",
  },
  14: {
    title: "Karmic Debt 14 — The Freedom Debt",
    theme: "Misuse of freedom, indulgence, addiction patterns across lifetimes.",
    lesson:
      "Freedom with discipline is your medicine. Pick the structure, then let yourself fly inside it.",
  },
  16: {
    title: "Karmic Debt 16 — The Ego Debt",
    theme: "Pride that broke alliances; arrogance that cost connection.",
    lesson:
      "Surrender is not defeat. Tear down the false self before it gets torn down — every 16 cycle is an invitation to humility.",
  },
  19: {
    title: "Karmic Debt 19 — The Independence Debt",
    theme: "Power used selfishly; refusal to accept help.",
    lesson:
      "Your independence is real, but you're not meant to do it alone. Receiving is the lesson — practice it on small things first.",
  },
};

export const KARMIC_LESSON_COPY: Record<number, string> = {
  1: "Lesson of self-trust. You'll be placed in situations that require you to lead before you feel ready.",
  2: "Lesson of cooperation. Solo wins will feel hollow until you let others in.",
  3: "Lesson of expression. Your voice matters — silence will keep returning the same problem until you speak.",
  4: "Lesson of foundation. Shortcuts will collapse; this life rewards patient building.",
  5: "Lesson of healthy freedom. Variety must be chosen, not used to escape.",
  6: "Lesson of responsibility in love. You're learning to commit without losing yourself.",
  7: "Lesson of inner study. Surface answers won't satisfy you — go deeper than is comfortable.",
  8: "Lesson of money and power. You're here to make peace with both, not avoid them.",
  9: "Lesson of letting go. Endings are doorways — clinging is the only thing that turns them into walls.",
};

export const PERSONAL_YEAR_COPY: Record<number, { title: string; energy: string; focus: string }> = {
  1: { title: "Year of New Beginnings", energy: "Initiative, planting seeds, courage.", focus: "Start the project. Make the bold move. Set the trajectory for the next 9 years." },
  2: { title: "Year of Patience & Partnership", energy: "Receptivity, cooperation, slow growth.", focus: "Nurture what was planted. Build alliances. Avoid forcing outcomes." },
  3: { title: "Year of Expression", energy: "Creativity, social expansion, joy.", focus: "Show your work. Say yes to visibility. Play seriously." },
  4: { title: "Year of Foundation", energy: "Structure, discipline, hard work.", focus: "Systems, contracts, health routines. Build the bones for the next leap." },
  5: { title: "Year of Change", energy: "Movement, freedom, the unexpected.", focus: "Travel, pivot, release what no longer fits. Stay flexible — plans will rewrite themselves." },
  6: { title: "Year of Responsibility & Love", energy: "Family, home, service.", focus: "Commitments deepen. Create beauty. Tend to relationships before they tend to you." },
  7: { title: "Year of Reflection", energy: "Inner work, study, retreat.", focus: "Slow down. Read, learn, rest. External wins are not this year's job." },
  8: { title: "Year of Power & Harvest", energy: "Authority, money, results.", focus: "Negotiate. Charge what you're worth. The harvest of the last 7 years lands here." },
  9: { title: "Year of Completion", energy: "Endings, release, transformation.", focus: "Close chapters. Forgive. Travel light into the next 9-year cycle." },
};

export const COMPATIBILITY_NOTE: Record<"harmony" | "growth" | "tension", string> = {
  harmony: "Natural ease. These connections feel fluent — you don't have to translate yourself.",
  growth: "Mirror dynamic. Friction here points to the work, not the wrong person.",
  tension: "Different operating systems. Possible, but only with explicit communication.",
};

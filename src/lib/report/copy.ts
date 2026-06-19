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

export type ShortCopy = { essence: string; shadow: string; guidance: string };

// Expression Number — what you're built to DO in the world (full name)
export const EXPRESSION_COPY: Record<number, ShortCopy> = {
  1: {
    essence: "Your name encodes a force of pure origination. You were built to initiate — projects, conversations, movements — before others see the need.",
    shadow: "When the path isn't yours to lead, resentment builds quietly. Watch for the need to control disguised as 'just doing it right'.",
    guidance: "Channel this number into one focused endeavour at a time. Scattered leadership is the only thing that can dilute your power.",
  },
  2: {
    essence: "Your name carries the frequency of the bridge-builder. You make things work between people — partnerships, negotiations, creative collaborations.",
    shadow: "You can become the invisible glue that holds everything together while receiving none of the credit. Name your contributions out loud.",
    guidance: "Your greatest work will always involve another person. Stop trying to succeed alone — it contradicts the architecture of your name.",
  },
  3: {
    essence: "Your name vibrates at the frequency of creative expression. Words, images, performance — your medium doesn't matter as much as the act of sharing.",
    shadow: "Scattered output is your default under pressure. Ten half-finished projects and no finished ones is the Expression 3 trap.",
    guidance: "Commit to completion once. The discipline of finishing one thing will unlock the full power of your number.",
  },
  4: {
    essence: "Your name is built for construction. Systems, processes, reliable structures — you don't build fast, but what you build outlasts everything built around you.",
    shadow: "Rigidity masquerading as standards. Not every situation needs a protocol — some need flexibility and you'll resist it on instinct.",
    guidance: "Build the system, then let others run it. Your Expression 4 is a gift to institutions, not just to yourself.",
  },
  5: {
    essence: "Your name pulses with the energy of versatility and change. You were built to move through many worlds and translate them for others.",
    shadow: "Commitment avoidance. Everything stays interesting until it requires depth — then the 5 finds a reason to pivot.",
    guidance: "Pick one arena to go deep in. Your Expression 5 shines brightest when freedom is earned through mastery, not escaped toward.",
  },
  6: {
    essence: "Your name carries the energy of the healer and the host. You were built to create environments where others feel safe enough to become themselves.",
    shadow: "Over-responsibility. You'll absorb other people's problems as if they were yours to solve — and quietly resent it.",
    guidance: "Your role is to create the container, not to fill it for everyone. Teach; don't rescue.",
  },
  7: {
    essence: "Your name encodes the frequency of the investigator. You were built to go beneath surfaces — to find the principle underneath the pattern.",
    shadow: "Analysis as avoidance. Researching something forever is the 7's elegant way of never having to act on it.",
    guidance: "Set a deadline for the research phase. At some point the data is enough — trust what you know and move.",
  },
  8: {
    essence: "Your name carries the vibration of authority and material mastery. Leadership, resource stewardship and legacy-building are your operating domain.",
    shadow: "Confusing power with control. The 8 that micro-manages loses the very influence it's trying to protect.",
    guidance: "Delegate deliberately. Your Expression 8 scales when you trust others to execute — and they will, if you stop redoing their work.",
  },
  9: {
    essence: "Your name encodes the highest humanitarian frequency. You were built to contribute to something that outlives you — art, service, wisdom.",
    shadow: "Giving until empty and calling it virtue. The 9 that never receives eventually has nothing left to offer.",
    guidance: "Let yourself be supported. Receiving gracefully is the final lesson of your number — and the one most 9s skip.",
  },
};

// Soul Urge Number — what your heart actually wants (vowels only)
export const SOUL_URGE_COPY: Record<number, ShortCopy> = {
  1: {
    essence: "At the core, you crave autonomy and the satisfaction of building something that is wholly yours. Recognition matters — but only on your own terms.",
    shadow: "The private fear: that you're not as exceptional as you need to be. This can make you competitive in ways that isolate rather than elevate.",
    guidance: "Define success by your own standard, in writing, before you start. Otherwise you'll chase a moving target and call it ambition.",
  },
  2: {
    essence: "What you want most is to belong — to feel truly seen by one person who stays. Peace, mutual care, and emotional safety are the real currencies for you.",
    shadow: "You'll sacrifice your own needs for connection and then wonder why you feel invisible. The people-pleasing starts here.",
    guidance: "State a need out loud to someone you trust. Once. See what happens. Your Soul Urge 2 is healed by being asked for — not by asking.",
  },
  3: {
    essence: "You came here to delight. Joy, laughter, creative contribution — your soul doesn't want impact as much as it wants to be met with genuine enthusiasm.",
    shadow: "You'll suppress the creative urge in practical contexts and grow grey inside. The suppression always leaks out eventually.",
    guidance: "Schedule one hour per week that belongs only to what brings you alive. Protect it like a financial appointment.",
  },
  4: {
    essence: "Security is your soul's deepest prayer. Not luxury — security. A solid home, a reliable income, a structure you trust.",
    shadow: "The drive for security can tip into hoarding — of money, of control, of information. The 4 that won't let go can't receive what's next.",
    guidance: "Identify one area where your need for control is costing you connection. Release it slowly. Security built on trust lasts longer than security built on grip.",
  },
  5: {
    essence: "Freedom is not a preference for you — it's oxygen. Your soul needs variety, movement and the permission to be different things in different seasons.",
    shadow: "The fear of being trapped can make you bolt before anything gets real. You'll call it instinct; it's often fear wearing adventure's clothes.",
    guidance: "Notice the impulse to leave just as something deepens. Pause there. Ask: am I moving toward something, or away from discomfort?",
  },
  6: {
    essence: "Love is your soul's native language. You want to care and be cared for within something that feels like home — built from honesty and chosen daily.",
    shadow: "Perfectionism in relationships. You'll hold others to an internal standard they don't know exists and be quietly devastated when they miss it.",
    guidance: "Say what you need directly instead of hoping they'll notice. Your Soul Urge 6 is nourished by mutuality — which requires two people speaking.",
  },
  7: {
    essence: "Your soul wants truth. Not comfort, not approval — understanding. You need time alone with your thoughts as much as you need air.",
    shadow: "Emotional withdrawal as self-protection. The 7 goes quiet when hurt, and the silence is often read as indifference by the people who care.",
    guidance: "Tell one person when you need to retreat. The difference between chosen solitude and isolation is whether others know where you went.",
  },
  8: {
    essence: "Your soul came here to experience mastery. Not just competence — real authority. The kind earned over years of deliberate effort.",
    shadow: "Tying self-worth to net worth or title. When the external marker is absent, the 8 soul can feel fundamentally unworthy.",
    guidance: "Build an internal measure of success that exists regardless of what's in the account. Anchor it there. Return to it weekly.",
  },
  9: {
    essence: "Your soul came to give. Beauty, wisdom, service — you're most at peace when you're contributing to something larger than personal gain.",
    shadow: "Using generosity to avoid intimacy. The 9 that serves everyone can go an entire lifetime without letting anyone serve them back.",
    guidance: "Let one person in. Not the whole world — one person. Soul Urge 9 is completed by allowing yourself to be loved, not just loving.",
  },
};

// Personality Number — the first impression others receive (consonants only)
export const PERSONALITY_COPY: Record<number, ShortCopy> = {
  1: {
    essence: "The world meets you as confident, self-contained and purposeful — even in rooms you've never entered before. People instinctively assume you're in charge.",
    shadow: "The impression of invulnerability means people rarely offer support. You project strength so consistently that asking for help feels like a contradiction.",
    guidance: "Let one small uncertainty show in low-stakes situations. It will make you more approachable — and the right people will respect you more, not less.",
  },
  2: {
    essence: "Others experience you as warm, attentive and easy to talk to. You make people feel heard before you've said anything significant yourself.",
    shadow: "You can be underestimated because the warmth reads as softness. Your opinions and edges are real — they just don't show up until trust is established.",
    guidance: "Offer your perspective early in conversations, not just after others have spoken. It trains the room to see your depth, not just your warmth.",
  },
  3: {
    essence: "You walk in and the energy lifts. People experience you as expressive, engaging and lit from within — even on days you feel flat.",
    shadow: "The performance of brightness can become exhausting to maintain. And people who only know your public face will miss you when you go quiet.",
    guidance: "Show the ordinary version of yourself to people you want to keep. The 3 that lets others see its boring Tuesday is the one that builds real intimacy.",
  },
  4: {
    essence: "You come across as steady, reliable and grounded. People trust you quickly because you project the quiet confidence of someone who keeps their word.",
    shadow: "You can read as rigid or humourless in informal settings. The 4 personality sometimes forgets that ease is also a kind of competence.",
    guidance: "Deliberately bring one personal or light detail into professional conversations. It humanises the structure people see and builds real loyalty.",
  },
  5: {
    essence: "People experience you as magnetic, unpredictable in the best way, and genuinely interesting. You hold attention without trying.",
    shadow: "The charisma can read as unreliability. People enjoy you but sometimes hesitate to depend on you — because the energy shifts.",
    guidance: "In contexts that matter, be explicit about your commitments and then visibly keep them. Reliability is the one thing the 5 personality must demonstrate, not assume.",
  },
  6: {
    essence: "You come across as caring, aesthetically aware and genuinely interested in the people around you. Strangers feel comfortable approaching you.",
    shadow: "People may bring you their problems reflexively — because you look like someone who can handle it. The boundary between availability and absorption matters here.",
    guidance: "It's fine to redirect. 'I hear you — and I don't have capacity for that right now' is a sentence that protects your energy without closing the relationship.",
  },
  7: {
    essence: "Others experience you as thoughtful, intelligent and a little mysterious. People want to earn your full attention because it's clearly selective.",
    shadow: "The reserve can read as arrogance or disinterest. The 7 personality often doesn't realise how few signals of warmth it sends.",
    guidance: "One specific, genuine compliment per interaction. It costs nothing and opens doors the 7 personality usually keeps accidentally closed.",
  },
  8: {
    essence: "You project authority and capability. People expect you to lead and are rarely disappointed — you carry the energy of someone who can absorb pressure.",
    shadow: "The power projection can make people perform for you rather than connect with you. Subordinates may please you rather than tell you the truth.",
    guidance: "Actively create moments where others can disagree with you safely. The 8 personality that invites challenge gets better information — and better teams.",
  },
  9: {
    essence: "People experience you as wise, open-hearted and unusually non-judgmental. Strangers tell you things they haven't told close friends.",
    shadow: "Being everyone's confessor is exhausting. The 9 personality absorbs other people's emotional weight without a visible seam — until the seam splits.",
    guidance: "End conversations with a deliberate internal reset. Three breaths, a physical change of location, a brief note of what's yours and what you're leaving behind.",
  },
};

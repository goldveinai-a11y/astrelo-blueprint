import { createFileRoute } from '@tanstack/react-router'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December']

const LP_ARCHETYPE: Record<number, string> = {
  1: 'a natural pioneer who needs autonomy above all — someone who generates ideas others execute, and who will take on others\' work rather than watch it done poorly',
  2: 'a quiet force of sensitivity and collaboration — someone who reads rooms others miss entirely, and whose influence runs deeper than they ever show',
  3: 'a communicator and creative with an almost magnetic expressiveness — someone whose best work happens when they stop editing themselves before they begin',
  4: 'a builder and systems-thinker who finds deep satisfaction in structure — someone whose reliability is real, but whose rigidity is the one thing that costs them most',
  5: 'an adapter and freedom-seeker who is genuinely at their best in motion — someone for whom the cage is never the bars but the belief that the bars are there',
  6: 'a nurturer with exacting standards for the people they choose — someone whose care runs deepest for those who rarely notice how much it costs',
  7: 'an analyst and seeker who thinks several layers below the surface conversation — someone others read as distant when they are actually just working at a depth most people don\'t reach',
  8: 'a strategist with an instinct for power and structure — someone for whom ambition is not a trait but an operating system, running whether they choose it or not',
  9: 'a finisher and humanitarian whose gifts are most potent when aimed outward — someone who has absorbed more experience than they\'ve processed, and whose wisdom runs ahead of their willingness to use it',
  11: 'an intuitive with perception that borders on the uncomfortable — someone who has always sensed more than the room was ready to hear',
  22: 'a master builder whose vision operates at scale — someone whose ambition is matched only by the weight of knowing exactly what they could build if they committed fully',
  33: 'a teacher and guide whose influence reshapes the people around them — someone whose real power lies not in what they do but in what others become near them',
}

export const Route = createFileRoute('/api/public/generate-teaser')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as {
            name?: string
            dobDay?: number
            dobMonth?: number
            dobYear?: number
            zodiac?: string
            lifePathNum?: number
            focus?: string
            relationship?: string
            karma?: string
            financialStress?: number
          }

          const {
            name = 'you',
            dobDay = 1,
            dobMonth = 1,
            dobYear = 1990,
            zodiac = '',
            lifePathNum = 1,
            focus = '',
            relationship = '',
            karma = '',
            financialStress = 5,
          } = body

          const month = MONTH_NAMES[dobMonth] ?? 'January'
          const dateStr = `${month} ${dobDay}, ${dobYear}`
          const archetype = LP_ARCHETYPE[lifePathNum] ?? LP_ARCHETYPE[1]

          const isRelationshipFocus = /partner|love|relation|heal/i.test(focus)
          const isFinancialFocus = /financ|wealth|money|stagnation/i.test(focus)
          const hasKarma = /yes|definitely|prove/i.test(karma)
          const highFinancialStress = (financialStress ?? 5) >= 7
          const isSingle = /single/i.test(relationship)

          const focusHint = isRelationshipFocus
            ? 'Their stated focus is relationships and love — reference a relational pattern or karmic love block in the final hook.'
            : isFinancialFocus || highFinancialStress
            ? 'Their stated focus involves finances or they report high financial stress — reference a financial pattern or wealth block in the final hook.'
            : 'Their focus is purpose, meaning, or escaping burnout — reference a clarity or direction block in the final hook.'

          const relationshipHint = isSingle
            ? 'They are currently single.'
            : 'They are in a relationship or married.'

          const karmaHint = hasKarma
            ? 'They believe karmic patterns from the past are affecting their present — you may weave in a brief karmic reference.'
            : ''

          const prompt = `You are writing one short paragraph for a numerology app. It appears on a screen between a loading animation and a pricing page. The user has just completed a 12-step quiz. The paragraph must make them feel genuinely seen — not like a horoscope, but like a perceptive person who has studied them specifically.

User data:
- Name: ${name}
- Born: ${dateStr} (${zodiac})
- Life Path Number: ${lifePathNum} — archetype: ${archetype}
- ${focusHint}
- ${relationshipHint}
- ${karmaHint}

Rules for the paragraph (strictly follow all):
1. Write 110–150 words. One paragraph, no line breaks, no bullet points.
2. Open by naming them and their birth date and zodiac sign — this creates instant specificity.
3. Use the rainbow ruse technique: name an outer quality they project AND the inner tension that contradicts it. Example structure: "You carry yourself as [outer trait] — but the people closest to you rarely see [inner reality]."
4. Reference their Life Path archetype (${lifePathNum}) in a way that feels observed, not labeled. Do not say "your Life Path number is ${lifePathNum}."
5. End with a forward hook that names a specific pattern or block their Blueprint will reveal — tied to their focus area. Make it feel inevitable, not salesy.
6. Forbidden phrases: "unique potential", "harness your energy", "cosmic blueprint", "the universe", "journey", "authentic self", "unlock your", "dive deep". No clichés.
7. Tone: a sharp, warm friend who has read a lot — not a psychic, not a marketer.

Return ONLY the paragraph. No preamble, no quotes, no explanation.`

          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'missing_key' }), { status: 500, headers: JSON_HEADERS })
          }

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 300,
              messages: [{ role: 'user', content: prompt }],
            }),
          })

          const data = await response.json() as { content?: Array<{ type: string; text: string }> }
          const paragraph = data.content?.find((b) => b.type === 'text')?.text?.trim() ?? ''

          return new Response(JSON.stringify({ paragraph }), { status: 200, headers: JSON_HEADERS })
        } catch (err) {
          console.error('[generate-teaser] error:', err)
          return new Response(JSON.stringify({ paragraph: '' }), { status: 200, headers: JSON_HEADERS })
        }
      },
    },
  },
})

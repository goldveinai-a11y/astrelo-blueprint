import { createFileRoute } from '@tanstack/react-router'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const Route = createFileRoute('/api/public/get-report')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const token = url.searchParams.get('token')

        if (!token) {
          return new Response(JSON.stringify({ error: 'missing_token' }), {
            status: 400,
            headers: JSON_HEADERS,
          })
        }

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const { data: order, error } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('token', token)
          .maybeSingle()

        if (error) {
          console.error('[get-report] DB error:', error.message)
          return new Response(JSON.stringify({ error: 'db_error' }), {
            status: 500,
            headers: JSON_HEADERS,
          })
        }

        if (!order) {
          return new Response(JSON.stringify({ error: 'not_found' }), {
            status: 404,
            headers: JSON_HEADERS,
          })
        }

        if (order.status !== 'paid') {
          return new Response(JSON.stringify({ status: 'pending' }), {
            status: 200,
            headers: JSON_HEADERS,
          })
        }

        if (order.generated_narrative == null) {
          return new Response(JSON.stringify({ status: 'generating' }), {
            status: 200,
            headers: JSON_HEADERS,
          })
        }

        return new Response(
          JSON.stringify({
            status: 'ready',
            fullName: order.full_name,
            dob: {
              day: order.dob_day,
              month: order.dob_month,
              year: order.dob_year,
            },
            tier: order.tier,
            partnerName: order.partner_name,
            narrative: order.generated_narrative,
          }),
          { status: 200, headers: JSON_HEADERS },
        )
      },
    },
  },
})

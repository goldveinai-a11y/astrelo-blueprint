import { createFileRoute } from '@tanstack/react-router'
import Stripe from 'stripe'
import { generateNarrativeForOrder } from '@/lib/report/generateNarrative.server'
import { sendReportEmail } from '@/lib/report/sendReportEmail.server'

export const Route = createFileRoute('/api/public/stripe-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = process.env.STRIPE_SECRET_KEY
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        const signature = request.headers.get('stripe-signature')

        if (!secretKey || !webhookSecret) {
          console.error('[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
          return new Response('Server misconfigured', { status: 500 })
        }
        if (!signature) {
          return new Response('Missing stripe-signature header', { status: 400 })
        }

        const rawBody = await request.text()
        const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as any })

        let event: Stripe.Event
        try {
          event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
        } catch (err) {
          console.error('[stripe-webhook] Signature verification failed:', (err as Error).message)
          return new Response('Invalid signature', { status: 400 })
        }

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session
          const token = session.metadata?.token
          const sessionId = session.id

          if (!token) {
            console.error('[stripe-webhook] checkout.session.completed missing metadata.token', sessionId)
            return new Response('ok', { status: 200 })
          }

          const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
          const { data, error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'paid', stripe_session_id: sessionId })
            .eq('token', token)
            .select('id')

          if (error) {
            console.error('[stripe-webhook] DB update error:', error.message)
            return new Response('DB error', { status: 500 })
          }

          try {
            const generated = await generateNarrativeForOrder(token)
            if (generated) {
              try { await sendReportEmail(token) } catch (e) {
                console.error('[stripe-webhook] Email send failed:', (e as Error).message)
              }
            }
          } catch (e) {
            console.error('[stripe-webhook] Narrative generation failed:', (e as Error).message)
          }

          return new Response('ok', { status: 200 })
        }

        if (event.type === 'payment_intent.succeeded') {
          const pi = event.data.object as Stripe.PaymentIntent
          const token = pi.metadata?.token

          if (!token) {
            console.error('[stripe-webhook] payment_intent.succeeded missing metadata.token', pi.id)
            return new Response('ok', { status: 200 })
          }

          const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
          const { data, error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'paid', stripe_session_id: pi.id })
            .eq('token', token)
            .select('id')

          if (error) {
            console.error('[stripe-webhook] payment_intent DB error:', error.message)
            return new Response('DB error', { status: 500 })
          }

          try {
            const generated = await generateNarrativeForOrder(token)
            if (generated) {
              try { await sendReportEmail(token) } catch (e) {
                console.error('[stripe-webhook] Email send failed:', (e as Error).message)
              }
            }
          } catch (e) {
            console.error('[stripe-webhook] Narrative generation failed:', (e as Error).message)
          }

          return new Response('ok', { status: 200 })
        }

        return new Response('ok', { status: 200 })
      },
    },
  },
})

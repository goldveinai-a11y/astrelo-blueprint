import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/.well-known/apple-developer-merchantid-domain-association')({
  server: {
    handlers: {
      GET: async () => {
        const response = await fetch(
          'https://stripe.com/files/apple-pay/apple-developer-merchantid-domain-association'
        )
        const text = await response.text()
        return new Response(text, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})

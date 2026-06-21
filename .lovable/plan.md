Create a new public API route `src/routes/api/public/get-report.ts` that serves gated report data.

### Route
- File: `src/routes/api/public/get-report.ts`
- Endpoint: `GET /api/public/get-report?token=<token>`

### Implementation
1. Parse `token` from query params (`new URL(request.url).searchParams`).
2. If `token` is missing, return `400` with JSON `{ error: "missing_token" }`.
3. Dynamic-import `supabaseAdmin` from `@/integrations/supabase/client.server` inside the handler (same pattern as `stripe-webhook.ts`).
4. Query `orders` table via `supabaseAdmin.from('orders').select('*').eq('token', token).single()`.

### Response Logic
- **No matching order** → `404` with `Content-Type: application/json` and body `{ error: "not_found" }`
- **order.status !== 'paid'** → `200` with `Content-Type: application/json` and body `{ status: "pending" }`
- **order.status === 'paid' AND generated_narrative is null** → `200` with `Content-Type: application/json` and body `{ status: "generating" }`
- **order.status === 'paid' AND generated_narrative is present** → `200` with `Content-Type: application/json` and body `{ status: "ready", fullName, dob: { day, month, year }, tier, partnerName, narrative: generated_narrative }`

### Safety
- Set `Content-Type: application/json` on every response path.
- No other files touched (routeTree.gen.ts auto-regenerates).
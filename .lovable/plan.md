# GA4 tracking для нового квиза (numerology.astrelo.net)

## Что отправляем

Все события идут только в новый GA4-стрим `G-16CJ7CBJX5` (это единственный `gtag('config', …)` в проекте — со старым квизом Astrelo не пересекаются, у того другой проект и другой Measurement ID). Дополнительно к каждому событию добавляем параметры:

- `send_to: 'G-16CJ7CBJX5'` — жёсткая привязка к нужному стриму, даже если в будущем добавится другой `config`.
- `quiz_version: 'numerology_v2'` — позволит фильтровать в GA4 / Ads, если когда-нибудь оба квиза окажутся в одном property.

Цены берём из существующих тиров в `PricingTiers.tsx`: core $19, popular $27, ultimate $33, валюта USD.

| Событие         | Где срабатывает                                                                          | Параметры                                                                                                                              |
|-----------------|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `begin_checkout`| `Paywall.tsx`, момент клика по «Unlock» (до загрузки Stripe)                             | `currency: 'USD'`, `value`, `items: [{ item_id: tier, item_name, price, quantity: 1 }]`                                                |
| `purchase`      | `report.$token.tsx`, когда `/api/public/get-report` вернул `status: 'ready'` (один раз)  | `transaction_id: token`, `currency: 'USD'`, `value`, `items: [...]`. Дедуп через `sessionStorage['ga_purchase_'+token]`               |
| `view_result`   | Тот же момент, что `purchase` (кастомное событие — «result page» нового квиза)           | `transaction_id: token`, `tier`, `quiz_version`                                                                                        |

`purchase` — это и есть основная конверсия для Google Ads (transaction_id = order token, без дублей).

## Файлы

### Создаём

1. `src/lib/analytics.ts` — клиентский хелпер.
   ```ts
   const GA_ID = 'G-16CJ7CBJX5';
   declare global { interface Window { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] } }
   export function track(event: string, params: Record<string, unknown> = {}) {
     if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
     window.gtag('event', event, { send_to: GA_ID, quiz_version: 'numerology_v2', ...params });
   }
   ```

2. `src/lib/quiz/tiers.ts` — единый источник цен (чтобы `PricingTiers` и аналитика не разъезжались).
   ```ts
   import type { Tier } from '@/components/quiz/widgets/PricingTiers';
   export const TIER_PRICE_USD: Record<Tier, number> = { core: 19, popular: 27, ultimate: 33 };
   ```

### Правим

3. `src/components/quiz/Paywall.tsx` — в самом начале `startCheckout`, до `setLoading(true)`:
   ```ts
   const value = TIER_PRICE_USD[tier];
   track('begin_checkout', {
     currency: 'USD', value,
     items: [{ item_id: tier, item_name: `Numerology Blueprint — ${tier}`, price: value, quantity: 1 }],
   });
   ```

4. `src/routes/report.$token.tsx` — внутри блока, где `data.status === 'ready'`, через `useEffect` с зависимостью `[data?.status, token]`:
   ```ts
   const key = `ga_purchase_${token}`;
   if (sessionStorage.getItem(key)) return;
   const value = TIER_PRICE_USD[data.tier];
   track('purchase', {
     transaction_id: token, currency: 'USD', value,
     items: [{ item_id: data.tier, item_name: `Numerology Blueprint — ${data.tier}`, price: value, quantity: 1 }],
   });
   track('view_result', { transaction_id: token, tier: data.tier });
   sessionStorage.setItem(key, '1');
   ```

   (Оборачиваем рендер `ReportView` в маленький компонент-обёртку, чтобы корректно повесить `useEffect`, не нарушая правила хуков.)

### Не трогаем

`__root.tsx` (там уже корректный gtag-снипет), `stripe-webhook.ts`, `get-report.ts`, `checkout.functions.ts`, `ReportView.tsx`, схему `orders`.

## Что сделать в GA4 / Google Ads после деплоя

1. GA4 → Admin → Events → пометить `purchase` как **Key event** (раньше Conversion).
2. Google Ads → Tools → Conversions → New → Import from GA4 → выбрать `purchase` (и при желании `view_result` как secondary).
3. Связать GA4 property со Google Ads-аккаунтом (Admin → Product links → Google Ads links), если ещё не связано.

После этого `purchase` будет атрибутироваться к кампаниям Google Ads с реальным `value` и `transaction_id`, а данные старого квиза Astrelo не попадут в этот property — у него отдельный stream.
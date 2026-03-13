# SeatGeek API setup

Credentials are used **only** in Supabase Edge Function secrets. The frontend never receives or sends your client ID or secret.

## 1. Add secrets in Supabase

1. Open **Supabase Dashboard** → your project → **Edge Functions** → **Secrets**.
2. Add:
   - `SEATGEEK_CLIENT_ID` = your client ID
   - `SEATGEEK_CLIENT_SECRET` = your client secret

## 2. Deploy the Edge Function

From your project root:

```bash
npx supabase functions deploy fetch-external-events
```

After this, **Discover → Nearby** loads SeatGeek events by city. All SeatGeek API calls happen in the Edge Function; the frontend only calls your Supabase function and never sees credentials.

## Security

- Do **not** put SeatGeek credentials in `.env`, `VITE_*` variables, or any frontend code.
- Rotate your secret at [seatgeek.com/account/develop](https://seatgeek.com/account/develop) if it’s ever exposed.

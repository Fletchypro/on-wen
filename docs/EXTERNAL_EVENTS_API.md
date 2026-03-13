# External events in Discover (by location)

The **Discover → Nearby** tab can show events pulled from an external API (e.g. SeatGeek: concerts, sports, etc.) so they appear automatically by city. Users can **Add to calendar** to create a copy on their Wen calendar.

## How it works

1. **In-app public events** – Still come from your Supabase DB (`get_public_events_by_city`).
2. **External API events** – Fetched by city when the user is on the Nearby tab with a city set (from location or search). They are merged with in-app events and sorted by date.
3. **Add to calendar** – For an external event, the user taps “Add to calendar”; the app creates a new event in Supabase (their copy) with title, date, time, location, image, and an optional link back to the source.

## Enabling the API (server-side only)

Credentials stay in Supabase only; the frontend never sees them.

1. Run the migration: in **Supabase** → **SQL Editor**, run the contents of `supabase/migrations/20260312000000_external_events.sql` (creates `external_events` and `get_external_events_by_city`).
2. Get a free **SeatGeek** client ID: sign up at [seatgeek.com](https://seatgeek.com/) and use their API / developer section, or search “SeatGeek API client_id”.
3. In **Supabase Dashboard** → your project → **Edge Functions** → **Secrets**, add at least one of **SeatGeek** or **Ticketmaster** (see below), plus `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (so the function can write to `external_events`).
4. Deploy the function (from the project root):
   ```bash
   npx supabase functions deploy fetch-external-events
   ```
5. The app calls this function when the user is on Discover → Nearby with a city; results are cached so everyone can see them.

## SeatGeek setup

- Get a free client ID (and optional secret) at [seatgeek.com](https://seatgeek.com/) (API / developer section).
- Add secrets: `SEATGEEK_CLIENT_ID`, and optionally `SEATGEEK_CLIENT_SECRET`.

## Ticketmaster setup

1. **Get an API key**
   - Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2).
   - Sign in or create an account.
   - Open **My Apps** (or **Apps** in the top nav) and create an app if you don’t have one.
   - In the app, open **Consumer Key** (or **API Key**) and copy the key.

2. **Add the secret in Supabase**
   - In **Supabase Dashboard** → your project → **Edge Functions** → **Secrets**, add:
   - **Key:** `TICKETMASTER_API_KEY`
   - **Value:** the API key you copied.

3. **Redeploy the function**
   ```bash
   npx supabase functions deploy fetch-external-events
   ```

The function will then fetch from both SeatGeek (if configured) and Ticketmaster for each city and merge the results. You can use SeatGeek only, Ticketmaster only, or both.

## Files involved

- **`src/lib/externalEventsApi.js`** – Calls the Edge Function only (no API keys in the frontend).
- **`src/hooks/useExternalEvents.js`** – Hook that fetches external events for the current city.
- **`src/components/FriendsEventFeed.jsx`** – Merges in-app and external events on the Nearby tab and wires “Add to calendar.”
- **`supabase/functions/fetch-external-events/index.ts`** – Edge Function that calls SeatGeek and/or Ticketmaster and returns normalized events.

## Adding another provider

To add a different API (e.g. Eventbrite):

1. In the Edge Function, add a fetch + normalize step (same output shape: `id`, `external_id`, `title`, `date`, `time`, `location`, `image`, `isExternal`, `source`, `external_url`).
2. Push the normalized events into `allEvents` and ensure `external_id` is unique (e.g. `eb-{id}`).
3. Add the required env/secret and document it here.

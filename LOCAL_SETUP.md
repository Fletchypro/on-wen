# Local setup + Supabase

Get the app running on your machine and connected to Supabase.

---

## 1. Install and run

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 2. Connect to Supabase

The app is already wired to a Supabase project (URL and anon key in code with optional overrides via env). To use **your own** Supabase project:

1. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **API**, copy:
   - **Project URL**
   - **anon public** key

2. In this project folder, copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Edit **`.env`** and set:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Restart the dev server (`Ctrl+C`, then `npm run dev`). The app will use the project defined in `.env`.

If you **don’t** create a `.env` file, the app keeps using the default Supabase project already in the code.

---

## 3. Allow localhost in Supabase (for login / redirects)

So sign-in, sign-up, and password reset work locally:

1. Supabase Dashboard → your project → **Authentication** → **URL Configuration**.
2. **Site URL**: set to `http://localhost:3000` for local dev (you can change this later for production).
3. **Redirect URLs**: add:
   - `http://localhost:3000/**`
   - `http://127.0.0.1:3000/**` (optional, same machine)

Save. Then try signing up or logging in at http://localhost:3000; Supabase will redirect back to your app after auth.

---

## 4. Summary

| Step | Action |
|------|--------|
| Run locally | `npm install` → `npm run dev` → open http://localhost:3000 |
| Use your Supabase project | Copy `.env.example` to `.env`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, restart dev server |
| Auth works locally | In Supabase: set Site URL to `http://localhost:3000` and add `http://localhost:3000/**` to Redirect URLs |

You’re set up locally and connected to Supabase.

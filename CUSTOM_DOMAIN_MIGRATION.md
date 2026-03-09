# Using your custom domain (wen.net) off Hostinger

Your app is already set up for **wen.net** (canonical URLs, Open Graph, support@wen.net). To move off Hostinger and keep using that domain, follow these steps.

---

## 1. Choose where to host

Any static/Jamstack host that serves a Vite build will work. Common options:

| Host | Custom domain | SSL | Good for |
|------|----------------|-----|----------|
| **Vercel** | Yes, free | Auto (Let’s Encrypt) | Connect Git, auto deploys |
| **Netlify** | Yes, free | Auto | Connect Git or drag-and-drop `dist` |
| **Cloudflare Pages** | Yes, free | Auto | Fast CDN, connect Git or upload |

Pick one and create an account if you haven’t.

---

## 2. Deploy the app

### Build locally

```bash
npm install
npm run build
```

The output is in the **`dist/`** folder.

### Deploy

- **Vercel:** Install Vercel CLI (`npm i -g vercel`) and run `vercel` in the project root, or connect your Git repo in the Vercel dashboard and set build command `npm run build`, output directory `dist`.
- **Netlify:** Connect the repo in the dashboard (build: `npm run build`, publish: `dist`), or drag and drop the `dist` folder in “Deploy manually.”
- **Cloudflare Pages:** Connect the repo (build: `npm run build`, output: `dist`) or upload `dist` with Wrangler.

Your app will first be live at a default URL (e.g. `your-project.vercel.app`). Use that to confirm everything works before switching the domain.

---

## 3. Add your custom domain (wen.net)

In the host’s dashboard, open your project → **Settings** / **Domain**:

1. Add **wen.net** (and **www.wen.net** if you use it).
2. The host will show you what to set in DNS (usually a **CNAME** or **A** record).

---

## 4. Point DNS to the new host

Where you manage **wen.net** (e.g. Cloudflare, Namecheap, Hostinger DNS, etc.):

- **If the host says “CNAME”** (typical for Vercel/Netlify/Cloudflare Pages):
  - For **wen.net** (root): some hosts support CNAME flattening at the root; others require an **A** record (the host’s docs will give the IP).
  - For **www.wen.net**: add a CNAME record: `www` → target they give (e.g. `your-site.vercel.app` or `your-site.netlify.app`).
- **If the host says “A”**: Create an A record for `@` (or `wen.net`) pointing to the IP they provide.

Remove or stop using any old A/CNAME records that pointed wen.net to Hostinger so traffic goes to the new host only.

SSL is usually automatic once DNS is correct; it can take a few minutes up to 48 hours.

---

## 5. Tell Supabase about the new URL

So login, magic links, and password reset work on wen.net:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.
2. Set **Site URL** to `https://wen.net` (or `https://www.wen.net` if that’s your primary).
3. In **Redirect URLs**, add:
   - `https://wen.net/**`
   - `https://www.wen.net/**` (if you use www)

Save. Existing Supabase config in the app (`src/lib/customSupabaseClient.js`) does not need to change; it already uses your Supabase project.

---

## 6. Optional: stop depending on Hostinger assets

The app currently loads some images/icons from Hostinger CDN (`horizons-cdn.hostinger.com` and `storage.googleapis.com/hostinger-horizons-assets-prod`). As long as those URLs stay reachable, the site will work. If you want to fully leave Hostinger:

1. Download the assets you need (favicon, logos, landing images, etc.) from those URLs.
2. Put them in **`public/`** (e.g. `public/logo.png`, `public/favicon.png`).
3. In the code, replace the full Hostinger URLs with paths like `/logo.png`, `/favicon.png`.
4. Update `index.html` (favicon, apple-touch-icon, og:image) and any component that still references the old URLs.

If you want, we can do this file-by-file in the repo next.

---

## Checklist

- [ ] Build runs: `npm run build`
- [ ] Deploy to chosen host; default URL works
- [ ] Custom domain **wen.net** added in host dashboard
- [ ] DNS for wen.net points to new host (CNAME/A as instructed)
- [ ] Supabase **Site URL** and **Redirect URLs** include `https://wen.net` (and www if used)
- [ ] Visit https://wen.net and test login / signup / password reset
- [ ] (Optional) Replace Hostinger CDN URLs with your own assets in `public/`

After DNS has propagated and Supabase is updated, your custom domain **wen.net** will be served from the new host instead of Hostinger.

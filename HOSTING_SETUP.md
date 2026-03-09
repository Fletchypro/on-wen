# Hosting this app (off Horizons)

You don’t need to create a new website. This project **is** the website. You only need to **build** it and **put the built files** on a host.

---

## What you do

1. **Build the app** (once per update)
   ```bash
   npm install
   npm run build
   ```
   That creates a **`dist/`** folder with your site (HTML, JS, CSS, assets).

2. **Put `dist/` on a host**  
   Either upload the **contents** of `dist/` to a web server, or connect this repo to a host that runs the build for you.

3. **Point your domain (e.g. onwen.com)** to that host (in the host’s dashboard + DNS).

No new “website” to create—just a new **hosting place** for this one app.

---

## Option A: Hostinger regular hosting (no Horizons)

If you have Hostinger **shared hosting** or **VPS** (not Horizons):

1. In **hPanel** → **Websites** or **Domains**: add/attach **onwen.com** (or use a subdomain for testing).
2. Open **File Manager** (or FTP) and go to the folder for that domain (often **`public_html`**).
3. Upload the **contents** of your **`dist/`** folder into that folder (so `index.html` is in the root of public_html, and `assets/` is there too).
4. In Hostinger, turn on **SSL** for that domain.
5. In **Supabase** → Authentication → URL Configuration, set **Site URL** and **Redirect URLs** to `https://onwen.com` and `https://onwen.com/**`.

You do **not** create a “new website” in a builder—you just use “add domain” / “attach domain” and put the files in the right folder.

---

## Option B: Vercel / Netlify / Cloudflare Pages (no server to manage)

You create a **new project** on their site (that’s the “hosting thing”), not a new website:

1. Sign up at [vercel.com](https://vercel.com), [netlify.com](https://netlify.com), or [pages.cloudflare.com](https://pages.cloudflare.com).
2. **New project** → connect your **Git repo** (GitHub/GitLab) that contains this code, or **upload** the **`dist/`** folder (after running `npm run build`).
3. If you connected Git, set **Build command**: `npm run build`, **Output directory**: `dist`. Then each push can auto-deploy.
4. In the project’s **Settings** → **Domains**, add **onwen.com**. They’ll show you what DNS record to add (usually CNAME or A).
5. At your domain registrar, add that DNS record so **onwen.com** points to them.
6. In **Supabase**, set **Site URL** and **Redirect URLs** to `https://onwen.com` and `https://onwen.com/**`.

Again: the “new” thing is only the **hosting project** (one place to put your build). The website is still this codebase.

---

## Summary

| Question | Answer |
|----------|--------|
| Do I need to create a new website? | **No.** This repo is the website. You only set up a **hosting place** and put the **build** there. |
| What do I upload? | The **contents** of the **`dist/`** folder after running `npm run build`. |
| Do I need a “website builder”? | **No.** You’re serving static files. Any host that can serve files (Hostinger public_html, Vercel, Netlify, Cloudflare Pages) is enough. |

So: **build** → **upload/connect to a host** → **point onwen.com to that host** → **set Supabase URLs**. That’s the full setup.

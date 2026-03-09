# Using onwen.com on Hostinger

Yes — you can keep hosting on Hostinger and use your custom domain **onwen.com**. The app is now set up for **onwen.com** (canonical URLs, Open Graph, support@onwen.com).

---

## 1. Point the domain to Hostinger (DNS)

Where **onwen.com** is registered (Hostinger Domains, Namecheap, Cloudflare, etc.):

- **Option A – Use Hostinger nameservers (simplest)**  
  If you want Hostinger to manage DNS for onwen.com:
  - In **Hostinger**: go to **Domains** → add or connect **onwen.com** (or link it to your account).
  - In your **domain registrar** (where you bought onwen.com): set the domain’s **nameservers** to the ones Hostinger gives you (e.g. `ns1.dns-parking.com` and `ns2.dns-parking.com` or whatever Hostinger shows for your account).
  - After propagation, Hostinger will resolve onwen.com and you can attach it to your hosting/Horizons project.

- **Option B – Keep DNS elsewhere (A/CNAME)**  
  If you leave DNS at your current provider:
  - Get Hostinger’s **server IP** (in hPanel: **Hosting** → your plan → **IP Address**, or ask support).
  - At your DNS provider, add an **A** record: **@** (or **onwen.com**) → that IP.
  - For **www**: add a **CNAME** record **www** → **onwen.com** (or the hostname Hostinger gives you).

Wait for DNS to propagate (minutes to 48 hours). You can check with `dig onwen.com` or any “DNS lookup” tool.

---

## 2. Attach onwen.com to your site in Hostinger

How you do this depends on how the app is hosted:

- **Hostinger Horizons (current live setup)**  
  In the **Horizons** dashboard for this project, open **Settings** or **Domain** and add **onwen.com** (and **www.onwen.com** if you want). Save. Horizons will serve the app for that domain.

- **Shared hosting (VPS / public_html)**  
  In **hPanel** → **Domains** → **Attach domain** (or **Add domain**), add **onwen.com** and choose the folder where the built app lives (e.g. the folder containing your `index.html` and assets from `npm run build`). If the app is in a subfolder, you may need to set the document root to that folder.

After this, Hostinger will respond on **https://onwen.com** once SSL is set up (see below).

---

## 3. Turn on SSL (HTTPS) for onwen.com

In **hPanel** (or Horizons, if that’s where the domain is managed):

- Go to **SSL** or **Security** for the domain **onwen.com**.
- Enable **Free SSL** / **Let’s Encrypt** and apply it to **onwen.com** (and **www.onwen.com** if you use it).

Hostinger will issue the certificate automatically once DNS for onwen.com points to Hostinger. After it’s active, use **https://onwen.com** for the site.

---

## 4. Supabase (login / password reset / magic links)

So sign-in and email links work on **onwen.com**:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.
2. Set **Site URL** to **https://onwen.com** (or **https://www.onwen.com** if that’s the main one).
3. In **Redirect URLs**, add:
   - `https://onwen.com/**`
   - `https://www.onwen.com/**` (if you use www)

Save. No code changes are needed; the app already uses your Supabase project.

---

## Checklist

- [ ] DNS for **onwen.com** points to Hostinger (nameservers or A/CNAME).
- [ ] **onwen.com** is attached to this project in Hostinger (Horizons or domain settings).
- [ ] SSL is enabled for **onwen.com** in Hostinger.
- [ ] Supabase **Site URL** and **Redirect URLs** include **https://onwen.com** (and www if used).
- [ ] Visit **https://onwen.com** and test the app and login flow.

If something doesn’t match your Hostinger plan (e.g. no “Horizons” or different menus), use Hostinger’s help or support; the idea is always: **point the domain to Hostinger → attach the domain to the site → enable SSL → set Supabase URLs to onwen.com.**

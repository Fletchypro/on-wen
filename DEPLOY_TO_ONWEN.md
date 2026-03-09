# Deploy from localhost to onwen.com

Step-by-step: build the app, put it on a server, and point onwen.com to it.

---

## Step 1: Build the app on your computer

In the project folder, in Terminal:

```bash
npm install
npm run build
```

When it finishes, you’ll have a **`dist/`** folder. Everything inside that folder is your live site (HTML, JS, CSS). You’ll upload **the contents** of `dist/` in the next step.

---

## Step 2: Get hosting for onwen.com

You need a place on the internet that will serve those files. Two common options:

### Option A: Hostinger shared hosting

- Log in to **Hostinger** (hpanel.hostinger.com).
- Go to **Websites** or **Domains**.
- **Add** or **attach** the domain **onwen.com** to your hosting account (e.g. “Add website” or “Connect domain” and choose onwen.com).
- Note the folder where this site’s files go (usually **`public_html`** for the main domain). You’ll upload the contents of `dist/` into that folder.

### Option B: Hostinger VPS (or any VPS)

- Create a **VPS** in Hostinger and note its **IP address**.
- Connect by **SSH** (Terminal: `ssh root@YOUR_VPS_IP`).
- Install a web server, e.g. **nginx**:
  - Ubuntu/Debian: `apt update && apt install -y nginx`
  - Create a folder for the site, e.g. `mkdir -p /var/www/onwen`
- Copy your built files to the server. From **your Mac** (in the project folder):
  ```bash
  scp -r dist/* root@YOUR_VPS_IP:/var/www/onwen/
  ```
- Configure nginx to serve that folder and respond to `onwen.com` (see Step 4 for a minimal config).

Use **one** of these (shared or VPS). The rest of the steps assume you have a “place” where the site will live.

---

## Step 3: Upload the built files

### If using Hostinger shared hosting

1. In hPanel, open **File Manager**.
2. Go to the folder for onwen.com (often **`public_html`**). If there’s already an `index.html` or other files from a default page, you can delete them (or replace them).
3. **Upload** the **contents** of your **`dist/`** folder:
   - So that **`index.html`** is directly inside `public_html` (not inside a `dist` subfolder).
   - And the **`assets/`** folder (with JS and CSS) is also directly inside `public_html`.

So on the server it should look like:

- `public_html/index.html`
- `public_html/assets/...` (all the built JS/CSS files)

### If using a VPS

You already copied with `scp` in Step 2. Make sure `/var/www/onwen/` (or your folder) contains `index.html` and `assets/` at the top level.

---

## Step 4: Point onwen.com to your server (DNS)

Where **onwen.com** is registered (Hostinger Domains, or another registrar):

1. Open **DNS** or **DNS Management** for **onwen.com**.
2. **If your site is on Hostinger shared hosting:**
   - Often Hostinger will tell you to set **nameservers** to Hostinger’s (e.g. `ns1.dns-parking.com`, `ns2.dns-parking.com` — use what Hostinger shows for your account). Do that and save.
   - Or, if you keep DNS elsewhere: add an **A** record: **@** (or host `onwen.com`) → your Hostinger server **IP** (shown in hPanel).
3. **If your site is on a VPS:**
   - Add an **A** record: **@** → your **VPS IP address**.
   - Optionally **www**: add a **CNAME** record **www** → **onwen.com** (or the value your host suggests).

Wait a few minutes (up to 24–48 hours) for DNS to update. You can check with a browser or a site like [whatsmydns.net](https://www.whatsmydns.net) for onwen.com.

---

## Step 5: Turn on HTTPS (SSL) for onwen.com

### Hostinger shared hosting

- In hPanel, go to **SSL** or **Security** for the domain **onwen.com**.
- Enable **Free SSL** / **Let’s Encrypt** for onwen.com (and www if you use it). Save.

### VPS (nginx)

- Install Certbot and get a certificate, e.g.:
  ```bash
  apt install -y certbot python3-certbot-nginx
  certbot --nginx -d onwen.com -d www.onwen.com
  ```
- Follow the prompts. Certbot will configure nginx for HTTPS.

After this, **https://onwen.com** should load your site.

---

## Step 6: Single-page app (SPA) routing

Your app uses client-side routing (e.g. `/dashboard`, `/login`). The server must serve **`index.html`** for those paths so the React app can load and then handle the route.

### Hostinger shared hosting

- If there’s an **.htaccess** file in `public_html`, it may already have rules to send requests to `index.html`. Your project has a `public/.htaccess`; **copy it** into `public_html` (or merge its rules into the existing one). It should contain something like:
  - “If the request is not for a real file or directory, rewrite to index.html.”

### VPS (nginx)

- In your nginx **server** block for onwen.com, add a **try_files** rule so that non-file requests go to `index.html`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name onwen.com www.onwen.com;
    root /var/www/onwen;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then reload nginx: `systemctl reload nginx`. (SSL with Certbot will add `listen 443` and certificate paths.)

---

## Step 7: Tell Supabase about onwen.com

So login, signup, and password reset work on the live domain:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Open **Authentication** → **URL Configuration**.
3. Set **Site URL** to: **`https://onwen.com`** (or `https://www.onwen.com` if that’s the main one).
4. In **Redirect URLs**, add:
   - `https://onwen.com/**`
   - `https://www.onwen.com/**` (if you use www)

Save. Your app code already uses this Supabase project; no code changes needed.

---

## Step 8: Check that everything works

1. Open **https://onwen.com** in a browser (use HTTPS).
2. You should see your app (landing or login).
3. Try **Sign up** or **Log in** — you should be able to complete auth and get redirected back to onwen.com.
4. Try opening **https://onwen.com/dashboard** (or another route) and refresh — the page should load, not 404.

If anything doesn’t work, check: DNS (onwen.com points to your server), SSL (padlock in browser), and Supabase URL/Redirect URLs (must use https://onwen.com).

---

## Quick checklist

| Step | What to do |
|------|------------|
| 1 | Run `npm run build`; use the **`dist/`** folder. |
| 2 | Get hosting (Hostinger shared or VPS) and a place for the site (e.g. `public_html` or `/var/www/onwen`). |
| 3 | Upload **contents** of `dist/` so `index.html` and `assets/` are in the site root. |
| 4 | Point **onwen.com** DNS (A record or nameservers) to that server. |
| 5 | Enable **SSL** for onwen.com. |
| 6 | Ensure server serves **index.html** for SPA routes (.htaccess or nginx `try_files`). |
| 7 | In Supabase, set **Site URL** and **Redirect URLs** to **https://onwen.com**. |
| 8 | Test https://onwen.com and login/signup. |

After this, your app is live at **onwen.com** instead of localhost.

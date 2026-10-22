# Umami

## Documentation

- [Umami documentation](https://docs.umami.is) — adding websites, the tracker, reports and the dashboard

## What you get on StartOS

Two interfaces:

- **Dashboard** — where you sign in, add your websites and read their statistics. It doesn't need
  a public address; keep it on your LAN, Tor or VPN.
- **Tracker** — serves only the tracking script and the endpoints it reports to. This is the
  address your sites' visitors load, so it needs a public domain.

Umami's telemetry, update notices and the favicons it would fetch from DuckDuckGo for each
referrer are switched off.

## Getting set up

1. **Run Set Admin Password.** StartOS asks for it before Umami can start. Copy the username
   and password it shows.
2. **Start Umami and sign in** on the **Dashboard** interface.
3. **Give the Tracker a public domain.** On the **Tracker** interface, add a public domain. Pick a
   name that doesn't start with `umami.`: ad blockers block tracking scripts from hosts named
   that way. Something like `stats.example.com` works.
4. **Add a website.** In the dashboard, click **Websites**, then **Add website**, and enter its
   name and domain.
5. **Copy the tracking code.** Click **Edit** on the website and copy the code under
   **Tracking code**. It contains the address you opened the dashboard on. Replace that address
   with your Tracker's public domain, so it reads like this:

   ```text
   <script defer src="https://stats.example.com/script.js" data-website-id="…"></script>
   ```

6. **Paste it into your site's `<head>`.** In Ghost, open **Settings**, find **Code injection**,
   and paste it into **Site header**.
7. **Visit your site.** The visit shows up in the dashboard within a few seconds.

## Using Umami

### Actions

- **Set Admin Password** — generates a new password for the admin account and shows it. Run it
  again whenever you lose the password; each run replaces the previous one.

### Your own visits

To keep your own visits out of the statistics, open your site, open the browser's developer
console, and run `localStorage.setItem('umami.disabled', 1)`. It applies to that site in that
browser only.

### Links and pixels

Umami's links and pixels work through the Tracker too. The URLs Umami shows for them use the
dashboard's address; swap in your Tracker's public domain before you share them.

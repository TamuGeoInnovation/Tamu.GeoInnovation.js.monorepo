# How these images were made (#3747)

Admin > Dashboards > Accounts, taken by [`capture.mjs`](capture.mjs) in the Playwright image (`v1.65.1-noble`) on the home machine, 26 November 2026. Two builds were used:

- **Before:** `gisday-angular:build-app:local` at `development`.
- **After:** the same build at this branch.

Each was served from its `dist` folder by `serve-dist.js`.

**Nobody signed in.** The browser answered Auth0's silent sign-in itself, so nothing reached Auth0:

- a cookie that tells Auth0's SDK a session may exist;
- an `/authorize` page that posts back a code;
- an `/oauth/token` answer with unsigned tokens: an ID token carrying the `GIS Day Admin` role and the request's own nonce, and an access token with `read:users`.

**The API was answered by the browser too.** It gave two seasons and the same made-up counts to both builds. For "unavailable", each build got what its own API sends when Auth0 answers 429, as the specs prove:

- `development`'s API: **500**.
- this branch's API: **503** with `Retry-After: 12`.

| Image                    | Build       | The dashboard's answer                     |
| ------------------------ | ----------- | ------------------------------------------ |
| `before-counts.png`      | development | 200, the counts                            |
| `after-counts.png`       | this branch | 200, the counts (byte-identical to before) |
| `before-unavailable.png` | development | 500, as Auth0's 429 became                 |
| `after-unavailable.png`  | this branch | 503, `Retry-After: 12`                     |

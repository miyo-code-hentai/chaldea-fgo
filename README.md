# Chaldea Fanpage — Astro + Svelte

Astro 7 (SSR, Node adapter) + Svelte 5 + Tailwind 4. Accounts, the servant database, comments and the forum
run on a built-in SQLite file, so there is nothing else to host.

## Run it

```bash
npm install
cp .env.example .env     # put your own email in ADMIN_EMAILS
npm run dev              # http://localhost:4321
npm run build && node dist/server/entry.mjs
```

Needs **Node 22.13 or newer** (the database is `node:sqlite`, no native modules to compile). Node 22 prints an
"experimental" warning for it; that is harmless.

Everything the community creates lives in `./data` (`chaldea.db` and `uploads/`). Back that folder up. Set
`DATA_DIR` to move it.

## Becoming admin

1. Sign up on `/signup` with your email.
2. Put the same email in `ADMIN_EMAILS` in `.env` and restart.
3. Your profile now shows **Admin panel** (`/admin`). From there you can promote other users to admin without
   touching `.env`.

## What is where

| Feature                    | Page / component                                    | API                                   |
| -------------------------- | --------------------------------------------------- | ------------------------------------- |
| Site logo                  | `Emblem.svelte` (masks `public/assets/logo/*.png`)  | —                                     |
| Loading screen + audio gate| `SiteGate.svelte`, `LoadingScreen.svelte`           | —                                     |
| Servant class roulette     | `ClassRoulette.svelte` (About page)                 | —                                     |
| Accounts                   | `/login`, `/signup`, `AuthForm.svelte`              | `/api/auth/*`, `/api/me`              |
| Profile card, favourites   | `/account` (`ProfileApp`), `/u/<id>` (public card)  | `/api/me`, `/api/favorites/<id>`, `/api/upload` |
| Admin panel                | `/admin` (`AdminApp.svelte`)                        | `/api/servants*`, `/api/admin/users*` |
| Grand Order comments       | "Comments" tab of every record (`CommentsPanel`)    | `/api/comments`                       |
| Forum                      | `#/forum` (`Forum.svelte`, `ForumTopic.svelte`)     | `/api/forum/*`                        |

Server code is in `src/lib/server/` (database, uploads, validation, rate limits). Shared types are in
`src/lib/types.ts`.

### Loading screen

The artwork in `public/assets/loading/` is shown one picture at a time. Browsers block audio until the visitor
does something, so the screen ends with **Press Space or Enter**; that key press unlocks the music. It is shown
once per browser session. To change the order or add pictures, edit `src/lib/loading.ts`.

### Servant database

Admins add servants one by one (with an image upload) or paste a JSON array under **Bulk import**:

```json
[
  { "name": "Artoria Pendragon", "class": "Saber", "rarity": 5, "trueName": "Arthur Pendragon",
    "origin": "Arthurian Legend", "alignment": "Lawful Good", "description": "…", "image": "" }
]
```

Allowed classes: Saber, Archer, Lancer, Rider, Caster, Assassin, Berserker, Ruler, Avenger, Moon Cancer,
Alter Ego, Foreigner, Pretender, Beast, Shielder. `image` may be empty, an uploaded `/uploads/…` file or a
file you placed under `public/assets/`. Users then star servants from their profile; the stars show on their card.

### Safety notes

- Passwords are hashed with scrypt; the session cookie is httpOnly and only its hash is stored.
- Every state-changing API checks the request origin; login, signup, posting, voting and uploads are rate limited
  (in memory, per server process).
- Uploads accept PNG, JPG, WebP and GIF only (checked by file signature, not by file name) and are stored under
  random names.
- User text is always rendered as text, never as HTML.
- Behind a reverse proxy, make sure the proxy forwards the real client address, or the per-IP limits will count
  everyone as one visitor.

## Chapters and look (earlier updates)

- Editorial look (`src/styles/editorial.css`) on top of the existing animations; the community screens use
  `src/styles/community.css`.
- Chapters: I, I.5, II only. Ordeal Call is a sub-tab of Chapter II (after Nahui Mictlan), ending with Lostbelt No.0.
- Every record has its own panel transition and music; Solomon (Ω) and Lostbelt No.0 have their own animations.
- Record details open as a transparent floating page instead of a side bar.
- About page rebuilt from the TYPE-MOON wiki; CHALDEAS is the last, special system. See `ASSETS_GUIDE.md` for
  new images and music.

## Dropped from the original Figma export

Custom head/body scripts, Google Analytics, the "skip to content" bypass link, robots/OG image settings and the
`/.figma/make/[asset]` route. Title and description are set per page in `Layout.astro`. The Payload CMS
dependency is gone; `src/lib/auth.payload.reference.ts.txt` is kept only for reference.

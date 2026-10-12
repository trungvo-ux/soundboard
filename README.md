# Trung's Portfolio 2026

Personal portfolio site for **Trung Vo**, product designer at [IBM](https://www.ibm.com/). The homepage opens with an interactive soundboard and a live “last seen” status line; the rest of the site covers selected work, about, inquiries, and a personal lifeline timeline.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage — soundboard, intro, last-seen status, social links |
| `/works` | Selected product design work and case studies |
| `/about` | About copy and interactive Mii |
| `/email` | Inquiries / contact |
| `/lifeline` | Personal timeline (Lifeline component) |
| `/study/[slug]` | Individual case study pages |

Primary nav: Home, Works, About, Inquiries. The lifeline lives at its own route with its own chrome.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- [three.js](https://threejs.org/) / React Three Fiber (about-page Mii and related 3D)
- [next-themes](https://github.com/pacocoursey/next-themes) (lifeline theme switcher)
- shadcn / Base UI primitives where used

Package manager: **pnpm**.

## Run locally

```bash
pnpm install
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

```bash
pnpm build   # production build
pnpm start   # serve the build
pnpm lint
```

## Site URL and metadata

Absolute Open Graph / Twitter image URLs need a base URL. In `app/layout.tsx`, `metadataBase` is derived as:

1. `NEXT_PUBLIC_SITE_URL` if set (preferred for production)
2. else `https://${VERCEL_PROJECT_PRODUCTION_URL}` on Vercel
3. else `http://localhost:3000` for local/dev

Site title and default description are defined there as **Trung's Portfolio 2026**. Set `NEXT_PUBLIC_SITE_URL` to your canonical origin (for example `https://your-domain.com`) so link previews resolve correctly.

## Updating the “last seen” line

The homepage status line is driven by a small config in `components/home-experience.tsx`:

```ts
const lastSeen = {
  city: "San Jose",
  activity: "at a shooting range",
  at: "2026-10-11T19:30:40Z",
}
```

| Field | Meaning |
| --- | --- |
| `city` | City shown at the end of the line |
| `activity` | What you were doing (e.g. `at a shooting range`) |
| `at` | ISO 8601 timestamp of when you were last seen |

The relative label updates on the client (and refreshes periodically / on focus):

| Elapsed | Label |
| --- | --- |
| under 1 hour | `N minute(s) ago` |
| under 24 hours | `N hour(s) ago` |
| 24–48 hours | `yesterday` |
| 48+ hours | `N days ago` |

Edit `city`, `activity`, and `at` whenever the status changes; the relative phrasing keeps running from `at` across visits. The line is revealed after mount so the server never ships a stale relative time, and the text sizes to the real label (no reserved gap).

## License

This repository includes Lifeline and related demo code originally published under the [MIT License](./LICENSE) (Copyright © 2026 Evil Rabbit). Portfolio content and branding are Trung Vo’s.

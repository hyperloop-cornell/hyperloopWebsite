# Cornell Hyperloop Website

Static multi-page website for the Cornell Hyperloop student project team. No build step — open any `.html` file directly in a browser or serve from a local HTTP server.

## Stack & Design Decisions

- **Tailwind CSS (CDN)** — No build toolchain. The full Tailwind config (colors, spacing, typography) is inlined in a `<script>` tag on every page. This keeps the project zero-dependency while allowing a fully custom design system.
- **Material Symbols (Google Fonts)** — Icon font loaded per-page with only the icons that page needs, keeping network payloads small.
- **Space Grotesk + Inter** — Space Grotesk for all headings/labels (technical, uppercase aesthetic); Inter for body copy (readability).
- **Dark-only theme** — `<html class="dark">` is hardcoded. The color palette is a Material Design 3-style dark scheme with Cornell red (`#d22b2b`) as the primary container accent.
- **`shared.js`** — Single shared script that renders the nav and footer into `#nav-placeholder` / `#footer-placeholder` divs on every page. Also handles subdirectory path prefixing (`../`) for pages inside `subteam-views/` and registers the service worker.
- **Service Worker (`sw.js`)** — Cache-first strategy. On activation it prefetches all pages and `members.json` so the site works offline after first visit.
- **`res/members.json`** — Single source of truth for all team member data (faculty, leads, subteam leads, members). `members.html` fetches this at runtime and renders cards via JS. Updating the roster only requires editing this file.
- **Lazy loading + IntersectionObserver** — `members.html` renders skeleton placeholders and swaps in real member cards only when they scroll into view, keeping initial paint fast with a large photo roster.
- **`.avif` / `.webp` assets** — Optimized site imagery lives in `res/`, `res/avifs/`, and `res/compressed_teamPhotos/`. Original JPG/PNG sources and retired drafts live in `res/unused/`.

## File Structure

```
hyperloop_website/
├── index.html                  # Home — hero, mission, stats, subsystem overview
├── subteams.html               # Engineering divisions overview (card grid)
├── members.html                # Full roster, data-driven from members.json
├── apply.html                  # Recruitment / application page
├── sponsors.html               # Sponsor logos and tiers
├── shared.js                   # Nav + footer renderer, service worker registration
├── sw.js                       # Service worker (cache-first, prefetch on load)
├── members.json                # Symlink/copy of res/members.json (used by sw.js cache path)
├── subteam-views/
│   ├── subteam-structures.html # Mechanical · Structures detail page
│   ├── subteam-braking.html    # Mechanical · Braking detail page
│   ├── subteam-magnetic.html   # Electrical · Magnetic Levitation detail page
│   ├── subteam-power.html      # Electrical · Power detail page
│   ├── subteam-ecc.html        # Electrical · ECC detail page
│   └── subteam-business.html   # Business detail page
├── res/
    ├── members.json            # Roster data: faculty, teamLeads, subteamLeads, members
    ├── compressed_teamPhotos/  # Web-optimized team headshots (used by members.html)
    ├── avifs/                  # Shared AVIF versions of subteam/section images
    ├── sponsors/               # Sponsor logo PNGs
    ├── unused/                 # Original/source images and retired experiments
    └── *.avif / *.webp / *.png / *.jpg # Optimized site imagery kept at the top level when needed
```

## Adding / Editing Content

- **Roster** — Edit `res/members.json`. Each person needs `name`, `role`, `subteam`, `photo` (filename in `compressed_teamPhotos/`), and optionally `linkedin`.
- **Image optimization** — Run `tools/convert_images.py` to convert any new JPG/PNG assets to AVIF before referencing them in HTML or `res/members.json`.
- **New subteam page** — Copy an existing file from `subteam-views/`, update content, add a card to `subteams.html`, and add the path to the `PAGES` array in `sw.js`.
- **Nav links** — Edit the `NAV_LINKS` array at the top of `shared.js`.
- **Color / typography** — The Tailwind config block is duplicated in each HTML file's `<head>`. Update all files if changing the design system (or consolidate into a shared config file if a build step is introduced).

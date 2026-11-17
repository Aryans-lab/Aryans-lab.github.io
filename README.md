# aryanbandyopadhyay.me

The personal academic site of **Aryan Bandyopadhyay** — Integrated M.Sc. Physics at NISER
Bhubaneswar, DST-DISHA Scholar.

Live at **[aryanbandyopadhyay.me](https://aryanbandyopadhyay.me)** (GitHub Pages, `main` branch).

---

## What this is

A single hand-built page. No framework, no build step, no CDN, no analytics, no third-party
fonts, no tracking. Everything is served as static files straight from this repository.

```
.
├── index.html                  the site
├── 404.html                    themed "out of the depletion region" page
├── manifest.webmanifest        installable web app metadata
├── robots.txt  sitemap.xml     crawling
├── CNAME                       aryanbandyopadhyay.me
├── CV_Aryan_Bandyopadhyay.pdf  curriculum vitae
└── assets/
    ├── css/site.css            design system + components (~3.3k lines)
    ├── js/site.js              all behaviour (~1.6k lines)
    ├── fonts/                  self-hosted WOFF2 (Inter, Instrument Serif, JetBrains Mono)
    └── img/
        ├── figures/            real research output, pulled from the project repositories
        ├── favicon.svg  favicon.ico  icon-*.png  apple-touch-icon.png
        └── og-card.png         1200×630 social card
```

## Why it looks like this

The page is styled as an **instrument panel** rather than a résumé: a precise, editorial
serif for names and headings, a monospace face for anything numeric, and hairline rules
instead of boxes. Two themes share one token set:

| Token | Obsidian lab (default) | Journal paper (light) |
| --- | --- | --- |
| `--bg` | `#05070c` | `#f7f5f0` |
| `--ink` | `#f1f5f9` | `#0d1522` |
| `--signal` | `#38bdf8` | `#0369a1` |

Both themes were audited against WCAG 2.1 AA for text contrast; the light theme changes the
accent *and* the on-tint text colours, because a cyan that reads well on obsidian is illegible
on paper.

## The interactive parts are real

Nothing on this page is a screenshot pretending to be a simulation.

- **Hero instrument.** Two modes. *4H-SiC LGAD* animates carrier drift and impact-ionisation
  multiplication through the gain layer — click the canvas to inject a ²⁴¹Am α-track.
  *Burgers shock* draws the exact travelling `tanh` solution and its `k⁻²` spectrum.
- **Lab · 4H-SiC LGAD.** A live analytic instrument: bias slider, fluence toggle, and a
  switch between the `1/C²` Mott–Schottky characteristic and the internal field profile.
  Values are anchored to the measured quantities of the study (`V_pt = 75.5 V`,
  `E_peak ≈ 1.71 MV/cm`, `M = 2.02–2.84`, `α-CCE = 52.5 %` at `10¹⁴ n_eq/cm²`).
- **Lab · Burgers.** Recomputes the exact shock for any viscosity and runs a **1024-point
  radix-2 FFT in the browser** to produce the energy spectrum, then least-squares fits the
  inertial range. No chart library is involved — `assets/js/site.js` contains a small canvas
  plotting core with linear and log axes.
- **Lab · Galaxy / PINN.** The committed figures from each repository, shown unedited.

Every figure in the research cards is genuine output from the linked repository — the
Burgers figures from `project_burgulence/figures`, the galaxy figures from
`results/figures`, and the PINN figures from `results/uv_divergence` and
`results/bias_vs_weight`.

## Accessibility & performance notes

- Semantic landmarks (`header`/`nav`/`main`/`footer`), one `h1`, ordered headings.
- All controls are real buttons with `aria-pressed` / `aria-selected` state.
- Full keyboard support: `⌘K` / `Ctrl-K` command palette, `↑ ↓` to move, `↵` to run,
  `Esc` to dismiss; `/` focuses the research filter.
- `prefers-reduced-motion` disables every animation and renders the hero as a single frame.
- Fonts are self-hosted and preloaded; the page makes **zero third-party requests**.
- A print stylesheet turns the page into a clean academic hand-out.

## Local development

Any static server works — there is nothing to compile.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deployment

Push to `main`. GitHub Pages serves the repository root (`build_type: legacy`,
source `main:/`), and `CNAME` points it at `aryanbandyopadhyay.me`. HTTPS is enforced on the
custom domain.

## Editing content

- **Projects** live in two places that must stay in sync: the markup in `index.html`
  (`data-project` articles) and `PROJECT_SPECS` in `assets/js/site.js` (the technical sheet,
  metrics and BibTeX for each project).
- **Coursework** is the `DATA` array in the `Courses` module of `assets/js/site.js`.
- **Honours, labs and copy** are plain markup in `index.html`.
- After replacing `CV_Aryan_Bandyopadhyay.pdf`, update the `lastmod` dates in `sitemap.xml`.

---

Built by hand. If something is wrong, the bug is in this repository and nowhere else.

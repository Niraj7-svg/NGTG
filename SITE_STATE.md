# SITE_STATE: NGTG website, as it is now

Snapshot of the site's current state, written so someone can design new features without reading the code. It describes what exists. Nothing here is a plan.

The site is a personal portfolio and weekly devlog for "Niraj" (3D artist and video editor, building a first game in public). It is designed as a light **pinboard**: photos and clippings are taped on, short text sits on sticky notes, long text sits on pinned sheets. All content comes from files in `content/`.

## 1. Tech stack

- **Next.js 16.4.5**, **App Router** (`app/`), Turbopack. AGENTS.md at the root says this Next.js version has breaking changes and to read `node_modules/next/dist/docs/` before writing code.
- **React 19.3.1**. JavaScript with JSX, no TypeScript. Server components everywhere except one client component, `CompareSlider`.
- **Styling:** one plain CSS file, `theme/theme.css`, imported in `app/layout.jsx`. CSS custom properties, no Tailwind, no CSS modules. Uses the `rotate` and `translate` properties and container query units (`cqw`).
- **MDX:** `next-mdx-remote` 6.0.0, the `/rsc` entry, with `blockJS: false` (see section 7). No remark or rehype plugins.
- **Other packages:** `yaml` 2.9.1. No devDependencies.
- **Fonts:** Fraunces and Caveat through `next/font/google`; Paper Mono self-hosted.
- **Scripts:** `dev`, `build`, `start`, `check` (`node scripts/check.mjs`). No tests, no linter, no `next.config`, no `tsconfig`.
- **Not a git repository.** `.gitignore` lists `node_modules`, `.next`, `.vercel`, `.DS_Store`, `.taste-skill`.
- **Rendering:** every route is static. `content/` is read from disk with `fs` at build time (and on each request in `npm run dev`).

## 2. Folder tree

```
.
├── AGENTS.md, SITE_STATE.md, CONTENT_GUIDE.md
├── package.json, package-lock.json, .gitignore
├── app/
│   ├── layout.jsx
│   ├── page.jsx                     Home
│   ├── about/page.jsx
│   ├── work/page.jsx
│   └── devlog/
│       ├── page.jsx
│       ├── [slug]/page.jsx
│       └── tag/[tag]/page.jsx
├── components/
│   ├── paper.jsx                    Polaroid, Clipping, Cutout, Photo, Gallery, Clip, Compare, Reel, Video, Sticky, Paper, Card, Fastened
│   ├── board.jsx                    PageTitle, SectionTitle, Tags, PostCard, WorkCard, isShort
│   ├── section.jsx                  <Section>: a titled sticky note with an optional taped picture
│   ├── mdx.jsx                      Body, Note, and the list of tools usable inside .mdx
│   ├── PostList.jsx                 Devlog list body
│   ├── Icon.jsx                     built-in logos
│   └── CompareSlider.jsx            the only client component
├── lib/
│   ├── content.js                   loads site.yml, content files, story, contact links
│   ├── schema.mjs                   field rules shared by the site and `npm run check`
│   └── hash.mjs                     hash-based "random but decided once" looks
├── scripts/check.mjs                `npm run check`
├── content/
│   ├── site.yml
│   ├── story.mdx                    "How it started" (Home)
│   ├── home.mdx                     optional: extra <Section>s on Home (does not exist yet)
│   ├── devlog/        01-sample-post.mdx (draft), .gitkeep
│   ├── work/, testimonials/, growth/    empty (.gitkeep)
│   └── _templates/    devlog.mdx, work.mdx, testimonial.mdx, growth.mdx
├── theme/theme.css
└── public/
    ├── fonts/         PaperMono.woff2, PaperMono-OFL.txt
    ├── story/         .gitkeep (the story picture goes here)
    └── .gitkeep
```

No favicon, no `public/textures/`, no `public/media/`.

## 3. Pages and routes

**Layout (`app/layout.jsx`):** the `<html>` carries the Fraunces and Caveat font variables. Metadata for every page: title is `site.name`, description is `site.tagline` (pages that set their own title string replace it; there is no title template). Header, `<main>`, footer.
- **Header** (plain, not pinned): brand link (site name) on the left; Devlog, Work, About and a red "Contact" button (to `/about#contact`) on the right.
- **Footer:** blue paper strip with a torn top edge. One centred row of the filled-in contact links from `site.yml`, each with its logo, no underline until hover. Empty if every link is `REPLACE`.

| Route | What it shows now |
|---|---|
| `/` | Row 1: a coral sticky holding the `h1` = `site.tagline` (handwriting if under 20 words, else serif). With a story picture file: left half = tagline note, then the picture as a taped newspaper clipping (caption and credit in small mono; the picture rises 12px under the note on desktop); right half = a large yellow sticky "How it started" with the story text. Without the picture file (the case today): the two notes stack, full width, and on desktop the story text runs in two columns. With no `story.mdx`: the tagline note only. Then, if `content/home.mdx` exists, has text and is not a live-site draft: its body, rendered with the same `Body`, so `<Section>` works (full-width stack of sections, no extra heading). Row 2 (if any posts): a "Latest devlogs" heading note and the 3 newest posts as sticky cards. Row 3 (if any featured work): a "Work" heading note and up to 3 featured work items as small taped cards linking to `/work#<slug>`. |
| `/devlog` | Page title note "Devlog". If any tags exist, a row of small notes: "all" plus one per tag in use (the current one is shown as a dark note). Posts as a grid of sticky cards: 2 per row on desktop, 1 on tablet and phone. If none: "No posts yet." |
| `/devlog/tag/[tag]` | Same as `/devlog`, filtered to one tag. Only existing tags are generated; others 404. |
| `/devlog/[slug]` | A large yellow sticky with the title (`h1`), "Ep N · date" in handwriting, then the tags as small notes. Then one pinned paper sheet (700px wide, centred) holding the reel (if `reel` is set) and the MDX body. At the bottom, previous and next as small notes. Only existing slugs are generated. |
| `/work` | Page title note "Work". If there is no work, no quote and no growth file: "Editing work coming soon." Otherwise sections that appear only when they have content: **Showreel** (the showreel taped, up to 960px, with its title and text on a sky-coloured note), **Projects** (cards in a grid: 3 columns desktop, 2 tablet, 1 phone), **What people say** (quotes as notes, 2 columns on desktop, 1 on tablet and phone), and the growth story (heading, a paper sheet with the start date, account and text, then the milestones as small notes in a wrapping row joined by a red thread, a vertical list on phone). |
| `/about` | Page title note "About". On desktop: the About text on a pinned sheet (centred, offset, or beside a Polaroid portrait if `photo` is set in `site.yml`), and below it the contact links as small notes with logos. Stacked on phone. The sheet's row has `id="contact"`. |

Post page details:
- A sheet that holds any picture, a reel, or more than 1,200 characters sits straight; only short text-only sheets tilt. This is because a tall tilted sheet swings sideways.
- On screens wider than 640px, `<Cutout>`, `<Photo>`, `<Clipping>`, `<Video>`, `<Clip>`, `<Compare>` and galleries break out of the sheet up to 960px wide. Polaroids stay 420px wide, centred. On screens wider than 1100px the reel floats to the right, 340px wide, hanging 90px over the sheet's edge; below 1100px it is centred.
- `previous` pointing at a draft or missing file drops the link and prints a build warning.

Work details:
- Order: showreel (the entry with `type: showreel` or `showreel: true`; a second showreel is listed as a normal project), then featured projects sorted by `order` (missing `order` last, then by date), then the rest by date.
- Project card: media (reel or video), title, "client · date", `did` labels as small notes, "Result: …", the MDX body, and any testimonials whose `project` is this file.
- Which media leads: `type` video or showreel prefers `video`, then `reel`; `type` reel or no type prefers `reel`, then `video`.
- A testimonial whose `project` is a draft or missing prints a warning; the quote still shows in "What people say".

## 4. Components

All look-and-feel components are server components. Every picture-like component takes an optional `tilt` (degrees) that replaces the computed tilt, and a `file` (the content file path, used only in warnings and errors; the MDX registry fills it in).

`components/paper.jsx`
- `Polaroid({ src, alt, caption, tilt, ratio = 'square' | 'landscape', small })`: fresh white-framed instant photo, handwritten caption in the bottom strip.
- `Clipping({ src, alt, caption, credit, creditLink, tilt, mono })`: aged newsprint, torn edge, grayscale with sepia and halftone dots, caption under it (italic serif, or small mono with `mono`).
- `Cutout({ src, alt, caption, tilt, small })`: plain paper with a margin and slightly uneven scissor-cut edges. `Photo` is an alias.
- `Gallery({ images, alts, style = 'cutout' | 'polaroid' | 'clipping' })`: a loose responsive grid of those items.
- `Clip({ url, poster, caption, tilt })`: silent looping MP4 on a cutout (`autoPlay muted loop playsInline preload="metadata"`). With "reduce motion" on, CSS hides the video and shows the `poster` (or a "Watch the short clip" link).
- `Compare({ before, after, alt, tilt })`: before/after slider on a cutout, using `CompareSlider`.
- `Reel({ url, tilt })`: Instagram embed iframe inside a Polaroid frame. Throws (build error naming the file) if the URL is not an Instagram `/reel/`, `/reels/` or `/p/` link.
- `Video({ url, poster, title = 'Video', tilt })`: YouTube links (watch, shorts, embed, youtu.be) become a `youtube-nocookie.com` iframe; anything else is a native `<video controls>`. On a cutout, 16:9.
- `Sticky({ color, pin = 'pin' | 'tape' | 'none', size = 'small' | 'medium' | 'large', tilt, seed, index = 0, href, id, className })`: a sticky note. `color` is `yellow | coral | sage | sky | pink`; without it the colour comes from a hash of `seed` (or the children's text) shifted by `index`, so neighbours differ. With `href` the whole note is a link (`<a>` for external and `mailto:`, `next/link` otherwise).
- `Paper({ pin = 'tape', seed, tilt, long, className })`: a larger pinned sheet of plain paper for long text. `long` forces it straight.
- `Card({ href, seed, className })`: a small taped, linking cutout (used for featured work on Home).
- `Fastened({ kind, seed, tilt, fasten = 'tape' | 'pin' | 'none', className, as, rootProps })`: the wrapper every item uses (tilt, shadow, fastener). `kind` is `polaroid | clipping | cutout | sticky | paper`.
- `stickyColor(key, index)` and `noteColors(keys, avoid)`: colour pickers. Neighbouring notes never share a colour, and `noteColors` also avoids the colour of the thing the notes sit on.

`components/board.jsx`
- `PageTitle({ children })`: a medium sticky with the page `h1`.
- `SectionTitle({ children })`: a small sticky with an `h2`.
- `Tags({ tags, draft, parent, active, linked })`: a row of small notes (link to the tag page; "draft" is not linked).
- `PostCard({ p, index, showReel, className })`: a sticky card: cover (taped cutout) or, with `showReel`, the reel; "Ep N · date" in handwriting; title link; summary; tags.
- `WorkCard({ w, className })`: a `Card` with the cover (if any), title and client.
- `isShort(text)`: true when text is under 20 words (the rule for using handwriting).

`components/mdx.jsx`
- `Body({ source, file })`: renders an MDX string. Tools available in `.mdx`: `Polaroid`, `Clipping`, `Cutout`, `Photo`, `Gallery`, `Clip`, `Compare`, `Reel`, `Video`, `Section`, `Note`, `Sticky`, `Paper`. Plain `![alt](url "caption")` renders as a `Cutout` (the title becomes the caption); a paragraph holding only a picture is unwrapped so no figure sits inside a `<p>`.
- `Section({ title, color, image, alt, caption, credit, creditLink, imageStyle = 'cutout', imageSide, index, file })` (`components/section.jsx`, tool `<Section>` in every `.mdx`): a large pinned sticky with the title (handwriting if under 20 words, else serif) and the children as text. With `image`: a 12-column row, picture half (taped, as `clipping`, `polaroid` or `cutout`) and note half. On desktop the side follows `imageSide`, else alternates left, right, left by the section's number in the file (`Body` adds `index`, skipping code samples); on tablet and phone the picture comes first. Without `image` the note is full width. Colour left out: from a hash of the file name plus position, stepping 2 per place, so neighbours never match. `credit` is a link only for `clipping`; for `polaroid` and `cutout` it is appended to the caption. `REPLACE` hides caption, credit and creditLink. Errors naming the file: no title, image without alt, bad `color`, `imageStyle` or `imageSide`.
- `Note({ children })`: renders a small sticky note (the old API kept).
- Also re-exports `Reel` and `Video`.

`components/PostList.jsx`: `PostList({ tag })` is the Devlog page body (page title, tag filter notes, post grid). `components/Icon.jsx`: `Icon({ name })`, logos `email`, `instagram`, `linkedin`, `youtube`, `github`, `artstation` in the current text colour; an unknown name draws nothing. `components/CompareSlider.jsx`: client component, `{ before, after, alt }`, a range input that sets the CSS variable `--pos`.

`lib/content.js`: `site()`, `list(folder)`, `story()`, `links(site)` (see section 5).

## 5. How content works

**Folders:** `content/devlog`, `content/work`, `content/testimonials`, `content/growth`, plus `content/story.mdx`. Each entry is a `.mdx` file: YAML frontmatter between `---` lines starting on line 1, MDX body below. The file name without `.mdx` is the `slug`. `_templates/` is never loaded. A missing or empty folder gives an empty list and the section hides.

**Loading:** `list(folder)` parses every `.mdx`, drops drafts when `NODE_ENV` is `production` (they show in `npm run dev`), and sorts newest first by `String(date)`; dates stay `YYYY-MM-DD` strings; no date sorts last. Each entry is `{ slug, file, data, body }`. Build errors are plain English and name the file: invalid YAML, header not starting on line 1, and `'<field>' is missing` for required fields (devlog `title`, `date`; work `title`; testimonials `name`; growth `milestones`; story `title`). The rules live in `lib/schema.mjs`.

**Fields the code reads**

| File | Fields |
|---|---|
| devlog | `title`, `date` (required); `episode`, `tags`, `summary`, `cover`, `reel`, `previous`, `draft` |
| work | `title` (required); `type` (showreel, reel, video), `date`, `client`, `clientLink`, `did` (list), `video`, `reel`, `cover` (poster for MP4 video), `result`, `featured`, `order`, `draft`; old `showreel: true` still works |
| testimonials | `name` (required); `role`, `link`, `photo`, `project` (a work file name), `date`, `featured`, `draft` |
| growth | `milestones` (required; each `date`, `followers`, `note`, optional `reel`); `title`, `account`, `started`, `draft`. Only the first file is used. |
| story | `title` (required), `image`, `alt`, `caption`, `credit`, `creditLink` (`REPLACE` hides caption, credit and link) |

**`content/site.yml`:** `name`, `tagline`, `about` (read by `/about`), optional `photo` (a picture link; shows a Polaroid on About; not currently set), and a `links:` list of `{ icon, label, url }` entries (see CONTENT_GUIDE.md). `links()` skips entries with no `url` or `url: "REPLACE"`, adds `mailto:` to a bare email address, and defaults `label` to the icon name. Current entries: email, an Instagram (label "Niraj"), an "NGTG" Instagram (`REPLACE`), LinkedIn (`REPLACE`), GitHub.

**`content/story.mdx`:** the four paragraphs of "How it started". Header: `title`; optional `image`, `alt` (needed with an image), `imageStyle` (`clipping` default, `polaroid`, `cutout`), `mono` (true default; only for a clipping), `caption`, `credit`, `creditLink` (`REPLACE` hides). A bad `imageStyle` or a non-boolean `mono` throws an error naming the file (and `npm run check` lists it). Today the file points at an external image link and has `imageStyle: polarized`, which is a typo: the site and `npm run check` report it until it is changed to `polaroid`.

**`content/home.mdx`:** optional. Header optional (a file with no `---` is all body); `draft: true` hides it on the live site only. No file or an empty body renders nothing. There is no `content/home/` folder. Template: `content/_templates/section-example.mdx`.

**`npm run check`** (`scripts/check.mjs`): reads `site.yml` and every `.mdx` in `content/` (not `_templates`) and prints plain-English problems, exit code 1 if any: invalid YAML, a Tab used to indent, unquoted text containing a colon, `#` or apostrophe, missing required fields, dates not `YYYY-MM-DD`, tags other than `mechanic`/`bug`/`cinematic`, bad `type`/`order`/`episode`/`did`, links not starting with `https://`, a non-Instagram reel link (header or `<Reel>`), `previous` or `project` pointing at a missing file, pictures with no alt text (`![](…)`, `<Polaroid>`, `<Clipping>`, `<Cutout>`, `<Photo>`, `<Compare>`, `<Gallery>` without `alts`, or a different number of `images` and `alts`), body text MDX cannot read (uses `@mdx-js/mdx` if present), `site.yml` links with an unknown icon or no url, `<Section>` without a title, with an image and no alt, or with a bad `imageStyle`, `imageSide` or `color`, and a bad story `imageStyle` or `mono`. Notes (not failures): links still `REPLACE`, story picture file missing.

## 6. Theme (`theme/theme.css`)

Named "theme-v4 Pinboard". Every colour, size, tilt range and gap is a token in the first `:root` block. Current values:

- **Board:** `--board #E9E4DA` (page background under the grain), `--vignette rgb(26 25 24 / .10)`, `--vignette-size clamp(80px, 12vw, 200px)` (a soft inner shadow at the screen edges, drawn by `body::after`).
- **Paper and ink:** `--paper #F0EEE9` (a reference; the board is a shade darker; no rule uses it), `--paper-raised #FAF9F6`, `--ink #1A1918`, `--accent #C8261C` (Contact button only), `--thread #C8261C` (the growth thread), `--paper-blue #2F4B7C` (footer).
- **Sticky notes (ink on each is at least 7.3:1):** `--note-yellow #EBCB5A`, `--note-coral #EE8E78`, `--note-sage #A9C2AC`, `--note-sky #9DB9D6`, `--note-pink #F2B8C2`. `--note-lift rgb(26 25 24 / .09)` is the darker strip along a note's bottom edge.
- **Pins:** `--pin-red #D8392B`, `--pin-blue #3A66B5`, `--pin-yellow #E8B923`, `--pin-green #3E9461`.
- **Paper items:** `--polaroid-frame #FCFBF8`, `--newsprint #E4DCC8`, `--newsprint-ink #2B2720`, `--halftone-opacity .32`, tape colours `--tape-cream / -yellow / -blue / -pink` (translucent), `--item-shadow`, `--item-shadow-small`.
- **Tilt:** `--tilt-<kind>-min` and `-max` for `polaroid` (.9 to 4deg), `clipping` (.9 to 3deg), `cutout` (.9 to 2.5deg), `sticky` (.9 to 3deg), `paper` (.25 to .6deg); `--tilt-phone .5` (tilt is multiplied by this on phones).
- **Texture:** `--texture-opacity .3`; `--texture` is an inline SVG `feTurbulence` filter (fractal noise, 400px tile, warm brown). No image file; the CSS comment says to swap in `url('/textures/paper.jpg')` if that file is added.
- **Type:** `--font-heading` and `--font-body` = Fraunces, Georgia; `--font-hand-stack` = Caveat then Segoe Print, cursive; `--font-mono` = Paper Mono. `--hand 1.4rem` (minimum handwriting size), `--hand-h clamp(1.9rem, 3.4vw, 2.6rem)`, `--h2 clamp(1.4rem, 2.2vw, 1.9rem)`, `--text 1.125rem`, `--small .875rem`.
- **Layout:** `--bp-phone 640px` and `--bp-desktop 1100px` (documentation only: CSS cannot read variables inside `@media`, so the numbers are written out in the media queries), `--m clamp(16px, 4vw, 32px)`, `--container min(1200px, 100% - 2 * var(--m))`, `--column 680px`, `--sheet 700px`, `--break min(960px, 100cqw)`, `--gap-s`, `--gap-m`, `--gap-l`, `--overlap 12px`.

**Fonts and loading:** Fraunces (`next/font/google`, `latin`, axes `SOFT` and `opsz`, variable `--font-display`); Caveat (`next/font/google`, `latin`, weights 500 and 700, variable `--font-hand`); Paper Mono (`@font-face` for `/fonts/PaperMono.woff2`, variable weight 100 to 900, `font-display: swap`). Paper Mono is used for `.meta` lines, the Contact button, small credits and Compare labels. Handwriting (`.hand`) is only for text under 20 words: headings on notes, tags, dates, "Ep N", Polaroid captions, short quotes, the tagline.

**Texture setup:** the page has the texture on `body::before` (fixed, multiply, `--texture-opacity`). Sheets, cutouts and clippings repeat it on themselves; the footer too.

**Grid and breakpoints:** `.grid` has 12 columns above 1100px, 6 columns from 641 to 1100px, 1 column at 640px and below. Column helpers `.s12 .s8 .s6 .s4 .s3`. The page container is `--container` (header, main, footer text). Running text stays within 680px; post sheets are 700px. Neighbours may overlap by 12px only above 1100px (the Home tagline note over the picture); never below.

**Tilt and fasteners:** each item gets a hash-based direction and position in its range (CSS custom properties `--ts` and `--tf`), turned into degrees by CSS from the token range. Below 640px the tilt is halved, shadows are lighter, and tape sits closer to the item so it stays inside the screen gutter. Tape is chosen from the item's hash: three layouts, three sizes, four looks. `top` = one strip across the middle of the top edge (lean -7 to 7 degrees); `corners` = two strips on the top corners, mirrored; `opposite` = two strips on the top-left and bottom-right corners (35 to 45 degrees). Each strip sits about 40% over the item's edge. Small items (`item-small`, `Card`, small notes) always use `top`. On narrow screens the strip's centre is pushed inward so it stays inside the screen gutter. The old `diag` layout is gone; `lib/hash.mjs` keeps the same draws, so tilt, edge, tape size and tone and pin colour are unchanged. Pins (four colours) and tape are decorative: `aria-hidden`, `pointer-events: none`.

**Motion:** the only motion is a 2px lift on linked notes on hover-capable screens wider than 1100px (not with reduce-motion). No entrance animations, no scroll effects.

## 7. Images, reels and videos

- Every picture, reel and clip is on a taped piece of paper (see section 4). Plain `![alt](url)` in MDX renders as a `Cutout`.
- Pictures are plain `<img loading="lazy" decoding="async">` (no `next/image`). No images are stored locally; content uses links to a media host. The only local assets are the fonts.
- Alt text is expected on every picture. If it is missing, `npm run dev` and the build log a warning naming the file, and an empty alt is used. `npm run check` lists it.
- **Looks are decided by the picture's link** (the `src`, or the `url` for reels, videos and clips; `before` for Compare): the same link gives the same tilt, tape and torn edge on every build, page and device. Hash: 32-bit FNV-1a with a seeded generator (`lib/hash.mjs`); no `Math.random`.
- **MDX security:** `Body` runs with `blockJS: false` so props like `images={["a","b"]}` work. `blockDangerousJS` stays on (blocks `eval`, `require`, `process` and similar). Only feed it your own content files.

## 8. Half-built, broken, or placeholder

- `content/story.mdx` has `imageStyle: polarized` (a typo for `polaroid`), so the Home page throws a clear error until it is fixed.

**Placeholder content**
- `story.mdx` points at `/story/tennis-for-two.jpg`, which is not in `public/story/` yet; `caption`, `credit` and `creditLink` are `REPLACE`. Until the picture exists, Home shows the two notes stacked and the story in two columns.
- `site.yml`: the "NGTG" Instagram and LinkedIn links are `REPLACE` (hidden). The `about` text contains an unedited line ("i can do a lot of things").
- The only devlog file is `01-sample-post.mdx` (`draft: true`). On the live site: Home has no "Latest devlogs", Devlog says "No posts yet." with no tag row, and no post pages exist.
- `content/work`, `testimonials` and `growth` are empty, so Work says "Editing work coming soon." and Home has no Work row.

**Not built or not present**
- No `photo` in `site.yml`, so About has no portrait. No favicon, social image, sitemap or robots file. No `public/textures/paper.jpg` (the SVG grain is used).
- Cloudflare R2, GitHub and Vercel are not connected (not a git repo).

**Quirks and limits**
- Embedded players (Instagram and YouTube iframes) do not show the browser's focus ring on the iframe itself; focus inside them is the player's own.
- `<Clip>` autoplays. With reduce-motion on, CSS hides it and shows the poster, so a `poster` is needed for a useful fallback; the video still loads in the background.
- Floating the reel beside short text on desktop leaves empty paper to its left (the reel is about 720px tall).
- A tall tilted sheet swings sideways by its height times the angle, which is why sheets with pictures sit straight and `--tilt-paper-max` is small.
- Tag note colours are picked by position, not by tag name (the earlier mechanic = sage, bug = coral, cinematic = mustard mapping is gone).
- `Sticky` colours are guaranteed different only for neighbours in one row or in a 2- or 3-column grid.
- `--bp-phone` and `--bp-desktop` are documentation; the breakpoints are also written as numbers in the media queries and must be changed in both places.
- `ICONS` in `lib/schema.mjs` and the keys in `components/Icon.jsx` must be kept in step by hand.

**Verified with temporary test content (since removed):** all five widths (390, 768, 1024, 1440, 1920) on the CSS as it stood just before the last few fixes, then again at 1440 and 390 after them. Results: no cut-off items or sideways scroll after the fixes, handwriting only under 20 words and at least 22.4px, no adjacent notes with the same colour, no text covered by another note, pin or tape, ink contrast at least 4.5:1 on every note colour, tilt identical after reload and after a production rebuild, every tilt inside its token range, the Compare slider moves with the arrow keys.

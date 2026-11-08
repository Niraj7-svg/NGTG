# How to change your site

You do not need to code. Everything on the site comes from text files in the `content/` folder. You copy a block from this page, change the words, and save.

Two words used here:
- **Header**: the few lines at the top of a file, between two `---` lines. They hold the facts (title, date).
- **Link**: a web address that starts with `https://`.

---

## Cheat sheet

| I want to… | Do this | Copy this |
|---|---|---|
| Write a devlog post | Add a file in `content/devlog/` | Recipe 1 |
| Put a titled note with a picture inside a post | Use `<Section>` | Recipe 2 |
| Choose how a picture looks | Add `imageStyle="…"` | Recipe 3 |
| Add sections to the Home page | Make `content/home.mdx` | Recipe 4 |
| Change the "How it started" picture | Edit `content/story.mdx` | Recipe 5 |
| Show an Instagram reel | Paste its link | Recipe 6 |
| Show a video or a looping clip | Use `<Video>` or `<Clip>` | Recipe 7 |
| Add an editing project | Add a file in `content/work/` | Recipe 8 |
| Add a client quote | Add a file in `content/testimonials/` | Recipe 9 |
| Add or change a contact link | Edit `content/site.yml` | Recipe 10 |
| Hide something for now | Add `draft: true` | Recipe 11 |
| Find mistakes | Type `npm run check` | The last part |

Blank files to copy are in `content/_templates/`.

## Rules for every file

- File names: lowercase, hyphens, no spaces. Start devlogs with the episode number: `03-wall-jump.mdx`.
- A file starts with `---` on **line 1**. Nothing above it, not even an empty line.
- Dates look like `2026-11-20`.
- Put "quotes" around header text that has a colon, a `#` or an apostrophe.
- Lists use square brackets: `[mechanic, bug]`.
- Indent with 2 spaces. Never the Tab key.
- Do not type `<` in normal writing. Write "less than".
- Every picture needs a description (`alt`). It is read aloud to blind visitors.

## How tilt and tape work

Each picture's tilt, torn edge, tape and pin colour are decided once, from the picture's link. The same link always looks the same.
If you change a picture's link, its look changes too.

---

## Recipe 1: Add a devlog post

Make a file like `content/devlog/03-wall-jump.mdx`:

```mdx
---
title: "Wall jump: why it felt floaty"
date: 2026-11-20
episode: 3
tags: [mechanic]
summary: "I doubled gravity on the way down."
cover: https://media.your-domain.com/devlog-03.jpg
reel: https://www.instagram.com/reel/XXXXXXXX/
previous: 02-coyote-time
---

Today I rebuilt the wall jump.

## What went wrong

The first version felt floaty.
```

Only `title` and `date` are needed. `tags` can be `mechanic`, `bug` or `cinematic`. `previous` is the earlier post's file name without `.mdx`.
**You will see:** the post on the Devlog page, and the 3 newest on Home. Use `## Heading`, `**bold**` and `[words](https://link)` in the text.
A `previous` that names a draft or a missing file is dropped, with a warning.

## Recipe 2: Add a section with a picture

A section is a sticky note with a title. With a picture, the picture takes one half. Put it in any `.mdx` file (a post, a project, or Home).

```mdx
<Section title="The first prototype" image="https://media.your-domain.com/proto.jpg" alt="A grey box jumping a gap" caption="Week one" imageStyle="polaroid" imageSide="left" color="sky">
Write the text here. Normal writing works, and so do other tools like a reel.
</Section>
```

Only `title` is needed. With `image` you also need `alt`.

| Option | Choices | If you leave it out |
|---|---|---|
| `color` | yellow, coral, sage, sky, pink | Picked for you. Neighbours never match. |
| `imageStyle` | clipping, polaroid, cutout | cutout |
| `imageSide` | left, right | left, right, left… in order |
| `caption`, `credit`, `creditLink` | any text, link | nothing. `REPLACE` hides it |

**You will see:** the picture taped on one half, the note on the other. On a phone the picture comes first. With no `image`, the note is full width.
Clipping shows the credit as a link. Polaroid and cutout put the credit after the caption, without a link.
For a full example with three sections, see `content/_templates/section-example.mdx`.

## Recipe 3: Choose the picture style

Use the same word in `<Section imageStyle="…">`, in `content/story.mdx`, or as the tool name in a post (`<Polaroid … />`).

| Style | Looks like | Good for |
|---|---|---|
| `polaroid` | White instant photo, handwritten caption, taped | Friendly moments, portraits |
| `clipping` | Torn grey newspaper cutting with dots, credit line | History, old photos |
| `cutout` | Picture on a plain piece of paper, taped | Screenshots, game footage |

Tools you can write straight in a post (each on its own line, with an empty line above and below):

```mdx
<Polaroid src="https://…/fix.jpg" alt="The fixed jump arc" caption="the fix" />

<Clipping src="https://…/old.jpg" alt="…" caption="…" credit="Photo: someone" creditLink="https://…" />

<Cutout src="https://…/shot.jpg" alt="…" caption="…" />

![Player sliding down a wall](https://…/slide.jpg "Optional caption")

<Gallery images={["https://…/a.jpg","https://…/b.jpg"]} alts={["What a shows","What b shows"]} style="polaroid" />

<Compare before="https://…/before.jpg" after="https://…/after.jpg" alt="The scene" />

<Note>Tip: lock the frame rate first.</Note>
```

`<Photo>` is the same as `<Cutout>`. To force a tilt, add `tilt="-3"` (degrees).

## Recipe 4: Add a Home section

Make `content/home.mdx`. It needs no header. Write sections in it:

```mdx
<Section title="What I'm building" image="https://…/game.jpg" alt="The game's first level" imageStyle="cutout">
A small platformer about a sleepy robot.
</Section>

<Section title="Why a devlog">
So you can watch me learn.
</Section>
```

**You will see:** the sections on Home, after "How it started" and before "Latest devlogs". No file, or an empty file, shows nothing.
To hide it for now, put `draft: true` in a header at the top (`---`, the line, `---`).

## Recipe 5: Edit the story picture

Open `content/story.mdx`. Change the header:

```mdx
---
title: "How it started"
image: "/story/tennis-for-two.jpg"
alt: "Two people playing Tennis for Two on an oscilloscope, 1958"
imageStyle: clipping
mono: true
caption: "Tennis for Two at Brookhaven, 1958"
credit: "Brookhaven National Laboratory"
creditLink: "https://commons.wikimedia.org/wiki/File:EXACT-FILE-NAME.jpg"
---
```

Put your picture file in `public/story/`. `alt` is needed with an image.
`imageStyle` is `clipping`, `polaroid` or `cutout` (left out = clipping). `mono: true` makes a clipping grey, `false` keeps colour (left out = true). `mono` only matters for a clipping.
`caption`, `credit` and `creditLink` set to `REPLACE` are hidden. The text under the header is the story.
**You will see:** the picture beside the story on Home. With no picture file, only the text shows.

## Recipe 6: Add a reel

The reel stays on Instagram. You only paste its link, which must contain `/reel/`, `/reels/` or `/p/`.

```mdx
<Reel url="https://www.instagram.com/reel/XXXXXXXX/" />
```

Or put `reel: https://www.instagram.com/reel/XXXXXXXX/` in a post's header to show it at the top of the post (and on its Home card when there is no `cover`).
**You will see:** the reel in a taped frame.

## Recipe 7: Add a video or a looping clip

```mdx
<Video url="https://www.youtube.com/watch?v=XXXXXXXXXXX" />

<Clip url="https://media.your-domain.com/jump.mp4" poster="https://media.your-domain.com/jump.jpg" caption="the jump" />
```

A YouTube link (watch, shorts, embed, youtu.be) becomes a player. Any other link is played as a normal video file. `<Clip>` is a short silent loop, an MP4 and never a GIF. Always give it a `poster`: people who turn on "reduce motion" see that picture instead.
**You will see:** the video in a taped frame.

## Recipe 8: Add an editing project

Make `content/work/streamer-highlights.mdx`:

```mdx
---
title: "Streamer highlights edit"
type: video
client: "Channel name"
clientLink: https://www.youtube.com/@channelname
did: [edit, motion graphics, sound]
video: https://www.youtube.com/watch?v=XXXXXXXXXXX
result: "Views doubled in a week."
featured: true
order: 1
---

Cut a 2-hour stream into a 6-minute highlight reel.
```

Only `title` is needed. Other fields: `type` (`showreel`, `reel` or `video`), `date`, `reel`, `cover` (only for an MP4 `video`), `draft`.
`type: showreel` puts it at the top. `featured: true` also shows it on Home (up to 3), sorted by `order`, smallest first. The rest follow by date.
**You will see:** a note on the Work page. With no work files, the page says "Editing work coming soon."

## Recipe 9: Add a client quote

Make `content/testimonials/channel-name.mdx`. The text is the quote.

```mdx
---
name: "Client Name"
role: "Streamer"
link: https://www.youtube.com/@theirchannel
photo: https://media.your-domain.com/client.jpg
project: streamer-highlights
featured: true
---

Niraj turned my messy footage into the best video on my channel.
```

Only `name` is needed. `project` is a work file's name without `.mdx`; the quote then also shows on that project.
**You will see:** the quote on the Work page. Quotes under 20 words are handwritten.

## Recipe 10: Add or change a contact link

Open `content/site.yml`. Each link is a block of three lines under `links:`:

```yaml
links:
  - icon: instagram
    label: "Personal Instagram"
    url: "https://www.instagram.com/yourhandle/"
  - icon: instagram
    label: "NGTG"
    url: "https://www.instagram.com/ngtg/"
```

`icon` can be `email`, `instagram`, `linkedin`, `youtube`, `github` or `artstation`. `label` is the words next to the logo (left out = the icon name). For `email`, `url` can be just the address. Copy a whole block to add a link. Set `url: "REPLACE"` to hide one.
The same file holds `name`, `tagline` and `about` (the About page text).
**You will see:** the links in the footer and on About, in the order you wrote them.

## Recipe 11: Hide something as a draft

Add `draft: true` to a file's header. Remove the line (or write `false`) to publish.
**You will see:** the file on your laptop, but not on the live site.
Growth story: `content/growth/from-zero.mdx` works the same way. Its header needs a `milestones` list (each with `date`, `followers`, `note`, and optionally `reel`), plus optional `title`, `account` and `started`. Only the first growth file is used.

---

## Publish a post

1. Upload pictures or clips to your media host and copy the links.
2. Copy a file from `content/_templates/` into its folder and rename it.
3. Fill in the header, paste the links, write the text.
4. Type `npm run check`, then `npm run dev` and open `localhost:3000`.
5. When it looks right, remove `draft: true`.

## When something goes wrong

Type this in the terminal, in the project folder. It lists every problem in plain words and names the file:

```
npm run check
```

| Message | What to do |
|---|---|
| "the header must start on line 1 with ---" | Delete anything above the first `---`, even an empty line. |
| "the header is not valid YAML" | Look for a missing quote, or a Tab instead of 2 spaces. |
| "the text for 'x' has a colon, # or apostrophe, so it needs quotes" | Put "quotes" around the text. |
| "'title' is missing" (or another name) | Add that line to the header. |
| "must be written year-month-day" | Write the date like `2026-11-20`. |
| "the tag 'x' is not one of: mechanic, bug, cinematic" | Use one of those three words. |
| "'previous' points to … but there is no file" | Fix the spelling: the earlier file's name without `.mdx`. |
| "not an Instagram reel link" | Use a link like `https://www.instagram.com/reel/XXXXXXXX/`. |
| "a picture has no description" or "has no alt" | Add `alt="what it shows"`, or write it in the `[ ]`. |
| "a `<Section>` has no title" | Add `title="…"` to the Section. |
| "imageStyle / imageSide / color 'x' is not one of…" | Use one of the words it lists. |
| "mono must be true or false" | Write `mono: true` or `mono: false`. |
| "the text could not be read as MDX" | You typed a `<` in normal writing. Write "less than". |

Notes from `npm run check` that are not errors (like a link that still says `REPLACE`) only tell you something is hidden.

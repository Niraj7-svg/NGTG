// npm run check: reads site.yml and every .mdx in content/ and lists problems in plain English.
// Exit code 1 if anything is wrong, 0 if clean. Files in content/_templates are examples and are skipped.
import fs from 'node:fs'
import path from 'node:path'
import { parse, parseDocument } from 'yaml'
import { required, TAGS, WORK_TYPES, ICONS, INSTAGRAM, EMAIL, DATE, IMAGE_STYLES, SIDES, COLORS } from '../lib/schema.mjs'

const root = path.join(process.cwd(), 'content')
const rel = f => path.relative(process.cwd(), f)
const problems = new Map()   // file -> [text]
const notes = []
const bad = (file, text) => problems.set(file, [...(problems.get(file) ?? []), text])

let compile = null
try { compile = (await import('@mdx-js/mdx')).compile } catch { /* the MDX-readable check is skipped if the compiler is not installed */ }

// ---- helpers ---------------------------------------------------------------
const isDate = v => typeof v === 'string' && DATE.test(v) && new Date(v).toISOString().slice(0, 10) === v
const isHttps = v => typeof v === 'string' && /^https:\/\//.test(v)

// Tab indentation, and text that needs quotes (a colon, a # glued to a word, or an apostrophe, when unquoted).
// A trailing " # comment" after a value is normal in the templates and is allowed.
function checkText(file, text, firstLine = 1) {
  text.split(/\r?\n/).forEach((line, i) => {
    const n = firstLine + i
    if (/^\s*\t/.test(line)) bad(file, `line ${n}: a Tab is used to indent. Use 2 spaces instead.`)
    const m = line.match(/^\s*(?:- )?([A-Za-z_][\w-]*):\s+(.*)$/)
    if (!m) return
    let v = m[2].replace(/\s+#.*$/, '').trim()
    if (!v || /^["'\[{|>&*!#]/.test(v)) return
    if (/:\s/.test(v) || /\S#/.test(v) || v.includes("'")) bad(file, `line ${n}: the text for '${m[1]}' has a colon, # or apostrophe, so it needs "quotes" around it.`)
  })
}

function yamlOf(file, text, firstLine = 1) {
  checkText(file, text, firstLine)
  const doc = parseDocument(text)
  if (doc.errors.length) {
    const e = doc.errors[0]
    bad(file, `the header is not valid YAML (${String(e.message).split('\n')[0]}). Usually a missing quote around text with a colon, or a Tab instead of spaces.`)
    return null
  }
  return doc.toJS() ?? {}
}

function checkLinks(file, d, keys) {
  for (const k of keys) if (d[k] != null && !isHttps(d[k])) bad(file, `'${k}' must be a link starting with https:// (it is '${d[k]}').`)
}
function checkReel(file, v, where) {
  if (v != null && !INSTAGRAM.test(String(v))) bad(file, `${where} is not an Instagram reel link (it should look like https://www.instagram.com/reel/XXXXXXXX/): '${v}'.`)
}
function checkDate(file, key, v) {
  if (v != null && !isDate(v)) bad(file, `'${key}' must be written year-month-day, like 2026-11-20 (it is '${v}').`)
}

// ---- site.yml --------------------------------------------------------------
const siteFile = rel(path.join(root, 'site.yml'))
if (!fs.existsSync(path.join(root, 'site.yml'))) bad(siteFile, 'the file is missing.')
else {
  const s = yamlOf(siteFile, fs.readFileSync(path.join(root, 'site.yml'), 'utf8'))
  if (s) {
    for (const k of ['name', 'tagline']) if (!s[k]) bad(siteFile, `'${k}' is missing.`)
    if (s.links != null && !Array.isArray(s.links)) bad(siteFile, `'links' must be a list (each entry starts with a dash).`)
    ;(Array.isArray(s.links) ? s.links : []).forEach((l, i) => {
      const at = `links entry ${i + 1}${l?.label ? ` ("${l.label}")` : ''}`
      if (!l?.icon) bad(siteFile, `${at}: 'icon' is missing.`)
      else if (!ICONS.includes(l.icon)) bad(siteFile, `${at}: the icon '${l.icon}' is not built in. Use one of: ${ICONS.join(', ')}.`)
      if (!l?.url) bad(siteFile, `${at}: 'url' is missing.`)
      else if (l.url === 'REPLACE') notes.push(`${siteFile}: ${at} still says REPLACE, so it is hidden on the site.`)
      else if (!EMAIL.test(l.url) && !isHttps(l.url) && !/^mailto:/.test(l.url)) bad(siteFile, `${at}: 'url' must be an email address or a link starting with https:// (it is '${l.url}').`)
    })
  }
}

// ---- content files ---------------------------------------------------------
const folders = ['devlog', 'work', 'testimonials', 'growth']
const files = []   // { abs, file, folder, slug }
for (const folder of folders) {
  const dir = path.join(root, folder)
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))) files.push({ abs: path.join(dir, f), file: rel(path.join(dir, f)), folder, slug: f.slice(0, -4) })
}
if (fs.existsSync(path.join(root, 'story.mdx'))) files.push({ abs: path.join(root, 'story.mdx'), file: rel(path.join(root, 'story.mdx')), folder: 'story', slug: 'story' })
if (fs.existsSync(path.join(root, 'home.mdx'))) files.push({ abs: path.join(root, 'home.mdx'), file: rel(path.join(root, 'home.mdx')), folder: 'home', slug: 'home' })

const parsed = files.map(f => {
  const raw = fs.readFileSync(f.abs, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m && f.folder === 'home') return { ...f, data: {}, body: raw }   // home.mdx may have no header at all
  if (!m) { bad(f.file, 'the header must start on line 1 with --- (nothing above it, not even an empty line), and end with another ---.'); return { ...f, data: null } }
  return { ...f, data: yamlOf(f.file, m[1], 2), body: m[2] }
})
const slugs = folder => new Set(parsed.filter(p => p.folder === folder).map(p => p.slug))
const draftOf = (folder, slug) => parsed.find(p => p.folder === folder && p.slug === slug)?.data?.draft === true

// the writing below the header is checked even when the header itself is broken
async function checkBody(p) {
  const { file } = p
  const body = (p.body ?? '').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  if (/!\[\s*\]\(/.test(body)) bad(file, `a picture has no description. Write it inside the brackets: ![what it shows](link).`)
  for (const m of body.matchAll(/<(Polaroid|Clipping|Cutout|Photo|Compare)\b([^>]*?)\/?>/g)) {
    if (!/\balt=/.test(m[2])) bad(file, `<${m[1]}> has no alt="..." description.`)
  }
  for (const m of body.matchAll(/<Gallery\b([^>]*?)\/?>/g)) {
    if (!/\balts=/.test(m[1])) bad(file, `<Gallery> has no alts={[...]} descriptions.`)
    else {
      const count = k => (m[1].match(new RegExp(`${k}=\\{\\[([\\s\\S]*?)\\]\\}`))?.[1].match(/"[^"]*"|'[^']*'/g) ?? []).length
      if (count('images') !== count('alts')) bad(file, `<Gallery> has ${count('images')} images but ${count('alts')} descriptions. Each image needs one.`)
    }
  }
  for (const m of body.matchAll(/<Section\b([^>]*?)>/g)) {
    const prop = k => m[1].match(new RegExp(`\\b${k}=(?:"([^"]*)"|'([^']*)')`))?.slice(1).find(v => v != null)
    const t = prop('title')
    const at = `<Section${t ? ` "${t}"` : ''}>`
    if (!t) bad(file, `a <Section> has no title="...".`)
    if (/\bimage=/.test(m[1]) && !/\balt=/.test(m[1])) bad(file, `${at} has an image but no alt="..." description.`)
    for (const [k, list] of [['imageStyle', IMAGE_STYLES], ['imageSide', SIDES], ['color', COLORS]]) {
      const v = prop(k)
      if (v != null && !list.includes(v)) bad(file, `${at}: ${k} '${v}' is not one of: ${list.join(', ')}.`)
    }
  }
  for (const m of body.matchAll(/<Reel\b([^>]*?)\/?>/g)) {
    const u = m[1].match(/url=["']([^"']*)["']/)?.[1]
    if (!u) bad(file, `<Reel> has no url="...".`)
    else checkReel(file, u, `a <Reel> link`)
  }
  if (compile) {
    try { await compile(body) } catch (e) { bad(file, `the text could not be read as MDX (${String(e.reason ?? e.message).split('\n')[0]}). A "<" in normal writing is the usual cause: write "less than" instead.`) }
  }
}

for (const p of parsed) {
  const { file, folder, data: d } = p
  if (!d) { await checkBody(p); continue }
  for (const k of required[folder] ?? []) if (d[k] == null) bad(file, `'${k}' is missing.`)
  checkDate(file, 'date', d.date)
  checkDate(file, 'started', d.started)

  if (folder === 'devlog') {
    if (d.tags != null) {
      if (!Array.isArray(d.tags)) bad(file, `'tags' must be a list in square brackets, like [mechanic, bug].`)
      else for (const t of d.tags) if (!TAGS.includes(t)) bad(file, `the tag '${t}' is not one of: ${TAGS.join(', ')}. It would show without a colour.`)
    }
    if (d.episode != null && !Number.isInteger(d.episode)) bad(file, `'episode' must be a whole number, like 3 (it is '${d.episode}').`)
    checkReel(file, d.reel, `'reel'`)
    checkLinks(file, d, ['cover'])
    if (d.previous != null) {
      if (!slugs('devlog').has(d.previous)) bad(file, `'previous' points to '${d.previous}', but there is no file content/devlog/${d.previous}.mdx.`)
      else if (draftOf('devlog', d.previous) && !d.draft) bad(file, `'previous' points to '${d.previous}', which is a draft. On the live site that link will be dropped.`)
    }
  }
  if (folder === 'work') {
    if (d.type != null && !WORK_TYPES.includes(d.type)) bad(file, `'type' must be one of: ${WORK_TYPES.join(', ')} (it is '${d.type}').`)
    if (d.type === 'reel' && !d.reel) bad(file, `'type' is reel, so 'reel' needs an Instagram link.`)
    if ((d.type === 'video' || d.type === 'showreel') && !d.video && !d.reel) bad(file, `'type' is ${d.type}, so it needs a 'video' (or 'reel') link.`)
    if (d.did != null && !Array.isArray(d.did)) bad(file, `'did' must be a list in square brackets, like [edit, sound].`)
    if (d.order != null && typeof d.order !== 'number') bad(file, `'order' must be a number (it is '${d.order}').`)
    checkReel(file, d.reel, `'reel'`)
    checkLinks(file, d, ['video', 'cover', 'clientLink'])
  }
  if (folder === 'testimonials') {
    checkLinks(file, d, ['link', 'photo'])
    if (d.project != null) {
      if (!slugs('work').has(d.project)) bad(file, `'project' points to '${d.project}', but there is no file content/work/${d.project}.mdx.`)
      else if (draftOf('work', d.project) && !d.draft) bad(file, `'project' points to '${d.project}', which is a draft. The quote will only show in the quotes list.`)
    }
  }
  if (folder === 'growth') {
    checkLinks(file, d, ['account'])
    if (d.milestones != null && !Array.isArray(d.milestones)) bad(file, `'milestones' must be a list (each milestone starts with a dash, indented 2 spaces).`)
    ;(Array.isArray(d.milestones) ? d.milestones : []).forEach((m, i) => {
      const at = `milestone ${i + 1}`
      for (const k of ['date', 'followers', 'note']) if (m?.[k] == null) bad(file, `${at}: '${k}' is missing.`)
      checkDate(file, `${at} date`, m?.date)
      checkReel(file, m?.reel, `${at} 'reel'`)
    })
  }
  if (folder === 'story') {
    if (d.image && !/^https?:/.test(d.image) && !fs.existsSync(path.join(process.cwd(), 'public', d.image))) notes.push(`${file}: the image '${d.image}' is not in public/ yet, so the section shows text only.`)
    if (d.image && !d.alt) bad(file, `'alt' is missing: describe the picture for blind visitors.`)
    if (d.imageStyle != null && !IMAGE_STYLES.includes(d.imageStyle)) bad(file, `'imageStyle' must be one of: ${IMAGE_STYLES.join(', ')} (it is '${d.imageStyle}').`)
    if (d.mono != null && typeof d.mono !== 'boolean') bad(file, `'mono' must be true or false (it is '${d.mono}').`)
  }

  await checkBody(p)
}

// ---- report ----------------------------------------------------------------
for (const n of notes) console.log(`note: ${n}`)
if (!problems.size) {
  console.log(`\n✓ Everything looks fine (site.yml and ${parsed.length} content file${parsed.length === 1 ? '' : 's'} checked).`)
  process.exit(0)
}
let total = 0
for (const [file, list] of problems) {
  console.log(`\n✗ ${file}`)
  for (const t of list) { console.log(`   - ${t}`); total++ }
}
console.log(`\n${total} problem${total === 1 ? '' : 's'} in ${problems.size} file${problems.size === 1 ? '' : 's'}. Fix them and run: npm run check`)
process.exit(1)

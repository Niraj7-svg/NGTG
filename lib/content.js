import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { required, EMAIL, IMAGE_STYLES } from './schema.mjs'

const root = path.join(process.cwd(), 'content')
const showDrafts = process.env.NODE_ENV !== 'production'
const firstLine = e => String(e.message).split('\n')[0]

export const site = () => {
  try { return parse(fs.readFileSync(path.join(root, 'site.yml'), 'utf8')) ?? {} }
  catch (e) { throw new Error(`content/site.yml: this is not valid YAML. ${firstLine(e)}`) }
}

function parseFile(abs, where, folder) {
  const m = fs.readFileSync(abs, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) throw new Error(`${where}: the header must start on line 1 with ---`)
  let data
  try { data = parse(m[1]) ?? {} }
  catch (e) { throw new Error(`${where}: the header is not valid YAML. ${firstLine(e)} Check the quotes around text with a colon, and use 2 spaces (never Tab) to indent.`) }
  for (const k of required[folder] ?? []) if (data[k] == null) throw new Error(`${where}: '${k}' is missing`)
  return { slug: path.basename(abs, '.mdx'), file: where, data, body: m[2] }
}

// Newest first. A missing folder or no files gives [], which hides that section.
export function list(folder) {
  const dir = path.join(root, folder)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
    .map(f => parseFile(path.join(dir, f), `content/${folder}/${f}`, folder))
    .filter(e => showDrafts || !e.data.draft)
    .sort((a, b) => String(b.data.date ?? '').localeCompare(String(a.data.date ?? '')))
}

// The "How it started" section on Home. No file, no section.
export function story() {
  const abs = path.join(root, 'story.mdx')
  if (!fs.existsSync(abs)) return null
  const st = parseFile(abs, 'content/story.mdx', 'story')
  const { imageStyle, mono } = st.data
  if (imageStyle != null && !IMAGE_STYLES.includes(imageStyle)) throw new Error(`${st.file}: imageStyle '${imageStyle}' is not one of: ${IMAGE_STYLES.join(', ')}`)
  if (mono != null && typeof mono !== 'boolean') throw new Error(`${st.file}: mono must be true or false (it is '${mono}')`)
  return st
}

// Optional extra sections on Home (content/home.mdx). No file, an empty file or draft: true (on the live site) gives null.
// The header is optional here: a file with no --- lines is all body.
export function home() {
  const abs = path.join(root, 'home.mdx')
  if (!fs.existsSync(abs)) return null
  const raw = fs.readFileSync(abs, 'utf8')
  const h = /^---\r?\n/.test(raw) ? parseFile(abs, 'content/home.mdx', 'home') : { file: 'content/home.mdx', data: {}, body: raw }
  if (!showDrafts && h.data.draft) return null
  return h.body.trim() ? h : null
}

const real = v => v && v !== 'REPLACE'
// Contact links from the `links:` list in site.yml, in the order written. A url of REPLACE (or none) hides the entry.
export const links = s => (s.links ?? []).filter(l => real(l.url)).map(l => ({
  label: l.label ?? l.icon,
  href: EMAIL.test(l.url) ? `mailto:${l.url}` : l.url,
  icon: l.icon,
}))

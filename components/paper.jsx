import Link from 'next/link'
import { look, edge, fnv1a } from '../lib/hash.mjs'
import { INSTAGRAM } from '../lib/schema.mjs'
import CompareSlider from './CompareSlider'

// Everything on the board is a fastened piece of paper: photos and clippings are taped, notes are pinned or taped.
// Server components only (CompareSlider is the one client piece). Looks come from lib/hash.mjs; all styling is in theme/theme.css.
const where = file => file ?? 'A page'

function altText(alt, src, file) {
  if (alt) return alt
  if (process.env.NODE_ENV !== 'production') console.warn(`${where(file)}: the image ${src} has no alt text. Add alt="what it shows".`)
  return ''
}

function needSrc(src, file, tag) {
  if (!src) throw new Error(`${where(file)}: <${tag}> needs a src (the image link)`)
}

const textOf = n => n == null || typeof n === 'boolean' ? '' : typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(textOf).join(' ') : textOf(n.props?.children)

// Decorative tape, drawn above the picture. Layout, size, rotation and colour come from the hash.
//   top      one strip across the middle of the top edge
//   corners  two strips on the top corners, mirrored
//   opposite two strips on the top-left and bottom-right corners
// Small items always use 'top'.
function Tape({ t, small }) {
  const variant = small ? 'top' : t.variant
  const rot = small ? t.topRot : t.rot
  const base = `tape tape-${variant} tape-sz-${t.size} tape-${t.tone}${t.tone === 'blue' || t.tone === 'pink' ? ' tape-washi' : ''}`
  const spots = variant === 'corners' ? ['tl', 'tr'] : variant === 'opposite' ? ['tl', 'br'] : [null]
  return <>{spots.map(w => <span key={w ?? 'top'} aria-hidden="true" className={w ? `${base} tape-${w}` : base} style={{ '--tape-rot': `${rot}deg` }} />)}</>
}

// The one wrapper every item uses: hash-based tilt (applied in CSS from tokens), a fastener, and an optional torn edge.
export function Fastened({ kind, seed, tilt, fasten = 'tape', small, className = '', as: Root = 'div', rootProps = {}, children }) {
  const l = look(String(seed))
  const forced = tilt === undefined || tilt === '' ? NaN : Number(tilt)
  const style = { '--ts': l.sign, '--tf': l.frac }
  if (Number.isFinite(forced)) style['--tilt-forced'] = `${forced}deg`
  if (kind === 'clipping') style['--edge'] = `polygon(${edge(l.r, 14, 1.6)})`
  if (kind === 'cutout') style['--edge'] = `polygon(${edge(l.r, 3, 0.7)})`
  return (
    <Root {...rootProps} className={`item item-${kind} ${className}`} style={style}>
      {children}
      {fasten === 'tape' && <Tape t={l.tape} small={small} />}
      {fasten === 'pin' && <span aria-hidden="true" className={`pin pin-${l.pin}`} />}
    </Root>
  )
}

const Frame = ({ kind, seed, tilt, small, className, children }) => (
  <Fastened kind={kind} seed={seed} tilt={tilt} small={small} className={className}><figure className="paper">{children}</figure></Fastened>
)

export function Polaroid({ src, alt, caption, tilt, ratio = 'square', small, file }) {
  needSrc(src, file, 'Polaroid')
  return (
    <Frame kind="polaroid" seed={src} tilt={tilt} small={small} className={`polaroid ratio-${ratio}${small ? ' item-small' : ''}`}>
      <img src={src} alt={altText(alt, src, file)} loading="lazy" decoding="async" />
      {caption && <figcaption className="hand">{caption}</figcaption>}
    </Frame>
  )
}

export function Clipping({ src, alt, caption, credit, creditLink, tilt, mono, file }) {
  needSrc(src, file, 'Clipping')
  return (
    <Frame kind="clipping" seed={src} tilt={tilt} className={`clipping${mono ? ' clipping-mono' : ''}`}>
      <div className="photo-wrap"><img src={src} alt={altText(alt, src, file)} loading="lazy" decoding="async" /></div>
      {(caption || credit) && (
        <figcaption>
          {caption && <span>{caption}</span>}
          {credit && <span className="credit">{creditLink ? <a href={creditLink}>{credit}</a> : credit}</span>}
        </figcaption>
      )}
    </Frame>
  )
}

export function Cutout({ src, alt, caption, tilt, small, file }) {
  needSrc(src, file, 'Cutout')
  return (
    <Frame kind="cutout" seed={src} tilt={tilt} small={small} className={`cutout${small ? ' item-small' : ''}`}>
      <img src={src} alt={altText(alt, src, file)} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </Frame>
  )
}

export const Photo = Cutout

const kinds = { polaroid: Polaroid, clipping: Clipping, cutout: Cutout }
export function Gallery({ images = [], alts = [], style = 'cutout', file }) {
  const Item = kinds[style] ?? Cutout
  return <div className="gallery">{images.map((src, i) => <Item key={`${src}-${i}`} src={src} alt={alts[i]} file={file} />)}</div>
}

// A short silent looping MP4 (use this instead of a GIF). Under reduced motion the clip is swapped for its poster, or a link.
export function Clip({ url, poster, caption, tilt, file }) {
  if (!url) throw new Error(`${where(file)}: <Clip> needs a url (the MP4 link)`)
  return (
    <Frame kind="cutout" seed={url} tilt={tilt} className="cutout clip">
      <video src={url} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-label={caption ?? 'Short clip'} />
      <span className="clip-fallback">{poster ? <img src={poster} alt={caption ?? 'Still from a short clip'} loading="lazy" /> : <a href={url}>Watch the short clip</a>}</span>
      {caption && <figcaption>{caption}</figcaption>}
    </Frame>
  )
}

export function Compare({ before, after, alt, tilt, file }) {
  if (!before || !after) throw new Error(`${where(file)}: <Compare> needs both 'before' and 'after' links`)
  return (
    <Frame kind="cutout" seed={before} tilt={tilt} className="cutout">
      <CompareSlider before={before} after={after} alt={altText(alt, before, file)} />
    </Frame>
  )
}

// The Instagram embed is the "photo" inside a fresh Polaroid frame.
export function Reel({ url, tilt, file }) {
  const id = url?.match(INSTAGRAM)?.[1]
  if (!id) throw new Error(`${where(file)}: the Reel link '${url}' is not an Instagram reel link. It should look like https://www.instagram.com/reel/XXXXXXXX/`)
  return (
    <Frame kind="polaroid" seed={url} tilt={tilt} className="polaroid polaroid-reel">
      <iframe className="reel" src={`https://www.instagram.com/reel/${id}/embed`} title="Instagram reel" loading="lazy" allowFullScreen />
    </Frame>
  )
}

export function Video({ url, poster, title = 'Video', tilt, file }) {
  if (!url) throw new Error(`${where(file)}: <Video> needs a url (a YouTube or MP4 link)`)
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1]
  return (
    <Frame kind="cutout" seed={url} tilt={tilt} className="cutout video-frame">
      {yt
        ? <iframe className="video" src={`https://www.youtube-nocookie.com/embed/${yt}`} title={title} loading="lazy" allowFullScreen />
        : <video className="video" src={url} poster={poster} controls playsInline preload="metadata" />}
    </Frame>
  )
}

// ---- notes and sheets ----------------------------------------------------------------------------------------

const NOTE_COLORS = ['yellow', 'coral', 'sage', 'sky', 'pink']
// Stable colour from the content, shifted by position. Stepping by 2 (coprime with 5) means neighbours in a row,
// and items a whole 2- or 3-column row apart, never share a colour.
export const stickyColor = (key, index = 0) => NOTE_COLORS[(fnv1a(String(key)) + index * 2) % NOTE_COLORS.length]

// Colours for a run of small notes inside something coloured: none equals its neighbour or the thing they sit on.
export function noteColors(keys, avoid) {
  const out = []
  keys.forEach((k, i) => {
    let n = (fnv1a(String(k)) + i * 2) % NOTE_COLORS.length
    while (NOTE_COLORS[n] === avoid || NOTE_COLORS[n] === out[i - 1]) n = (n + 1) % NOTE_COLORS.length
    out.push(NOTE_COLORS[n])
  })
  return out
}

// A sticky note. size: small | medium | large. pin: pin | tape | none. With `href` the whole note is the link.
export function Sticky({ color, pin = 'pin', size = 'medium', tilt, seed, index = 0, href, id, className = '', children }) {
  const key = String(seed ?? textOf(children))
  const external = href && /^(https?:|mailto:)/.test(href)
  return (
    <Fastened kind="sticky" seed={key} tilt={tilt} fasten={pin === 'none' ? 'none' : pin} small={size === 'small'}
      as={!href ? 'div' : external ? 'a' : Link} rootProps={{ ...(href ? { href } : {}), ...(id ? { id } : {}) }}
      className={`sticky sticky-${size} note-${color ?? stickyColor(key, index)}${href ? ' is-link' : ''} ${className}`}>
      <div className="sticky-body">{children}</div>
    </Fastened>
  )
}

// A larger pinned sheet of plain paper for long text. Its tilt never goes past 1deg.
export function Paper({ pin = 'tape', seed, tilt, long, className = '', children }) {
  return (
    <Fastened kind="paper" seed={seed ?? textOf(children).slice(0, 120)} tilt={tilt} fasten={pin} className={`sheet-paper${long ? ' is-long' : ''} ${className}`}>
      {children}
    </Fastened>
  )
}

// A small taped card that links somewhere (used for the featured work on Home).
export function Card({ href, seed, className = '', children }) {
  return (
    <Fastened kind="cutout" seed={seed} small as={Link} rootProps={{ href }} className={`cutout card ${className}`}>
      <span className="paper">{children}</span>
    </Fastened>
  )
}

// "Random but decided once": every look is derived from a hash of the item's src (or url),
// so the same src gives the same tilt, tape and torn edge on every build, page and device. No Math.random.

export function fnv1a(str) {                       // 32-bit FNV-1a
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return h >>> 0
}

export function seeded(str) {                      // mulberry32: a small seeded generator, 0 <= n < 1
  let a = fnv1a(String(str))
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// What is decided here is only a direction (sign) and a position in the range (frac, 0 to 1).
// The ranges themselves (--tilt-<kind>-min / -max) live in theme/theme.css and are applied there.
// Always draws in the same order, so adding a later draw never changes an earlier result.
export function look(src) {
  const r = seeded(src)
  const sign = r() < 0.5 ? -1 : 1
  const frac = +r().toFixed(3)
  const variant = ['top', 'corners', 'opposite'][Math.floor(r() * 3)]
  const size = ['s', 'm', 'l'][Math.floor(r() * 3)]
  const raw = r()
  const tone = ['cream', 'yellow', 'blue', 'pink'][Math.floor(r() * 4)]
  const side = r() < 0.5 ? 'l' : 'r'
  const pin = ['red', 'blue', 'yellow', 'green'][Math.floor(r() * 4)]
  // top: a slight lean. corners / opposite: 35 to 45 degrees. topRot is the lean a small item uses, because small items always take 'top'.
  // `side` is still drawn (so every later draw stays the same) but no layout uses it any more.
  const topRot = +(-7 + raw * 14).toFixed(1)
  const rot = variant === 'top' ? topRot : +(35 + raw * 10).toFixed(1)
  return { sign, frac, tape: { variant, size, rot, topRot, tone, side }, pin, r }   // r carries on for the edge polygon
}

// A clip-path polygon whose edges wobble inwards by up to maxJ percent. n = points per side.
export function edge(r, n, maxJ) {
  const j = () => +(r() * maxJ * (r() < 0.12 ? 2 : 1)).toFixed(2)    // an occasional bigger tear
  const p = []
  for (let i = 0; i <= n; i++) p.push(`${+(i / n * 100).toFixed(1)}% ${j()}%`)
  for (let i = 1; i <= n; i++) p.push(`${+(100 - j()).toFixed(2)}% ${+(i / n * 100).toFixed(1)}%`)
  for (let i = n - 1; i >= 0; i--) p.push(`${+(i / n * 100).toFixed(1)}% ${+(100 - j()).toFixed(2)}%`)
  for (let i = n - 1; i >= 1; i--) p.push(`${j()}% ${+(i / n * 100).toFixed(1)}%`)
  return p.join(', ')
}

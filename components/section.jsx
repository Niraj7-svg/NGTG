import { Clipping, Polaroid, Cutout, Sticky, stickyColor } from './paper'
import { isShort } from './board'
import { IMAGE_STYLES, SIDES, COLORS } from '../lib/schema.mjs'

// <Section title="..."> text </Section>: a titled sticky note, with an optional taped picture on one half.
// Missing colour: picked from the file name and the section's place. Stepping by 2 per place means neighbours never match.
// A <Section> inside any sticky note (another Section, or the story note) is stacked by CSS (.sticky .section-row): picture first, small note below.
// `index` is added by Body (components/mdx.jsx): the number of this section in its file.
const real = v => (v && v !== 'REPLACE' ? v : undefined)
const oneOf = (v, list, name, file) => {
  if (v != null && !list.includes(v)) throw new Error(`${file ?? 'A page'}: <Section> ${name} '${v}' is not one of: ${list.join(', ')}`)
}

export default function Section({ title, color, image, alt, caption, credit, creditLink, imageStyle = 'cutout', imageSide, index = 0, file, children }) {
  const at = file ?? 'A page'
  if (!title) throw new Error(`${at}: a <Section> needs a title="..."`)
  if (image && !alt) throw new Error(`${at}: the <Section> "${title}" has an image but no alt="what it shows"`)
  oneOf(color, COLORS, 'color', at)
  oneOf(imageStyle, IMAGE_STYLES, 'imageStyle', at)
  oneOf(imageSide, SIDES, 'imageSide', at)

  const side = imageSide ?? (index % 2 ? 'right' : 'left')
  const note = (
    <Sticky size="large" color={color ?? stickyColor(at, index)} seed={`${title}-${index}`} className="section-note">
      <h2 className={isShort(title) ? 'hand hand-h' : 'serif-h'}>{title}</h2>
      <div className="section-text">{children}</div>
    </Sticky>
  )
  if (!image) return <div className="section-row">{note}</div>

  const cap = real(caption), cr = real(credit)
  const pic = imageStyle === 'clipping'
    ? <Clipping src={image} alt={alt} caption={cap} credit={cr} creditLink={real(creditLink)} file={file} />
    : imageStyle === 'polaroid'
      ? <Polaroid src={image} alt={alt} caption={[cap, cr].filter(Boolean).join(' · ') || undefined} file={file} />
      : <Cutout src={image} alt={alt} caption={[cap, cr].filter(Boolean).join(' · ') || undefined} file={file} />
  return (
    <div className={`section-row grid has-image side-${side}`}>
      <div className="s6 section-pic">{pic}</div>
      <div className="s6 section-text-col">{note}</div>
    </div>
  )
}

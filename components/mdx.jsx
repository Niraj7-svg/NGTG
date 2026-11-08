import { Children } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Section from './section'
import { Polaroid, Clipping, Cutout, Photo, Gallery, Clip, Compare, Reel, Video, Sticky, Paper } from './paper'

export { Reel, Video }
// <Note> keeps its API and now renders as a small sticky note.
export const Note = ({ children }) => <Sticky size="small" className="inline-note"><aside>{children}</aside></Sticky>

// Every tool an .mdx file may use. `file` is passed down so warnings and errors can name the file.
function tools(file) {
  const withFile = C => props => <C {...props} file={file} />
  const MdImg = ({ src, alt, title }) => <Cutout src={src} alt={alt} caption={title} file={file} />   // plain ![alt](url "caption")
  return {
    Polaroid: withFile(Polaroid), Clipping: withFile(Clipping), Cutout: withFile(Cutout), Photo: withFile(Photo),
    Gallery: withFile(Gallery), Clip: withFile(Clip), Compare: withFile(Compare), Reel: withFile(Reel), Video: withFile(Video),
    Section: withFile(Section), Note, Sticky, Paper,
    img: MdImg,
    // a paragraph holding only a picture must not wrap the figure in a <p>
    p: ({ children }) => { const k = Children.toArray(children); return k.length === 1 && k[0].type === MdImg ? k[0] : <p>{children}</p> },
  }
}

// blockJS is off so props like images={["a","b"]} work. The text comes from your own repo, and blockDangerousJS stays on
// (it still blocks eval, require, process and similar). Never feed this text that visitors can write.
// Each <Section> is numbered by its place in the file (outside code samples), so sides can alternate left, right, left.
const numberSections = src => {
  let n = 0
  return src.split(/(```[\s\S]*?```|`[^`\n]*`)/).map((part, i) => i % 2 ? part : part.replace(/<Section(?=[\s>])/g, () => `<Section index={${n++}}`)).join('')
}
export const Body = ({ source, file }) => <MDXRemote source={numberSections(source)} components={tools(file)} options={{ blockJS: false }} />

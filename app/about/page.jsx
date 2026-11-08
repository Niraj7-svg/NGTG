import { site, links } from '../../lib/content'
import Icon from '../../components/Icon'
import { Polaroid, Sticky, Paper, noteColors } from '../../components/paper'
import { PageTitle } from '../../components/board'

export const metadata = { title: 'About' }

export default function About() {
  const s = site()
  const l = links(s)
  const colors = noteColors(l.map(x => x.label))
  return (
    <>
      <PageTitle>About</PageTitle>
      <section className="grid about-grid" id="contact">
        {s.photo && <div className="s4"><Polaroid src={s.photo} alt={`Portrait of ${s.name}`} caption={s.name} file="content/site.yml" /></div>}
        <div className={`about-main ${s.photo ? 's8' : 's8 about-solo'}`}>
          <Paper seed="about" className="about-sheet"><p>{s.about}</p></Paper>
          {l.length > 0 && (
            <ul className="tag-row link-row">
              {l.map((x, i) => (
                <li key={x.href}>
                  <Sticky size="small" pin="none" color={colors[i]} seed={x.label} href={x.href}>
                    <span className="hand link-note"><Icon name={x.icon} />{x.label}</span>
                  </Sticky>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

'use client'
import { useState } from 'react'

// The only client component: a before/after slider. A range input (keyboard and touch work natively)
// sets one CSS variable; the theme clips the "before" picture with it.
export default function CompareSlider({ before, after, alt }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="compare" style={{ '--pos': `${pos}%` }}>
      <img src={after} alt={`${alt} (after)`} loading="lazy" decoding="async" />
      <img className="compare-before" src={before} alt={`${alt} (before)`} loading="lazy" decoding="async" />
      <span className="compare-line" aria-hidden="true" />
      <span className="compare-tag compare-tag-before" aria-hidden="true">Before</span>
      <span className="compare-tag compare-tag-after" aria-hidden="true">After</span>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))} aria-label="Slide to compare before and after" aria-valuetext={`${pos}% before`} />
    </div>
  )
}

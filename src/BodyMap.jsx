import { RANKS } from './ranks.js'

// Stylised front and back figure. ranks = { muscle: rank index } — muscles with no logged lift stay dark.
// Each part is drawn once and mirrored around the figure's centre line.
const FRONT = [
  ['traps', 'M-5 30 L-18 38 L-4 38 Z'],
  ['shoulders', 'e -25 45 8 9'],
  ['chest', 'r -18 40 17 17 6'],
  ['biceps', 'e -30 65 6 12'],
  ['abs', 'r -10 60 9 9 3'], ['abs', 'r -10 71 9 9 3'], ['abs', 'r -10 82 9 9 3'],
  ['quads', 'e -11 124 10 23'],
  ['calves', 'e -11 172 6.5 18'],
]
const BACK = [
  ['traps', 'M0 28 L-18 39 L0 60 Z'],
  ['shoulders', 'e -25 45 8 9'],
  ['back', 'M-19 46 L-3 64 L-3 92 L-12 92 Z'],
  ['triceps', 'e -30 65 6 12'],
  ['glutes', 'e -9.5 104 10 9.5'],
  ['hamstrings', 'e -11 134 9.5 17'],
  ['calves', 'e -11 172 6.5 18'],
]
const NEUTRAL = ['e -34 92 5 13', 'c -36 110 4.5', 'e -11 196 6.5 4']

function Shape({ d, ...rest }) {
  const [k, ...n] = d.split(' ')
  if (k === 'e') return <ellipse cx={n[0]} cy={n[1]} rx={n[2]} ry={n[3]} {...rest} />
  if (k === 'c') return <circle cx={n[0]} cy={n[1]} r={n[2]} {...rest} />
  if (k === 'r') return <rect x={n[0]} y={n[1]} width={n[2]} height={n[3]} rx={n[4]} {...rest} />
  return <path d={d} {...rest} />
}

function Figure({ x, parts, ranks, label }) {
  const both = (node, key) => [node, <g key={key + 'm'} transform="scale(-1,1)">{node}</g>]
  return (
    <g transform={`translate(${x},0)`}>
      <circle cx="0" cy="15" r="11" className="bm-base" />
      <rect x="-4.5" y="24" width="9" height="8" className="bm-base" />
      <path d="M-18 38 H18 L13 96 H-13 Z" className="bm-base" />
      {NEUTRAL.flatMap((d, i) => both(<Shape key={i} d={d} className="bm-base" />, i))}
      {parts.flatMap(([m, d], i) => both(
        <Shape key={i} d={d} className="bm-part" fill={ranks[m] != null ? RANKS[ranks[m]].color : 'var(--muscle-off)'}>
          <title>{m}: {ranks[m] != null ? RANKS[ranks[m]].name : 'no lifts yet'}</title>
        </Shape>, i))}
      <text x="0" y="216" textAnchor="middle" className="bm-label">{label}</text>
    </g>
  )
}

export default function BodyMap({ ranks }) {
  return (
    <svg viewBox="0 0 200 222" className="bodymap" role="img" aria-label="Muscle ranks">
      <Figure x={52} parts={FRONT} ranks={ranks} label="Front" />
      <Figure x={148} parts={BACK} ranks={ranks} label="Back" />
    </svg>
  )
}

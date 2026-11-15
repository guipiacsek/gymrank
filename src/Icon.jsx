// Pictogram per exercise on a 100x100 grid (ground at y=92).
// h head, s shoulder, p hip, a/a2 arms [elbow, hand], l/l2 legs [knee, foot], eq equipment.
// Equipment: ['plate',x,y,r] barbell seen end-on · ['bar',cx,y,half] barbell seen from the front
// ['db',x,y] dumbbell · ['dbv',x,y] upright dumbbell · ['ln',x1,y1,x2,y2,width] bench, cable, machine part
const SIDE = { h: [50, 16], s: [50, 28], p: [50, 56], l: [[50, 74], [50, 92]] }
const FRONT = { h: [50, 26], s: [50, 38], p: [50, 64], l: [[44, 78], [42, 92]], l2: [[56, 78], [58, 92]] }
const LYING = { h: [24, 57], s: [33, 60], p: [62, 60], l: [[76, 58], [78, 82]] }
const FLAT_BENCH = [['ln', 18, 67, 70, 67, 4], ['ln', 26, 67, 26, 90], ['ln', 62, 67, 62, 90]]
const SEATED = { h: [40, 20], s: [40, 32], p: [42, 62] }
const SEAT = [['ln', 33, 30, 33, 66, 4], ['ln', 33, 69, 56, 69, 4], ['ln', 44, 69, 44, 90]]
const STACK = (x) => ['ln', x, 38, x, 88, 8]

const POSES = {
  'bench-press': { ...LYING, a: [[33, 46], [33, 33]], eq: [...FLAT_BENCH, ['plate', 33, 30, 11]] },
  'incline-bench-press': { h: [32, 37], s: [38, 47], p: [56, 70], a: [[40, 33], [42, 20]], l: [[72, 66], [76, 90]],
    eq: [['ln', 61, 76, 35, 42, 4], ['ln', 58, 77, 72, 77, 4], ['ln', 62, 77, 62, 90], ['plate', 42, 17, 10]] },
  'dumbbell-bench-press': { ...LYING, a: [[33, 46], [33, 34]], eq: [...FLAT_BENCH, ['db', 33, 30]] },
  'chest-press': { ...SEATED, a: [[50, 40], [64, 38]], l: [[60, 62], [62, 90]],
    eq: [...SEAT, ['ln', 66, 28, 66, 46, 4], ['ln', 66, 34, 86, 34], STACK(86)] },
  'machine-chest-fly': { h: [50, 20], s: [50, 32], p: [50, 62], a: [[34, 38], [31, 24]], a2: [[66, 38], [69, 24]],
    l: [[42, 74], [41, 92]], l2: [[58, 74], [59, 92]], eq: [['ln', 26, 16, 26, 44, 5], ['ln', 74, 16, 74, 44, 5], ['ln', 40, 66, 60, 66, 4]] },
  deadlift: { h: [64, 29], s: [58, 39], p: [38, 60], a: [[58, 54], [58, 70]], l: [[52, 72], [46, 92]], eq: [['plate', 58, 77, 13]] },
  'bent-over-row': { h: [71, 38], s: [62, 43], p: [36, 50], a: [[53, 37], [58, 54]], l: [[47, 70], [43, 92]], eq: [['plate', 58, 57, 10]] },
  'dumbbell-row': { h: [76, 45], s: [66, 49], p: [38, 52], a: [[56, 40], [58, 55]], a2: [[67, 59], [68, 67]], l: [[36, 72], [34, 92]],
    eq: [['ln', 46, 70, 88, 70, 4], ['ln', 52, 70, 52, 90], ['ln', 82, 70, 82, 90], ['db', 58, 59]] },
  'lat-pulldown': { h: [50, 34], s: [50, 46], p: [50, 72], a: [[36, 38], [31, 23]], a2: [[64, 38], [69, 23]],
    l: [[42, 82], [41, 94]], l2: [[58, 82], [59, 94]], eq: [['ln', 22, 21, 78, 21, 4], ['ln', 50, 21, 50, 5], ['ln', 38, 76, 62, 76, 4]] },
  'seated-cable-row': { h: [35, 26], s: [36, 38], p: [34, 66], a: [[29, 51], [46, 50]], l: [[54, 60], [70, 68]],
    eq: [['ln', 18, 71, 52, 71, 4], ['ln', 26, 71, 26, 90], ['ln', 73, 58, 73, 78, 4], ['ln', 46, 50, 86, 50, 1.5], STACK(88)] },
  'shoulder-press': { ...FRONT, a: [[37, 28], [36, 14]], a2: [[63, 28], [64, 14]], eq: [['bar', 50, 12, 36]] },
  'dumbbell-shoulder-press': { ...FRONT, a: [[33, 36], [33, 22]], a2: [[67, 36], [67, 22]], eq: [['db', 33, 18], ['db', 67, 18]] },
  'dumbbell-lateral-raise': { ...FRONT, a: [[36, 38], [22, 37]], a2: [[64, 38], [78, 37]], eq: [['dbv', 18, 37], ['dbv', 82, 37]] },
  'barbell-shrug': { ...FRONT, h: [50, 28], a: [[39, 52], [38, 66]], a2: [[61, 52], [62, 66]], eq: [['bar', 50, 68, 36]] },
  'barbell-curl': { ...SIDE, h: [48, 16], s: [48, 28], p: [48, 56], l: [[48, 74], [48, 92]], a: [[50, 45], [62, 35]], eq: [['plate', 63, 34, 10]] },
  'dumbbell-curl': { ...FRONT, a: [[38, 52], [33, 39]], a2: [[61, 52], [63, 66]], eq: [['db', 32, 36], ['dbv', 67, 67]] },
  'hammer-curl': { ...SIDE, h: [48, 16], s: [48, 28], p: [48, 56], l: [[48, 74], [48, 92]], a: [[50, 45], [62, 37]], eq: [['dbv', 64, 35]] },
  'preacher-curl': { h: [50, 33], s: [46, 44], p: [38, 68], a: [[62, 57], [72, 44]], l: [[54, 70], [54, 90]],
    eq: [['ln', 28, 73, 46, 73, 4], ['ln', 36, 73, 36, 90], ['ln', 51, 49, 67, 63, 5], ['ln', 60, 58, 62, 90], ['plate', 73, 43, 9]] },
  'tricep-pushdown': { h: [38, 18], s: [38, 30], p: [38, 58], l: [[38, 75], [38, 92]], a: [[40, 46], [53, 57]],
    eq: [['ln', 53, 57, 64, 8, 1.5], ['ln', 64, 8, 74, 8], ['ln', 74, 6, 74, 92, 4], STACK(82)] },
  'lying-tricep-extension': { ...LYING, a: [[35, 43], [23, 39]], eq: [...FLAT_BENCH, ['plate', 21, 37, 8]] },
  squat: { h: [57, 27], s: [50, 37], p: [36, 58], a: [[53, 47], [47, 38]], l: [[58, 66], [52, 92]], eq: [['plate', 46, 35, 11]] },
  'front-squat': { h: [52, 25], s: [48, 37], p: [36, 58], a: [[64, 42], [56, 37]], l: [[58, 66], [52, 92]], eq: [['plate', 57, 38, 11]] },
  'sled-leg-press': { h: [15, 47], s: [20, 58], p: [32, 80], a: [[28, 72], [36, 84]], l: [[45, 58], [63, 49]],
    eq: [['ln', 13, 62, 27, 88, 4], ['ln', 36, 92, 90, 38, 1.5], ['ln', 58, 40, 70, 58, 5], ['plate', 78, 38, 10]] },
  'leg-extension': { ...SEATED, a: [[44, 48], [50, 62]], l: [[60, 62], [82, 58]], eq: [...SEAT, ['plate', 80, 50, 4], STACK(18)] },
  'dumbbell-bulgarian-split-squat': { h: [49, 20], s: [48, 32], p: [46, 58], a: [[48, 46], [48, 60]], l: [[62, 66], [58, 92]], l2: [[36, 78], [22, 70]],
    eq: [['ln', 10, 74, 28, 74, 4], ['ln', 14, 74, 14, 90], ['ln', 24, 74, 24, 90], ['db', 48, 64]] },
  'romanian-deadlift': { h: [70, 38], s: [61, 42], p: [36, 50], a: [[61, 54], [61, 64]], l: [[41, 71], [42, 92]], eq: [['plate', 61, 67, 10]] },
  'seated-leg-curl': { ...SEATED, a: [[44, 48], [50, 62]], l: [[62, 62], [56, 84]], eq: [...SEAT, ['plate', 61, 86, 4], STACK(18)] },
  'hip-thrust': { h: [15, 44], s: [24, 52], p: [54, 53], a: [[40, 61], [52, 50]], l: [[72, 55], [72, 90]],
    eq: [['ln', 10, 59, 30, 59, 4], ['ln', 14, 59, 14, 90], ['ln', 26, 59, 26, 90], ['plate', 55, 48, 11]] },
  'machine-calf-raise': { h: [46, 16], s: [46, 28], p: [46, 56], l: [[46, 72], [46, 84]], a: [[52, 38], [56, 29]],
    eq: [['ln', 36, 89, 58, 89, 6], ['ln', 38, 23, 82, 23, 4], ['ln', 82, 20, 82, 90, 4], ['ln', 46, 84, 53, 85, 5]] },
  'cable-crunch': { h: [69, 57], s: [60, 52], p: [42, 66], a: [[67, 66], [72, 47]], l: [[52, 90], [26, 90]],
    eq: [['ln', 72, 46, 78, 8, 1.5], ['ln', 78, 8, 88, 8], ['ln', 88, 6, 88, 92, 4]] },
}

const pts = (...p) => p.map((q) => q.join(',')).join(' ')

function Equip({ e }) {
  const [k, x, y, a, b, w] = e
  if (k === 'plate') return <><circle cx={x} cy={y} r={a} strokeWidth="3.5" /><circle cx={x} cy={y} r="1.5" fill="currentColor" /></>
  if (k === 'bar') return <><path d={`M${x - a} ${y}H${x + a}`} strokeWidth="2.5" /><path d={`M${x - a + 4} ${y - 8}v16M${x + a - 4} ${y - 8}v16`} strokeWidth="5" /></>
  if (k === 'db') return <><path d={`M${x - 5} ${y}h10`} strokeWidth="2.5" /><path d={`M${x - 6} ${y - 4}v8M${x + 6} ${y - 4}v8`} strokeWidth="4" /></>
  if (k === 'dbv') return <><path d={`M${x} ${y - 5}v10`} strokeWidth="2.5" /><path d={`M${x - 4} ${y - 6}h8M${x - 4} ${y + 6}h8`} strokeWidth="4" /></>
  return <path d={`M${x} ${y}L${a} ${b}`} strokeWidth={w || 3} />
}

export default function Icon({ id, size = 64 }) {
  const p = POSES[id]
  if (!p) return null
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g stroke="currentColor" style={{ color: 'var(--accent)' }}>{p.eq.map((e, i) => <Equip key={i} e={e} />)}</g>
      <g stroke="var(--figure)" strokeWidth="5.5">
        <polyline points={pts(p.s, p.p)} />
        {[p.l, p.l2].map((l, i) => l && <polyline key={i} points={pts(p.p, ...l)} />)}
        {[p.a, p.a2].map((a, i) => a && <polyline key={i} points={pts(p.s, ...a)} strokeWidth="4.5" />)}
        <circle cx={p.h[0]} cy={p.h[1]} r="5.5" fill="var(--figure)" stroke="none" />
      </g>
    </svg>
  )
}

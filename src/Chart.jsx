import { useState } from 'react'

// Single-series line over time. points: [{ date: 'YYYY-MM-DD', kg }] sorted by date. fmt turns kg into display text.
const W = 320, H = 132, L = 6, R = 6, T = 26, B = 20
const day = (d) => new Date(d + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export default function Chart({ points, fmt }) {
  const [hover, setHover] = useState(null)
  const ts = points.map((p) => Date.parse(p.date))
  const t0 = ts[0], tSpan = ts[ts.length - 1] - t0
  const lo = Math.min(...points.map((p) => p.kg)), hi = Math.max(...points.map((p) => p.kg))
  // A lone point (or a flat line) sits in the middle instead of dividing by zero.
  const x = (i) => (tSpan ? L + ((ts[i] - t0) / tSpan) * (W - L - R) : W / 2)
  const y = (kg) => (hi > lo ? T + (1 - (kg - lo) / (hi - lo)) * (H - T - B) : (T + H - B) / 2)

  function move(e) {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    let best = 0
    points.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i })
    setHover(best)
  }

  const h = hover != null && points[hover] ? hover : null
  const last = points.length - 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)}
      aria-label={`${points.length} entries from ${day(points[0].date)} to ${day(points[last].date)}, latest ${fmt(points[last].kg)}`}>
      <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="axis" />
      {hi > lo && <line x1={L} x2={W - R} y1={T} y2={T} className="axis" strokeDasharray="2 4" />}
      {h != null && <line x1={x(h)} x2={x(h)} y1={T - 6} y2={H - B} className="axis cross" />}
      <polyline points={points.map((p, i) => `${x(i)},${y(p.kg)}`).join(' ')} className="line" />
      {points.map((p, i) => (points.length <= 24 || i === last || i === h) &&
        <circle key={p.date} cx={x(i)} cy={y(p.kg)} r={i === h ? 5 : i === last ? 4 : 2.5} className="dot" />)}
      {h != null
        ? <text x={Math.min(Math.max(x(h), 50), W - 50)} y={12} textAnchor="middle" className="tip">{day(points[h].date)} · {fmt(points[h].kg)}</text>
        : hi > lo && <text x={L} y={T - 6} className="tick">{fmt(hi)}</text>}
      <text x={L} y={H - 5} className="tick">{day(points[0].date)}</text>
      {last > 0 && <text x={W - R} y={H - 5} textAnchor="end" className="tick">{day(points[last].date)}</text>}
    </svg>
  )
}

import { RANKS } from './ranks.js'

export default function Badge({ rank }) {
  return <span className="badge" style={{ '--c': RANKS[rank].color }}>{RANKS[rank].name}</span>
}

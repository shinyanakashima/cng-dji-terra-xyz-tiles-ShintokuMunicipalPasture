import { INDICES, INDEX_META } from '../constants'
import type { VegetationIndex } from '../constants'

interface Props {
  activeIndex: VegetationIndex
  opacity: number
  onIndexChange: (idx: VegetationIndex) => void
  onOpacityChange: (v: number) => void
}

export default function LayerControl({ activeIndex, opacity, onIndexChange, onOpacityChange }: Props) {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">植生指数ビューア</p>

      <div className="sidebar-section">
        <h2>指数選択</h2>
        {INDICES.map((idx) => (
          <button
            key={idx}
            className={`index-btn${activeIndex === idx ? ' active' : ''}`}
            onClick={() => onIndexChange(idx)}
          >
            <div className="index-btn-name">{INDEX_META[idx].label}</div>
            <div className="index-btn-desc">{INDEX_META[idx].desc}</div>
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <h2>透過度</h2>
        <div className="opacity-control">
          <div className="opacity-row">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
            />
            <span className="opacity-value">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

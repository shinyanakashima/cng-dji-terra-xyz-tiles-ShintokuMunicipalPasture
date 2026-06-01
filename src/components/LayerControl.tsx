import { INDICES, INDEX_META, BASE_MAPS } from '../constants'
import type { VegetationIndex, BaseMap } from '../constants'

interface Props {
  baseMap: BaseMap
  showTrueColor: boolean
  activeIndex: VegetationIndex | null
  opacity: number
  onBaseMapChange: (b: BaseMap) => void
  onTrueColorChange: (v: boolean) => void
  onIndexChange: (idx: VegetationIndex | null) => void
  onOpacityChange: (v: number) => void
}

export default function LayerControl({
  baseMap,
  showTrueColor,
  activeIndex,
  opacity,
  onBaseMapChange,
  onTrueColorChange,
  onIndexChange,
  onOpacityChange,
}: Props) {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">植生指数ビューア</p>

      <div className="sidebar-section">
        <h2>背景</h2>
        {BASE_MAPS.map((b) => (
          <button
            key={b.id}
            className={`index-btn${baseMap === b.id ? ' active' : ''}`}
            onClick={() => onBaseMapChange(b.id)}
          >
            <div className="index-btn-name">{b.label}</div>
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <h2>オルソ画像</h2>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showTrueColor}
            onChange={(e) => onTrueColorChange(e.target.checked)}
          />
          <span>トゥルーカラー（ドローン空撮）</span>
        </label>
      </div>

      <div className="sidebar-section">
        <h2>植生指数</h2>
        {INDICES.map((idx) => (
          <button
            key={idx}
            className={`index-btn${activeIndex === idx ? ' active' : ''}`}
            // クリックで選択／もう一度押すと非表示（null）
            onClick={() => onIndexChange(activeIndex === idx ? null : idx)}
          >
            <div className="index-btn-name">{INDEX_META[idx].label}</div>
            <div className="index-btn-desc">{INDEX_META[idx].desc}</div>
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <h2>植生指数の透過度</h2>
        <div className="opacity-control">
          <div className="opacity-row">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              disabled={!activeIndex}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
            />
            <span className="opacity-value">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

import { INDICES, INDEX_META, BASE_MAPS } from '../constants'
import type { VegetationIndex, BaseMap } from '../constants'

interface Props {
  baseMap: BaseMap
  showTrueColor: boolean
  showOutline: boolean
  showIndex: boolean
  activeIndex: VegetationIndex
  opacity: number
  onBaseMapChange: (b: BaseMap) => void
  onTrueColorChange: (v: boolean) => void
  onOutlineChange: (v: boolean) => void
  onIndexShowChange: (v: boolean) => void
  onIndexChange: (idx: VegetationIndex) => void
  onOpacityChange: (v: number) => void
}

export default function LayerControl({
  baseMap,
  showTrueColor,
  showOutline,
  showIndex,
  activeIndex,
  opacity,
  onBaseMapChange,
  onTrueColorChange,
  onOutlineChange,
  onIndexShowChange,
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
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showOutline}
            onChange={(e) => onOutlineChange(e.target.checked)}
          />
          <span>圃場輪郭</span>
        </label>
      </div>

      <div className="sidebar-section">
        <h2>植生指数</h2>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showIndex}
            onChange={(e) => onIndexShowChange(e.target.checked)}
          />
          <span>植生指数を表示</span>
        </label>
        {INDICES.map((idx) => (
          <button
            key={idx}
            className={`index-btn${showIndex && activeIndex === idx ? ' active' : ''}`}
            disabled={!showIndex}
            onClick={() => onIndexChange(idx)}
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
              disabled={!showIndex}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
            />
            <span className="opacity-value">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

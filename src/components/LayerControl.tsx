import { INDEX_META } from '../constants'
import type { VegetationIndex } from '../constants'
import { FieldSection, BaseMapSection, OutlineToggle } from './ControlSections'
import type { SharedViewProps } from './ControlSections'

interface Props extends SharedViewProps {
  visibleIndices: Record<string, boolean>
  opacityByIndex: Record<string, number>
  onIndexToggle: (idx: VegetationIndex, v: boolean) => void
  onIndexOpacityChange: (idx: VegetationIndex, v: number) => void
}

/** 通常表示のサイドバー。植生指数を個別ON/OFF＋指数ごとの透過度で重ね表示する。 */
export default function LayerControl(props: Props) {
  const {
    field,
    showTrueColor,
    visibleIndices,
    opacityByIndex,
    onTrueColorChange,
    onIndexToggle,
    onIndexOpacityChange,
  } = props
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Mimori v0.2.0</p>

      <FieldSection {...props} />
      <BaseMapSection {...props} />

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
        <OutlineToggle {...props} />
      </div>

      <div className="sidebar-section">
        <h2>植生指数</h2>
        {field.indices.map((idx) => {
          const on = visibleIndices[idx] ?? false
          const op = opacityByIndex[idx] ?? 0.8
          return (
            <div key={idx} className={`index-item${on ? ' active' : ''}`}>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => onIndexToggle(idx, e.target.checked)}
                />
                <span className="index-item-text">
                  <span className="index-btn-name">{INDEX_META[idx].label}</span>
                  <span className="index-btn-desc">{INDEX_META[idx].desc}</span>
                </span>
              </label>
              <div className="opacity-row">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={op}
                  disabled={!on}
                  onChange={(e) => onIndexOpacityChange(idx, Number(e.target.value))}
                />
                <span className="opacity-value">{Math.round(op * 100)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

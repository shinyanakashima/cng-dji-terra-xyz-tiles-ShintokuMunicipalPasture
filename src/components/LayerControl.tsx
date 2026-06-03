import { INDEX_META, BASE_MAPS } from '../constants'
import type { VegetationIndex, BaseMap, FieldDef } from '../constants'

interface Props {
  fields: FieldDef[]
  activeFieldId: string
  baseMap: BaseMap
  showTrueColor: boolean
  showOutline: boolean
  visibleIndices: Record<string, boolean>
  opacityByIndex: Record<string, number>
  onFieldChange: (id: string) => void
  onBaseMapChange: (b: BaseMap) => void
  onTrueColorChange: (v: boolean) => void
  onOutlineChange: (v: boolean) => void
  onIndexToggle: (idx: VegetationIndex, v: boolean) => void
  onIndexOpacityChange: (idx: VegetationIndex, v: number) => void
}

export default function LayerControl({
  fields,
  activeFieldId,
  baseMap,
  showTrueColor,
  showOutline,
  visibleIndices,
  opacityByIndex,
  onFieldChange,
  onBaseMapChange,
  onTrueColorChange,
  onOutlineChange,
  onIndexToggle,
  onIndexOpacityChange,
}: Props) {
  const activeField = fields.find((f) => f.id === activeFieldId) ?? fields[0]
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Mimori v0.2.0</p>

      <div className="sidebar-section">
        <h2>圃場</h2>
        {fields.map((f) => (
          <button
            key={f.id}
            className={`index-btn${activeFieldId === f.id ? ' active' : ''}`}
            onClick={() => onFieldChange(f.id)}
          >
            <div className="index-btn-name">{f.label}</div>
          </button>
        ))}
      </div>

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
        {activeField.indices.map((idx) => {
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

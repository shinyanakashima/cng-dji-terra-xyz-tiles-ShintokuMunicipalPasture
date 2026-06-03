import { BASE_MAPS } from '../constants'
import type { BaseMap, FieldDef } from '../constants'

/** 通常表示・比較表示の両サイドバーで共有する「圃場・背景・輪郭」の状態と更新関数。 */
export interface SharedViewProps {
  fields: FieldDef[]
  activeFieldId: string
  field: FieldDef
  baseMap: BaseMap
  showTrueColor: boolean
  showOutline: boolean
  onFieldChange: (id: string) => void
  onBaseMapChange: (b: BaseMap) => void
  onTrueColorChange: (v: boolean) => void
  onOutlineChange: (v: boolean) => void
}

/** 圃場セレクタ（共通） */
export function FieldSection({ fields, activeFieldId, onFieldChange }: SharedViewProps) {
  return (
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
  )
}

/** 背景地図セレクタ（共通） */
export function BaseMapSection({ baseMap, onBaseMapChange }: SharedViewProps) {
  return (
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
  )
}

/** 圃場輪郭トグル（共通） */
export function OutlineToggle({ showOutline, onOutlineChange }: SharedViewProps) {
  return (
    <label className="toggle-row">
      <input
        type="checkbox"
        checked={showOutline}
        onChange={(e) => onOutlineChange(e.target.checked)}
      />
      <span>圃場輪郭</span>
    </label>
  )
}

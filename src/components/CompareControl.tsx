import { FieldSection, BaseMapSection, OutlineToggle } from './ControlSections'
import type { SharedViewProps } from './ControlSections'

/** 比較対象に選べるレイヤー（オルソ or 各植生指数） */
export interface CompareLayerOption {
  value: string
  label: string
}

interface Props extends SharedViewProps {
  options: CompareLayerOption[]
  leftLayer: string
  rightLayer: string
  orientation: 'vertical' | 'horizontal'
  onLeftChange: (v: string) => void
  onRightChange: (v: string) => void
  onOrientationChange: (o: 'vertical' | 'horizontal') => void
}

/** 比較表示のサイドバー。左右（上下）に表示するレイヤーと比較の向きを選ぶ。 */
export default function CompareControl(props: Props) {
  const { options, leftLayer, rightLayer, orientation, onLeftChange, onRightChange, onOrientationChange } = props
  const vertical = orientation === 'vertical'
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Mimori v0.2.0 — 比較</p>

      <FieldSection {...props} />
      <BaseMapSection {...props} />

      <div className="sidebar-section">
        <h2>比較の向き</h2>
        <button
          className={`index-btn${vertical ? ' active' : ''}`}
          onClick={() => onOrientationChange('vertical')}
        >
          <div className="index-btn-name">左右（縦バー）</div>
        </button>
        <button
          className={`index-btn${!vertical ? ' active' : ''}`}
          onClick={() => onOrientationChange('horizontal')}
        >
          <div className="index-btn-name">上下（横バー）</div>
        </button>
      </div>

      <div className="sidebar-section">
        <h2>{vertical ? '左に表示' : '上に表示'}</h2>
        <select className="compare-select" value={leftLayer} onChange={(e) => onLeftChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <h2>{vertical ? '右に表示' : '下に表示'}</h2>
        <select className="compare-select" value={rightLayer} onChange={(e) => onRightChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <h2>その他</h2>
        <OutlineToggle {...props} />
      </div>
    </aside>
  )
}

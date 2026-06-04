import { FieldSection, BaseMapSection, OutlineToggle } from './ControlSections'
import type { SharedViewProps } from './ControlSections'

interface Props extends SharedViewProps {
  orientation: 'vertical' | 'horizontal'
  onOrientationChange: (o: 'vertical' | 'horizontal') => void
}

/**
 * 比較表示のサイドバー。圃場・背景・比較の向き・輪郭を扱う。
 * 左右（上下）に表示するレイヤーの選択は、地図上のプルダウン（オーバーレイ）側に置く。
 */
export default function CompareControl(props: Props) {
  const { orientation, onOrientationChange } = props
  const vertical = orientation === 'vertical'
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Mimori v0.2.0 — 比較</p>

      <FieldSection {...props} />
      <BaseMapSection {...props} />

      <div className="sidebar-section">
        <h2>比較の向き</h2>
        <div className="radio-row">
          <label className="radio-option">
            <input
              type="radio"
              name="compare-orientation"
              checked={vertical}
              onChange={() => onOrientationChange('vertical')}
            />
            <span>左右</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="compare-orientation"
              checked={!vertical}
              onChange={() => onOrientationChange('horizontal')}
            />
            <span>上下</span>
          </label>
        </div>
      </div>

      <div className="sidebar-section">
        <h2>その他</h2>
        <OutlineToggle {...props} />
      </div>
    </aside>
  )
}

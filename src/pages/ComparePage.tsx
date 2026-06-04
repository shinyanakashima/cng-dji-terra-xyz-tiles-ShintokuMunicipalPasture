import { useState } from 'react'
import CompareMap from '../components/CompareMap'
import CompareControl from '../components/CompareControl'
import type { SharedViewProps } from '../components/ControlSections'
import type { FieldMapState } from '../lib/mapStyle'
import { INDEX_META, TRUECOLOR_ID } from '../constants'

interface LayerOption {
  value: string
  label: string
}

/** 比較対象の選択値（'truecolor' or 植生指数）→ 1地図ぶんの表示状態に変換 */
function sideState(sel: string, shared: SharedViewProps): FieldMapState {
  const isTrueColor = sel === TRUECOLOR_ID
  return {
    baseMap: shared.baseMap,
    showTrueColor: isTrueColor,
    showOutline: shared.showOutline,
    visibleIndices: isTrueColor ? {} : { [sel]: true },
    // 比較は見比べやすさ優先で不透明に
    opacityByIndex: isTrueColor ? {} : { [sel]: 1 },
  }
}

/** 地図上に重ねるレイヤー選択プルダウン（左右それぞれ） */
function LayerSelect({
  position,
  label,
  value,
  options,
  onChange,
}: {
  position: string
  label: string
  value: string
  options: LayerOption[]
  onChange: (v: string) => void
}) {
  return (
    <div className={`compare-overlay ${position}`}>
      <span className="compare-overlay-label">{label}</span>
      <select className="compare-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

/** 左右比較ページ: 2つのレイヤーをスワイプで見比べる。レイヤー選択は地図上の左右プルダウン。 */
export default function ComparePage(shared: SharedViewProps) {
  const { field } = shared

  const options: LayerOption[] = [
    { value: TRUECOLOR_ID, label: 'トゥルーカラー（空撮）' },
    ...field.indices.map((idx) => ({ value: idx, label: `${INDEX_META[idx].label}（${INDEX_META[idx].desc}）` })),
  ]

  const [leftLayer, setLeftLayer] = useState<string>(field.indices[0] ?? TRUECOLOR_ID)
  const [rightLayer, setRightLayer] = useState<string>(field.indices[1] ?? TRUECOLOR_ID)
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const vertical = orientation === 'vertical'

  // 圃場が変わって選択中の指数を持たない場合は先頭にフォールバック
  const safeLeft = leftLayer === TRUECOLOR_ID || field.indices.includes(leftLayer as never) ? leftLayer : (field.indices[0] ?? TRUECOLOR_ID)
  const safeRight = rightLayer === TRUECOLOR_ID || field.indices.includes(rightLayer as never) ? rightLayer : (field.indices[0] ?? TRUECOLOR_ID)

  return (
    <div className="app-body">
      <CompareControl
        {...shared}
        orientation={orientation}
        onOrientationChange={setOrientation}
      />
      <div className="compare-area">
        <CompareMap
          key={field.id}
          field={field}
          left={sideState(safeLeft, shared)}
          right={sideState(safeRight, shared)}
          orientation={orientation}
        />
        <LayerSelect
          position={`compare-overlay-a ${orientation}`}
          label={vertical ? '左' : '上'}
          value={safeLeft}
          options={options}
          onChange={setLeftLayer}
        />
        <LayerSelect
          position={`compare-overlay-b ${orientation}`}
          label={vertical ? '右' : '下'}
          value={safeRight}
          options={options}
          onChange={setRightLayer}
        />
      </div>
    </div>
  )
}

import { useState } from 'react'
import CompareMap from '../components/CompareMap'
import CompareControl from '../components/CompareControl'
import type { CompareLayerOption } from '../components/CompareControl'
import type { SharedViewProps } from '../components/ControlSections'
import type { FieldMapState } from '../lib/mapStyle'
import { INDEX_META, TRUECOLOR_ID } from '../constants'

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

/** 左右比較ページ: 2つのレイヤーをスワイプで見比べる。 */
export default function ComparePage(shared: SharedViewProps) {
  const { field } = shared

  const options: CompareLayerOption[] = [
    { value: TRUECOLOR_ID, label: 'トゥルーカラー（空撮）' },
    ...field.indices.map((idx) => ({ value: idx, label: `${INDEX_META[idx].label}（${INDEX_META[idx].desc}）` })),
  ]

  const [leftLayer, setLeftLayer] = useState<string>(field.indices[0] ?? TRUECOLOR_ID)
  const [rightLayer, setRightLayer] = useState<string>(field.indices[1] ?? TRUECOLOR_ID)
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')

  // 圃場が変わって選択中の指数を持たない場合は先頭にフォールバック
  const safeLeft = leftLayer === TRUECOLOR_ID || field.indices.includes(leftLayer as never) ? leftLayer : (field.indices[0] ?? TRUECOLOR_ID)
  const safeRight = rightLayer === TRUECOLOR_ID || field.indices.includes(rightLayer as never) ? rightLayer : (field.indices[0] ?? TRUECOLOR_ID)

  return (
    <div className="app-body">
      <CompareControl
        {...shared}
        options={options}
        leftLayer={safeLeft}
        rightLayer={safeRight}
        orientation={orientation}
        onLeftChange={setLeftLayer}
        onRightChange={setRightLayer}
        onOrientationChange={setOrientation}
      />
      <CompareMap
        key={field.id}
        field={field}
        left={sideState(safeLeft, shared)}
        right={sideState(safeRight, shared)}
        orientation={orientation}
      />
    </div>
  )
}

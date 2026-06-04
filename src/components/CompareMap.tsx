import { useEffect, useRef } from 'react'
import Compare from '@maplibre/maplibre-gl-compare'
import '@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css'
import { useFieldMap } from '../lib/useFieldMap'
import type { FieldMapState } from '../lib/mapStyle'
import type { FieldDef } from '../constants'

interface Props {
  field: FieldDef
  /** 左（縦）/上（横）に表示する地図の状態 */
  left: FieldMapState
  /** 右（縦）/下（横）に表示する地図の状態 */
  right: FieldMapState
  orientation: 'vertical' | 'horizontal'
}

/**
 * maplibre-gl-compare による左右（上下）スワイプ比較。
 * 2つの地図インスタンスを useFieldMap で生成し、Compare が clip＋移動同期で1枚に見せる。
 * 圃場の切替は呼び出し側で key を付けて再マウントする前提。
 */
export default function CompareMap({ field, left, right, orientation }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const a = useFieldMap(field, left, { controls: false })
  // コントロールは上の地図(b)のみに、右下へまとめて配置（上隅は左右のレイヤー選択に使う）
  const b = useFieldMap(field, right, { controls: true, navPosition: 'bottom-right', scalePosition: 'bottom-right' })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const mapA = a.mapRef.current
    const mapB = b.mapRef.current
    if (!wrapper || !mapA || !mapB) return
    const compare = new Compare(mapA, mapB, wrapper, { orientation, mousemove: false })
    return () => compare.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation])

  return (
    <div className="compare-wrapper" ref={wrapperRef}>
      <div ref={a.containerRef} className="map-container compare-map" />
      <div ref={b.containerRef} className="map-container compare-map" />
    </div>
  )
}

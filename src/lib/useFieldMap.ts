import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { ControlPosition } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { buildFieldStyle, DEFAULT_INDEX_OPACITY } from './mapStyle'
import type { FieldMapState } from './mapStyle'
import { TRUECOLOR_ID } from '../constants'
import type { FieldDef } from '../constants'

interface Options {
  /** ナビゲーション/スケールのコントロールを載せるか（比較表示では片側のみ true にする） */
  controls?: boolean
  /** ナビゲーションコントロールの配置 */
  navPosition?: ControlPosition
  /** スケールコントロールの配置 */
  scalePosition?: ControlPosition
}

/**
 * 圃場1単位ぶんの MapLibre 地図を生成し、表示状態（背景/オルソ/輪郭/各指数の表示・透過）を
 * props と同期させる共通フック。通常表示の単一地図、比較表示の左右 2 地図で共有する。
 *
 * 圃場の切替（center/zoom が変わる）は呼び出し側で key を付けて再マウントする前提。
 */
export function useFieldMap(field: FieldDef, state: FieldMapState, options: Options = {}) {
  const { controls = true, navPosition = 'top-right', scalePosition = 'bottom-left' } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  // ロード完了を state にして、各同期 useEffect がロード後に確実に再実行されるようにする
  const [ready, setReady] = useState(false)
  const { baseMap, showTrueColor, showOutline, visibleIndices, opacityByIndex } = state

  useEffect(() => {
    if (!containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildFieldStyle(field, state),
      center: field.center,
      zoom: field.zoom,
      maxZoom: 24, // 既定22 → z23タイルへ到達＋少し拡大(オーバーズーム)で詳細確認
    })
    if (controls) {
      map.addControl(new maplibregl.NavigationControl(), navPosition)
      map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), scalePosition)
    }
    map.on('load', () => setReady(true))
    mapRef.current = map
    return () => {
      setReady(false)
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 背景の切り替え
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setLayoutProperty('lyr-gsi-photo', 'visibility', baseMap === 'satellite' ? 'visible' : 'none')
    map.setLayoutProperty('lyr-osm', 'visibility', baseMap === 'map' ? 'visible' : 'none')
  }, [baseMap, ready])

  // トゥルーカラーの ON/OFF
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setLayoutProperty(`lyr-${TRUECOLOR_ID}`, 'visibility', showTrueColor ? 'visible' : 'none')
  }, [showTrueColor, ready])

  // 圃場輪郭の ON/OFF
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setLayoutProperty('lyr-field-outline', 'visibility', showOutline ? 'visible' : 'none')
  }, [showOutline, ready])

  // 植生指数の表示ON/OFF（指数ごと・複数同時表示可）
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    field.indices.forEach((idx) => {
      if (!map.getLayer(`lyr-${idx}`)) return
      map.setLayoutProperty(`lyr-${idx}`, 'visibility', (visibleIndices[idx] ?? false) ? 'visible' : 'none')
    })
  }, [field.indices, visibleIndices, ready])

  // 植生指数の透過度（指数ごと）
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    field.indices.forEach((idx) => {
      if (!map.getLayer(`lyr-${idx}`)) return
      map.setPaintProperty(`lyr-${idx}`, 'raster-opacity', opacityByIndex[idx] ?? DEFAULT_INDEX_OPACITY)
    })
  }, [field.indices, opacityByIndex, ready])

  return { containerRef, mapRef, ready }
}

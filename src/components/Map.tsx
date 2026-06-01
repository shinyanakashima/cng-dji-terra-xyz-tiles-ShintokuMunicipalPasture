import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { INDICES, MAP_CENTER, MAP_ZOOM, TRUECOLOR_ID } from '../constants'
import type { VegetationIndex, BaseMap } from '../constants'

// XYZ タイルのベースURL。
// 開発: /tiles（vite.config.ts のプラグインが ../map/index_map_color を配信）
// 本番: VITE_TILES_BASE_URL（R2 公開URL）
const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? '/tiles'

interface Props {
  baseMap: BaseMap
  showTrueColor: boolean
  showOutline: boolean
  showIndex: boolean
  activeIndex: VegetationIndex
  opacity: number
}

// 圃場輪郭 GeoJSON（segment.tif から生成, public/ に配置）
const OUTLINE_URL = `${import.meta.env.BASE_URL}field-outline.geojson`

export default function Map({ baseMap, showTrueColor, showOutline, showIndex, activeIndex, opacity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  // ロード完了を state にして、各同期 useEffect がロード後に確実に再実行されるようにする
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          // 背景: 地理院シームレス空中写真（衛星画像）
          'gsi-photo': {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
            tileSize: 256,
            maxzoom: 18,
            attribution: '&copy; <a href="https://www.gsi.go.jp/">国土地理院</a>',
          },
          // 背景: OpenStreetMap（地図）
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
          // ドローン オルソ（トゥルーカラー）
          [`src-${TRUECOLOR_ID}`]: {
            type: 'raster',
            tiles: [`${TILES_BASE}/${TRUECOLOR_ID}/{z}/{x}/{y}.png`],
            tileSize: 256,
            minzoom: 12,
            maxzoom: 23,
          },
          // 植生指数 5 種
          ...Object.fromEntries(
            INDICES.map((idx) => [
              `src-${idx}`,
              {
                type: 'raster',
                tiles: [`${TILES_BASE}/${idx}/{z}/{x}/{y}.png`],
                tileSize: 256,
                minzoom: 12,
                maxzoom: 23,
              },
            ]),
          ),
          // 圃場輪郭
          'field-outline': { type: 'geojson', data: OUTLINE_URL },
        },
        // 重ね順（下→上）: 背景 → トゥルーカラー → 植生指数
        layers: [
          { id: 'lyr-gsi-photo', type: 'raster', source: 'gsi-photo', layout: { visibility: baseMap === 'satellite' ? 'visible' : 'none' } },
          { id: 'lyr-osm', type: 'raster', source: 'osm', layout: { visibility: baseMap === 'map' ? 'visible' : 'none' } },
          {
            id: `lyr-${TRUECOLOR_ID}`,
            type: 'raster',
            source: `src-${TRUECOLOR_ID}`,
            layout: { visibility: showTrueColor ? 'visible' : 'none' },
          },
          ...INDICES.map((idx) => ({
            id: `lyr-${idx}`,
            type: 'raster' as const,
            source: `src-${idx}`,
            layout: { visibility: showIndex && idx === activeIndex ? ('visible' as const) : ('none' as const) },
            paint: { 'raster-opacity': opacity },
          })),
          // 最前面: 圃場輪郭
          {
            id: 'lyr-field-outline',
            type: 'line' as const,
            source: 'field-outline',
            layout: { visibility: showOutline ? ('visible' as const) : ('none' as const) },
            paint: { 'line-color': '#ffd21e', 'line-width': 2.5, 'line-opacity': 0.95 },
          },
        ],
      },
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      maxZoom: 24, // 既定22 → z23タイルへ到達＋少し拡大(オーバーズーム)で詳細確認
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      setReady(true)
    })

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

  // 植生指数の表示ON/OFF＋排他切り替え
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    INDICES.forEach((idx) => {
      map.setLayoutProperty(`lyr-${idx}`, 'visibility', showIndex && idx === activeIndex ? 'visible' : 'none')
    })
  }, [activeIndex, showIndex, ready])

  // 植生指数の透過度
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setPaintProperty(`lyr-${activeIndex}`, 'raster-opacity', opacity)
  }, [activeIndex, opacity, ready])

  return <div ref={containerRef} className="map-container" />
}

import { useEffect, useRef } from 'react'
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
  activeIndex: VegetationIndex | null
  opacity: number
}

export default function Map({ baseMap, showTrueColor, activeIndex, opacity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const readyRef = useRef(false)

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
            layout: { visibility: idx === activeIndex ? ('visible' as const) : ('none' as const) },
            paint: { 'raster-opacity': opacity },
          })),
        ],
      },
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      readyRef.current = true
    })

    mapRef.current = map
    return () => {
      readyRef.current = false
      map.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 背景の切り替え
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    map.setLayoutProperty('lyr-gsi-photo', 'visibility', baseMap === 'satellite' ? 'visible' : 'none')
    map.setLayoutProperty('lyr-osm', 'visibility', baseMap === 'map' ? 'visible' : 'none')
  }, [baseMap])

  // トゥルーカラーの ON/OFF
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    map.setLayoutProperty(`lyr-${TRUECOLOR_ID}`, 'visibility', showTrueColor ? 'visible' : 'none')
  }, [showTrueColor])

  // 植生指数の排他切り替え
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    INDICES.forEach((idx) => {
      map.setLayoutProperty(`lyr-${idx}`, 'visibility', idx === activeIndex ? 'visible' : 'none')
    })
  }, [activeIndex])

  // 植生指数の透過度
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current || !activeIndex) return
    map.setPaintProperty(`lyr-${activeIndex}`, 'raster-opacity', opacity)
  }, [activeIndex, opacity])

  return <div ref={containerRef} className="map-container" />
}

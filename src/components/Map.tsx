import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { INDICES, MAP_CENTER, MAP_ZOOM } from '../constants'
import type { VegetationIndex } from '../constants'

// XYZ タイルのベースURL。
// DJI Terra 出力: ../index_map_color/{INDEX}/{z}/{x}/{y}.png
// 本番: VITE_TILES_BASE_URL を .env で設定
const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? '/tiles'

interface Props {
  activeIndex: VegetationIndex
  opacity: number
}

export default function Map({ activeIndex, opacity }: Props) {
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
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxzoom: 19,
          },
        },
        layers: [{ id: 'osm-base', type: 'raster', source: 'osm' }],
      },
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      INDICES.forEach((idx) => {
        map.addSource(`src-${idx}`, {
          type: 'raster',
          tiles: [`${TILES_BASE}/${idx}/{z}/{x}/{y}.png`],
          tileSize: 256,
          minzoom: 12,
          maxzoom: 23,
        })
        map.addLayer({
          id: `lyr-${idx}`,
          type: 'raster',
          source: `src-${idx}`,
          layout: { visibility: idx === activeIndex ? 'visible' : 'none' },
          paint: { 'raster-opacity': opacity },
        })
      })
      readyRef.current = true
    })

    mapRef.current = map
    return () => {
      readyRef.current = false
      map.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    INDICES.forEach((idx) => {
      map.setLayoutProperty(`lyr-${idx}`, 'visibility', idx === activeIndex ? 'visible' : 'none')
    })
  }, [activeIndex])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    map.setPaintProperty(`lyr-${activeIndex}`, 'raster-opacity', opacity)
  }, [activeIndex, opacity])

  return <div ref={containerRef} className="map-container" />
}

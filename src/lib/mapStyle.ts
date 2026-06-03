import type { StyleSpecification } from 'maplibre-gl'
import { TRUECOLOR_ID } from '../constants'
import type { FieldDef, BaseMap } from '../constants'

// XYZ タイルのベースURL。
// 開発: /tiles（vite.config.ts のプラグインが ../map/index_map_color を配信）
// 本番: VITE_TILES_BASE_URL（R2 公開URL）
const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? '/tiles'

/** 指定圃場・指定指数（またはオルソ）の XYZ タイルURLテンプレート */
export function tileUrl(field: FieldDef, name: string) {
  return `${TILES_BASE}/${field.tilePrefix}${name}/{z}/{x}/{y}.png`
}

/** 1枚の地図に与える初期表示状態。通常表示・比較表示の双方で使い回す。 */
export interface FieldMapState {
  baseMap: BaseMap
  showTrueColor: boolean
  showOutline: boolean
  /** 指数ごとの表示ON/OFF（キー未定義は非表示扱い） */
  visibleIndices: Record<string, boolean>
  /** 指数ごとの透過度（キー未定義は 0.8 扱い） */
  opacityByIndex: Record<string, number>
}

export const DEFAULT_INDEX_OPACITY = 0.8

/**
 * 圃場1単位ぶんの MapLibre スタイル（ソース＋レイヤー）を組み立てる。
 * 重ね順（下→上）: 背景 → トゥルーカラー → 植生指数 → 圃場輪郭。
 * 通常表示の単一地図、比較表示の左右 2 地図のいずれもこの関数でスタイルを生成する。
 */
export function buildFieldStyle(field: FieldDef, state: FieldMapState): StyleSpecification {
  const indices = field.indices
  const outlineUrl = `${import.meta.env.BASE_URL}${field.outline}`
  return {
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
        tiles: [tileUrl(field, TRUECOLOR_ID)],
        tileSize: 256,
        minzoom: 12,
        maxzoom: 23,
      },
      // 植生指数（この圃場が持つ指数のみ）
      ...Object.fromEntries(
        indices.map((idx) => [
          `src-${idx}`,
          {
            type: 'raster',
            tiles: [tileUrl(field, idx)],
            tileSize: 256,
            minzoom: 12,
            maxzoom: 23,
          },
        ]),
      ),
      // 圃場輪郭
      'field-outline': { type: 'geojson', data: outlineUrl },
    },
    layers: [
      { id: 'lyr-gsi-photo', type: 'raster', source: 'gsi-photo', layout: { visibility: state.baseMap === 'satellite' ? 'visible' : 'none' } },
      { id: 'lyr-osm', type: 'raster', source: 'osm', layout: { visibility: state.baseMap === 'map' ? 'visible' : 'none' } },
      {
        id: `lyr-${TRUECOLOR_ID}`,
        type: 'raster',
        source: `src-${TRUECOLOR_ID}`,
        layout: { visibility: state.showTrueColor ? 'visible' : 'none' },
      },
      ...indices.map((idx) => ({
        id: `lyr-${idx}`,
        type: 'raster' as const,
        source: `src-${idx}`,
        layout: { visibility: (state.visibleIndices[idx] ?? false) ? ('visible' as const) : ('none' as const) },
        paint: { 'raster-opacity': state.opacityByIndex[idx] ?? DEFAULT_INDEX_OPACITY },
      })),
      // 最前面: 圃場輪郭
      {
        id: 'lyr-field-outline',
        type: 'line',
        source: 'field-outline',
        layout: { visibility: state.showOutline ? 'visible' : 'none' },
        paint: { 'line-color': '#ffd21e', 'line-width': 2.5, 'line-opacity': 0.95 },
      },
    ],
  }
}

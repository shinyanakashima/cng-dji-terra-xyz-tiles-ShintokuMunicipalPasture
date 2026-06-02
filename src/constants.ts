export const INDICES = ['NDVI', 'GNDVI', 'NDRE', 'LCI', 'OSAVI'] as const
export type VegetationIndex = (typeof INDICES)[number]

export const INDEX_META: Record<VegetationIndex, { label: string; desc: string }> = {
  NDVI:  { label: 'NDVI',  desc: '正規化植生指数' },
  GNDVI: { label: 'GNDVI', desc: '緑色正規化植生指数' },
  NDRE:  { label: 'NDRE',  desc: 'レッドエッジ植生指数' },
  LCI:   { label: 'LCI',   desc: '葉緑素指数' },
  OSAVI: { label: 'OSAVI', desc: '最適化土壌調整植生指数' },
}

// 既定ズーム
export const MAP_ZOOM = 16

// ── 圃場定義 ──────────────────────────────────────────────
// 圃場を1単位として、タイル一式(オルソ＋植生指数)・輪郭・初期表示位置を持たせる。
// 圃場を追加するときは FIELDS に1要素足すだけでセレクタ・地図に反映される。
export interface FieldDef {
  /** 内部ID（タイルのプレフィックスにも使う想定。英数字推奨） */
  id: string
  /** サイドバーに表示する名称 */
  label: string
  /** 初期表示の中心 [経度, 緯度] */
  center: [number, number]
  /** 初期表示ズーム */
  zoom: number
  /**
   * タイル配信のプレフィックス。
   * '' = バケット直下（圃場D2 の現行レイアウト: `/{INDEX}/...`, `/truecolor/...`）。
   * 新規圃場は衝突回避のため 'fieldId/' 形式にし、R2 へ `fieldId/{INDEX}/...` でアップする。
   */
  tilePrefix: string
  /** public/ 配下に置く圃場輪郭 GeoJSON のファイル名 */
  outline: string
  /** この圃場で利用可能な植生指数（基本は全種） */
  indices: readonly VegetationIndex[]
}

// 新得町営牧場 圃場D（D2）。TFW上端左 [142.8488°E, 43.1705°N] より算出。
// center は中心からやや左下(西・南)へずらした初期表示位置。
export const FIELDS: FieldDef[] = [
  {
    id: 'D2',
    label: '圃場D',
    center: [142.852, 43.1685],
    zoom: MAP_ZOOM,
    tilePrefix: '', // 現行はバケット直下に配置済み
    outline: 'field-outline.geojson',
    indices: INDICES,
  },
]

export const DEFAULT_FIELD_ID = FIELDS[0].id

// 背景地図
export type BaseMap = 'satellite' | 'map'
export const BASE_MAPS: { id: BaseMap; label: string }[] = [
  { id: 'satellite', label: '衛星画像（地理院）' },
  { id: 'map', label: '地図（OSM）' },
]

// ドローン オルソ（トゥルーカラー）タイル。R2 の truecolor/ プレフィックスに配置。
export const TRUECOLOR_ID = 'truecolor'

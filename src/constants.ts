export const INDICES = ['NDVI', 'GNDVI', 'NDRE', 'LCI', 'OSAVI'] as const
export type VegetationIndex = (typeof INDICES)[number]

export const INDEX_META: Record<VegetationIndex, { label: string; desc: string }> = {
  NDVI:  { label: 'NDVI',  desc: '正規化植生指数' },
  GNDVI: { label: 'GNDVI', desc: '緑色正規化植生指数' },
  NDRE:  { label: 'NDRE',  desc: 'レッドエッジ植生指数' },
  LCI:   { label: 'LCI',   desc: '葉緑素指数' },
  OSAVI: { label: 'OSAVI', desc: '最適化土壌調整植生指数' },
}

// 新得町営牧場 圃場D2 TFW上端左 [142.8488°E, 43.1705°N] より算出
export const MAP_CENTER: [number, number] = [142.857, 43.170]
export const MAP_ZOOM = 16

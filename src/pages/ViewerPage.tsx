import { useState } from 'react'
import Map from '../components/Map'
import LayerControl from '../components/LayerControl'
import type { SharedViewProps } from '../components/ControlSections'
import type { VegetationIndex } from '../constants'

/** 通常表示ページ: 植生指数を複数重ねて表示し、指数ごとに透過度を調整する。 */
export default function ViewerPage(shared: SharedViewProps) {
  const { field, baseMap, showTrueColor, showOutline } = shared
  // 植生指数は複数同時表示可。指数ごとに表示ON/OFFと透過度を個別に保持する。
  const [visibleIndices, setVisibleIndices] = useState<Record<string, boolean>>({ NDVI: true })
  const [opacityByIndex, setOpacityByIndex] = useState<Record<string, number>>({})

  const handleIndexToggle = (idx: VegetationIndex, v: boolean) =>
    setVisibleIndices((prev) => ({ ...prev, [idx]: v }))
  const handleIndexOpacityChange = (idx: VegetationIndex, v: number) =>
    setOpacityByIndex((prev) => ({ ...prev, [idx]: v }))

  return (
    <div className="app-body">
      <LayerControl
        {...shared}
        visibleIndices={visibleIndices}
        opacityByIndex={opacityByIndex}
        onIndexToggle={handleIndexToggle}
        onIndexOpacityChange={handleIndexOpacityChange}
      />
      <Map
        key={field.id}
        field={field}
        baseMap={baseMap}
        showTrueColor={showTrueColor}
        showOutline={showOutline}
        visibleIndices={visibleIndices}
        opacityByIndex={opacityByIndex}
      />
    </div>
  )
}

import { useState } from 'react'
import Map from './components/Map'
import LayerControl from './components/LayerControl'
import type { VegetationIndex, BaseMap } from './constants'

export default function App() {
  const [baseMap, setBaseMap] = useState<BaseMap>('satellite')
  const [showTrueColor, setShowTrueColor] = useState(true)
  const [showOutline, setShowOutline] = useState(true)
  const [showIndex, setShowIndex] = useState(true)
  const [activeIndex, setActiveIndex] = useState<VegetationIndex>('NDVI')
  const [opacity, setOpacity] = useState(0.8)

  return (
    <div className="app">
      <LayerControl
        baseMap={baseMap}
        showTrueColor={showTrueColor}
        showOutline={showOutline}
        showIndex={showIndex}
        activeIndex={activeIndex}
        opacity={opacity}
        onBaseMapChange={setBaseMap}
        onTrueColorChange={setShowTrueColor}
        onOutlineChange={setShowOutline}
        onIndexShowChange={setShowIndex}
        onIndexChange={setActiveIndex}
        onOpacityChange={setOpacity}
      />
      <Map
        baseMap={baseMap}
        showTrueColor={showTrueColor}
        showOutline={showOutline}
        showIndex={showIndex}
        activeIndex={activeIndex}
        opacity={opacity}
      />
    </div>
  )
}

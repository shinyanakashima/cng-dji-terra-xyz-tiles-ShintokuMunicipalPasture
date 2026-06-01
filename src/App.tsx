import { useState } from 'react'
import Map from './components/Map'
import LayerControl from './components/LayerControl'
import type { VegetationIndex } from './constants'

export default function App() {
  const [activeIndex, setActiveIndex] = useState<VegetationIndex>('NDVI')
  const [opacity, setOpacity] = useState(0.8)

  return (
    <div className="app">
      <LayerControl
        activeIndex={activeIndex}
        opacity={opacity}
        onIndexChange={setActiveIndex}
        onOpacityChange={setOpacity}
      />
      <Map activeIndex={activeIndex} opacity={opacity} />
    </div>
  )
}

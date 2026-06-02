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
      <header className="app-header">
        <div className="app-header-brand">
          <img
            className="app-header-logo"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="株式会社ズコーシャ"
          />
          <span className="app-header-title">for 新得町営牧場　圃場</span>
        </div>
        <nav className="app-header-nav" />
      </header>
      <div className="app-body">
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
    </div>
  )
}

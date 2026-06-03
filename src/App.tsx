import { useState } from 'react'
import Map from './components/Map'
import LayerControl from './components/LayerControl'
import { FIELDS, DEFAULT_FIELD_ID } from './constants'
import type { VegetationIndex, BaseMap } from './constants'

export default function App() {
  const [activeFieldId, setActiveFieldId] = useState<string>(DEFAULT_FIELD_ID)
  const [baseMap, setBaseMap] = useState<BaseMap>('satellite')
  const [showTrueColor, setShowTrueColor] = useState(true)
  const [showOutline, setShowOutline] = useState(true)
  const [showIndex, setShowIndex] = useState(true)
  const [activeIndex, setActiveIndex] = useState<VegetationIndex>('NDVI')
  const [opacity, setOpacity] = useState(0.8)

  const field = FIELDS.find((f) => f.id === activeFieldId) ?? FIELDS[0]

  // 圃場切替: 新しい圃場が現在の指数を持たなければ先頭の指数に切り替える
  const handleFieldChange = (id: string) => {
    const next = FIELDS.find((f) => f.id === id)
    if (next && !next.indices.includes(activeIndex)) {
      setActiveIndex(next.indices[0])
    }
    setActiveFieldId(id)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-brand">
          <img
            className="app-header-logo"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="株式会社ズコーシャ"
          />
          <span className="app-header-title">
            <span className="app-header-product">Mimori</span>
            <span className="app-header-for">for 【DEMO】牧場</span>
          </span>
        </div>
        <nav className="app-header-nav" />
      </header>
      <div className="app-body">
        <LayerControl
          fields={FIELDS}
          activeFieldId={activeFieldId}
          baseMap={baseMap}
          showTrueColor={showTrueColor}
          showOutline={showOutline}
          showIndex={showIndex}
          activeIndex={activeIndex}
          opacity={opacity}
          onFieldChange={handleFieldChange}
          onBaseMapChange={setBaseMap}
          onTrueColorChange={setShowTrueColor}
          onOutlineChange={setShowOutline}
          onIndexShowChange={setShowIndex}
          onIndexChange={setActiveIndex}
          onOpacityChange={setOpacity}
        />
        <Map
          key={field.id}
          field={field}
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

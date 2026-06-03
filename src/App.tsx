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
  // 植生指数は複数同時表示可。指数ごとに表示ON/OFFと透過度を個別に保持する。
  const [visibleIndices, setVisibleIndices] = useState<Record<string, boolean>>({ NDVI: true })
  const [opacityByIndex, setOpacityByIndex] = useState<Record<string, number>>({})

  const field = FIELDS.find((f) => f.id === activeFieldId) ?? FIELDS[0]

  const handleIndexToggle = (idx: VegetationIndex, v: boolean) =>
    setVisibleIndices((prev) => ({ ...prev, [idx]: v }))
  const handleIndexOpacityChange = (idx: VegetationIndex, v: number) =>
    setOpacityByIndex((prev) => ({ ...prev, [idx]: v }))

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
          visibleIndices={visibleIndices}
          opacityByIndex={opacityByIndex}
          onFieldChange={setActiveFieldId}
          onBaseMapChange={setBaseMap}
          onTrueColorChange={setShowTrueColor}
          onOutlineChange={setShowOutline}
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
    </div>
  )
}

import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import ViewerPage from './pages/ViewerPage'
import ComparePage from './pages/ComparePage'
import type { SharedViewProps } from './components/ControlSections'
import { FIELDS, DEFAULT_FIELD_ID } from './constants'
import type { BaseMap } from './constants'

export default function App() {
  // 圃場・背景・輪郭・オルソは両ページ共通の表示状態。ページ遷移しても保持する。
  const [activeFieldId, setActiveFieldId] = useState<string>(DEFAULT_FIELD_ID)
  const [baseMap, setBaseMap] = useState<BaseMap>('satellite')
  const [showTrueColor, setShowTrueColor] = useState(true)
  const [showOutline, setShowOutline] = useState(true)

  const field = FIELDS.find((f) => f.id === activeFieldId) ?? FIELDS[0]

  const shared: SharedViewProps = {
    fields: FIELDS,
    activeFieldId,
    field,
    baseMap,
    showTrueColor,
    showOutline,
    onFieldChange: setActiveFieldId,
    onBaseMapChange: setBaseMap,
    onTrueColorChange: setShowTrueColor,
    onOutlineChange: setShowOutline,
  }

  return (
    <HashRouter>
      <div className="app">
        <AppHeader />
        <Routes>
          <Route path="/" element={<ViewerPage {...shared} />} />
          <Route path="/compare" element={<ComparePage {...shared} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

import { useFieldMap } from '../lib/useFieldMap'
import type { FieldMapState } from '../lib/mapStyle'
import type { FieldDef } from '../constants'

interface Props extends FieldMapState {
  field: FieldDef
}

/** 通常表示の単一地図。表示状態の同期は useFieldMap に集約。 */
export default function Map({ field, ...state }: Props) {
  const { containerRef } = useFieldMap(field, state)
  return <div ref={containerRef} className="map-container" />
}

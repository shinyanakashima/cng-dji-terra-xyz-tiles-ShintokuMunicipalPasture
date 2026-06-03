declare module '@maplibre/maplibre-gl-compare' {
  import type { Map } from 'maplibre-gl'

  interface CompareOptions {
    /** 'vertical'（左右）/ 'horizontal'（上下）。既定 'vertical' */
    orientation?: 'vertical' | 'horizontal'
    /** true ならスライダーがカーソルに追従する。既定 false（ドラッグで移動） */
    mousemove?: boolean
  }

  /** maplibre-gl-compare: 2つの地図をスワイプ比較するコントロール */
  export default class Compare {
    constructor(a: Map, b: Map, container: string | HTMLElement, options?: CompareOptions)
    currentPosition: number
    setSlider(x: number): void
    on(type: 'slideend', fn: (data: { currentPosition: number }) => void): this
    off(type: 'slideend', fn: (data: { currentPosition: number }) => void): this
    fire(type: string, data: unknown): this
    /** 比較コントロールを DOM から除去し、地図同期を停止する */
    remove(): void
  }
}

declare module '@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css'

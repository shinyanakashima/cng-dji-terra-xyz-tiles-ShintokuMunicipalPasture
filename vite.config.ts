import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import type { Plugin } from 'vite'

/**
 * 開発時専用: ../index_map_color/ のタイルを /tiles/ として配信するプラグイン。
 * npm run dev のみ有効。本番ビルドには影響しない。
 * タイルのコピー・シンボリックリンクが不要になる。
 */
function localTilePlugin(): Plugin {
  const indexRoot = path.resolve(__dirname, '../map/index_map_color')
  const mapRoot = path.resolve(__dirname, '../map') // トゥルーカラー(オルソ) = ../map/{z}/{x}/{y}.png
  return {
    name: 'local-tile-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/tiles', (req, res) => {
        const url = req.url ?? ''
        // /truecolor/{z}/... は ../map/{z}/... 、それ以外は ../map/index_map_color/{INDEX}/...
        const filePath = url.startsWith('/truecolor/')
          ? path.join(mapRoot, url.slice('/truecolor'.length))
          : path.join(indexRoot, url)
        try {
          const stat = fs.statSync(filePath)
          if (stat.isFile()) {
            res.setHeader('Content-Type', 'image/png')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            fs.createReadStream(filePath).pipe(res as NodeJS.WritableStream)
            return
          }
        } catch {
          // ファイルが存在しない場合は下の 404 へ
        }
        // データのない圃場外タイルは 404 を返す。
        // next() に委ねると Vite の SPA フォールバックが index.html(200) を返し、
        // MapLibre が「画像をデコードできない」エラーを大量に出すため、ここで明示的に 404。
        res.statusCode = 404
        res.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localTilePlugin()],
  base: process.env.VITE_BASE_URL ?? '/',
})

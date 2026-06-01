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
  const tileRoot = path.resolve(__dirname, '../map/index_map_color')
  return {
    name: 'local-tile-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/tiles', (req, res, next) => {
        const filePath = path.join(tileRoot, req.url ?? '')
        try {
          const stat = fs.statSync(filePath)
          if (stat.isFile()) {
            res.setHeader('Content-Type', 'image/png')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            fs.createReadStream(filePath).pipe(res as NodeJS.WritableStream)
            return
          }
        } catch {
          // ファイルが存在しない場合は next() で 404 に任せる
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localTilePlugin()],
  base: process.env.VITE_BASE_URL ?? '/',
})

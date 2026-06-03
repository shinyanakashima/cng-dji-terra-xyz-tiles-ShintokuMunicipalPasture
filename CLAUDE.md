# CLAUDE.md — cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture 作業引き継ぎ

## このプロジェクトの目的

DJI Terra が生成済みのカラー XYZ PNG タイルを MapLibre で表示する。
5 種類の植生指数（NDVI / GNDVI / NDRE / LCI / OSAVI）をサイドバーで切り替え可能。

## 絶対パス（このファイルの場所から）

```
このプロジェクト:
  D:\Docs\社内\業務まとめ\販売企画\Z-Skywalker -空撮解析サービス-\案件管理\新得町営牧場\新得町営牧場20260522 圃場D2\cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture\

タイルデータ（DJI Terra 出力済み・変換不要）:
  D:\Docs\社内\業務まとめ\販売企画\Z-Skywalker -空撮解析サービス-\案件管理\新得町営牧場\新得町営牧場20260522 圃場D2\map\index_map_color\
  ├── NDVI\{z}\{x}\{y}.png   （ズームレベル z=12〜23）
  ├── GNDVI\...
  ├── NDRE\...
  ├── LCI\...
  └── OSAVI\...
```

## 現在の実装状態（引き継ぎ時点）

- [x] Vite + React + TypeScript プロジェクト雛形
- [x] MapLibre GL JS v5 でベースマップ表示
- [x] 5 指数の XYZ タイルソース登録・レイヤー切り替え
- [x] 透過度スライダー
- [x] 開発用タイルサーバープラグイン（`vite.config.ts`）
  - `npm run dev` で `/tiles/{INDEX}/{z}/{x}/{y}.png` を `../map/index_map_color/` から自動配信
  - タイルのコピー・シンボリックリンクは不要
- [ ] `npm install` まだ実行していない
- [ ] 動作確認まだ

## すぐに動かす手順

```powershell
# このプロジェクトディレクトリで実行
cd "D:\Docs\社内\業務まとめ\販売企画\Z-Skywalker -空撮解析サービス-\案件管理\新得町営牧場\新得町営牧場20260522 圃場D2\cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture"
npm install
npm run dev
# → http://localhost:5173 でブラウザ確認
```

## 確認項目（動作テスト）

1. ベースマップ（OpenStreetMap）が表示される
2. 圃場D2 周辺（142.857°E, 43.170°N）に植生指数タイルが表示される
3. サイドバーの NDVI / GNDVI / NDRE / LCI / OSAVI ボタンで切り替わる
4. 透過度スライダーが機能する

## 地図が表示されない場合のデバッグ

ブラウザの開発者ツール（Network タブ）でタイルの URL を確認:
- 期待するパス: `http://localhost:5173/tiles/NDVI/17/117545/48078.png`
- 実ファイル: `D:\...\map\index_map_color\NDVI\17\117545\48078.png`

タイルが 404 になる場合は `vite.config.ts` の `tileRoot` パスを確認。

## 本番デプロイ（レンタルサーバー）

```powershell
npm run build
# dist/ フォルダをサーバーにアップロード
# タイルは dist/tiles/{INDEX}/{z}/{x}/{y}.png として配置が必要
# → index_map_color/ の内容を dist/tiles/ にコピーまたはサーバー側でエイリアス設定
```

タイル総量: 約 2.9GB（5 指数合計）。全部アップロードするか、z=14〜19 に絞って再生成を検討。

## 本番デプロイ（GitHub Pages）

タイルが大きすぎて GitHub Pages 直接管理は困難。
→ タイルは外部 CDN（Cloudflare R2、Azure Blob など）に置いて `VITE_TILES_BASE_URL` で指定する方式を推奨。

```powershell
# .env を作成して GitHub Pages の base を設定
$env:VITE_BASE_URL = "/repo-name"
npm run build
```

## 将来の拡張アイデア

- タイル範囲を z=14〜19 に絞って軽量化（README.md に GDAL コマンド記載済み）
- カラーバー（凡例）コンポーネントの追加
- 地点クリックで座標表示
- ~~複数指数を比較表示（MapLibre Compare プラグイン）~~ → 実装済み（`#/compare`）

## 画面構成（2ページ・HashRouter）

react-router-dom の HashRouter で 2 ページに分岐（Cloudflare Pages/R2 でリライト設定不要）。

- `#/`（通常表示）: 植生指数を**複数同時にチェックボックスで重ね表示**、指数ごとに透過度スライダー。
- `#/compare`（左右比較）: `@maplibre/maplibre-gl-compare` で 2 地図をスワイプ比較。左右（または上下）に
  「オルソ / 各植生指数」を 1 つずつ選んで見比べる。

ヘッダー右のナビ（通常表示 / 左右比較）で切替。圃場・背景・輪郭の選択はページ間で保持（App が保持）。

## ファイル構成

```
cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture/
├── CLAUDE.md              ← このファイル
├── README.md              ← ユーザー向け手順書
├── .env.example           ← 環境変数テンプレート
├── vite.config.ts         ← 開発用タイルサーバープラグイン込み（未存在タイルは404を返す）
├── src/
│   ├── constants.ts       ← 指数定義・圃場定義（FIELDS）・マップ中心座標
│   ├── App.tsx            ← HashRouter + 共通状態（圃場/背景/輪郭/オルソ）
│   ├── lib/
│   │   ├── mapStyle.ts    ← MapLibre スタイル(ソース＋レイヤー)生成・タイルURL（通常/比較で共有）
│   │   └── useFieldMap.ts ← 地図生成＋表示状態同期の共通フック（通常の1枚・比較の2枚で共有）
│   ├── pages/
│   │   ├── ViewerPage.tsx ← 通常表示ページ（指数の複数重ね＋透過度）
│   │   └── ComparePage.tsx← 左右比較ページ（左右レイヤー選択＋向き）
│   ├── components/
│   │   ├── AppHeader.tsx      ← ロゴ＋タイトル＋ページ切替ナビ（共通）
│   │   ├── ControlSections.tsx← 圃場/背景/輪郭セクション（両サイドバー共有）
│   │   ├── Map.tsx           ← 通常表示の単一地図（useFieldMap の薄いラッパ）
│   │   ├── LayerControl.tsx  ← 通常表示サイドバー
│   │   ├── CompareMap.tsx    ← 比較用の2地図＋maplibre-gl-compare 連携
│   │   └── CompareControl.tsx← 比較表示サイドバー
│   └── types/
│       └── maplibre-gl-compare.d.ts ← 型定義（本体は型を同梱しないため自前）
└── public/                ← 本番タイル配置先（開発時は不要）
    └── tiles/（デプロイ時に index_map_color/ の内容をコピー）
```

依存追加: `react-router-dom` / `@maplibre/maplibre-gl-compare`（+`events` … compare が内部で使う EventEmitter の
ブラウザ用ポリフィル。Vite のバンドルに必要）。

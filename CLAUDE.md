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
- 複数指数を比較表示（MapLibre Compare プラグイン）

## ファイル構成

```
cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture/
├── CLAUDE.md              ← このファイル
├── README.md              ← ユーザー向け手順書
├── .env.example           ← 環境変数テンプレート
├── vite.config.ts         ← 開発用タイルサーバープラグイン込み
├── src/
│   ├── constants.ts       ← 指数定義・マップ中心座標
│   ├── App.tsx            ← レイアウト（サイドバー + マップ）
│   └── components/
│       ├── Map.tsx        ← MapLibre 初期化・レイヤー管理
│       └── LayerControl.tsx ← 指数切り替え・透過度UI
└── public/                ← 本番タイル配置先（開発時は不要）
    └── tiles/（デプロイ時に index_map_color/ の内容をコピー）
```

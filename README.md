# cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture

MapLibre + XYZ PNG タイルによる植生指数ビューア。
DJI Terra が `index_map_color/` に出力した既存タイルをそのまま配信する最もシンプルな構成。

## アーキテクチャ

```
index_map_color/{INDEX}/{z}/{x}/{y}.png   ← DJI Terra 出力済みタイル
        ↓ 静的ファイルとして配信
cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture (MapLibre raster source)
```

カラーマップは DJI Terra 側で適用済み。ブラウザ側での再計算は不要。

## 必要なもの

- Node.js 20 以上
- DJI Terra 出力の `index_map_color/` ディレクトリ

## セットアップ

```bash
npm install
cp .env.example .env
npm run dev
```

## データ配置（ローカル開発）

`public/tiles/` を作成し、DJI Terra 出力のタイルをコピーまたはシンボリックリンクで配置する。

```
cng-dji-terra-xyz-tiles-ShintokuMunicipalPasture/
└── public/
    └── tiles/
        ├── NDVI/   ← index_map_color/NDVI/ をコピー
        ├── GNDVI/
        ├── NDRE/
        ├── LCI/
        └── OSAVI/
```

PowerShell でシンボリックリンクを作成する場合（管理者権限不要の場合あり）:

```powershell
New-Item -ItemType Directory -Force public\tiles
$src = Resolve-Path "..\index_map_color"
foreach ($idx in @('NDVI','GNDVI','NDRE','LCI','OSAVI')) {
    New-Item -ItemType Junction -Path "public\tiles\$idx" -Target "$src\$idx"
}
```

## ビルド & デプロイ

### レンタルサーバー（FTP/SFTP）

```bash
npm run build
# dist/ フォルダをサーバーにアップロード
# タイルも dist/tiles/ として一緒にアップロードが必要
```

タイル総サイズが大きい（5指数 × 約580MB）ため、必要なズームレベルに絞ることを推奨。

### GitHub Pages

```bash
# リポジトリ名に合わせて .env の VITE_BASE_URL を設定
VITE_BASE_URL=/repo-name npm run build
```

> **注意**: GitHub Pages のファイルサイズ上限（リポジトリ 1GB）があるため、
> タイルは Git LFS を使用するか、ズームレベルを 14〜19 に絞って総量を削減してください。

## タイルのズームレベルを絞って再生成する場合

GDAL が必要。

```bash
# カラーマップファイル例（ndvi_colormap.txt）
# -1   165 0   38  255
#  0   255 255 191 255
#  1   0   104 55  255
# nv   0   0   0   0

# カラー適用
gdaldem color-relief ../index_map/NDVI.tif ndvi_colormap.txt ndvi_colored.tif

# タイル生成（z=14〜20）
gdal2tiles.py --zoom=14-20 --resampling=average \
  --tiledriver=PNG ndvi_colored.tif public/tiles/NDVI/
```

## 環境変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `VITE_TILES_BASE_URL` | タイルベースURL | `/tiles` |
| `VITE_BASE_URL` | Vite の base パス（GitHub Pages 用） | `/` |

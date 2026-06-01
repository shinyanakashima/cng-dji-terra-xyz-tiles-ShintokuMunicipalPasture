# デプロイ手順 — GitHub Pages（アプリ）＋ Cloudflare R2（タイル）

タイルは 3.0GB / 42,860ファイルあり **GitHub Pages の 1GB 上限**を超えるため、
タイルは R2 に置き、Pages にはアプリ本体（数MB）だけを載せる構成。

```
GitHub Pages (アプリ) ──fetch──> Cloudflare R2 (/{INDEX}/{z}/{x}/{y}.png, 3GB, egress無料)
```

前提ツール（このPCで確認済み）: `node`(npm), `aws`(aws-cli v2), `npx wrangler`。

---

## 1. バケット作成 ＋ CORS（ダッシュボード。トークン不要）

最小権限のため、bucket レベル操作（作成・CORS）はダッシュボードで済ませる。

1. **バケット作成**: R2 → 「Create bucket」→ 名前 `skywalker-2026-shintoku-tiles`
2. **CORS 設定**: 作成したバケット → Settings → CORS Policy → 以下を貼り付け
   （MapLibre のクロスオリジン読み込みに必須）
   ```json
   [
     { "AllowedOrigins": ["*"], "AllowedMethods": ["GET","HEAD"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 86400 }
   ]
   ```
   > 本番でオリジンを絞るなら `"*"` を `["https://<user>.github.io"]` に。

## 2. アップロード用トークンを発行（最小権限）

R2 →「**API トークンの管理**」→「**R2 トークンを作成**」
- 権限: **Object Read & Write**（バケット作成・削除・設定は不可。オブジェクト読み書きのみ）
- 適用先: **このバケットのみに限定**（`Apply to specific buckets` → `skywalker-2026-shintoku-tiles`）
- **Access Key ID** と **Secret Access Key** を控える（Secret は再表示不可）
- **Account ID** も控える（R2 ページ右側の32桁）

## 3. 認証情報を環境変数に設定 ＆ アップロード

```powershell
# 秘密キーはコマンド履歴に残さないため環境変数で渡す
$env:R2_ACCOUNT_ID         = "＜32桁のアカウントID＞"
$env:AWS_ACCESS_KEY_ID     = "＜R2 Access Key ID＞"
$env:AWS_SECRET_ACCESS_KEY = "＜R2 Secret Access Key＞"

# まず送信せず対象確認
.\scripts\upload-r2.ps1 -DryRun

# 本実行（約3GB / 42,860ファイル）
.\scripts\upload-r2.ps1
```
- `aws s3 sync` の差分同期。中断しても再実行すれば続きから。
- `*.tif` 等は自動除外、`*.png` のみ。タイルには1年キャッシュを付与。

> 補足: `-Init` を付けるとスクリプトがバケット作成＋CORS設定も実行するが、それには
> **Admin Read & Write** トークンが必要。最小権限を優先するなら手順1のダッシュボードで済ませ、
> `-Init` は付けない（Object Read & Write トークンで完結）。

## 4. R2 を公開（タイル配信URLを得る）

### お試し・社内デモ → r2.dev 公開URL（ダッシュボードでワンクリック）
R2 → 該当バケット → **Settings → Public Development URL → Enable**
表示される `https://pub-xxxxxxxxxxxx.r2.dev` がタイル配信URL。

> wrangler 認証が正常なら次でも可: `npx wrangler r2 bucket dev-url enable skywalker-2026-shintoku-tiles`
> r2.dev はレート制限あり・CDNキャッシュ弱め。常用・本番はカスタムドメイン推奨。

### 本番 → カスタムドメイン（Cloudflare でDNS管理しているドメインが必要）
ダッシュボード → R2 → 該当バケット → **Settings → Public access → Custom Domains** で
`tiles.example.com` 等を接続。CDNキャッシュが効き高速・無制限。

動作確認（公開URL/INDEX/z/x/y.png が 200 で返るか）:
```powershell
curl.exe -I "https://＜公開URL＞/NDVI/17/117545/48078.png"
```

## 5. タイル配信URLをアプリに設定

`.env.production` の `VITE_TILES_BASE_URL` を手順5の公開URLに書き換える（公開URLのみなのでコミット可）:

```
VITE_TILES_BASE_URL=https://pub-xxxxxxxxxxxx.r2.dev
```

## 6. GitHub リポジトリ作成 & Pages 有効化

```powershell
# このフォルダ（cng-dji-terra-xyz-tiles-...）をリポジトリルートにする
git init
git add .
git commit -m "Initial: xyz-tiles viewer (Pages + R2)"
gh repo create <repo-name> --public --source=. --remote=origin --push
```

GitHub リポジトリ設定:
- **Settings → Pages → Build and deployment → Source = GitHub Actions**

> `.github/workflows/deploy.yml` が push 時に自動ビルド＆デプロイする。
> タイルURLは `.env.production` から、`VITE_BASE_URL`（`/repo-name/`）はリポジトリ名から自動設定。

## 7. デプロイ & 確認

`main` に push すると Actions が走る。完了後:
```
https://<github-username>.github.io/<repo-name>/
```
- 圃場D2 周辺にタイルが表示されるか
- DevTools Network でタイルが `https://...r2.dev/NDVI/...png` を 200 で取得しているか
- サイドバーの指数切り替え・透過度スライダー

---

## トラブルシュート

| 症状 | 原因 / 対処 |
|---|---|
| タイルが出ない・Console に CORS エラー | 手順3のCORS未適用 → 再実行。`curl -I` で `access-control-allow-origin` 確認 |
| タイル 403/404 | バケット未公開（手順5）/ キー名ミス。`aws s3 ls s3://バケット/NDVI/17/ --endpoint-url ...` で存在確認 |
| `aws s3 sync` がチェックサムで失敗 | upload-r2.ps1 が設定済みの `AWS_REQUEST_CHECKSUM_CALCULATION=when_required` を確認 |
| 画面は出るがCSSが崩れる/404 | Pages のサブパス。`VITE_BASE_URL=/repo-name/` がビルドに渡っているか（Actionsログ） |
| アップロードが遅い | `aws configure set default.s3.max_concurrent_requests 20` で並列数を上げる |
| R2 料金 | ストレージのみ課金（無料枠10GB)。egress(配信)は無料。3GBは無料枠内。 |

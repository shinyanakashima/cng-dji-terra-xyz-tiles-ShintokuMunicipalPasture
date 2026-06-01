<#
.SYNOPSIS
  Cloudflare R2 へ XYZ タイルをセットアップ＆一括アップロードする統合スクリプト。

.DESCRIPTION
  認証情報は「環境変数」から読む（コマンド履歴に秘密キーを残さないため）。
  実行前に以下を設定すること:
      $env:R2_ACCOUNT_ID        = "＜32桁のアカウントID＞"
      $env:AWS_ACCESS_KEY_ID    = "＜R2 Access Key ID＞"
      $env:AWS_SECRET_ACCESS_KEY= "＜R2 Secret Access Key＞"

  トークン権限（最小権限）:
    - 既定（アップロードのみ）: 「Object Read & Write」＋対象バケット限定 で十分。
      バケット作成・CORS はダッシュボードで先に済ませておく（DEPLOY.md 手順1）。
    - -Init を使う場合のみ    : バケット作成・CORS設定も行うため「Admin Read & Write」が必要。

  処理内容:
    -Init 指定時 : バケット作成（既存ならスキップ）＋ CORS 設定（scripts/r2-cors.json）
    常に        : ../../map/index_map_color のタイルを aws s3 sync で差分アップロード
                  （並列・再開可 / *.tif 等は除外 / 1年キャッシュ付与）

.EXAMPLE
  # 初回（バケット作成＋CORS＋アップロードまで一括）
  $env:R2_ACCOUNT_ID="xxxx"; $env:AWS_ACCESS_KEY_ID="xxxx"; $env:AWS_SECRET_ACCESS_KEY="xxxx"
  .\scripts\upload-r2.ps1 -Init

  # 2回目以降（差分アップロードのみ）
  .\scripts\upload-r2.ps1

  # 送信せず対象だけ確認
  .\scripts\upload-r2.ps1 -DryRun
#>
param(
  [string]$Bucket    = "skywalker-2026-shintoku-tiles",
  [string]$AccountId = $env:R2_ACCOUNT_ID,
  [string]$Source    = (Join-Path $PSScriptRoot "..\..\map\index_map_color"),
  [switch]$Init,
  [switch]$TrueColor,   # 指定時: ../../map の {z} タイル(ドローンのオルソ)を truecolor/ へアップ
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# --- プロジェクト専用の認証ファイルを自動読込 ---
# scripts/.r2-credentials (gitignore 済み・コミットされない) に KEY=VALUE 形式で
# R2_ACCOUNT_ID / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY を書いておけば自動で読む。
# 既に環境変数がセットされていればそちらを優先する。
$credFile = Join-Path $PSScriptRoot ".r2-credentials"
if (Test-Path $credFile) {
  Write-Host "認証ファイルを読込: $credFile" -ForegroundColor DarkGray
  Get-Content $credFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
      $kv = $line -split "=", 2
      if ($kv.Count -eq 2) {
        $name = $kv[0].Trim()
        $val  = ($kv[1].Trim() -replace '^["'']|["'']$', '')
        if ($name -and -not (Test-Path "env:$name")) {
          Set-Item -Path "env:$name" -Value $val
        }
      }
    }
  }
  # param の既定値はファイル読込前に評価済みのため、ここで再取得する
  if (-not $AccountId) { $AccountId = $env:R2_ACCOUNT_ID }
}

# プレースホルダのまま実行されるのを防ぐ
if ($env:AWS_ACCESS_KEY_ID -like "PASTE_*" -or $env:AWS_SECRET_ACCESS_KEY -like "PASTE_*") {
  throw "scripts\.r2-credentials がプレースホルダのままです。実際の R2 Access Key / Secret に書き換えてください。"
}

# --- 認証情報チェック ---
if (-not $AccountId)                 { throw "環境変数 R2_ACCOUNT_ID が未設定です。" }
if (-not $env:AWS_ACCESS_KEY_ID)     { throw "環境変数 AWS_ACCESS_KEY_ID が未設定です。" }
if (-not $env:AWS_SECRET_ACCESS_KEY) { throw "環境変数 AWS_SECRET_ACCESS_KEY が未設定です。" }

# TrueColor モードでは ../../map の {z} タイル群を対象にする
if ($TrueColor) {
  $Source = (Join-Path $PSScriptRoot "..\..\map")
  $DestPrefix = "truecolor/"
} else {
  $DestPrefix = ""
}
$Source = (Resolve-Path $Source).Path
if (-not (Test-Path $Source)) { throw "Source が見つかりません: $Source" }

$endpoint = "https://$AccountId.r2.cloudflarestorage.com"
$corsFile = Join-Path $PSScriptRoot "r2-cors.json"

# aws-cli v2 互換設定（このプロセス内のみ）
$env:AWS_DEFAULT_REGION                = "auto"
$env:AWS_REQUEST_CHECKSUM_CALCULATION  = "when_required"
$env:AWS_RESPONSE_CHECKSUM_VALIDATION  = "when_required"

Write-Host "==== R2 設定 ====" -ForegroundColor Cyan
Write-Host "  Source   : $Source"
Write-Host "  Bucket   : s3://$Bucket/"
Write-Host "  Endpoint : $endpoint"
Write-Host "  Init     : $Init / DryRun : $DryRun"
Write-Host ""

if ($Init) {
  Write-Host "[1/2] バケット作成 (既存ならスキップ)" -ForegroundColor Cyan
  try {
    & aws s3api create-bucket --bucket $Bucket --endpoint-url $endpoint 2>&1 | Out-Host
  } catch {
    Write-Host "  (作成スキップ: 既に存在する可能性。続行します)" -ForegroundColor DarkYellow
  }

  Write-Host "[2/2] CORS 設定" -ForegroundColor Cyan
  & aws s3api put-bucket-cors --bucket $Bucket --cors-configuration "file://$corsFile" --endpoint-url $endpoint
  if ($LASTEXITCODE -ne 0) { throw "put-bucket-cors が失敗しました (exit $LASTEXITCODE)" }
  Write-Host "  CORS 適用完了" -ForegroundColor Green
  Write-Host ""
}

$syncArgs = @(
  "s3", "sync", $Source, "s3://$Bucket/$DestPrefix",
  "--endpoint-url", $endpoint,
  "--cache-control", "public, max-age=31536000, immutable"
)
if ($TrueColor) {
  # map/ 直下の {z=12..23} タイルだけを対象（index_map* / report / *.tif 等は除外）
  $syncArgs += @("--exclude", "*")
  12..23 | ForEach-Object { $syncArgs += @("--include", "$_/*") }
} else {
  $syncArgs += @("--exclude", "*.tif", "--exclude", "*.tfw", "--exclude", "*.aux.xml")
}
if ($DryRun) { $syncArgs += "--dryrun" }

if ($DryRun) {
  Write-Host "*** ドライラン: 実際にはアップロードしません。以下は『送る予定』の一覧です ***" -ForegroundColor Magenta
} else {
  Write-Host "アップロード中... (約3GB / 42,860ファイル。回線次第で数分〜数十分。各ファイルが表示されます)" -ForegroundColor Yellow
}
& aws @syncArgs
if ($LASTEXITCODE -ne 0) { throw "aws s3 sync が失敗しました (exit $LASTEXITCODE)" }

Write-Host ""
Write-Host "完了。アップロード確認:" -ForegroundColor Green
$checkPrefix = if ($TrueColor) { "truecolor/17/" } else { "NDVI/17/" }
& aws s3 ls "s3://$Bucket/$checkPrefix" --endpoint-url $endpoint | Select-Object -First 5

# Next.js アクセスログの取得方法

このドキュメントでは、セキュリティ検査などの目的でNext.jsコンテナから1日分のアクセスログを取得する方法を説明します。

## ログの保存場所

アクセスログは以下の場所に保存されています：

- **コンテナ内**: `/var/log/nextjs/access.log` (現在のログ)
- **アーカイブ**: `/var/log/nextjs/archive/` (過去7日分の圧縮ログ)
- **Docker Volume**: `nextjs-logs` (本番環境) / `dev-nextjs-logs` (開発環境)

## ログのフォーマット

ログは以下のCombined Log Format形式で記録されます：

```
<IP> - - [<timestamp>] "<method> <url> <HTTP/version>" <status> - "<referer>" "<user-agent>" <duration>ms
```

例：
```
172.18.0.1 - - [2024-12-30T04:15:23.456Z] "GET /api/users/test HTTP/1.1" 200 - "https://school.kuwaharu.com" "Mozilla/5.0..." 45ms
```

## ログの取得方法

### 1. 現在のアクセスログを表示

```bash
# 本番環境
docker compose exec nextjs cat /var/log/nextjs/access.log

# 開発環境
docker compose -f docker-compose.yml.dev exec nextjs cat /var/log/nextjs/access.log
```

### 2. 最新N行を表示

```bash
# 最新100行を表示
docker compose exec nextjs tail -n 100 /var/log/nextjs/access.log

# リアルタイムで監視
docker compose exec nextjs tail -f /var/log/nextjs/access.log
```

### 3. アーカイブされたログを表示

```bash
# アーカイブファイルの一覧
docker compose exec nextjs ls -lh /var/log/nextjs/archive/

# 特定日のログを表示（圧縮されているので解凍が必要）
docker compose exec nextjs zcat /var/log/nextjs/archive/access_20241230_000000.log.gz
```

### 4. ログをホストにコピー

```bash
# 現在のログをホストにコピー
docker compose cp nextjs:/var/log/nextjs/access.log ./access.log

# アーカイブをホストにコピー
docker compose cp nextjs:/var/log/nextjs/archive/access_20241230_000000.log.gz ./
```

### 5. Docker Volumeから直接取得

```bash
# ボリュームの場所を確認
docker volume inspect nextjs-logs

# ボリュームの内容を一時コンテナでマウントして取得
docker run --rm -v nextjs-logs:/logs -v $(pwd):/backup alpine tar czf /backup/nextjs-logs-$(date +%Y%m%d).tar.gz -C /logs .
```

## ログのローテーション

- **ローテーション頻度**: 毎日 0:00 (UTC)
- **保持期間**: 7日間
- **圧縮**: gzip形式で自動圧縮

ローテーションは `supercronic` により自動実行されます。

### 手動ローテーション

```bash
# ログローテーションスクリプトを手動実行
docker compose exec nextjs /app/rotate-logs.sh
```

## ログ検索の例

### 特定のIPアドレスのアクセスを検索

```bash
docker compose exec nextjs grep "192.168.1.100" /var/log/nextjs/access.log
```

### エラーレスポンス (4xx, 5xx) を検索

```bash
docker compose exec nextjs grep -E '" [45][0-9]{2} ' /var/log/nextjs/access.log
```

### 特定のパスへのアクセスを検索

```bash
docker compose exec nextjs grep "/api/users/login" /var/log/nextjs/access.log
```

### 日時範囲で検索

```bash
# 2024-12-30のログを検索
docker compose exec nextjs grep "2024-12-30" /var/log/nextjs/access.log
```

### レスポンス時間が遅いリクエストを検索（1000ms以上）

```bash
docker compose exec nextjs grep -E ' [0-9]{4,}ms$' /var/log/nextjs/access.log
```

## セキュリティ検査での活用

### 1. 不審なアクセスパターンの検出

```bash
# 短時間に大量のリクエスト（潜在的なDDoS攻撃）
docker compose exec nextjs awk '{print $1}' /var/log/nextjs/access.log | sort | uniq -c | sort -rn | head -20
```

### 2. 認証の失敗を検出

```bash
# 401 Unauthorizedレスポンスを検索
docker compose exec nextjs grep '" 401 ' /var/log/nextjs/access.log
```

### 3. SQLインジェクション試行の検出

```bash
# SQLキーワードを含むリクエストを検索
docker compose exec nextjs grep -iE '(union|select|insert|update|delete|drop)' /var/log/nextjs/access.log
```

### 4. パス・トラバーサル試行の検出

```bash
# ../ を含むリクエストを検索
docker compose exec nextjs grep '\.\.\/' /var/log/nextjs/access.log
```

## トラブルシューティング

### ログファイルが作成されない場合

1. コンテナのログを確認：
```bash
docker compose logs nextjs
```

2. ログディレクトリの権限を確認：
```bash
docker compose exec nextjs ls -la /var/log/nextjs
```

3. コンテナを再起動：
```bash
docker compose restart nextjs
```

### ログローテーションが動作しない場合

```bash
# ローテーションログを確認
docker compose exec nextjs cat /var/log/nextjs/rotation.log

# supercronic の動作を確認
docker compose exec nextjs ps aux | grep supercronic
```

## 参考情報

- ログはUTCタイムゾーンで記録されます
- ログファイルはUTF-8エンコーディングで保存されます
- コンテナの再起動時もDocker Volumeにログは保持されます

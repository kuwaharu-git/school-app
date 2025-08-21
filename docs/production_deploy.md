## 本番デプロイ手順書 (Raspberry Pi / Cloudflare Tunnel)

このドキュメントは現在の開発環境 (ローカル / 既存サーバ) から Raspberry Pi 上の本番環境へ移行するための具体的な手順をまとめています。

---
## 目次
1. 前提 / 構成概要
2. 差分 (開発 vs 本番)
3. 環境準備 (Raspberry Pi)
4. データベース移行 (ダンプ & リストア)
5. アプリケーションデプロイ
6. 動作確認チェックリスト
7. ロールバック手順
8. 運用・保守ポイント (セキュリティ / バックアップ / 監視)

---
## 1. 前提 / 構成概要

サービス (Docker Compose):
- nextjs: Next.js 本番 (ビルド済) / ポート 3000 公開
- django: Gunicorn + WhiteNoise / ポート 8000 (メンテ/内部用)
- mysql: MySQL 8 / ポート 3306 (メンテ用)

公開経路:
- Cloudflare Tunnel (ホストで稼働) -> localhost:3000 (nextjs)
- 8000 / 3306 はファイアウォールで許可 IP を制限

データ永続化:
- MySQL: Docker Volume `mysql-data`
- アプリ静的ファイル: イメージ再生成で復元可能 (collectstatic 済)

---
## 2. 差分 (開発 vs 本番)

| 項目 | 開発 | 本番 |
|------|------|------|
| Django 実行 | runserver | gunicorn (3 workers) |
| Next.js 実行 | `next dev` (ホットリロード) | `next build` + `next start` |
| ソースコード | bind mount | イメージ内固定 (変更は再ビルド) |
| STATICFILES | 未収集 | `collectstatic` + WhiteNoise |
| DB ポート | 公開 or 内部 | メンテ用に 3306 公開 (制限推奨) |
| Tunnel | 任意 | Cloudflare Tunnel (ホスト) |
| DEBUG | True | False (DJANGO_DEBUG=0) |
| SECRET_KEY | ハードコード | 環境変数で安全管理 |

---
## 3. 環境準備 (Raspberry Pi)

1. OS 更新
```bash
sudo apt update && sudo apt upgrade -y
```
2. Docker / Compose (plugin) インストール (未導入時)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
sudo apt install -y docker-compose-plugin
```
3. Cloudflare Tunnel (ホスト)
```bash
sudo mkdir -p /etc/cloudflared
sudo apt install -y cloudflared || true  # (リポ未対応の場合は公式手順に従う)
cloudflared tunnel login  # ブラウザで認証
cloudflared tunnel create school-app
cloudflared tunnel route dns school-app nextjs.example.com
```
4. `config.yml` 作成例 (/etc/cloudflared/config.yml)
```yaml
tunnel: school-app
credentials-file: /home/pi/.cloudflared/<UUID>.json
ingress:
  - hostname: nextjs.example.com
    service: http://localhost:3000
  - service: http_status:404
```
5. サービス登録
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared && sudo systemctl start cloudflared
```

---
## 4. データベース移行 (ダンプ & リストア)

現行環境のコンテナ名が旧: `db` / 新: `mysql` の可能性があるため適宜読み替え。

### 4.1 ダンプ取得 (開発 / 旧環境)
フルダンプ (構造 + データ + ルーチン + トリガ)
```bash
docker compose exec mysql \
  sh -c 'mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD --single-transaction --routines --triggers $MYSQL_DATABASE' \
  > dump_$(date +%Y%m%d_%H%M%S).sql
```
root 利用時:
```bash
docker compose exec mysql \
  sh -c 'mysqldump -uroot -p$MYSQL_ROOT_PASSWORD --single-transaction --routines --triggers $MYSQL_DATABASE' \
  > dump_$(date +%Y%m%d_%H%M%S).sql
```
サイズ確認 & 圧縮 (任意):
```bash
ls -lh dump_*.sql
gzip dump_2024XXXXXXXX.sql
```

### 4.2 ダンプの整合性チェック (任意)
```bash
grep -i 'CREATE TABLE' dump_*.sql | wc -l
tail dump_*.sql
```

### 4.3 転送 (Raspberry Pi へ)
```bash
scp dump_2024XXXXXXXX.sql.gz pi@<RASPI_HOST>:~/
```

### 4.4 本番 DB 初期化 (必要なら)
既存データを消してクリーンリストアする場合のみ:
```bash
docker compose stop django nextjs
docker compose exec mysql sh -c 'mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -e "DROP DATABASE $MYSQL_DATABASE; CREATE DATABASE $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
```

### 4.5 リストア
```bash
gunzip dump_2024XXXXXXXX.sql.gz  # 圧縮していた場合
docker compose exec -T mysql sh -c 'mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' < dump_2024XXXXXXXX.sql
```

### 4.6 マイグレーション再適用 (差分確認)
```bash
docker compose exec django python manage.py migrate --plan
docker compose exec django python manage.py migrate
```

---
## 5. アプリケーションデプロイ

### 5.1 リポジトリ取得
```bash
git clone https://github.com/kuwaharu-git/school-app.git
cd school-app/app
```

### 5.2 `.env` 作成
```bash
cat > .env <<'EOF'
DJANGO_SECRET_KEY=生成した長いランダム文字列
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=nextjs.example.com,localhost
MYSQL_ROOT_PASSWORD=***
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=***
DB_HOST=mysql
DB_PORT=3306
EOF
```

### 5.3 ビルド & 起動
```bash
docker compose build --pull --no-cache
docker compose up -d
```

### 5.4 初期処理 (静的, 管理ユーザ)
コンテナ起動時に migrate / collectstatic 済み。管理ユーザ未作成なら:
```bash
docker compose exec django python manage.py createsuperuser
```

### 5.5 Cloudflare Tunnel 動作確認
```bash
curl -I https://nextjs.example.com
```

---
## 6. 動作確認チェックリスト

| 項目 | コマンド / URL | 期待結果 |
|------|----------------|----------|
| コンテナ稼働 | `docker compose ps` | 全て Up |
| DB 接続 | `docker compose exec mysql mysql -u$DB_USER -p$DB_PASSWORD -e 'SELECT 1;'` | 1 |
| マイグレーション | `python manage.py showmigrations` | すべて [X] |
| 静的ファイル | `ls backend/staticfiles` | ファイル有り |
| API 正常 | `/api/...` | 200/認証系 401 |
| Next.js | https://nextjs.example.com | 表示 OK |
| Admin | https://nextjs.example.com (API 経由アクセス) | 認証可 |

---
## 7. ロールバック手順

1. 直前のイメージ ID を控える `docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' | grep backend`
2. 旧バージョンへタグ付け戻し (必要なら)
3. DB は dump を取得してから復元: `mysql < dump_previous.sql`
4. 失敗判定時: 新イメージ削除 & 旧コンテナ再起動

簡易: デプロイ前に `docker compose pull && docker compose up -d --no-deps nextjs django` を行わず、新イメージ検証をステージング (別 compose ファイル) で先に確認。

---
## 8. 運用・保守ポイント

### 8.1 定期バックアップ
```bash
mkdir -p /opt/backups/mysql
docker compose exec mysql sh -c 'mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > /opt/backups/mysql/dump_$(date +%F).sql
find /opt/backups/mysql -type f -mtime +7 -delete
```
cron 例 (`crontab -e`):
```
0 2 * * * /bin/bash /home/pi/backup_db.sh >> /var/log/backup_db.log 2>&1
```

### 8.2 セキュリティ
- SECRET_KEY・DB パスワードはリポに含めない
- ufw / iptables で 8000/3306 をローカルセグメント限定
- Cloudflare Zero Trust (Access Policy) 導入で特定ユーザのみアクセス
- Gunicorn workers はメモリ監視し調整 (Pi なら 2〜3)

### 8.3 監視 / ログ
```bash
docker compose logs -f --tail=200 django
docker compose logs -f nextjs
```
メトリクス追加案: cAdvisor + Prometheus + Grafana (任意)

### 8.4 アップデートフロー
```bash
git pull origin main
docker compose build --pull
docker compose up -d
docker image prune -f
```

### 8.5 災害復旧 (DR)
- 最新 dump + `.env` + ソースを別ストレージへ複製 (例: rclone / rsync)
- 復旧: 新ホストで `.env` -> volume 初期化 -> dump リストア -> compose up

---
## 付録: トラブルシューティング

| 症状 | 対処 |
|------|------|
| `django` が起動しない | `docker compose logs django` / DB 接続エラー -> 環境変数/DB_HOST 確認 |
| `collectstatic` エラー | `STATIC_ROOT` の書き込み権限 / イメージ再ビルド |
| Next.js 404 | build 成功ログ確認 (`.next` ディレクトリ存在) |
| MySQL 接続遅延 | healthcheck 待機 / `wait-for-it.sh` の対象ホスト名確認 |
| Tunnel 504 | cloudflared ログ (`journalctl -u cloudflared -f`) / DNS 設定再確認 |

---
## 参考環境変数テンプレート (.env)
```bash
DJANGO_SECRET_KEY=変更必須ランダム文字列
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=nextjs.example.com,localhost
MYSQL_ROOT_PASSWORD=change-root
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=change-app
DB_HOST=mysql
DB_PORT=3306
```

---
以上で本番環境への移行手順は完了です。改善や追加の要望があればドキュメントを更新してください。

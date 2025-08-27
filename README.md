# School App

学校向けの総合管理システムです。学生のプロフィール管理、成果物レビューフルスタックWebアプリケーションです。

## 🚀 プロジェクト概要

このプロジェクトは、学校環境での学習支援を目的としたWebアプリケーションです。Django REST Frameworkをバックエンドに、Next.js + TypeScriptをフロントエンドに使用し、Dockerで環境を統一しています。

### 主な機能

- **認証システム**: 学籍番号ベースのログイン機能
- **プロフィール管理**: 学生の詳細情報とポートフォリオ管理
- **成果物レビュー**: 学習成果の共有とフィードバック

今後実装予定の機能仕様については [docs/feature_list.md](docs/feature_list.md) をご覧ください。

## 🛠 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク
- **TypeScript** - 型安全なJavaScript
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - Radix UIベースのコンポーネントライブラリ
- **Axios** - HTTP クライアント

### バックエンド
- **Django 5.2** - Pythonウェブフレームワーク
- **Django REST Framework** - RESTful API
- **djangorestframework-simplejwt** - JWT認証
- **MySQL 8** - リレーショナルデータベース

### 開発環境・ツール
- **Docker & Docker Compose** - コンテナ化
- **MySQL 8** - データベースサーバー
- **ESLint** - JavaScriptリンター

## 📁 プロジェクト構造

```
school-app/
├── app/
│   ├── backend/           # Django バックエンド
│   │   ├── myproject/     # Django設定
│   │   ├── review         # 成果物レビューアプリ 
│   │   ├── users/         # ユーザー管理アプリ
│   │   ├── user_profile/  # プロフィール管理アプリ
│   │   ├── manage.py
│   │   └── requirements.txt
│   ├── frontend/          # Next.js フロントエンド
│   │   ├── src/
│   │   │   ├── app/       # App Router
│   │   │   ├── components/ # UIコンポーネント
│   │   │   └── lib/       # ユーティリティ
│   │   ├── package.json
│   │   └── next.config.ts
│   ├── docker-compose.yml # Docker設定
│   └── .gitignore
├── docs/                  # プロジェクト文書
│   ├── feature_list.md    # 機能一覧
│   ├── technical_component.md
│   └── api_data/          # API仕様書
└── README.md
```

## 🚀 セットアップ

### 前提条件

- Docker
- Docker Compose
- Git

### インストール手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/kuwaharu-git/school-app.git
   cd school-app.git
   ```

2. **環境変数の設定**
   ```bash
   cd app
   cp .env.example .env
   # .envファイルを編集してMySQL接続設定, Djangoの設定を行う
   ```
   
   `.env`ファイルの設定例：
   ```bash
   MYSQL_ROOT_PASSWORD=change-your-password
   DB_USER=appuser
   DB_PASSWORD=change-your-password
   DB_NAME=appdb
   DB_HOST=mysql
   DB_PORT=3306
   DJANGO_SECRET_KEY=change-your-secret-key
   DJANGO_DEBUG=0
   DJANGO_ALLOWED_HOSTS=django,localhost
   ```

3. **本番環境用Docker コンテナの起動**
   ```bash
   docker compose build --no-cache
   docker-compose up -d
   ```
   
   このコマンドにより以下のサービスが起動します：
   - `backend`: Django アプリケーション（ポート8000）
   - `frontend`: Next.js アプリケーション（ポート3000）
   - `db`: MySQL 8 データベース（ポート3306）

4. **データベースのマイグレーション**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
   
   **注意**: `docker-compose up`実行時、バックエンドは`wait-for-it.sh`スクリプトによりMySQLデータベースの起動を待機してから自動的にマイグレーションを実行します。

5. **スーパーユーザーの作成（オプション）**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

### アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **MySQL**: localhost:3306

## 🔧 開発ワークフロー

### 開発サーバーの起動

```bash
docker compose -f docker-compose.yml.dev build --no-cache
docker compose -f docker-compose.yml.dev up
```

### コードの変更とホットリロード

- フロントエンドとバックエンドの両方でホットリロードが有効
- `app/frontend/` と `app/backend/` ディレクトリの変更は自動的に反映
- MySQLデータは永続化ボリューム（`dev-mysql-data`）に保存されます

### データベース操作

```bash
# マイグレーションファイルの作成
docker-compose exec backend python manage.py makemigrations

# マイグレーションの実行
docker-compose exec backend python manage.py migrate

# データベースシェル
docker-compose exec db mysql -u root -p app

# または、Djangoのdbshellを使用
docker-compose exec backend python manage.py dbshell
```

## 📚 API ドキュメント

APIの詳細仕様については以下をご参照ください：

- **API仕様書**: [docs/api_data/](docs/api_data/)
- **Django Admin**: http://localhost:8000/admin

### 主要なAPIエンドポイント

- `POST /api/auth/login/` - ユーザーログイン
- `GET /api/profiles/` - プロフィール一覧
- `GET /api/profiles/{id}/` - 特定プロフィール取得
- `PUT /api/profiles/{id}/` - プロフィール更新

## 🧪 テスト

```bash
# バックエンドテスト
docker-compose exec backend python manage.py test

# フロントエンドテスト（設定後）
docker-compose exec frontend npm test
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. マージリクエストを作成

### コーディング規約

- **Python**: PEP 8に準拠
- **TypeScript/JavaScript**: ESLint設定に従う
- **コミット**: 日本語または英語で明確な説明

## 📄 ライセンス

このプロジェクトは学習目的で開発されています。

## 📞 サポート

問題や質問がある場合は、GitLab Issuesまでお気軽にお問い合わせください。

---

**開発チーム**: SIW School App Development Team

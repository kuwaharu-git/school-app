# Copilot Instructions for school-app

このプロジェクトで AI がすぐ動けるための要点を、実コードに基づき最小限でまとめます。

## アーキテクチャと境界
- Backend: `Django 5.2 + DRF` at `app/backend/`、DB: `MySQL 8` (サービス名 `mysql`)
- Frontend: `Next.js 15 + TypeScript` at `app/frontend/`
- ルート集約: `app/backend/myproject/urls.py`
  - `api/users/` → `users`、`api/user_profile/` → `user_profile`、`api/review/` → `review`

## 開発/実行フロー
- 開発起動(ホットリロード):
  - `cd app && docker compose -f docker-compose.yml.dev build --no-cache && docker compose -f docker-compose.yml.dev up`
  - dev は `backend`/`frontend` を bind mount、`django runserver`/`next dev`、DB は `dev-mysql-data` 永続化
- 本番起動(検証用): `cd app && docker compose build --no-cache && docker compose up -d`
  - `wait-for-it.sh` → `migrate` → `collectstatic` → `gunicorn`、Next は `next start`
- マイグレーション/テスト: (開発時)
  - `docker compose -f docker-compose.yml.dev exec django python manage.py makemigrations|migrate|test`

## 認証と権限(このプロジェクトの肝)
- JWT は Cookie 運用。`users.authentication.CustomJWTAuthentication` が `access` Cookie を読み `Authorization: Bearer ...` を `request.META` に注入
- `settings.REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]` が既定
- Users API(例):
  - `POST /api/users/login/` → `access`/`refresh` を Cookie に設定
  - `POST /api/users/retry/` → `refresh` から `access` 再発行
  - `POST /api/users/logout/` → Cookie 削除、`GET /api/users/test/` → 認証確認
- 公開APIにする場合は `authentication_classes = []` を明示し、必要に応じて独自 Permission を付与 (例: `review/permissions.py` の `IsAuthorOrReadOnly` / `IsReviewerOrReadOnly`)

## 実装パターン(コード例あり)
- ルーティング: `routers.DefaultRouter()` 登録 (例: `review/urls.py`)
- Serializer 切替: `get_serializer_class()` で `list/detail/create/update` を出し分け (例: `review/views.py`)
- ネスト更新: `user_profile/views.py` はトランザクション内で `update_or_create` と差分削除/追加を実施 (辞書/ID リストで比較)

## 参照すべきキー文件
- 設定: `app/backend/myproject/settings.py` (DB_HOST=`mysql`、`Asia/Tokyo`、`WhiteNoise`、`SIMPLE_JWT`、`CSRF_TRUSTED_ORIGINS=['https://school.kuwaharu.com']`)
- 認証実装: `app/backend/users/authentication.py`
- 代表的エンドポイント:
  - Users: `app/backend/users/views.py`
  - Profile: `app/backend/user_profile/views.py`
  - Review: `app/backend/review/views.py`

## 環境と変数
- `.env` は `app/.env`。主要キー例: `MYSQL_ROOT_PASSWORD, DB_USER, DB_PASSWORD, DB_NAME, DB_HOST=mysql, DB_PORT=3306, DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS`
- Compose と DB のサービス名は `mysql` に合わせる前提

## 新規 API/機能追加の型
1) Django アプリ/エンドポイント追加 → `INSTALLED_APPS`/`urls.py` 登録
2) ViewSet で Cookie JWT 前提、公開は `authentication_classes=[]` を明記
3) Serializer はアクション別に切替 (上記実装に倣う)

詳細な API 仕様は `docs/api_data/` を参照。迷ったら上記キー文件から実装例を辿ってください。

## フロントのAPIクライアント規約
- 標準HTTPクライアントは `app/frontend/src/lib/customAxios.ts`
  - `customAxios`: 401時に自動で `POST /api/users/retry` を呼び直し→元リクエスト再送。失敗時は `/login` へリダイレクト
  - `noRedirectCustomAxios`: 上記の自動リトライは同様だが、401時に画面遷移しない（呼び出し側でハンドル）
- API呼び出しは原則 `/api/...` の相対パスで実装（バックエンドと同一オリジン/リバプロ経由を前提）
- Cookieベース認証のため、別オリジンで叩く場合は `withCredentials` とCORS設定の検討が必要（通常は相対パス運用）
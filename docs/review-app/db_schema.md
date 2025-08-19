# Review App - データベース定義書

作成日: 2025-08-19
作成者: GitHub Copilot（自動生成）

## 概要
この文書は「制作物レビュー機能」に必要なデータベース設計を定義する。既存のユーザモデル（app/users）を利用する前提。
実装はDjango（SQLite 開発 / PostgreSQL 本番想定）で行うことを想定する。

## ER概要（テキスト）
- User (既存)
  - Project (作成者: User) 1:N
  - Review (投稿者: User) 1:N
- Project と Tag は多対多（M2M）

## テーブル一覧
- projects
- reviews
- tags
- project_tags (M2M junction table)
- audit_logs（監査ログ、任意）

---

## projects
目的: 学生が登録する制作物（GitHub リポジトリ / 公開URL）を保持する。

フィールド（Django 型 / SQL 型 / 備考）:
- id: BigAutoField / BIGINT PRIMARY KEY
- author_id: ForeignKey(User, on_delete=CASCADE) / BIGINT / users テーブルの外部キー
- title: CharField(max_length=255) / VARCHAR(255) NOT NULL
- slug: SlugField(max_length=255, unique=True) / VARCHAR(255) UNIQUE NOT NULL（フロントのURL用、任意）
- description: TextField / TEXT
- repository_url: URLField(max_length=2000) / VARCHAR(2000) NULLABLE? NOT NULL推奨
- live_url: URLField(max_length=2000, null=True, blank=True) / VARCHAR(2000) NULL
- ogp_image_url: URLField(max_length=2000, null=True, blank=True) / VARCHAR(2000) NULL（OGP画像キャッシュ用）
- is_public: BooleanField(default=True) / BOOLEAN NOT NULL DEFAULT TRUE
- created_at: DateTimeField(auto_now_add=True) / TIMESTAMP NOT NULL
- updated_at: DateTimeField(auto_now=True) / TIMESTAMP NOT NULL
- cached_reviewer_count: IntegerField(default=0) / INTEGER NOT NULL DEFAULT 0（任意、パフォーマンス）
- cached_average_rating: DecimalField(max_digits=3, decimal_places=2, default=0) / DECIMAL(3,2)（任意）

制約・インデックス:
- PK: id
- FK: author_id -> users(id) ON DELETE CASCADE
- INDEX: (author_id), (created_at) — 一覧ソート・フィルタ用
- UNIQUE: slug（ある場合）

備考:
- repository_url は外部URLのためサニタイズとバリデーションを行うこと。
- 本番環境ではOGP画像をダウンロードして CDN に置くことを推奨。

---

## reviews
目的: 各制作物に対するレビュー（評価・コメント）を保持する。

フィールド（Django 型 / SQL 型 / 備考）:
- id: BigAutoField / BIGINT PRIMARY KEY
- project_id: ForeignKey(Project, on_delete=CASCADE, related_name='reviews') / BIGINT NOT NULL
- reviewer_id: ForeignKey(User, on_delete=SET_NULL, null=True) / BIGINT NULLABLE（ユーザ削除時は NULL に設定）
- reviewer_name_snapshot: CharField(max_length=255, null=False, blank=False, default='削除されたユーザ') / VARCHAR(255) NOT NULL（表示名のスナップショット。ユーザ削除後は '削除されたユーザ' に置換）
- rating: SmallIntegerField / SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5)
- comment: TextField / TEXT
- created_at: DateTimeField(auto_now_add=True) / TIMESTAMP NOT NULL
- updated_at: DateTimeField(auto_now=True) / TIMESTAMP NOT NULL

制約・インデックス:
- PK: id
- FK: project_id -> projects(id) ON DELETE CASCADE
- FK: reviewer_id -> users(id) ON DELETE SET NULL
- UNIQUE CONSTRAINT: (project_id, reviewer_id) — 同一ユーザは同一プロジェクトに対して1レビュー（初期仕様）
  - reviewer_id が NULL の場合は適用されないため、ゲストレビューを許可しない仕様と整合すること
- INDEX: (project_id), (reviewer_id), (created_at)

備考:
- 要件ではレビュー投稿は登録ユーザのみ可能なので reviewer_id は通常 NOT NULL でもよいが、ユーザ削除時にレビューを残すために ON DELETE SET NULL を採用する。
- reviewer_name_snapshot は常に表示用の名前を保持する。ユーザ削除時にはこのカラムを '削除されたユーザ' に書き換えることで、公開表示上は匿名化される。

### ユーザ削除時の振る舞い（実装メモ）
- 方針: ユーザが削除された場合、レビュー本文はそのまま残すが、レビューに紐づく個人情報は匿名化する（表示名を '削除されたユーザ' に変更し、 reviewer_id を NULL にする）。
- 実装例（Django）:
  - User 削除処理の前後にシグナルを用いて関連レビューを更新する。例: pre_delete または post_delete シグナルで Review.objects.filter(reviewer=deleted_user).update(reviewer_id=None, reviewer_name_snapshot='削除されたユーザ') を実行する。
  - マイグレーションや既存データに対しては、スクリプトで既存レビューの reviewer_name_snapshot を補填する処理を用意する。
- 注意点:
  - 完全匿名化が法的に必要な場合はさらにレビュー本文から個人名等を検出して削除するロジックを検討する。
  - reviewer_name_snapshot を default にしておくと、将来的に匿名化方針を変更しても表示ロジック側で対応しやすい。

---

## tags
目的: 制作物に付与するタグ（技術、カテゴリ等）を保持する。

フィールド:
- id: BigAutoField / BIGINT PRIMARY KEY
- name: CharField(max_length=100, unique=True) / VARCHAR(100) NOT NULL UNIQUE
- slug: SlugField(max_length=100, unique=True) / VARCHAR(100) NOT NULL UNIQUE

インデックス:
- UNIQUE(name), UNIQUE(slug)

---

## project_tags (中間テーブル)
目的: projects と tags の多対多関係を保持する。

フィールド:
- id: BigAutoField / BIGINT PK（または複合PK）
- project_id: ForeignKey(Project, on_delete=CASCADE) / BIGINT NOT NULL
- tag_id: ForeignKey(Tag, on_delete=CASCADE) / BIGINT NOT NULL

制約:
- UNIQUE (project_id, tag_id)
- INDEX (project_id), INDEX (tag_id)

---

## audit_logs（任意）
目的: 投稿・削除・編集などの監査ログを保存する。

フィールド:
- id: BigAutoField
- actor_id: ForeignKey(User, null=True, on_delete=SET_NULL)
- action: CharField(max_length=50) — ex: 'create_project','update_review','delete_project'
- target_type: CharField(max_length=50) — ex: 'project','review'
- target_id: BigIntegerField
- detail: JSONField(null=True, blank=True) — 変更差分など
- created_at: DateTimeField(auto_now_add=True)

インデックス:
- INDEX (actor_id), INDEX (target_type, target_id)

---

## サンプル SQL（PostgreSQL 想定・抜粋）
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  author_id BIGINT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  repository_url VARCHAR(2000) NOT NULL,
  live_url VARCHAR(2000),
  ogp_image_url VARCHAR(2000),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id BIGINT REFERENCES auth_user(id) ON DELETE SET NULL,
  reviewer_name_snapshot VARCHAR(255),
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (project_id, reviewer_id)
);

---

## マイグレーション & 実装上の注意
1. Django のモデルを作成して `python manage.py makemigrations reviews` → `python manage.py migrate` を実行する。
2. SQLite は制約・インデックスのサポートが限定的なため、ローカル開発では動作差に注意。Postgres 本番環境での検証を必須とする。
3. review のユニーク制約を有効にする場合、既存データを考慮した移行脚本を用意する。
4. パフォーマンス改善のため、projects に cached_average_rating / cached_reviewer_count を保持し、レビュー作成・更新時にインクリメント/再計算する。
5. ユーザの個人情報はユーザテーブルに格納されているため、API レイヤーで公開可能なカラムのみ返すこと（DB 層では別扱い）。

---

## Privacy / Access Control について（DB 側の注意点）
- プロフィールの非公開情報（メール、設定等）は DB レベルで保護するのではなく、API レイヤで出力制御を行う（GET /api/users/{id}/public は公開可能なカラムのみ返す）。
- is_public フラグは将来的にプロジェクト公開制御に使えるが、本設計ではデフォルトで公開(true)を想定する。

---

## 追加提案（実務的な改善）
- フルテキスト検索用に PostgreSQL の GIN インデックスを設定（title, description）
- サムネイルや OGP は別テーブル（project_media）で管理し、CDN キャッシュを前提にする
- レビューヒストリ（更新履歴）を保持する場合は review_history テーブルを追加する

---

以上。実装用にDjangoモデルのサンプルコードが必要なら作成しますか？

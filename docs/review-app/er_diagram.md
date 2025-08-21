# Review App - ER 図

作成日: 2025-08-19

以下は Review 機能に関するER図（論理設計）と補足説明です。PlantUML を使って描画できます。

---

## PlantUML（レンダリング可能）

```plantuml
@startuml
hide circle
skinparam linetype ortho

entity "users_user (既存)" as User {
  * id : BIGINT <<PK>>
  --
  username : VARCHAR
  --
  /* 他のカラムは既存モデルに依存 */
}

entity "projects" as Project {
  * id : BIGINT <<PK>>
  --
  author_id : BIGINT <<FK users_user.id>>
  title : VARCHAR(255)
  slug : VARCHAR(255)
  description : TEXT
  repository_url : VARCHAR(2000)
  live_url : VARCHAR(2000)
  ogp_image_url : VARCHAR(2000)
  is_public : BOOLEAN
  cached_reviewer_count : INT
  cached_average_rating : DECIMAL(3,2)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "tags" as Tag {
  * id : BIGINT <<PK>>
  --
  name : VARCHAR(100)
  slug : VARCHAR(100)
}

entity "project_tags" as ProjectTag {
  * id : BIGINT <<PK>>
  --
  project_id : BIGINT <<FK projects.id>>
  tag_id : BIGINT <<FK tags.id>>
}

entity "reviews" as Review {
  * id : BIGINT <<PK>>
  --
  project_id : BIGINT <<FK projects.id>>
  reviewer_id : BIGINT <<FK users_user.id>> (nullable)
  reviewer_name_snapshot : VARCHAR(255)
  rating : SMALLINT
  comment : TEXT
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "audit_logs" as AuditLog {
  * id : BIGINT <<PK>>
  actor_id : BIGINT <<FK users_user.id>> (nullable)
  action : VARCHAR(50)
  target_type : VARCHAR(50)
  target_id : BIGINT
  detail : JSON
  created_at : TIMESTAMP
}

' リレーション '
User ||--o{ Project : "author"
Project ||--o{ Review : "reviews"
User ||--o{ Review : "reviewer (nullable, on_delete=SET_NULL)"
Project }o--|| Tag : "M:N via project_tags"
Project ||--o{ ProjectTag : "projects"
Tag ||--o{ ProjectTag : "tags"
User ||--o{ AuditLog : "actor"

@enduml
```

---

## 重要な振る舞い（補足）
- Review.reviewer はユーザ削除時に NULL にされ、表示用の `reviewer_name_snapshot` は '削除されたユーザ' に置換されます（DB 及び表示の匿名化処理）。
- Project と Tag は多対多（M:N）で `project_tags` 中間テーブルを持ちます。
- Project はレビューの平均評価・レビュー数を `cached_average_rating` / `cached_reviewer_count` に保持してパフォーマンス改善します。
- ユーザの詳細（メール等）は API レイヤで出力制御を行い、ゲストには公開可能なフィールドのみ返却します。

---

ファイルを生成しました。PlantUML をレンダリングしますか、あるいは mermaid / PNG 形式で出力しますか？

---

## Mermaid（ER 図）
以下は同じERをMermaidのerDiagram形式で表現したものです。

```mermaid
erDiagram
    USERS {
        BIGINT id PK
        VARCHAR username
    }

    PROJECTS {
        BIGINT id PK
        BIGINT author_id FK
        VARCHAR title
        VARCHAR slug
        TEXT description
        VARCHAR repository_url
        VARCHAR live_url
        VARCHAR ogp_image_url
        BOOLEAN is_public
        INT cached_reviewer_count
        DECIMAL cached_average_rating
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    TAGS {
        BIGINT id PK
        VARCHAR name
        VARCHAR slug
    }

    PROJECT_TAGS {
        BIGINT id PK
        BIGINT project_id FK
        BIGINT tag_id FK
    }

    REVIEWS {
        BIGINT id PK
        BIGINT project_id FK
        BIGINT reviewer_id FK NULLABLE
        VARCHAR reviewer_name_snapshot
        SMALLINT rating
        TEXT comment
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    AUDIT_LOGS {
        BIGINT id PK
        BIGINT actor_id FK NULLABLE
        VARCHAR action
        VARCHAR target_type
        BIGINT target_id
        JSON detail
        TIMESTAMP created_at
    }

    %% リレーション定義
    USERS ||--o{ PROJECTS : "author"
    PROJECTS ||--o{ REVIEWS : "reviews"
    USERS ||--o{ REVIEWS : "reviewer (nullable)"
    PROJECTS }o--|| TAGS : "M:N via project_tags"
    PROJECTS ||--o{ PROJECT_TAGS : "projects"
    TAGS ||--o{ PROJECT_TAGS : "tags"
    USERS ||--o{ AUDIT_LOGS : "actor"
```

---

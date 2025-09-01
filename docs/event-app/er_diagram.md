# Event App - ER 図

作成日: 2025-01-01

以下は Event 管理機能に関するER図（論理設計）と補足説明です。PlantUML を使って描画できます。

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

entity "events" as Event {
  * id : BIGINT <<PK>>
  --
  organizer_id : BIGINT <<FK users_user.id>>
  title : VARCHAR(200)
  slug : VARCHAR(200)
  description : TEXT
  start_datetime : TIMESTAMP WITH TIME ZONE
  end_datetime : TIMESTAMP WITH TIME ZONE
  location : VARCHAR(200)
  max_participants : INT
  is_public : BOOLEAN
  is_cancelled : BOOLEAN
  cached_participant_count : INT
  created_at : TIMESTAMP WITH TIME ZONE
  updated_at : TIMESTAMP WITH TIME ZONE
}

entity "event_participants" as EventParticipant {
  * id : BIGINT <<PK>>
  --
  event_id : BIGINT <<FK events.id>>
  participant_id : BIGINT <<FK users_user.id>>
  participant_name_snapshot : VARCHAR(150)
  status : VARCHAR(20)
  registered_at : TIMESTAMP WITH TIME ZONE
  attended_at : TIMESTAMP WITH TIME ZONE
  comment : TEXT
}

entity "event_comments" as EventComment {
  * id : BIGINT <<PK>>
  --
  event_id : BIGINT <<FK events.id>>
  author_id : BIGINT <<FK users_user.id>>
  author_name_snapshot : VARCHAR(150)
  content : TEXT
  created_at : TIMESTAMP WITH TIME ZONE
  updated_at : TIMESTAMP WITH TIME ZONE
}

entity "event_tags" as EventTag {
  * id : BIGINT <<PK>>
  --
  name : VARCHAR(50)
  slug : VARCHAR(50)
  color : VARCHAR(7)
}

entity "event_event_tags" as EventEventTag {
  * id : BIGINT <<PK>>
  --
  event_id : BIGINT <<FK events.id>>
  tag_id : BIGINT <<FK event_tags.id>>
}

entity "event_notifications" as EventNotification {
  * id : BIGINT <<PK>>
  --
  recipient_id : BIGINT <<FK users_user.id>>
  event_id : BIGINT <<FK events.id>>
  notification_type : VARCHAR(50)
  title : VARCHAR(200)
  message : TEXT
  is_read : BOOLEAN
  sent_at : TIMESTAMP WITH TIME ZONE
}

' リレーション
User ||--o{ Event : "主催"
User ||--o{ EventParticipant : "参加"
User ||--o{ EventComment : "投稿"
User ||--o{ EventNotification : "受信"

Event ||--o{ EventParticipant : "参加者管理"
Event ||--o{ EventComment : "コメント"
Event ||--o{ EventEventTag : "タグ付け"
Event ||--o{ EventNotification : "通知"

EventTag ||--o{ EventEventTag : "タグ関連"

@enduml
```

---

## Mermaid（ER 図）

```mermaid
erDiagram
    users_user {
        bigint id PK
        varchar username
    }
    
    events {
        bigint id PK
        bigint organizer_id FK
        varchar title
        varchar slug
        text description
        timestamp start_datetime
        timestamp end_datetime
        varchar location
        int max_participants
        boolean is_public
        boolean is_cancelled
        int cached_participant_count
        timestamp created_at
        timestamp updated_at
    }
    
    event_participants {
        bigint id PK
        bigint event_id FK
        bigint participant_id FK
        varchar participant_name_snapshot
        varchar status
        timestamp registered_at
        timestamp attended_at
        text comment
    }
    
    event_comments {
        bigint id PK
        bigint event_id FK
        bigint author_id FK
        varchar author_name_snapshot
        text content
        timestamp created_at
        timestamp updated_at
    }
    
    event_tags {
        bigint id PK
        varchar name
        varchar slug
        varchar color
    }
    
    event_event_tags {
        bigint id PK
        bigint event_id FK
        bigint tag_id FK
    }
    
    event_notifications {
        bigint id PK
        bigint recipient_id FK
        bigint event_id FK
        varchar notification_type
        varchar title
        text message
        boolean is_read
        timestamp sent_at
    }
    
    users_user ||--o{ events : "主催"
    users_user ||--o{ event_participants : "参加"
    users_user ||--o{ event_comments : "投稿"
    users_user ||--o{ event_notifications : "受信"
    
    events ||--o{ event_participants : "参加者"
    events ||--o{ event_comments : "コメント"
    events ||--o{ event_event_tags : "タグ"
    events ||--o{ event_notifications : "通知"
    
    event_tags ||--o{ event_event_tags : "関連"
```

---

## 重要な振る舞い（補足）

### 参加者管理
- EventParticipant.participant はユーザ削除時に NULL にされ、表示用の `participant_name_snapshot` は '削除されたユーザ' に置換されます（DB 及び表示の匿名化処理）。
- Event と User は EventParticipant を通じて多対多関係になります。
- status フィールドで参加状態を管理（registered → attended/absent）。

### イベント制約
- start_datetime < end_datetime の制約により、不正な日時設定を防止します。
- max_participants=0 は無制限を意味し、参加登録時にチェックされます。
- cached_participant_count はパフォーマンス改善のため、参加者数の変更時に更新されます。

### タグとコメント
- Event と EventTag は多対多（M:N）で `event_event_tags` 中間テーブルを持ちます。
- EventComment により参加者同士の情報共有やQ&Aが可能です。

### 通知システム
- event_notifications テーブルで通知履歴を管理し、既読/未読状態を追跡します。
- notification_type により通知の種類を分類（作成・更新・参加・リマインダー等）。

### プライバシーとアクセス制御
- is_public フラグにより公開・非公開を制御します。
- ユーザの詳細（メール等）は API レイヤで出力制御を行い、ゲストには公開可能なフィールドのみ返却します。

---

ファイルを生成しました。PlantUML をレンダリングしますか、あるいは mermaid / PNG 形式で出力しますか？

---
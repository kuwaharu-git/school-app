# Event App - データベース定義書

作成日: 2025-01-01
作成者: GitHub Copilot（自動生成）

## 概要
この文書は「イベント管理機能」に必要なデータベース設計を定義する。既存のユーザモデル（app/users）を利用する前提。
実装はDjango（SQLite 開発 / PostgreSQL 本番想定）で行うことを想定する。

## ER概要（テキスト）
- User (既存)
  - Event (主催者: User) 1:N
  - EventParticipant (参加者: User) 1:N
  - EventComment (投稿者: User) 1:N
- Event と EventTag は多対多（M2M）
- Event と User は EventParticipant を通じて多対多

## テーブル一覧
- events
- event_participants (参加者管理)
- event_comments (コメント)
- event_tags (タグ)
- event_event_tags (M2M junction table)
- event_notifications（通知ログ、任意）

---

## events
目的: イベントの基本情報を保持する。

フィールド（Django 型 / SQL 型 / 備考）:
- id: BigAutoField / BIGINT PRIMARY KEY
- organizer_id: ForeignKey(User, on_delete=CASCADE) / BIGINT / users テーブルの外部キー
- title: CharField(max_length=200) / VARCHAR(200) NOT NULL
- slug: SlugField(max_length=200, unique=True) / VARCHAR(200) UNIQUE NOT NULL（URL用、任意）
- description: TextField / TEXT
- start_datetime: DateTimeField / TIMESTAMP WITH TIME ZONE NOT NULL
- end_datetime: DateTimeField / TIMESTAMP WITH TIME ZONE NOT NULL
- location: CharField(max_length=200, null=True, blank=True) / VARCHAR(200) NULL（オンライン対応）
- max_participants: PositiveIntegerField(default=0) / INT DEFAULT 0（0=無制限）
- is_public: BooleanField(default=True) / BOOLEAN DEFAULT TRUE
- is_cancelled: BooleanField(default=False) / BOOLEAN DEFAULT FALSE
- cached_participant_count: PositiveIntegerField(default=0) / INT DEFAULT 0（パフォーマンス用）
- created_at: DateTimeField(auto_now_add=True) / TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- updated_at: DateTimeField(auto_now=True) / TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

制約:
- CHECK (start_datetime < end_datetime)
- CHECK (max_participants >= 0)

インデックス:
- INDEX (organizer_id)
- INDEX (start_datetime, end_datetime)
- INDEX (is_public, is_cancelled)
- UNIQUE(slug)

---

## event_participants
目的: イベントと参加者の関係を保持する（多対多の中間テーブル）。

フィールド:
- id: BigAutoField / BIGINT PRIMARY KEY
- event_id: ForeignKey(Event, on_delete=CASCADE) / BIGINT NOT NULL
- participant_id: ForeignKey(User, on_delete=SET_NULL, null=True) / BIGINT NULL
- participant_name_snapshot: CharField(max_length=150) / VARCHAR(150) NOT NULL（表示用名前の保存）
- status: CharField(max_length=20, default='registered') / VARCHAR(20) DEFAULT 'registered'
  - 選択肢: 'registered', 'cancelled', 'attended', 'absent'
- registered_at: DateTimeField(auto_now_add=True) / TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- attended_at: DateTimeField(null=True, blank=True) / TIMESTAMP WITH TIME ZONE NULL
- comment: TextField(null=True, blank=True) / TEXT NULL（参加時のコメント）

制約:
- UNIQUE (event_id, participant_id) — 同じユーザが同じイベントに重複参加できない

インデックス:
- INDEX (event_id)
- INDEX (participant_id)
- INDEX (status)

備考:
- participant_id は ON DELETE SET NULL により、ユーザ削除時もレコードは残る
- participant_name_snapshot は表示用の名前を常に保持し、ユーザ削除時は '削除されたユーザ' に置換される

---

## event_comments
目的: イベントに対するコメントを保持する。

フィールド:
- id: BigAutoField / BIGINT PRIMARY KEY
- event_id: ForeignKey(Event, on_delete=CASCADE) / BIGINT NOT NULL
- author_id: ForeignKey(User, on_delete=SET_NULL, null=True) / BIGINT NULL
- author_name_snapshot: CharField(max_length=150) / VARCHAR(150) NOT NULL
- content: TextField / TEXT NOT NULL
- created_at: DateTimeField(auto_now_add=True) / TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- updated_at: DateTimeField(auto_now=True) / TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

インデックス:
- INDEX (event_id, created_at)
- INDEX (author_id)

---

## event_tags
目的: イベントに付与するタグ（カテゴリ、種類等）を保持する。

フィールド:
- id: BigAutoField / BIGINT PRIMARY KEY
- name: CharField(max_length=50, unique=True) / VARCHAR(50) NOT NULL UNIQUE
- slug: SlugField(max_length=50, unique=True) / VARCHAR(50) NOT NULL UNIQUE
- color: CharField(max_length=7, default='#007bff') / VARCHAR(7) DEFAULT '#007bff'（表示色）

インデックス:
- UNIQUE(name), UNIQUE(slug)

---

## event_event_tags (中間テーブル)
目的: events と event_tags の多対多関係を保持する。

フィールド:
- id: BigAutoField / BIGINT PK（または複合PK）
- event_id: ForeignKey(Event, on_delete=CASCADE) / BIGINT NOT NULL
- tag_id: ForeignKey(EventTag, on_delete=CASCADE) / BIGINT NOT NULL

制約:
- UNIQUE (event_id, tag_id)
- INDEX (event_id), INDEX (tag_id)

---

## event_notifications（任意）
目的: イベント関連の通知ログを保存する。

フィールド:
- id: BigAutoField
- recipient_id: ForeignKey(User, null=True, on_delete=SET_NULL)
- event_id: ForeignKey(Event, on_delete=CASCADE)
- notification_type: CharField(max_length=50) — ex: 'event_created', 'event_updated', 'participant_joined', 'reminder_24h', 'reminder_1h'
- title: CharField(max_length=200)
- message: TextField
- is_read: BooleanField(default=False)
- sent_at: DateTimeField(auto_now_add=True)

インデックス:
- INDEX (recipient_id, is_read)
- INDEX (event_id)
- INDEX (notification_type)

---

## サンプル SQL（PostgreSQL 想定・抜粋）

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  organizer_id BIGINT NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(200),
  max_participants INT DEFAULT 0 CHECK (max_participants >= 0),
  is_public BOOLEAN DEFAULT TRUE,
  is_cancelled BOOLEAN DEFAULT FALSE,
  cached_participant_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_datetime CHECK (start_datetime < end_datetime)
);

CREATE TABLE event_participants (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id BIGINT REFERENCES users_user(id) ON DELETE SET NULL,
  participant_name_snapshot VARCHAR(150) NOT NULL,
  status VARCHAR(20) DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended_at TIMESTAMP WITH TIME ZONE,
  comment TEXT,
  UNIQUE (event_id, participant_id)
);

CREATE TABLE event_comments (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id BIGINT REFERENCES users_user(id) ON DELETE SET NULL,
  author_name_snapshot VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_organizer ON events (organizer_id);
CREATE INDEX idx_events_datetime ON events (start_datetime, end_datetime);
CREATE INDEX idx_events_public ON events (is_public, is_cancelled);
CREATE INDEX idx_participants_event ON event_participants (event_id);
CREATE INDEX idx_participants_user ON event_participants (participant_id);
CREATE INDEX idx_comments_event ON event_comments (event_id, created_at);
```

---

## マイグレーション & 実装上の注意

1. start_datetime / end_datetime はタイムゾーン付きで保存し、フロントエンドでユーザのローカル時間に変換する。
2. max_participants=0 は「無制限」を意味する。参加登録時にこの制限をチェックする。
3. cached_participant_count はパフォーマンス向上のため。参加者数変更時に更新する。
4. slug フィールドはURLフレンドリーなイベント識別子として使用（任意機能）。
5. 通知機能は event_notifications テーブルまたは外部サービス（メール等）で実装する。

---

## Privacy / Access Control について（DB 側の注意点）

1. is_public=False のイベントは招待されたユーザのみアクセス可能（招待システムは別途実装）。
2. 参加者リストの表示は API レイヤーで制御（プライバシー設定に応じて）。
3. ユーザ削除時の participant_name_snapshot / author_name_snapshot による匿名化処理。

---

## 追加提案（実務的な改善）

- フルテキスト検索用に PostgreSQL の GIN インデックスを設定（title, description）
- 繰り返しイベント用に event_series テーブルを追加（月次・週次開催）
- イベント画像・ファイル添付用に event_media テーブルを追加
- 参加者の出席確認用に QR コード生成機能を検討
- Google Calendar / Outlook 連携のための外部カレンダーID保存

---

以上。実装用にDjangoモデルのサンプルコードが必要なら作成しますか？
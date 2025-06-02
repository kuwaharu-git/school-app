# GET

## URL
/api/profile/<int: user_id>

## request_data
なし

## response_data

```
{
    "user_info": {
        "student_id": "23010015",  // 学生ID
        "username": "kuwaharu"    // ユーザー名
    },
    "profile": {
        "self_introduction": "",  // 自己紹介文（空の場合は空文字列）
        "portfolio_url": null,    // ポートフォリオURL（未設定の場合はnull）
        "github_url": null        // GitHub URL（未設定の場合はnull）
    },
    "user_languages": [
        {
            "language": {
                "id": 4,                  // 言語ID
                "language_name": "C#"     // 言語名
            },
            "other_language_name": null   // その他の言語名（未設定の場合はnull）
        },
        {
            "language": {
                "id": 10,
                "language_name": "C++"
            },
            "other_language_name": null
        }
    ],
    "user_frameworks": [
        {
            "framework": {
                "id": 9,                  // フレームワークID
                "framework_name": "Angular" // フレームワーク名
            },
            "other_framework_name": null  // その他のフレームワーク名（未設定の場合はnull）
        }
    ],
    "user_social_medias": [
        {
            "social_media": {
                "id": 2,                      // ソーシャルメディアID
                "social_media_name": "Twitter" // ソーシャルメディア名
            },
            "other_social_media_name": null,  // その他のソーシャルメディア名（未設定の場合はnull）
            "url": "https://x.com/kuwaharu_it" // ソーシャルメディアのURL
        }
    ]
}
```

# POST

## URL
/api/profile/

## request_data

```
{
    "profile": {
        "self_introduction": "こんにちは、私はソフトウェアエンジニアです。",
        "portfolio_url": "https://example.com/portfolio",
        "github_url": "https://github.com/kuwaharu"
    },
    "user_languages": [
        {
            "language": {
                "id": 4,
                "language_name": "C#"
            },
            "other_language_name": null
        },
        {
            "language": {
                "id": 10,
                "language_name": "C++"
            },
            "other_language_name": null
        },
        {
            "language": null,
            "other_language_name": "Rust"
        }
    ],
    "user_frameworks": [
        {
            "framework": {
                "id": 9,
                "framework_name": "Angular"
            },
            "other_framework_name": null
        },
        {
            "framework": null,
            "other_framework_name": "Svelte"
        }
    ],
    "user_social_medias": [
        {
            "social_media": {
                "id": 2,
                "social_media_name": "Twitter"
            },
            "other_social_media_name": null,
            "url": "https://x.com/kuwaharu_it"
        },
        {
            "social_media": null,
            "other_social_media_name": "LinkedIn",
            "url": "https://linkedin.com/in/kuwaharu"
        }
    ]
}
```

# Dockerfile for backend
FROM python:3.13-slim

# 作業ディレクトリを設定
WORKDIR /app

# 必要なファイルをコピー
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt


# サーバを起動
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
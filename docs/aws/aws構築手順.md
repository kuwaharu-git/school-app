1. はじめに：デプロイの全体像この解説書では、本番環境を見据えた以下の構成でアプリケーションをデプロイします。EC2インスタンス: アプリケーションを動かす仮想サーバー。Docker & Docker Compose: 複数のコンテナを一元管理するためのツール。Nginx (リバースプロキシ): HTTPS通信を終端し、各サービスにトラフィックを振り分ける。Next.js (Webサーバー): フロントエンドとAPIエンドポイントを提供。Django (APIサーバー): バックエンドのロジックとデータベースとのやり取りを担う。MySQL: データを永続化するデータベース。Certbot: Let's Encryptを使用してSSL証明書を自動で取得・更新する。この構成により、セキュリティとメンテナンス性が向上します。2. 事前準備ドメインの取得:お好みのドメインレジストラでドメインを取得します。DNS設定で、AレコードをEC2インスタンスのElastic IPに紐づけます。EC2インスタンスの作成:UbuntuなどのLinuxベースのOSを選択します。セキュリティグループを設定し、以下のポートを開放します。SSH (22): サーバー管理用HTTP (80): 証明書取得とHTTP通信用HTTPS (443): 暗号化された通信用SSH接続用のキーペアを準備し、インスタンスにElastic IPを割り当てます。EC2へのSSH接続とDockerのインストール:準備したキーペアとElastic IPを使ってEC2にSSH接続します。ssh -i /path/to/your-key.pem ubuntu@your-ec2-elastic-ip
以下のコマンドでDockerとDocker Composeをインストールします。# Dockerをインストール
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker ubuntu

# Docker Composeをインストール
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
usermodコマンド実行後、一度SSH接続を切り、再接続してください。3. プロジェクトファイルの準備ローカル環境のファイルをEC2にアップロードします。SSH経由でのファイル転送:ローカルPCからscpコマンドを使ってプロジェクト全体をEC2にコピーします。scp -i /path/to/your-key.pem -r /path/to/your-project ubuntu@your-ec2-elastic-ip:~
4. Docker Composeファイル (docker-compose.yml) の作成プロジェクトのルートディレクトリに、以下のdocker-compose.ymlファイルを作成します。今回はNginxとCertbotを追加します。version: '3.8'

services:
  # Next.jsアプリケーションのサービス
  nextjs:
    build:
      context: ./nextjs-app
      dockerfile: Dockerfile
    container_name: nextjs_app
    restart: always
    expose:
      - "3000"  # Nginxからのアクセス用
    depends_on:
      - django
    environment:
      - NEXT_PUBLIC_DJANGO_API_URL=http://django:8000/api
    networks:
      - app-network

  # Djangoアプリケーションのサービス
  django:
    build:
      context: ./django-app
      dockerfile: Dockerfile
    container_name: django_api
    restart: always
    expose:
      - "8000"
    depends_on:
      - mysql
    environment:
      - DATABASE_HOST=mysql
      - DATABASE_NAME=mydatabase
      - DATABASE_USER=user
      - DATABASE_PASSWORD=password
    command: python manage.py runserver 0.0.0.0:8000
    networks:
      - app-network

  # MySQLデータベースのサービス
  mysql:
    image: mysql:8.0
    container_name: mysql_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: mydatabase
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

  # Nginxリバースプロキシのサービス
  nginx:
    image: nginx:1.21-alpine
    container_name: nginx_proxy
    restart: always
    ports:
      - "80:80"   # HTTP
      - "443:443" # HTTPS
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/www/certbot
    depends_on:
      - nextjs
    networks:
      - app-network

  # Certbotのサービス
  certbot:
    image: certbot/certbot
    container_name: certbot_manager
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email --staging -d your-domain.com -d www.your-domain.com
    networks:
      - app-network

# ネットワーク定義
networks:
  app-network:
    driver: bridge

# ボリューム定義
volumes:
  mysql_data:
  certbot-etc:
  certbot-var:
5. DockerfileとNginx設定ファイルの作成Next.js用Dockerfile (./nextjs-app/Dockerfile)FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
Django用Dockerfile (./django-app/Dockerfile)FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py makemigrations
RUN python manage.py migrate
EXPOSE 8000
Nginx設定ファイル (./nginx/nginx.conf)プロジェクトのルートにnginxディレクトリを作成し、その中に以下の内容でnginx.confファイルを作成します。server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    server_tokens off;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    server_tokens off;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
your-domain.comを実際のドメインに、your-email@example.comを実際のメールアドレスに置き換えてください。注意: Certbotの--stagingオプションはテスト用です。本番環境ではこのオプションを削除してください。6. SSL証明書の取得とデプロイコンテナをビルド・起動 (証明書取得用):certbotコンテナのcommandがcertonlyになっていることを確認します。sudo docker-compose up -d
このコマンドで、NginxとCertbotが起動し、自動的に証明書が取得されます。sudo docker-compose logs certbotでログを確認し、Congratulations!のメッセージが表示されていることを確認します。証明書取得コマンドの更新:docker-compose.yml内のcertbotサービスを以下のように変更します。--stagingオプションを削除し、証明書の自動更新を設定します。certbot:
  image: certbot/certbot
  container_name: certbot_manager
  restart: always
  volumes:
    - certbot-etc:/etc/letsencrypt
    - certbot-var:/var/www/certbot
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $!; done;'"
  networks:
    - app-network
すべてのコンテナを再起動:Nginxが新しい証明書を読み込むために再起動します。sudo docker-compose down
sudo docker-compose up --build -d
7. トラブルシューティング証明書が取得できない:セキュリティグループのポート80が開放されているか確認します。DNS設定が正しく反映されているか確認します。ping your-domain.comでEC2のIPが返ってくるかテストします。サイトにアクセスできない:sudo docker-compose logs nginxでNginxのログを確認します。ポート443がEC2のセキュリティグループで開放されているか確認します。これで、本番環境で安全に動作するDockerコンテナのWebアプリケーションが完成です。
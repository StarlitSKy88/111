#!/bin/bash
# ONE-MCN HTTPS 配置（Let's Encrypt via certbot）
set -euo pipefail

DOMAIN=${1:-api.onemcn.com}
EMAIL=${2:-admin@onemcn.com}

# 安装 certbot（如未装）
which certbot || brew install certbot

# 申请证书
sudo certbot certonly --standalone -d "$DOMAIN" --email "$EMAIL" --agree-tos

# nginx 配置（参考）
cat > /tmp/nginx-onemcn.conf <<NGINX
server {
  listen 443 ssl http2;
  server_name $DOMAIN;
  ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
  }
}
NGINX

echo "[$(date)] ✅ HTTPS setup OK for $DOMAIN"

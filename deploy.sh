#!/bin/bash
# 自动部署脚本：提交到Git并同步到SSH服务器

DEPLOY_HOST="43.160.213.118"
DEPLOY_USER="ubuntu"
DEPLOY_KEY="/Users/opc-1/Downloads/miyao/hermes.pem"
DEPLOY_PATH="opcone"

# 获取所有已修改的文件
CHANGED_FILES=$(git status --porcelain | grep "^ M" | cut -c4-)

if [ -z "$CHANGED_FILES" ] && [ -z "$(git status --porcelain | grep "^?")" ]; then
  echo "没有需要部署的更改"
  exit 0
fi

# Git提交
git add -A
git commit -m "chore: update nodes - $(date '+%Y-%m-%d %H:%M')"

# 推送到GitHub
git push origin main

# 同步到服务器 (直接同步到nginx文档根目录)
rsync -avz --delete -e "ssh -i ${DEPLOY_KEY} -o StrictHostKeyChecking=no" \
  --exclude='node_modules/' \
  --exclude='.git/' \
  --exclude='.ralph/' \
  --exclude='.playwright-mcp/' \
  --exclude='api/node_modules/' \
  --exclude='admin-app/node_modules/' \
  ./ ${DEPLOY_USER}@${DEPLOY_HOST}:/var/www/html/

echo "部署完成: $(date)"
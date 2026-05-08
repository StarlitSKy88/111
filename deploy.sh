#!/bin/bash
# 自动部署脚本：提交到Git并同步到SSH服务器

DEPLOY_HOST="121.41.68.222"
DEPLOY_USER="root"
DEPLOY_PATH="/www/opcone"

# 获取所有已修改的文件
CHANGED_FILES=$(git status --porcelain | grep "^ M" | cut -c4-)

if [ -z "$CHANGED_FILES" ]; then
  echo "没有需要部署的更改"
  exit 0
fi

# Git提交
git add $CHANGED_FILES
git commit -m "chore: update nodes - $(date '+%Y-%m-%d %H:%M')"

# 推送到GitHub
git push origin main

# 同步到服务器
rsync -avz --delete -e "ssh -i ~/.ssh/tentcent_cloud" \
  --exclude='node_modules/' \
  --exclude='.git/' \
  --exclude='.ralph/' \
  --exclude='api/node_modules/' \
  --exclude='admin-app/node_modules/' \
  ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/

echo "部署完成: $(date)"
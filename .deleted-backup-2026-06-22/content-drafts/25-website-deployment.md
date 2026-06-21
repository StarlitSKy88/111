---
node_id: 25
persona: neutral
cta_type: wechat
keywords: [安装, 步骤, 分钟, 云服务器, 你的域名]
---

# 节点25：网站部署与SSL

> **面向OPC**：代码在本地跑得好好的，现在要让全世界都能访问。2026年OPC部署只有两条路——选Vercel（零运维）或选云服务器（完全控制）。本节点给你两条路的完整走法。

---

## 一、Vercel vs 云服务器：OPC的终极选择

| 维度 | Vercel | 阿里云/腾讯云轻量服务器 |
|---|---|---|
| **部署方式** | `git push` 自动部署 | SSH手动上传 / Git CI/CD |
| **月费** | 免费（个人版） | ¥24起（2核2G） |
| **SSL证书** | 自动配置+续期 | 手动申请（免费Let's Encrypt） |
| **ICP备案** | 不需要（服务器在海外） | 必须备案 |
| **国内访问速度** | 中等（CDN节点在日韩） | 快（国内节点） |
| **数据库** | 需外挂Supabase/PlanetScale | 可自建 |
| **运维工作** | 零 | 需要配Nginx、防火墙、日志 |

**决策口诀**：
- 你的用户全在国内，对速度要求高 → 云服务器
- 你的用户有海外，你不想碰运维 → Vercel
- 你需要微信小程序 → 云服务器（小程序要求国内服务器+备案）

---

## 二、路径A：Vercel部署（5分钟上线）

### 一步部署

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 在项目目录执行
vercel

# 3. 按提示操作：
#    - 登录（用GitHub账号）
#    - 确认项目目录
#    - 确认构建命令（纯静态选"无"）
#    - 确认输出目录

# 4. 得到 https://你的项目名.vercel.app
```

### 绑定自定义域名

```bash
# Vercel Dashboard → Settings → Domains → 添加你的域名
# 然后去域名DNS添加一条CNAME记录指向 cname.vercel-dns.com
```

**SSL证书自动生成，5分钟内生效。** 完全免费。

---

## 三、路径B：云服务器部署（完整控制）

### 步骤1：买服务器+登录（10分钟）

阿里云/腾讯云 → 轻量应用服务器 → 选最低配（2核2G，¥24/月）→ 镜像选 Ubuntu 22.04。

```bash
ssh root@你的服务器IP
```

### 步骤2：安装环境（15分钟）

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js 20（2026年LTS版本）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装Nginx
apt install -y nginx

# 安装PM2（让Node.js进程在后台持续运行）
npm i -g pm2

# 安装Git
apt install -y git
```

### 步骤3：部署代码（5分钟）

```bash
# 克隆代码到服务器
cd /var/www
git clone 你的仓库地址 opcone
cd opcone
npm install

# 用PM2启动
pm2 start api/analyze.js --name opcone-api
pm2 save
pm2 startup  # 设置开机自启
```

### 步骤4：配置Nginx（10分钟）

```nginx
# /etc/nginx/sites-available/opcone
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;

    root /var/www/opcone;
    index index.html;

    # 静态文件直接返回
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

```bash
# 启用配置
ln -s /etc/nginx/sites-available/opcone /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 步骤5：配置SSL证书（5分钟）

```bash
# 使用Certbot自动获取Let's Encrypt免费证书
apt install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名.com -d www.你的域名.com

# 证书会在到期前自动续期
```

---

## 四、部署后的安全必做项

```bash
# 1. 配置防火墙
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable

# 2. 禁止root SSH密码登录（改用密钥）
# 编辑 /etc/ssh/sshd_config
# PasswordAuthentication no
# systemctl restart sshd

# 3. 设置自动安全更新
apt install -y unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

---

## 五、检查清单

- [ ] 网站通过域名可正常访问
- [ ] HTTPS正常（浏览器地址栏有🔒图标）
- [ ] 强制HTTP跳转HTTPS
- [ ] 防火墙已开启（仅开放22/80/443端口）
- [ ] PM2已设置开机自启
- [ ] SSL证书自动续期已配置

---

## 节点资源链接

- 节点24：域名购买与ICP备案
- 节点26：审核材料准备
- 节点27：上线前检查清单

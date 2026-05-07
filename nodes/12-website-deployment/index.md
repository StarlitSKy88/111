# 网站部署与SSL

## 需求文档

### 基本信息
- **节点ID**: 12
- **slug**: website-deployment
- **分类**: 0-1
- **难度**: 进阶
- **咨询价格**: ¥299

## 当前内容

### 概述

网站做出来了，怎么让它在互联网上被人访问？这就是"部署"要解决的问题。2026年的部署已经非常简单：云服务器 + 一键部署 + 自动HTTPS，10分钟就能让网站上线。但很多OPC创业者卡在这一步——不知道买什么服务器、不知道怎么配置域名、不会给网站安装SSL证书。本节点用最简单的方式，把这三件事讲清楚。核心目标：**看完就能上线，上线就能访问，访问就是安全的HTTPS。**

### 详细说明

#### 一、云服务器选择：OPC应该买什么样的服务器

**1.1 服务器类型对比**

| 类型 | 代表产品 | 价格 | 适用场景 | 推荐指数 |
|:---|:---|:---|:---|:---:|
| **轻量应用服务器** | 阿里云轻量应用服务器、腾讯云轻量服务器 | 99-300元/年 | 入门网站、小型应用 | ★★★★★ |
| **云服务器ECS** | 阿里云ECS、腾讯云CVM | 300-2000元/年 | 中型网站、需要SSH管理 | ★★★★ |
| **VPS** | 传统VPS | 50-200元/月 | 有技术背景的开发者 | ★★★ |
| **静态网站托管** | Vercel、Netlify、Cloudflare Pages | 免费 | 纯静态网站（Hugo/Next.js） | ★★★★ |

**OPC推荐**：阿里云轻量应用服务器（适合新手）或 Vercel/Netlify（适合前端技术背景）。

**1.2 阿里云轻量应用服务器购买步骤**

1. 登录阿里云官网 → 选择"产品" → "轻量应用服务器"
2. 选择配置（入门推荐：2核2G，99元/年）
3. 选择地域（选择离你的用户最近的地域，例如华东用户选上海，华南选广州）
4. 选择系统镜像（Ubuntu 22.04 或 CentOS 8，推荐 Ubuntu，更通用）
5. 设置root密码（务必记住，后面SSH登录需要）
6. 购买并支付

**购买后的关键信息**：
- 公网IP地址（用于DNS解析）
- SSH登录密码（用于远程连接服务器）

**1.3 如果使用Vercel（适合前端项目）**

如果你的网站是纯静态的（HTML/CSS/JS）或使用Next.js/Hugo等框架构建，Vercel是最好的选择：

1. 注册 Vercel 账号（GitHub账号直接登录）
2. 点击"New Project" → 导入GitHub仓库
3. 自动构建和部署，分配一个 .vercel.app 的免费域名
4. 自定义域名：在DNS中添加CNAME记录指向 cname.vercel-dns.com

**Vercel的优势**：
- 免费版足够小型网站使用
- 自动配置SSL证书
- 全球CDN加速
- GitHub推送自动部署

#### 二、服务器环境配置：Linux基础操作

**2.1 SSH连接服务器**

SSH（Secure Shell）是连接远程服务器的标配方式。

**Windows用户**：下载并安装 Xshell 或 MobaXterm，或者使用 Windows 11 自带的 OpenSSH。

**Mac/Linux用户**：直接打开终端。

**连接命令**：
```bash
ssh root@你的服务器IP
# 例如: ssh root@123.45.67.89
# 输入密码（输入时屏幕不显示字符，正常现象）
```

**连接成功后，你会看到类似这样的提示符**：
```
root@iZ123456789:~#
```

**2.2 安装必要软件（Nginx + Node.js + PM2）**

**更新系统软件包**：
```bash
apt update && apt upgrade -y
```

**安装Nginx（Web服务器）**：
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

**安装Node.js（推荐使用nvm管理）**：
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# 退出重新登录，或者执行:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
```

**安装PM2（Node进程管理器）**：
```bash
npm install -g pm2
pm2 startup
```

**2.3 防火墙配置**

确保80端口（HTTP）和443端口（HTTPS）已开放：
```bash
# 查看防火墙状态
ufw status

# 开放端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH端口也要开放

# 重启防火墙
ufw reload
```

#### 三、项目部署：从上传到访问的全流程

**3.1 方式一：直接上传文件（适合静态网站）**

**上传工具**：使用scp命令或FileZilla等FTP工具。

**scp上传示例**：
```bash
# 从本地上传整个文件夹到服务器
scp -r ./my-website root@123.45.67.89:/var/www/
```

**Nginx配置**：上传后，配置Nginx指向你的网站目录。
```bash
# 编辑Nginx配置
vi /etc/nginx/sites-available/default

# 修改root路径为:
root /var/www/my-website;

# 测试配置并重启
nginx -t
systemctl restart nginx
```

**3.2 方式二：Git部署（适合动态网站）**

如果你的项目使用Git管理，可以在服务器上直接拉取代码：

```bash
# 在服务器上安装Git
apt install git -y

# 克隆你的项目
cd /var/www
git clone https://github.com/your-username/your-project.git

# 安装依赖
cd your-project
npm install

# 使用PM2启动
pm2 start npm --name "my-app" -- start

# 查看运行状态
pm2 status
```

**3.3 宝塔面板：可视化服务器管理（推荐新手）**

宝塔面板是一个免费的服务器管理工具，提供了可视化界面来管理服务器、文件、数据库、Nginx等。

**安装宝塔**：
```bash
# SSH连接到服务器后执行
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh
bash install.sh
```

安装完成后，你会得到一个登录地址和初始用户名/密码。

**宝塔面板的功能**：
- 可视化文件管理（上传、编辑、压缩）
- 一键安装Nginx、MySQL、PHP、Node.js等
- 站点管理（添加网站、配置SSL）
- 数据库管理（phpMyAdmin）
- 防火墙设置

**宝塔注意事项**：
- 首次登录需要绑定手机号
- 需要开放8888端口（宝塔面板访问端口）
- 定期更新面板和软件，确保安全

#### 四、SSL证书：从HTTP到HTTPS

**4.1 为什么必须有HTTPS**

- **数据加密**：防止用户数据被窃取（尤其是登录信息、支付信息）
- **身份验证**：证明你的网站是"你的网站"，防止被劫持
- **SEO加分**：百度、谷歌明确表示HTTPS是排名因素之一
- **浏览器信任**：Chrome会对HTTP网站显示"不安全"警告

**4.2 Let's Encrypt免费SSL（推荐）**

Let's Encrypt提供永久免费的SSL证书，是OPC的最佳选择。

**使用 Certbot 安装**：
```bash
# 安装Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书（自动配置Nginx）
certbot --nginx -d opcone.cn -d www.opcone.cn

# 自动续期（Let's Encrypt证书90天过期，Certbot会自动续期）
systemctl enable certbot.timer
```

**成功后的标志**：
- 访问你的网站，浏览器地址栏显示绿色锁标志
- URL从 http://opcone.cn 变成 https://opcone.cn

**4.3 阿里云免费SSL**

如果使用阿里云服务器，可以直接在阿里云申请免费SSL：

1. 登录阿里云控制台 → "安全" → "SSL证书"
2. 选择"免费证书" → "立即购买"
3. 添加域名（需要验证域名所有权）
4. 下载证书文件，上传到服务器
5. 配置Nginx使用证书

**Nginx配置HTTPS**：
```nginx
server {
    listen 443 ssl;
    server_name opcone.cn www.opcone.cn;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/cert.key;

    root /var/www/your-site;
    index index.html;
}

# HTTP自动跳转HTTPS
server {
    listen 80;
    server_name opcone.cn www.opcone.cn;
    return 301 https://$server_name$request_uri;
}
```

#### 五、自动化部署：从GitHub推送自动更新网站

**5.1 Webhook自动化部署**

Webhook是一种机制：当GitHub仓库有新的推送时，自动通知你的服务器拉取最新代码。

**服务器端设置**：
```bash
# 创建一个用于接收Webhook的脚本
vi /var/www/webhook.sh
```
```bash
#!/bin/bash
cd /var/www/your-project
git pull origin main
pm2 restart your-app
```

```bash
chmod +x /var/www/webhook.sh
```

**GitHub端设置**：
1. 进入GitHub仓库 → Settings → Webhooks → Add webhook
2. Payload URL填写你的服务器地址，如：https://opcone.cn/webhook
3. Content type选择 application/json
4. Secret填写一个随机字符串（服务器端也要保存同样的字符串来验证）
5. 触发事件选择"Just the push event"

**5.2 使用GitHub Actions自动化部署**

对于Node.js项目，可以在GitHub Actions中自动构建和部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          npm ci
          npm run build
      - name: Deploy to Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: root
          password: ${{ secrets.SERVER_PASSWORD }}
          source: "./dist/*"
          target: /var/www/your-project
```

#### 六、实际案例：OPC节点百科部署全流程

**背景**：OPC节点百科需要部署在阿里云轻量应用服务器上，域名为 opcone.cn，使用Nginx作为Web服务器，配置HTTPS。

**步骤1：购买并初始化服务器**
- 购买阿里云轻量应用服务器（2核2G，99元/年），系统Ubuntu 22.04
- SSH连接服务器，执行系统更新和基础软件安装

**步骤2：安装Nginx和配置站点**
- 安装Nginx，创建站点配置 /etc/nginx/sites-available/opcone
- 配置root路径指向 /var/www/opcone
- 启用配置并重启Nginx

**步骤3：上传网站文件**
- 将编译好的静态文件通过scp上传到 /var/www/opcone
- 或者使用Git克隆仓库，配置自动部署

**步骤4：申请并配置SSL证书**
- 使用Certbot申请Let's Encrypt免费证书
- 自动配置Nginx的HTTPS设置
- 验证 https://opcone.cn 可以正常访问

**步骤5：配置域名DNS**
- 在阿里云域名控制台添加A记录
- 主机记录@指向服务器IP
- 主机记录www也指向同一IP

**步骤6：配置自动部署**
- 在GitHub仓库配置Webhook
- 服务器接收推送后自动git pull并pm2 restart

**常见问题排查**：
- 502 Bad Gateway：检查PM2是否运行，端口是否正确
- 连接被拒绝：检查防火墙是否开放了对应端口
- SSL证书无效：检查证书路径是否正确，域名是否匹配

### 常见问题

**Q1: 服务器应该买多大的配置？**

A: 对于大多数OPC网站，2核2G完全够用。如果流量大或需要运行数据库，升级到4核4G即可。不建议一开始买过高配置，浪费成本。

**Q2: 服务器需要多久维护一次？**

A: 对于静态网站或Node.js小应用，每月维护一次即可：更新系统包、检查SSL证书过期、检查磁盘空间。推荐使用监控工具（如阿里云云监控）自动告警。

**Q3: 网站突然打不开了怎么办？**

A: 排查步骤：1）ping服务器IP是否通；2）检查Nginx是否运行（systemctl status nginx）；3）检查PM2是否运行（pm2 status）；4）查看日志（pm2 logs）

**Q4: HTTP自动跳转HTTPS怎么配置？**

A: 在Nginx配置中添加：return 301 https://$server_name$request_uri;

**Q5: 免费SSL证书能用多久？**

A: Let's Encrypt证书有效期90天，但Certbot会自动续期，所以你永远不需要手动续期。

**Q6: 网站加载很慢怎么办？**

A: 优化方案：1）启用Gzip压缩（Nginx配置）；2）静态资源开启CDN；3）图片压缩优化；4）使用浏览器缓存（Cache-Control）；5）考虑升级服务器带宽。

**Q7: 可以不用域名直接用IP访问吗？**

A: 可以，但用户体验差（用户记不住IP），也不利于SEO。域名是必须项。

**Q8: 部署需要多少费用？**

A: 阿里云轻量应用服务器99元/年，域名38元/年，SSL免费。总计约137元/年。

### 相关资源

- [OPC节点百科·完整地图](index.html) — 查看全部40个节点
- [GStack需求梳理方法论](https://gstack.cn) — 系统化需求梳理框架
- [一人公司创业模型白皮书2026](docs/opc-whitepaper-2026.pdf) — OPC创业完整路径

---

*本文档由 OPC节点百科 AI内容引擎 生成*
*版本: v1.0*
*最后更新: 2026-05-07*
*AI模型: deepseek-v4-flash*
*审核状态: 待人工审核*
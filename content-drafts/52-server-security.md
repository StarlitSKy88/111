# 节点52：服务器安全

> **面向OPC**：你的产品在服务器上跑着，里面有用户的邮箱、密码、支付记录。一个漏洞=所有用户数据泄露=你的生意结束。本节点告诉你一个人怎么守住服务器。

---

## 一、2026年OPC的最低安全基线

### 五条不做就会死的安全规则

| 规则 | 不做会怎样 |
|---|---|
| **SSH禁用密码登录，只用密钥** | 被暴力破解→服务器变矿机 |
| **所有对外服务只开必要端口** | 多余的端口=多余的攻击面 |
| **数据库不暴露在公网** | 被拖库→用户数据泄露 |
| **HTTPS强制启用** | 中间人攻击→用户密码被窃 |
| **定期更新系统和依赖** | 已知漏洞被利用→入侵 |

---

## 二、30分钟完成基础加固

### 第1步：SSH加固（5分钟）

```bash
# 1. 生成本地密钥对
ssh-keygen -t ed25519 -C "你的邮箱"

# 2. 上传公钥到服务器
ssh-copy-id root@你的服务器IP

# 3. 禁止密码登录
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 第2步：防火墙配置（5分钟）

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 第3步：自动安全更新（2分钟）

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades  # 选"Yes"
```

### 第4步：数据库安全（10分钟）

```sql
-- Supabase 的 Row Level Security 必须开启
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 每个表定义谁能读、谁能写
CREATE POLICY "用户读自己的数据" ON users
  FOR SELECT USING (auth.uid() = id);

-- 敏感字段不要返回给前端
-- 查询时永远不要 select * 如果包含密码/密钥字段
```

### 第5步：环境变量管理（3分钟）

```bash
# ❌ 绝不要在代码里写：
const API_KEY = "sk-xxxxx";

# ✅ 用环境变量：
const API_KEY = process.env.API_KEY;

# .env 文件必须加入 .gitignore
echo ".env" >> .gitignore
```

---

## 三、2026年免费安全工具

| 工具 | 做什么 | 怎么用 |
|---|---|---|
| **Lynis** | 安全审计（扫描服务器找漏洞） | `sudo apt install lynis && sudo lynis audit system` |
| **Cloudflare** | DDoS防护+CDN+WAF | 免费计划，域名DNS切到Cloudflare |
| **SSL Labs** | HTTPS配置评分 | [ssllabs.com](https://www.ssllabs.com/ssltest/) 输入域名 |
| **Have I Been Pwned** | 检查域名是否泄露 | [haveibeenpwned.com](https://haveibeenpwned.com/domain/你的域名) |

---

## 四、被入侵的三个信号（发现后立刻处理）

| 信号 | 可能发生了什么 | 立刻做什么 |
|---|---|---|
| CPU突然100% | 被装了挖矿程序 | `top` 查异常进程 → `kill` → 改密码 → 查SSH登录日志 |
| 数据库多了不认识的表 | 数据库被注入/拖库 | 立刻下线 → 从备份恢复 → 查API日志找注入点 |
| 用户反馈收到垃圾邮件 | 邮件服务器被利用 | 改邮箱密码 → 检查转发规则 |

---

## 五、OPC不需要做的安全措施（省时间）

| 你以为需要 | 实际上不需要 | 省下时间 |
|---|---|---|
| 买商业防火墙 | Cloudflare免费WAF够用 | 省¥5000/年 |
| 请安全公司做渗透测试 | 日活<1000不需要 | 省¥20000/次 |
| 做SOC2/ISO27001认证 | 没有企业客户要求就别做 | 省半年 |
| 自建堡垒机 | SSH密钥+Fail2ban够用 | 省1周 |

---

## 六、检查清单

- [ ] SSH只允许密钥登录
- [ ] 防火墙仅开放22/80/443
- [ ] 系统自动安全更新已配置
- [ ] Supabase RLS已全部开启
- [ ] .env在.gitignore中
- [ ] SSL Labs评分≥A
- [ ] 数据库有定期备份

---

## 节点资源链接

- 节点51：数据备份
- 节点25：网站部署与SSL
- 节点50：广告法合规

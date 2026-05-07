# 服务器安全防护

## 需求文档

### 基本信息
- **节点ID**: 31
- **slug**: server-security
- **分类**: 1-10
- **难度**: 高级
- **咨询价格**: ¥399

## 当前内容

### 概述

网站上线后，就会成为黑客攻击的目标。常见的攻击类型包括：暴力破解密码、DDoS攻击、SQL注入、XSS跨站脚本、 webshell上传等。本节点详解服务器安全防护的核心措施：防火墙配置、最小权限原则、安全监控、漏洞修复。保护好服务器，就是保护你的业务。

### 详细说明

#### 一、服务器安全基础

**1.1 安全原则**

| 原则 | 说明 | 操作 |
|:---|:---|:---|
| **最小权限** | 只开放必要的端口和服务 | 关闭不必要的服务 |
| **纵深防御** | 多层防护，一层被破还有下一层 | 防火墙+安全组+系统权限 |
| **持续监控** | 及时发现异常行为 | 日志分析+告警 |
| **快速响应** | 发现攻击立即处理 | 安全预案+快速修复 |

**1.2 常见攻击类型**

| 攻击类型 | 原理 | 后果 |
|:---|:---|:---|
| **暴力破解** | 用工具尝试大量密码组合 | 账户被入侵 |
| **DDoS** | 大量请求让服务器瘫痪 | 网站无法访问 |
| **SQL注入** | 在表单输入恶意SQL代码 | 数据库被拖库 |
| **XSS** | 在页面嵌入恶意脚本 | 用户信息被盗 |
| ** webshell** | 上传恶意脚本文件 | 服务器被控 |

#### 二、防火墙配置

**2.1 端口管理**

只开放必要的端口：

| 端口 | 服务 | 是否必须开放 |
|:---|:---|:---:|
| 22 | SSH | 是（但限制IP） |
| 80 | HTTP | 是 |
| 443 | HTTPS | 是 |
| 3306 | MySQL | 否（仅本地访问） |
| 6379 | Redis | 否（仅本地访问） |

**2.2 UFW防火墙（Ubuntu）**

```bash
# 安装UFW
sudo apt install ufw

# 默认拒绝所有入站
sudo ufw default deny incoming

# 允许SSH（限制IP）
sudo ufw allow from 你的IP to any port 22

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

**2.3 云服务器安全组（阿里云/腾讯云）**

在云控制台配置安全组，只开放必要端口：
- SSH：限制来源IP
- Web服务：80/443对所有开放
- 数据库：禁止外部访问

#### 三、SSH安全

**3.1 SSH密钥登录**

禁用密码登录，使用密钥：

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096

# 上传公钥到服务器
ssh-copy-id user@your-server

# 修改SSH配置
sudo vi /etc/ssh/sshd_config
# 设置：
# PasswordAuthentication no
# PubkeyAuthentication yes
# PermitRootLogin no

# 重启SSH服务
sudo systemctl restart sshd
```

**3.2 SSH端口修改**

默认22端口是暴力破解的目标，修改为其他端口：

```bash
# 编辑 /etc/ssh/sshd_config
Port 2222  # 修改默认端口

# 重启服务
sudo systemctl restart sshd
```

**3.3 Fail2Ban防暴力破解**

安装Fail2Ban，自动封禁多次登录失败的IP：

```bash
sudo apt install fail2ban

# 启动并启用
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 四、Web服务安全

**4.1 Nginx安全配置**

```nginx
# 隐藏版本号
server_tokens off;

# 禁止访问敏感目录
location ~ /\. {
    deny all;
}

# 限制请求大小
client_max_body_size 10M;

# 防止常见攻击
location ~* \.(sql|bak|config|conf|ini|log|sh|sql|swp|yaml|zip)$ {
    deny all;
}
```

**4.2 防止SQL注入**

- 后端代码使用参数化查询（Prepared Statements）
- 避免字符串拼接SQL
- 定期检查日志中的异常SQL

**4.3 防止XSS攻击**

- 输出时转义HTML
- 设置Content-Security-Policy头
- 使用WAF（Web应用防火墙）

#### 五、安全监控与响应

**5.1 日志监控**

开启并定期检查日志：

| 日志 | 路径 | 关注内容 |
|:---|:---|:---|
| SSH登录日志 | /var/log/auth.log | 失败登录尝试 |
| Nginx访问日志 | /var/log/nginx/access.log | 异常访问模式 |
| 系统日志 | /var/log/syslog | 异常进程/服务 |

**5.2 异常告警**

使用监控工具（如阿里云安骑士）设置告警：
- SSH异地登录告警
- 大量失败登录告警
- CPU/内存异常告警
- 文件被修改告警

**5.3 安全应急响应**

发现被入侵时的处理流程：

1. **隔离**：立即断开服务器网络，防止扩散
2. **排查**：检查日志，找到入侵路径
3. **清理**：删除恶意文件、封堵漏洞
4. **恢复**：从备份恢复干净的系统和数据
5. **复盘**：总结原因，加强防护

#### 六、SSL/TLS安全

**6.1 使用强加密套件**

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
```

**6.2 强制HTTPS**

```nginx
# HTTP跳转HTTPS
return 301 https://$server_name$request_uri;
```

**6.3 证书管理**

- 使用Let's Encrypt免费证书（90天有效期）
- 设置自动续期（Certbot自动续期）
- 证书过期前手动检查续期

### 常见问题

**Q1: 服务器被黑了怎么办？**

A: 立即断开网络 → 备份当前状态（用于分析）→ 重新构建干净系统 → 恢复数据 → 加强防护。必要时请专业安全公司协助。

**Q2: 如何防止DDoS攻击？**

A: ① 使用云服务商DDoS防护（如阿里云DDoS防护）；② 限制单个IP请求频率；③ 配置WAF；④ 事前扩容带宽。

**Q3: 密码应该多久换一次？**

A: 如果使用强密码（12位以上，无规律），可以每6个月-1年换一次。更重要的是开启密钥登录，禁用密码登录。

**Q4: 怎么知道服务器是否被攻击？**

A: ① 监控登录日志中的异常；② 监控流量异常（CPU/带宽突增）；③ 使用安全扫描工具定期检查；④ 订阅乌云补天等漏洞情报平台。

**Q5: 服务器需要安装杀毒软件吗？**

A: Linux服务器通常不需要传统杀毒软件，但需要：① 定期更新系统补丁；② 使用WAF防护Web攻击；③ 监控异常进程；④ 使用安全基线检查（如Lynis）。

**Q6: 如何防止Webshell上传？**

A: ① 限制上传文件类型；② 文件上传目录禁止执行；③ 使用WAF过滤；④ 定期检查服务器是否有可疑文件。

### 相关资源

- [OPC节点百科·完整地图](index.html)
- [GStack需求梳理方法论](https://gstack.cn)
- [一人公司创业模型白皮书2026](docs/opc-whitepaper-2026.pdf)

---

*本文档由 OPC节点百科 AI内容引擎 生成*
*版本: v1.0*
*最后更新: 2026-05-07*
*AI模型: deepseek-v4-flash*
*审核状态: 待人工审核*
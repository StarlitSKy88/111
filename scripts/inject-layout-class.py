#!/usr/bin/env python3
"""
给 57 节点的 <div class="layout"> 容器追加 layout-{type} class
仅修改顶层 <div class="layout">（第一个匹配），不影响其他 .layout 子容器
"""
import os, re

NODES_DIR = "/Users/opc-1/Downloads/O/opcone/nodes"

# 节点 → 布局类型（与 apply-layout-classes.py 同步）
LAYOUT_MAP = {
    "01-opc-fit-test": "classic", "02-personal-resources": "classic",
    "03-problem-definition": "classic", "04-prototype": "classic",
    "05-mvp-scope": "classic", "06-tech-selection": "classic",
    "07-dev-environment": "steps", "08-hello-world": "steps",
    "09-git-version": "classic", "10-backend-connect": "steps",
    "11-auth-system": "classic", "12-core-feature-1": "classic",
    "13-core-feature-2": "classic", "14-data-display": "classic",
    "15-core-feature-3": "classic", "16-payment-code": "tools",
    "17-payment-access": "tools", "18-developer-testing": "classic",
    "19-friend-testing": "classic", "20-bug-fix": "classic",
    "21-performance": "classic", "22-launch-content": "steps",
    "23-company-registration": "policy", "24-domain-icp": "policy",
    "25-website-deployment": "steps", "26-audit-material": "policy",
    "27-launch-checklist": "steps", "28-audit-submit": "policy",
    "29-audit-fix": "policy", "30-official-launch": "steps",
    "31-analytics": "classic", "32-cold-start": "steps",
    "33-content-marketing": "classic", "34-feedback": "steps",
    "35-private-traffic": "steps", "36-ai-customer-service": "classic",
    "37-customer-objections": "classic", "38-pricing": "calc",
    "39-advertising": "classic", "40-referral": "classic",
    "41-product-iteration": "steps", "42-income-diversification": "classic",
    "43-exit-plan": "classic", "44-bank-account": "tools",
    "45-tax-invoice": "policy", "46-cashflow": "calc",
    "47-business-email": "tools", "48-trademark": "policy",
    "49-copyright": "policy", "50-ad-compliance": "policy",
    "51-data-backup": "tools", "52-server-security": "tools",
    "53-global-payment": "tools", "54-wechat-miniapp": "tools",
    "55-outsourcing": "tools", "56-energy-management": "classic",
    "57-government-policy": "policy",
}

processed = 0
errors = []

for node_dir, layout in LAYOUT_MAP.items():
    fpath = os.path.join(NODES_DIR, node_dir, "index.html")
    if not os.path.exists(fpath):
        errors.append(fpath); continue

    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # 跳过已处理的
    if f"layout-{layout}" in content:
        continue

    # 替换第一个 <div class="layout"> 开头
    # 兼容 <div class="layout"> / <div class="layout ">/ <div class="layout xxx"...>
    pattern = r'(<div\s+class=")layout(")'
    new_content, n = re.subn(pattern, rf'\1layout layout-{layout}\2', content, count=1)

    if n == 0:
        # 试不同写法
        pattern2 = r'(<div\s+class=")layout(\s)("?)'
        new_content, n = re.subn(pattern2, rf'\1layout layout-{layout}\2\3', content, count=1)
        if n == 0:
            # 看节点用什么 class
            errors.append(f"{node_dir}: no .layout div found")
            continue

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(new_content)
    processed += 1

print(f"Processed: {processed}")
print(f"Errors: {len(errors)}")
for e in errors[:10]:
    print(f"  - {e}")

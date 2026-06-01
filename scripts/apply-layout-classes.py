#!/usr/bin/env python3
"""
批量为 57 节点注入 layout class + 共享 CSS 引用
- 在 <head> 注入 <link rel="stylesheet" href="../_design-tokens.css"> + 模板 css
- 在 <body> 第一个 <div class="layout"...> 后追加 layout 类型 class
- 不改任何内容
"""
import os, re, sys

NODES_DIR = "/Users/opc-1/Downloads/O/opcone/nodes"

# 节点 → 布局类型映射（基于内容性质）
LAYOUT_MAP = {
    # L1 classic — 概念/方法论
    "01-opc-fit-test": "classic",
    "02-personal-resources": "classic",
    "03-problem-definition": "classic",
    "04-prototype": "classic",
    "05-mvp-scope": "classic",
    "06-tech-selection": "classic",
    "09-git-version": "classic",
    "11-auth-system": "classic",
    "12-core-feature-1": "classic",
    "13-core-feature-2": "classic",
    "14-data-display": "classic",
    "15-core-feature-3": "classic",
    "18-developer-testing": "classic",
    "19-friend-testing": "classic",
    "20-bug-fix": "classic",
    "21-performance": "classic",
    "31-analytics": "classic",
    "32-cold-start": "classic",
    "33-content-marketing": "classic",
    "34-feedback": "classic",
    "35-private-traffic": "classic",
    "36-ai-customer-service": "classic",
    "37-customer-objections": "classic",
    "38-pricing": "calc",  # 改成 calc
    "39-advertising": "classic",
    "40-referral": "classic",
    "41-product-iteration": "classic",
    "42-income-diversification": "classic",
    "43-exit-plan": "classic",
    "56-energy-management": "classic",
    # L2 steps — 流程步骤
    "07-dev-environment": "steps",
    "08-hello-world": "steps",
    "10-backend-connect": "steps",
    "22-launch-content": "steps",
    "25-website-deployment": "steps",
    "27-launch-checklist": "steps",
    "30-official-launch": "steps",
    # L3 policy — 政策规则
    "23-company-registration": "policy",
    "24-domain-icp": "policy",
    "26-audit-material": "policy",
    "28-audit-submit": "policy",
    "29-audit-fix": "policy",
    "45-tax-invoice": "policy",
    "48-trademark": "policy",
    "49-copyright": "policy",
    "50-ad-compliance": "policy",
    "57-government-policy": "policy",
    # L4 tools — 工具面板
    "16-payment-code": "tools",
    "17-payment-access": "tools",
    "44-bank-account": "tools",
    "47-business-email": "tools",
    "51-data-backup": "tools",
    "52-server-security": "tools",
    "53-global-payment": "tools",
    "54-wechat-miniapp": "tools",
    "55-outsourcing": "tools",
    # L5 calc — 计算器
    "46-cashflow": "calc",
}

# 把 38-pricing 改为 calc（已有计价逻辑）
LAYOUT_MAP["38-pricing"] = "calc"

# 模板 CSS → 节点目录里的 CSS 文件
TEMPLATE_CSS = {
    "classic": "_layout-classic.css",
    "steps": "_layout-steps.css",
    "policy": "_layout-policy.css",
    "tools": "_layout-tools.css",
    "calc": "_layout-calc.css",
}

LINK_INSERT = '<link rel="stylesheet" href="../_design-tokens.css">\n  <link rel="stylesheet" href="../_layout-templates.css">'

# 给每个 layout 模板追加可独立加载的"独立" CSS（避免节点需要两层 link）
# 简单做法：把模板 CSS 复制一份命名为 _layout-{type}.css

# 这里我们采用：仅修改节点 index.html，在 <head> 注入 link 即可

processed = 0
skipped = 0
errors = []

for node_dir, layout in LAYOUT_MAP.items():
    fpath = os.path.join(NODES_DIR, node_dir, "index.html")
    if not os.path.exists(fpath):
        errors.append(fpath)
        continue

    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 检查是否已经注入（避免重复）
    if "_design-tokens.css" in content:
        skipped += 1
        continue
    # 注：上面跳过只是 dry-run 行为；实际批量处理时不再跳过
    # 因为 56 节点已成功，第二次运行应该 noop

    # 2. 注入共享 CSS link（在 </title> 后或 Google Fonts 后）
    inject = LINK_INSERT.format(layout=layout)
    # 先尝试匹配 Google Fonts link
    pattern_fonts = r'(<link href="https://fonts\.googleapis\.com/css2\?[^"]+" rel="stylesheet">)'
    new_content, n = re.subn(pattern_fonts, r'\1\n  ' + inject, content, count=1)
    if n == 0:
        # 回退：在 </title> 后注入
        pattern_title = r'(</title>)'
        new_content, n = re.subn(pattern_title, r'\1\n  ' + inject, content, count=1)
        if n == 0:
            errors.append(f"{node_dir}: no insertion point found")
            continue

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(new_content)
    processed += 1

print(f"Processed: {processed}")
print(f"Skipped (already injected): {skipped}")
print(f"Errors: {len(errors)}")
for e in errors:
    print(f"  - {e}")

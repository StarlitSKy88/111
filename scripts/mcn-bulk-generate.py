#!/usr/bin/env python3
"""
MCN 30 节点批量生成脚本

读取 data/mcn-nodes.json，按 A4-script skill 规则 + v1.1c 邪修修辞包装，
批量生成 30 个节点 HTML 文件到 nodes-mcn/{NN}-{slug}/index.html。

Usage:
    python3 scripts/mcn-bulk-generate.py [--dry-run] [--only 1,2,3]

Environment:
    LITELLM_BASE_URL  默认 http://localhost:9118/v1
    LITELLM_API_KEY   默认 dummy (LiteLLM 不验证)
    LITELLM_MODEL     默认 minimax-M3
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from urllib import request, error

# ============== 配置 ==============
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = REPO_ROOT / "data" / "mcn-nodes.json"
NODES_DIR = REPO_ROOT / "nodes-mcn"
TEMPLATE_FILE = REPO_ROOT / "nodes-mcn" / "01-ai-side-hustle-truth" / "index.html"

LITELLM_BASE_URL = os.environ.get("LITELLM_BASE_URL", "http://localhost:9118/v1")
LITELLM_API_KEY = os.environ.get("LITELLM_API_KEY", "dummy")
LITELLM_MODEL = os.environ.get("LITELLM_MODEL", "MiniMax-M3")

# ============== A4 脚本生成 Prompt ==============
SYSTEM_PROMPT = """你是「愚者 AI · 邪修 AI 老炮」(戴黑帽+口罩，从不露面，靠 AI 副业多挣 1 万)。

任务：为「邪修 AI 副业」30 节点系列生成 1 个节点的 HTML 内容（仅 <main> 内，header/script/style 不用生成）。

## 严格遵循 v1.1c 规则

### 风格
- 字数：节点正文 800-1500 字（不是 90-120，那是视频脚本）
- 风格：草根共情 + 邪修黑话（野路子/老炮/暗门/不外传）
- 开场：用「我跟你说啊」/「你猜怎么着」/「你知道吗」/「诶」4 选 1
- 段落：反问 → 案例（必有具体数字）→ 总结金句 → CTA

### 受众
- 上班族/学生/宝妈/新人 4 类身份
- 痛点：想做副业但没 AI 基础
- 梦想：多挣 1 万，不辞职

### 红线（重要，触 1 个就重写）
- ❌ 不能承诺"具体月入数字"（如"月入 1 万"）
- ❌ 不能诱导"躺赚 / 0 投入"
- ❌ 不能保证"30 天学会"
- ❌ 不能伪造"学员成功案例"（可以写"我带过的学员"但不能编名字和数字）
- ❌ 不能擦边"刷单/黑产/黑五类"
- ❌ 不能诱导"钻平台漏洞/批量封号"
- ✅ "邪修" 仅作修辞包装，实际内容 100% 合规

### 视觉规范
- 用 Ma 間 风格：大量留白、不对称、Noto Serif JP 标题 200/300
- 朱红 #C0392B 每节点最多 1 处
- 禁用 Emoji，用 Unicode 符号（✓ × ⚠ ◈）
- 容器 max-width: 1200px
- h2 用 .mark-check 或 .mark-cross 前缀
- 案例用 .case-block 类

## 输出格式
直接输出 HTML 片段（仅 <main>...</main> 内），不要任何 ```html``` 包裹。
"""


def build_user_prompt(node: dict) -> str:
    """为单个节点构造生成 prompt"""
    return f"""请为「节点 {node['id']:02d}」生成 HTML 内容：

标题: {node['title']}
阶段: {node['stage']} ({node.get('stage_name', '')})
难度: {node['difficulty']}
钩子: {node['hook']}
核心洞察: {node['core_insight']}
适合身份: {', '.join(node.get('persona_match', []))}
下一节点 CTA 目标: {node.get('cta_target', '下一节点')}

输出要求：
1. 长度 800-1500 字（含 HTML 标签）
2. 结构：开场钩子 + 3-4 个核心 section + 案例 + 金句 + CTA
3. 至少 1 个真实/半真实案例（必有具体数字）
4. 至少 1 个金句（blockquote）
5. 最后给 1 个 CTA 链接到下一节点
6. 文末 footer-nav：左（返回总览）/ 中（节点 XX/30 · 阶段 X · {node.get('stage_name', '')}）/ 右（下一节点 →）
7. 不要输出任何 markdown 代码块标记
8. 直接以 `<main class="page">` 开头
9. 直接以 `</main>` 结尾
"""


# ============== LiteLLM 调用 ==============
def call_litellm(node: dict, max_retries: int = 3) -> str:
    """调用 LiteLLM 代理生成节点内容"""
    payload = {
        "model": LITELLM_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(node)},
        ],
        "max_tokens": 6000,
        "temperature": 0.7,
    }

    req = request.Request(
        f"{LITELLM_BASE_URL}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LITELLM_API_KEY}",
        },
    )

    for attempt in range(max_retries):
        try:
            with request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read())
                content = data["choices"][0]["message"].get("content", "") or ""
                if not content.strip():
                    # 推理模型可能把内容放在 reasoning_content
                    reasoning = data["choices"][0]["message"].get("reasoning_content", "") or ""
                    content = reasoning
                return content.strip()
        except error.URLError as e:
            if attempt < max_retries - 1:
                wait = 2 ** attempt
                print(f"  ⚠ 重试 {attempt+1}/{max_retries}，等 {wait}s ... ({e})")
                time.sleep(wait)
            else:
                raise


# ============== 写入节点 ==============
def write_node(node: dict, content: str, dry_run: bool = False):
    """把生成的内容写入 nodes-mcn/{NN}-{slug}/index.html"""
    node_id = node["id"]
    slug = node["slug"]
    dir_name = f"{node_id:02d}-{slug}"
    node_dir = NODES_DIR / dir_name
    html_file = node_dir / "index.html"
    data_file = node_dir / "data.json"

    if dry_run:
        print(f"  [dry-run] would create {html_file}")
        return

    # 1. 写 data.json
    node_dir.mkdir(parents=True, exist_ok=True)
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(node, f, ensure_ascii=False, indent=2)

    # 2. 包裹 HTML 模板
    full_html = wrap_html(node, content)
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"  ✓ {dir_name}/index.html ({len(full_html):,} bytes)")


def wrap_html(node: dict, content: str) -> str:
    """把 <main> 内容包成完整 HTML，套用 _design-tokens.css"""
    # 去掉 content 可能的 ```html 包裹
    content = content.strip()
    if content.startswith("```html"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    title = f"节点 {node['id']:02d} · {node['title']} - 邪修 AI 副业 · 愚者 AI"
    desc = f"节点 {node['id']:02d}：{node['title']} - 邪修 AI 老炮亲述"

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#111110">
  <title>{title}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23111110'/><circle cx='16' cy='16' r='12' stroke='%23C0392B' stroke-width='1.5' fill='none'/><circle cx='16' cy='16' r='5' fill='%23C0392B'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&family=Noto+Sans+SC:wght@300;400;500&family=Geist+Mono:wght@300;400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../_design-tokens.css">
  <style>
    .case-block {{
      background: var(--surface);
      border: 1px solid var(--line);
      padding: var(--space-lg);
      margin: var(--space-lg) 0;
    }}
    .case-block-meta {{
      display: flex;
      gap: var(--space-md);
      font-family: var(--font-mono);
      font-size: var(--meta-size);
      color: var(--text-tertiary);
      margin-bottom: var(--space-md);
    }}
    .keyword {{
      display: inline-block;
      padding: 2px 8px;
      background: var(--accent-soft);
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: var(--meta-size);
      letter-spacing: 0.1em;
    }}
    .truth-callout {{
      border-left: 2px solid var(--accent);
      padding: var(--space-md) var(--space-lg);
      margin: var(--space-xl) 0;
      background: var(--accent-soft);
    }}
    .truth-callout-label {{
      font-family: var(--font-mono);
      font-size: var(--meta-size);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: var(--space-sm);
    }}
  </style>
</head>
<body>
{content}
</body>
</html>
"""


# ============== Main ==============
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only", type=str, help="只生成指定节点, e.g. '1,2,3'")
    args = parser.parse_args()

    if not DATA_FILE.exists():
        print(f"✗ 数据文件不存在: {DATA_FILE}")
        sys.exit(1)

    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)

    nodes = data["nodes"]
    if args.only:
        only_ids = set(int(x) for x in args.only.split(","))
        nodes = [n for n in nodes if n["id"] in only_ids]

    print(f"=== MCN 节点批量生成 ===")
    print(f"目标: {len(nodes)} 个节点")
    print(f"模型: {LITELLM_MODEL}")
    print(f"后端: {LITELLM_BASE_URL}")
    print(f"模式: {'dry-run' if args.dry_run else 'live'}")
    print()

    success = 0
    fail = 0
    for i, node in enumerate(nodes, 1):
        print(f"[{i}/{len(nodes)}] 节点 {node['id']:02d}: {node['title']}")
        try:
            if args.dry_run:
                write_node(node, "", dry_run=True)
            else:
                content = call_litellm(node)
                write_node(node, content, dry_run=False)
            success += 1
        except Exception as e:
            print(f"  ✗ 失败: {e}")
            fail += 1

    print()
    print(f"=== 完成 ===")
    print(f"  ✓ 成功: {success}")
    print(f"  ✗ 失败: {fail}")
    sys.exit(0 if fail == 0 else 1)


if __name__ == "__main__":
    main()

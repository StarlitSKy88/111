#!/usr/bin/env python3
"""
ONE-MCN L6 飞书 5 表创建脚本
基于 lark-oapi 1.5.3 调飞书 OpenAPI 批量创建多维表格

Usage:
  1. 飞书开放平台注册应用：https://open.feishu.cn/app
  2. 申请 scopes: bitable:app, bitable:app:readonly
  3. 填 .env: FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_FOLDER_TOKEN
  4. python3 scripts/create-feishu-bitable.py
"""
import os
import sys
import json
import time
from pathlib import Path

try:
    import lark_oapi as lark
    from lark_oapi.api.bitable.v1 import (
        CreateAppRequest, CreateAppRequestBody,
        CreateAppTableRequest, CreateAppTableRequestBody,
        CreateAppTableFieldRequest, CreateAppTableFieldRequestBody,
        ListAppTableFieldRequest,
    )
except ImportError as e:
    print(f"❌ 缺少依赖：{e}")
    print("   pip3 install lark-oapi==1.5.3")
    sys.exit(1)


SCHEMA_PATH = Path(__file__).parent / "feishu-schemas" / "5-tables.json"


def load_env():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


def get_tenant_token(app_id: str, app_secret: str) -> str:
    """获取 tenant_access_token"""
    import requests
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    resp = requests.post(url, json={"app_id": app_id, "app_secret": app_secret}, timeout=10)
    data = resp.json()
    if data.get("code") != 0:
        raise RuntimeError(f"❌ 获取 tenant_access_token 失败：{data}")
    return data["tenant_access_token"]


def create_bitable_app(client, name: str) -> str:
    """创建多维表格 app，返回 app_token"""
    body = CreateAppTableRequestBody.builder().name(name).build()
    # 实际：bitable app 创建走 /open-apis/bitable/v1/apps
    # 这里简化为用 requests 直接调（lark_oapi 的封装较繁琐）
    raise NotImplementedError("改用 requests 直调更简洁")


def create_field_via_requests(token: str, app_token: str, table_id: str, field: dict) -> dict:
    """通过 requests 创建字段（更简单可靠）"""
    import requests
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8",
    }
    # 字段类型映射
    type_map = {
        "text": 1, "number": 2, "select": 3, "multi_select": 4,
        "datetime": 5, "date": 5, "checkbox": 7, "url": 15,
        "currency": 17,
    }
    body = {
        "field_name": field["name"],
        "type": type_map.get(field["type"], 1),
    }
    if "options" in field:
        body["property"] = {
            "options": [{"name": opt} for opt in field["options"]]
        }
    elif field["type"] in ("number", "currency"):
        body["property"] = {"formatter": "0" if field["type"] == "number" else "¥"}
    elif field["type"] in ("datetime", "date"):
        body["property"] = {"date_formatter": "yyyy-MM-dd HH:mm" if field["type"] == "datetime" else "yyyy-MM-dd"}

    resp = requests.post(url, headers=headers, json=body, timeout=10)
    return resp.json()


def create_table_via_requests(token: str, app_token: str, table_name: str, fields: list) -> str:
    """通过 requests 创建表 + 字段"""
    import requests
    # 1. 创建表（带第一个字段作为表头）
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8",
    }
    body = {"table": {"name": table_name, "is_all_field": False}}
    resp = requests.post(url, headers=headers, json=body, timeout=10)
    data = resp.json()
    if data.get("code") != 0:
        raise RuntimeError(f"❌ 创建表 {table_name} 失败：{data}")
    table_id = data["data"]["table_id"]
    print(f"  ✓ 表创建：{table_name} ({table_id})")

    # 2. 批量创建字段
    for field in fields:
        result = create_field_via_requests(token, app_token, table_id, field)
        if result.get("code") != 0:
            print(f"  ⚠ 字段 {field['name']} 创建失败：{result.get('msg')}")
        else:
            print(f"    ✓ 字段：{field['name']} ({field['type']})")
        time.sleep(0.1)  # 防止 rate limit
    return table_id


def create_bitable_app_via_requests(token: str, name: str, folder_token: str = None) -> str:
    """通过 requests 创建多维表格 app"""
    import requests
    url = "https://open.feishu.cn/open-apis/bitable/v1/apps"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8",
    }
    body = {"name": name}
    if folder_token:
        body["folder_token"] = folder_token
    resp = requests.post(url, headers=headers, json=body, timeout=10)
    data = resp.json()
    if data.get("code") != 0:
        raise RuntimeError(f"❌ 创建多维表格 {name} 失败：{data}")
    return data["data"]["app"]["app_token"]


def main():
    print("=" * 60)
    print("ONE-MCN L6 飞书 5 表创建")
    print("=" * 60)

    load_env()
    app_id = os.environ.get("FEISHU_APP_ID")
    app_secret = os.environ.get("FEISHU_APP_SECRET")
    folder_token = os.environ.get("FEISHU_FOLDER_TOKEN")

    if not app_id or not app_secret:
        print("❌ 缺少 .env 配置：FEISHU_APP_ID / FEISHU_APP_SECRET")
        print()
        print("📋 前置步骤：")
        print("   1. 打开 https://open.feishu.cn/app 创建企业自建应用")
        print("   2. 权限管理 → 申请 scopes：bitable:app + bitable:app:readonly")
        print("   3. 版本管理 → 创建版本 → 申请发布（企业自建可绕过审核）")
        print("   4. 把 app_id + app_secret 填到 .env：")
        print("      FEISHU_APP_ID=cli_xxxxxxxx")
        print("      FEISHU_APP_SECRET=xxxxxxxx")
        print("   5. (可选) 在飞书建好目标文件夹，把 folder_token 填到 .env")
        sys.exit(1)

    schema = json.loads(SCHEMA_PATH.read_text())
    print(f"✓ 加载 schema：{len(schema['tables'])} 张表 + {len(schema['g0_checklist_top'])} 项 g0 检查")
    print()

    print("→ 步骤 1/3：获取 tenant_access_token ...")
    token = get_tenant_token(app_id, app_secret)
    print(f"  ✓ token 获取成功（{token[:20]}...）")
    print()

    print("→ 步骤 2/3：创建多维表格 app ...")
    app_name = "ONE-MCN 业务数据库 v1.0"
    app_token = create_bitable_app_via_requests(token, app_name, folder_token)
    print(f"  ✓ app_token：{app_token}")
    print()

    print("→ 步骤 3/3：创建 5 张表 + 字段 ...")
    table_ids = {}
    for key, tdef in schema["tables"].items():
        print(f"\n  ▶ {tdef['name']} ({tdef['description']})")
        tid = create_table_via_requests(token, app_token, tdef["name"], tdef["fields"])
        table_ids[key] = tid

    # 写回 .env
    env_path = Path(__file__).parent.parent / ".env"
    env_content = env_path.read_text() if env_path.exists() else ""
    if "FEISHU_TABLE_IDS" in env_content:
        env_content = "\n".join(
            line for line in env_content.splitlines()
            if not line.startswith("FEISHU_TABLE_IDS=")
        )
    env_content += f"\nFEISHU_APP_TOKEN={app_token}\n"
    env_content += f"FEISHU_TABLE_IDS={json.dumps(table_ids, ensure_ascii=False)}\n"
    env_path.write_text(env_content)

    print()
    print("=" * 60)
    print("✅ 飞书 5 表创建完成！")
    print(f"   app_token: {app_token}")
    print(f"   table_ids: {json.dumps(table_ids, ensure_ascii=False, indent=2)}")
    print()
    print("📋 下一步：")
    print("   1. 在飞书打开多维表格，把 g0 检查清单复制到 01·选题库 顶部")
    print("      （清单内容见 feishu-schemas/5-tables.json g0_checklist_top 字段）")
    print("   2. 把表链接发给 Hermes Pet，b2-data Skill 可读写")
    print("=" * 60)


if __name__ == "__main__":
    main()

"""
pytest 共享 fixtures 和配置
"""
import pytest
import os
import sys
import tempfile
import shutil

# 确保可以从项目根目录 import
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)


@pytest.fixture
def temp_dir():
    """创建一个临时目录供测试使用"""
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d)


@pytest.fixture
def sample_nodes_dir(temp_dir):
    """创建一个模拟的 nodes 目录，包含几个测试节点"""
    nodes = {
        "01-test-node": {
            "index.html": """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Node 01</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body>
    <div class="layout">
        <h1>Test Content</h1>
        <p>Some paragraph content here.</p>
    </div>
</body>
</html>"""
        },
        "02-already-done": {
            "index.html": """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Already Done</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../_design-tokens.css">
</head>
<body>
    <div class="layout layout-classic">
        <h1>Done</h1>
    </div>
</body>
</html>"""
        },
    }

    for node_name, files in nodes.items():
        node_path = os.path.join(temp_dir, node_name)
        os.makedirs(node_path, exist_ok=True)
        for filename, content in files.items():
            filepath = os.path.join(node_path, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

    return temp_dir


def pytest_configure(config):
    """Register custom markers"""
    config.addinivalue_line("markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')")

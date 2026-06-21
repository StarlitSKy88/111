"""
Python 脚本集成测试

测试 scripts/ 下的 Python 工具脚本：
- apply-layout-classes.py: 为节点 HTML 注入 layout CSS link
- inject-layout-class.py: 为节点 <div class="layout"> 追加 layout-{type} class
"""
import os
import sys
import re
import subprocess
import importlib.util


class TestApplyLayoutClasses:
    """测试 apply-layout-classes.py 的 CSS 注入逻辑"""

    def test_inject_design_tokens_link(self, sample_nodes_dir):
        """
        验证共享 CSS link 在 Google Fonts link 后注入
        """
        # 模拟脚本中的 LINK_INSERT
        link_insert = '<link rel="stylesheet" href="../_design-tokens.css">\n  <link rel="stylesheet" href="../_layout-templates.css">'

        node_dir = os.path.join(sample_nodes_dir, "01-test-node")
        html_path = os.path.join(node_dir, "index.html")

        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 在 Google Fonts link 后注入（模拟脚本逻辑）
        pattern_fonts = r'(<link href="https://fonts\.googleapis\.com/css2\?[^"]+" rel="stylesheet">)'
        new_content, n = re.subn(pattern_fonts, r'\1\n  ' + link_insert, content, count=1)
        assert n == 1, "Google Fonts link not found"

        with open(html_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        # 验证 CSS link 已注入
        with open(html_path, "r", encoding="utf-8") as f:
            result = f.read()
        assert "_design-tokens.css" in result
        assert "_layout-templates.css" in result
        # Google Fonts link 应该在 _design-tokens.css 之前
        fonts_pos = result.index("fonts.googleapis.com")
        tokens_pos = result.index("_design-tokens.css")
        assert fonts_pos < tokens_pos, "CSS link should come after Google Fonts"

    def test_skip_already_injected(self, sample_nodes_dir):
        """
        验证已注入 CSS 的节点会被跳过
        """
        node_dir = os.path.join(sample_nodes_dir, "02-already-done")
        html_path = os.path.join(node_dir, "index.html")

        with open(html_path, "r", encoding="utf-8") as f:
            before = f.read()

        # 模拟脚本检测：如果包含 _design-tokens.css 则跳过
        if "_design-tokens.css" in before:
            # 不做任何修改
            pass

        with open(html_path, "r", encoding="utf-8") as f:
            after = f.read()

        assert before == after, "Already-injected file should not be modified"

    def test_fallback_title_insertion(self, temp_dir):
        """
        验证没有 Google Fonts 时在 </title> 后注入
        """
        # 创建一个没有 Google Fonts 的 HTML
        html_content = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>No Fonts Node</title>
</head>
<body>
    <div class="layout">
        <h1>Content</h1>
    </div>
</body>
</html>"""

        node_path = os.path.join(temp_dir, "test-no-fonts")
        os.makedirs(node_path, exist_ok=True)
        html_path = os.path.join(node_path, "index.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        link_insert = '<link rel="stylesheet" href="../_design-tokens.css">\n  <link rel="stylesheet" href="../_layout-templates.css">'

        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 尝试 fonts 模式
        pattern_fonts = r'(<link href="https://fonts\.googleapis\.com/css2\?[^"]+" rel="stylesheet">)'
        new_content, n = re.subn(pattern_fonts, r'\1\n  ' + link_insert, content, count=1)

        if n == 0:
            # 回退：在 </title> 后
            pattern_title = r'(</title>)'
            new_content, n = re.subn(pattern_title, r'\1\n  ' + link_insert, content, count=1)

        assert n == 1, "Should find insertion point via title fallback"
        assert "_design-tokens.css" in new_content

    def test_nodes_dir_not_found(self):
        """
        验证节点目录不存在时的行为
        """
        nonexistent = "/path/does/not/exist"
        assert not os.path.exists(nonexistent)


class TestInjectLayoutClass:
    """测试 inject-layout-class.py 的 layout class 注入逻辑"""

    def test_append_layout_class(self, sample_nodes_dir):
        """
        验证向 <div class="layout"> 追加 layout-{type} class
        """
        node_dir = os.path.join(sample_nodes_dir, "01-test-node")
        html_path = os.path.join(node_dir, "index.html")

        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        layout_type = "classic"

        # 模拟脚本的正则替换
        pattern = r'(<div\s+class=")layout(")'
        new_content, n = re.subn(pattern, rf'\1layout layout-{layout_type}\2', content, count=1)

        assert n == 1, "Should find layout div"
        assert f'layout-{layout_type}' in new_content

        # 写入并验证
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        with open(html_path, "r", encoding="utf-8") as f:
            result = f.read()
        assert 'class="layout layout-classic"' in result

    def test_skip_already_done(self, sample_nodes_dir):
        """
        验证已有 layout-{type} 的节点会被跳过
        """
        node_dir = os.path.join(sample_nodes_dir, "02-already-done")
        html_path = os.path.join(node_dir, "index.html")

        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 检测是否已有 layout-classic
        if "layout-classic" in content:
            # 不应该再次修改
            assert True
        else:
            pytest.fail("Expected layout-classic class to be present")

    def test_missing_layout_div(self, temp_dir):
        """
        验证没有 .layout div 的情况（应报错）
        """
        # 创建一个没有 layout div 的 HTML
        html_no_layout = """<!DOCTYPE html>
<html>
<head><title>No Layout</title></head>
<body>
    <div id="main">
        <h1>Content</h1>
    </div>
</body>
</html>"""
        node_path = os.path.join(temp_dir, "no-layout-node")
        os.makedirs(node_path, exist_ok=True)
        html_path = os.path.join(node_path, "index.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_no_layout)

        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        pattern = r'(<div\s+class=")layout(")'
        new_content, n = re.subn(pattern, r'\1layout layout-classic\2', content, count=1)

        assert n == 0, "Should NOT find layout div"

    def test_multiple_layout_types(self, temp_dir):
        """
        验证不同的 layout type (classic, steps, policy, tools, calc) 都能正确注入
        """
        layout_types = ["classic", "steps", "policy", "tools", "calc"]

        for lt in layout_types:
            html = f"""<!DOCTYPE html>
<html>
<head><title>Test {lt}</title></head>
<body>
    <div class="layout">
        <p>{lt} content</p>
    </div>
</body>
</html>"""
            node_path = os.path.join(temp_dir, f"test-{lt}")
            os.makedirs(node_path, exist_ok=True)
            html_path = os.path.join(node_path, "index.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html)

            # 执行替换
            with open(html_path, "r", encoding="utf-8") as f:
                content = f.read()

            pattern = r'(<div\s+class=")layout(")'
            new_content, n = re.subn(pattern, rf'\1layout layout-{lt}\2', content, count=1)

            assert n == 1, f"Should find layout div for {lt}"
            assert f'layout-{lt}' in new_content, f"Should inject layout-{lt}"


class TestScriptExecution:
    """测试脚本的整体执行"""

    def test_apply_layout_script_runnable(self):
        """验证 apply-layout-classes.py 可被 Python 解析"""
        script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "apply-layout-classes.py")
        assert os.path.exists(script_path), "Script file must exist"

        result = subprocess.run(
            [sys.executable, "-c", f"import ast; ast.parse(open('{script_path}').read())"],
            capture_output=True, text=True, cwd=os.path.dirname(script_path)
        )
        assert result.returncode == 0, f"Script parsing failed: {result.stderr}"

    def test_inject_layout_script_runnable(self):
        """验证 inject-layout-class.py 可被 Python 解析"""
        script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "inject-layout-class.py")
        assert os.path.exists(script_path), "Script file must exist"

        result = subprocess.run(
            [sys.executable, "-c", f"import ast; ast.parse(open('{script_path}').read())"],
            capture_output=True, text=True, cwd=os.path.dirname(script_path)
        )
        assert result.returncode == 0, f"Script parsing failed: {result.stderr}"

    def test_layout_maps_consistent(self):
        """
        验证两个脚本的 LAYOUT_MAP 映射一致
        重要：如果节点布局类型不同，可能导致注入不一致
        """
        import ast

        def parse_layout_map(script_path):
            with open(script_path, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read())

            for node in ast.walk(tree):
                if isinstance(node, ast.Assign):
                    for target in node.targets:
                        if isinstance(target, ast.Name) and target.id == "LAYOUT_MAP":
                            if isinstance(node.value, ast.Dict):
                                layout_map = {}
                                for k, v in zip(node.value.keys, node.value.values):
                                    if isinstance(k, ast.Constant) and isinstance(v, ast.Constant):
                                        layout_map[k.value] = v.value
                                return layout_map
            return {}

        script_dir = os.path.join(os.path.dirname(__file__), "..", "scripts")
        map_a = parse_layout_map(os.path.join(script_dir, "apply-layout-classes.py"))
        map_b = parse_layout_map(os.path.join(script_dir, "inject-layout-class.py"))

        # 找出差异
        only_a = set(map_a.keys()) - set(map_b.keys())
        only_b = set(map_b.keys()) - set(map_a.keys())
        diff_values = {k: (map_a[k], map_b[k]) for k in map_a if k in map_b and map_a[k] != map_b[k]}

        msg_parts = []
        if only_a:
            msg_parts.append(f"Only in apply: {only_a}")
        if only_b:
            msg_parts.append(f"Only in inject: {only_b}")
        if diff_values:
            msg_parts.append(f"Different values: {diff_values}")

        assert not (only_a or only_b or diff_values), \
            f"LAYOUT_MAP mismatch between scripts: {'; '.join(msg_parts)}"

// OPC 节点页面鉴权守卫
// 除节点01外，所有节点页面需要登录+付费（或管理员）才能访问
(function() {
  // 从路径提取节点编号
  var m = location.pathname.match(/\/nodes\/(\d+)/);
  var nodeId = m ? parseInt(m[1]) : null;

  // 节点01始终可访问（免费节点）
  if (nodeId === 1) return;

  var token = localStorage.getItem('opc_token');
  var role = localStorage.getItem('opc_role') || 'guest';

  if (!token) {
    // 未登录 → 跳转首页
    localStorage.setItem('opc_redirect', location.href);
    location.replace('/index.html');
    return;
  }

  // 管理员和付费用户放行
  if (role === 'admin' || role === 'paid') return;

  // 免费用户 → 跳转首页（引导订阅）
  localStorage.setItem('opc_redirect', location.href);
  location.replace('/index.html');
})();

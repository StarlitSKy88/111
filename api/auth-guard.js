// OPC 节点页面鉴权守卫
// 除首页外，所有节点页面需要登录+付费（或管理员）才能访问
(function() {
  const NODE_ID = (function() {
    var m = location.pathname.match(/\/nodes\/(\d+)/);
    return m ? parseInt(m[1]) : null;
  })();

  // 节点01始终可以访问（免费节点）
  if (NODE_ID === 1) return;

  var token = localStorage.getItem('opc_token');
  var role = localStorage.getItem('opc_role') || 'guest';

  if (!token) {
    // 未登录，跳转到首页
    localStorage.setItem('opc_redirect', location.href);
    location.replace('/index.html');
    return;
  }

  // 管理员和付费用户放行
  if (role === 'admin' || role === 'paid') return;

  // 免费用户：异步校验后台角色（可能有订阅变更）
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/auth/me', false);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  try {
    xhr.send();
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      if (data.user && (data.user.role === 'admin' || data.user.role === 'paid')) {
        localStorage.setItem('opc_role', data.user.role);
        return;
      }
    }
  } catch(e) {}

  // 权限不足，跳转到首页
  localStorage.setItem('opc_redirect', location.href);
  location.replace('/index.html');
})();

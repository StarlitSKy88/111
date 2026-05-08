// 管理后台鉴权守卫 — 仅管理员可访问
(function() {
  var token = localStorage.getItem('opc_token');
  var role = localStorage.getItem('opc_role') || 'guest';

  if (!token || role !== 'admin') {
    location.replace('/index.html');
  }
})();

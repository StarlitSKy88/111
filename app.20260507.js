const state = {
  currentQuestion: 0,
  answers: {},
  results: null,
  loading: false,
  userWechatId: '',
  paid: false,
  error: null,
  showLanding: true,
  selectedService: null,
  // 用户认证状态
  user: null, // { email, token }
  // 订阅状态
  subscription: null, // { plan: 'monthly' | 'yearly', paid: boolean }
  // 订阅弹窗选择
  selectedPlan: null
};

async function loadQuestions() {
  const response = await fetch('questions.json');
  return await response.json();
}

// Landing Screen
function renderLanding() {
  return `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding-top: 4rem; padding-bottom: 4rem;">

          <!-- Hero -->
          <div style="margin-bottom: 3rem;">
            <div class="text-label" style="margin-bottom: 1rem; color: var(--accent);">OPC适配自测</div>
            <h1 class="text-display" style="margin-bottom: 1.5rem;">
              你适合做<br>一人公司吗？
            </h1>
            <p class="text-body" style="color: var(--text-secondary); max-width: 36ch;">
              10道题，5分钟，测试你是否适合做OPC（一人公司）。<br>
              基于2026年最新创业模型评估。
            </p>
          </div>

          <!-- Features -->
          <div style="margin-bottom: 3rem;">
            <div style="display: grid; gap: 1px; background: var(--line);">
              <div style="background: var(--bg); padding: 1.25rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span style="font-size: 1.5rem; color: var(--accent); font-weight: 200;">01</span>
                  <div>
                    <div style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">个性分析</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">创始人核心能力诊断</div>
                  </div>
                </div>
              </div>
              <div style="background: var(--bg); padding: 1.25rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span style="font-size: 1.5rem; color: var(--accent); font-weight: 200;">02</span>
                  <div>
                    <div style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">12项素质评估</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">创始人核心能力诊断</div>
                  </div>
                </div>
              </div>
              <div style="background: var(--bg); padding: 1.25rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span style="font-size: 1.5rem; color: var(--accent); font-weight: 200;">03</span>
                  <div>
                    <div style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">行动建议</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">个性化提升路径</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div style="margin-bottom: 2rem;">
            <button onclick="startTest()" class="btn-pdf" style="width: 100%;">
              开始测试
            </button>
          </div>

          <!-- Note -->
          <div style="text-align: center;">
            <span class="text-label" style="color: var(--text-tertiary);">完全免费 · 5分钟完成 · 匿名测试</span>
          </div>

        </div>
      </div>
    </div>
  `;
}

function startTest() {
  state.showLanding = false;
  state.currentQuestion = 0;
  state.answers = {};
  state.results = null;
  render();
}

// Question Screen
function renderQuestion(question, index, total) {
  const progress = (index / total) * 100;
  return `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding-top: 3rem; padding-bottom: 3rem;">

          <!-- Progress indicator -->
          <div style="margin-bottom: 2.5rem;">
            <div class="progress-bar" style="--progress: ${progress}%"></div>
            <div class="progress-meta">
              <span class="question-number">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
              <span class="text-label">${Math.round(progress)}%</span>
            </div>
          </div>

          <!-- Question text -->
          <h2 class="text-headline" style="margin-bottom: 2rem; color: var(--text-primary);">${question.text}</h2>

          <!-- Options -->
          <div>
            ${question.options.map(opt => `
              <button class="opt" onclick="selectOption(${question.id}, '${opt.key}', event)">
                <span class="opt-key">${opt.key}</span>
                <span style="font-size: 0.875rem;">${opt.text}</span>
              </button>
            `).join('')}
          </div>

        </div>
      </div>
    </div>
  `;
}

function selectOption(questionId, key, event) {
  state.answers[questionId] = key;

  // 禁用所有选项按钮，防止重复点击
  document.querySelectorAll('.opt').forEach(btn => {
    btn.classList.add('btn-disabled');
    btn.style.pointerEvents = 'none';
  });

  event.target.closest('.opt').classList.add('selected');

  setTimeout(() => {
    const questions = window.QUESTIONS || [];
    if (state.currentQuestion < questions.length - 1) {
      state.currentQuestion++;
      render();
    } else {
      showResult();
    }
  }, 450);
}

function showResult() {
  submitForAnalysis();
}

const ABORT_TIMEOUT = 30000;

async function submitForAnalysis() {
  state.loading = true;
  state.error = null;
  render();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_TIMEOUT);

  try {
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: state.answers }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '请求失败');
    }

    state.results = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      state.error = '请求超时，请稍后再试';
    } else if (error.message.includes('网络')) {
      state.error = '网络连接失败，请检查网络';
    } else {
      state.error = error.message || '分析失败';
    }
    state.results = generateMockResults();
  }

  state.loading = false;
  render();
}

function generateMockResults() {
  return {
    fit_score: 78,
    fit_level: "高度适合",
    summary: "你是一个非常适合做OPC的人选。有强烈的动机和行动力，具备一定副业经验。",
    strengths: ["动机强，行动力足", "有一定副业经验", "时间投入可保证"],
    weaknesses: ["资本储备不足", "人脉资源有限", "耐心需要加强"],
    recommendations: ["优先选择轻资产OPC项目", "利用工具降低启动成本", "3个月内先跑通最小闭环"]
  };
}

// Show payment flow
function showPaymentFlow() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 1.5rem 0;">
      <!-- Step 1: Enter WeChat ID -->
      <div id="step-wechat" style="text-align: center;">
        <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">Step 1/3 — 输入你的微信</div>
        <p class="text-body" style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          手册完成后，我会添加你的微信发送给你
        </p>
        <input
          type="text"
          id="wechat-input"
          placeholder="请输入你的微信号"
          value="${state.userWechatId}"
          style="
            width: 100%;
            max-width: 280px;
            padding: 0.875rem 1rem;
            background: var(--surface);
            border: 1px solid var(--line);
            color: var(--text-primary);
            font-size: 0.875rem;
            text-align: center;
            outline: none;
          "
        >
        <div style="margin-top: 1rem;">
          <button onclick="goToPayment()" class="btn-pdf" style="background: var(--text-tertiary);">
            下一步
          </button>
        </div>
      </div>
    </div>
  `;
}

// Go to payment
function goToPayment() {
  const input = document.getElementById('wechat-input');
  const errorEl = document.getElementById('wechat-error');
  if (!input || !input.value.trim()) {
    input.classList.add('input-error');
    input.style.borderColor = 'var(--danger)';
    // 显示内联错误
    let errorMsg = document.getElementById('wechat-error');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.id = 'wechat-error';
      errorMsg.className = 'error-message';
      input.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = '请输入你的微信号';
    return;
  }
  input.classList.remove('input-error');
  input.style.borderColor = '';
  const errorMsg = document.getElementById('wechat-error');
  if (errorMsg) errorMsg.remove();
  state.userWechatId = input.value.trim();
  showPaymentQR();
}

// Show payment QR
function showPaymentQR() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 1.5rem 0; text-align: center;">
      <!-- Step 2: Payment -->
      <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">Step 2/3 — 扫码支付</div>

      <div style="display: inline-block; padding: 0.75rem; background: #fff; margin-bottom: 1.5rem;">
        <img src="wechat-pay.jpg" alt="微信支付" style="width: 220px; height: auto; display: block;">
      </div>

      <div style="font-size: 1.5rem; color: var(--accent); margin-bottom: 0.5rem;">
        ¥9.9
      </div>
      <div class="text-label" style="margin-bottom: 1.5rem; color: var(--text-tertiary);">
        支付后截图发给我
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">我的微信</div>
        <div style="font-size: 1rem; color: var(--accent); letter-spacing: 0.1em;">bcrf2025</div>
      </div>

      <div style="padding: 1rem; border: 1px solid var(--line); margin-bottom: 1.5rem; text-align: left;">
        <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">支付后请完成</div>
        <ol style="list-style: decimal; padding-left: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8;">
          <li>截图付款凭证</li>
          <li>添加微信 <span style="color: var(--accent);">bcrf2025</span></li>
          <li>发送截图给我</li>
          <li>我会发送完整手册给你</li>
        </ol>
      </div>

      <button onclick="confirmPayment()" class="btn-pdf" style="background: var(--success);">
        我已支付 ✓
      </button>
    </div>
  `;
}

// Confirm payment (user clicked)
function confirmPayment() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  const service = state.selectedService;
  const serviceName = service === 'company-registration' ? '公司注册代办' : '需求梳理';
  const nextSteps = service === 'company-registration'
    ? [
        '添加微信后，发送你的公司名称',
        '我们会在3-5个工作日内完成注册',
        '完成前会与你确认营业执照副本'
      ]
    : [
        '添加微信后，告诉我你目前卡在哪一步',
        '我会与你预约45-60分钟的视频通话时间',
        '通话前会发送问题清单给你准备'
      ];

  // 提交支付信息到后台
  if (state.results && state.results.id && state.userWechatId) {
    fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result_id: state.results.id,
        wechat_id: state.userWechatId,
        service_type: service,
        amount: 299
      })
    }).catch(err => console.error('Payment confirm error:', err));
  }

  container.innerHTML = `
    <div style="padding: 1.5rem 0; text-align: center;">
      <div class="text-label" style="margin-bottom: 1rem; color: var(--success);">✓ 购买成功</div>

      <div style="margin-bottom: 1.5rem;">
        <p class="text-body" style="color: var(--text-secondary);">
          服务：<br>
          <span style="color: var(--accent); font-size: 1.125rem;">${serviceName}</span>
        </p>
      </div>

      <div style="padding: 1.5rem; border: 1px solid var(--line); text-align: left; margin-bottom: 1.5rem;">
        <div class="text-label" style="margin-bottom: 0.75rem; color: var(--text-tertiary);">接下来</div>
        <ol style="list-style: decimal; padding-left: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8;">
          ${nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button onclick="showWechatQR()" class="action">查看我的微信</button>
        <button onclick="backToLanding()" class="action">返回首页</button>
      </div>
    </div>
  `;
}

// Show WeChat QR
function showWechatQR() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 2rem 0; text-align: center;">
      <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">添加我的微信</div>
      <div style="font-size: 1.5rem; font-weight: 300; color: var(--text-primary); margin-bottom: 1.5rem; letter-spacing: 0.1em;">
        <span style="color: var(--accent);">bcrf2025</span>
      </div>
      <div style="margin-top: 2rem; padding: 0.75rem; border: 1px solid var(--line); display: inline-block; background: #fff;">
        <img src="wechat-qr.jpg" alt="微信二维码" style="width: 180px; height: auto;">
        <div class="text-label" style="margin-top: 0.75rem; color: var(--text-tertiary);">扫码也可以</div>
      </div>
    </div>
  `;
}

// Share Card
function generateShareCard() {
  const r = state.results;
  if (!r) return;

  // 分享话术
  const shareText = `我刚完成OPC适配自测，得分${r.fit_score}分（${r.fit_level}）！

快来测试你是否适合做一人公司👇
https://taomyst.top`;

  // 复制到剪贴板
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).then(() => {
      showShareToast('已复制到剪贴板，粘贴到微信发送');
    }).catch(() => {
      // 降级方案
      copyToClipboardFallback(shareText);
    });
  } else {
    copyToClipboardFallback(shareText);
  }
}

function copyToClipboardFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showShareToast('已复制到剪贴板，粘贴到微信发送');
  } catch (err) {
    showShareToast('请长按复制下方文字');
  }
  document.body.removeChild(textarea);
}

function showShareToast(message) {
  // 移除已存在的toast
  const existing = document.getElementById('share-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'share-toast';
  toast.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
         background: var(--surface); border: 1px solid var(--line); padding: 1.5rem 2rem;
         z-index: 9999; text-align: center; animation: fadeUp 0.3s ease;">
      <div style="color: var(--text-primary); font-size: 0.875rem;">${message}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function downloadShareCard() {
  const card = document.getElementById('share-card');
  if (!card) return;

  html2canvas(card, {
    backgroundColor: '#1A1A18',
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `opc-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// PDF Export (from results)
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const r = state.results;

  doc.setFillColor(17, 17, 16);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(192, 57, 43);
  doc.text('OPC适配度分析报告', 105, 25, { align: 'center' });

  doc.setFontSize(64);
  doc.text(String(r.fit_score), 105, 65, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(150);
  doc.text(r.fit_level, 105, 78, { align: 'center' });

  doc.setDrawColor(192, 57, 43);
  doc.setLineWidth(0.3);
  doc.line(70, 88, 140, 88);

  doc.setTextColor(240, 237, 230);
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(r.summary, 160);
  doc.text(lines, 20, 102);

  let y = 115 + lines.length * 5;

  doc.setTextColor(34, 197, 94);
  doc.setFontSize(10);
  doc.text('优势', 20, y);
  doc.setTextColor(120);
  doc.setFontSize(9);
  r.strengths.forEach((s) => {
    y += 6;
    doc.text('· ' + s, 25, y);
  });

  y = 115 + lines.length * 5;
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(10);
  doc.text('短板', 120, y);
  doc.setTextColor(120);
  doc.setFontSize(9);
  r.weaknesses.forEach((w) => {
    y += 6;
    doc.text('· ' + w, 125, y);
  });

  y += 12;
  doc.setTextColor(192, 57, 43);
  doc.setFontSize(10);
  doc.text('行动建议', 20, y);
  doc.setTextColor(120);
  doc.setFontSize(9);
  r.recommendations.forEach((rec, i) => {
    y += 6;
    doc.text((i + 1) + '. ' + rec, 25, y);
  });

  doc.save(`OPC报告_${Date.now()}.pdf`);
}

// Score animation
function animateScore(targetScore, callback) {
  const el = document.getElementById('score-value');
  if (!el) return;

  let current = 0;
  const steps = 50;
  const duration = 1000;
  const increment = targetScore / steps;
  const interval = duration / steps;

  el.classList.add('score-in');

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(timer);
      if (callback) callback();
    }
    el.textContent = Math.floor(current);
  }, interval);
}

// Result Screen
function renderResult() {
  const r = state.results;
  return `
    <div class="ma-layout">
      <div class="ma-center">

        <!-- Score -->
        <div style="padding-top: 3rem; padding-bottom: 3rem;">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">OPC适配度</div>
          <div id="score-container">
            <div id="score-value" class="score">0</div>
            <div style="margin-top: 0.75rem; font-size: 1.125rem; font-weight: 300; color: var(--text-secondary);">${r.fit_level}</div>
          </div>
        </div>

        <!-- Summary -->
        <div class="result-section">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">总体评估</div>
          <p class="text-body" style="color: var(--text-primary);">${r.summary}</p>
        </div>

        <!-- Strengths & Weaknesses -->
        <div class="result-section">
          <div class="result-grid">
            <div>
              <div class="text-label" style="margin-bottom: 1rem; color: var(--success);">优势</div>
              <ul style="list-style: none;">
                ${r.strengths.map(s => `
                  <li style="margin-bottom: 0.625rem; font-size: 0.875rem; color: var(--text-secondary);">· ${s}</li>
                `).join('')}
              </ul>
            </div>
            <div>
              <div class="text-label" style="margin-bottom: 1rem; color: var(--danger);">短板</div>
              <ul style="list-style: none;">
                ${r.weaknesses.map(w => `
                  <li style="margin-bottom: 0.625rem; font-size: 0.875rem; color: var(--text-secondary);">· ${w}</li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="result-section">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--accent);">行动建议</div>
          <ol style="list-style: none; padding: 0; margin: 0;">
            ${r.recommendations.map((rec, i) => `
              <li style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--text-primary); display: flex; align-items: flex-start;">
                <span style="display: inline-block; width: 1.25rem; color: var(--accent); font-size: 0.625rem; margin-right: 0.75rem; flex-shrink: 0; padding-top: 0.25rem;">${String(i + 1).padStart(2, '0')}</span>
                <span>${rec}</span>
              </li>
            `).join('')}
          </ol>
        </div>

        <!-- OPC Manual (Payment Required) -->
        <div class="result-section">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">OPC项目手册</div>
          <div id="manual-content">
            <div style="text-align: center; padding: 1.5rem 0;">
              <p class="text-body" style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                完整手册：综合评估 + 素质分析 + 优势短板 + 行动计划<br>
                <span style="font-size: 0.75rem;">不少于5000字</span>
              </p>
              <button onclick="showPaymentFlow()" class="btn-pdf">
                获取完整手册 · 9.9元
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button onclick="restart()" class="action">重新测试</button>
          <button onclick="generateShareCard()" class="action">生成分享</button>
          <a href="#" class="action" aria-label="咨询详情" onclick="return false;">咨询详情</a>
        </div>

        <!-- Share Card -->
        <div id="share-container" class="hidden" style="margin-top: 1.5rem;">
          <div id="share-card">
            <div style="text-align: center; padding: 1.5rem 0;">
              <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">OPC适配度测试</div>
              <div style="font-size: clamp(3rem, 15vw, 4rem); font-weight: 100; color: var(--accent); letter-spacing: -0.04em;">${r.fit_score}</div>
              <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.5rem;">${r.fit_level} · 适合做OPC</div>
            </div>
            <div style="text-align: center; font-size: 0.75rem; color: var(--text-tertiary); padding: 1rem 0; border-top: 1px solid var(--line);">
              我刚完成OPC适配自测，发现自己${r.fit_level}。你也来试试。
            </div>
          </div>
          <button onclick="downloadShareCard()" class="action" style="margin-top: 0.5rem;">保存图片</button>
        </div>

      </div>
    </div>
  `;
}

// Loading Screen
function renderLoading() {
  return `
    <div class="ma-layout">
      <div class="ma-center" style="min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div class="spinner" style="margin-bottom: 1.5rem;"></div>
        <p class="text-body" style="color: var(--text-secondary);">正在生成个性化分析...</p>
      </div>
    </div>
  `;
}

// Main render
async function render() {
  const app = document.getElementById('app');
  const questions = await loadQuestions();
  window.QUESTIONS = questions.questions;

  if (state.showLanding) {
    app.innerHTML = renderLanding();
  } else if (state.loading) {
    app.innerHTML = renderLoading();
  } else if (state.results) {
    app.innerHTML = renderResult();
    setTimeout(() => {
      const container = document.getElementById('score-container');
      if (container) {
        animateScore(state.results.fit_score, () => {});
      }
    }, 100);
  } else {
    const q = questions.questions[state.currentQuestion];
    app.innerHTML = renderQuestion(q, state.currentQuestion, questions.questions.length);
  }
}

function backToLanding() {
  state.selectedService = null;
  state.showLanding = true;
  render();
}

function restart() {
  state.showLanding = true;
  state.currentQuestion = 0;
  state.answers = {};
  state.results = null;
  state.userWechatId = '';
  state.paid = false;
  state.error = null;
  state.selectedService = null;
  render();
}

document.addEventListener('DOMContentLoaded', async () => {
  initAuth(); // 初始化用户认证状态
  await loadNodes();
  render();
});

// 服务选择流程
function selectService(serviceType) {
  state.selectedService = serviceType;
  state.showLanding = false;
  renderServiceIntro();
}

function renderServiceIntro() {
  const app = document.getElementById('app');

  if (state.selectedService === 'company-registration') {
    app.innerHTML = renderCompanyServiceIntro();
  } else if (state.selectedService === 'needs-mapping') {
    app.innerHTML = renderNeedsMappingIntro();
  }
}

function renderCompanyServiceIntro() {
  return `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding: 3rem 0;">
          <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">标准化服务</div>
          <h2 class="text-headline" style="margin-bottom: 1rem;">公司注册代办</h2>

          <div style="margin-bottom: 2rem;">
            <div style="font-size: 2rem; color: var(--accent); margin-bottom: 0.5rem;">¥299</div>
            <div class="text-label" style="color: var(--text-tertiary);">市场价 ¥800-1500</div>
          </div>

          <div class="text-body" style="color: var(--text-secondary); margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;"><strong style="color: var(--text-primary);">包含服务：</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 0.5rem;">· 名称核准</li>
              <li style="margin-bottom: 0.5rem;">· 营业执照办理</li>
              <li style="margin-bottom: 0.5rem;">· 税务登记</li>
              <li style="margin-bottom: 0.5rem;">· 银行开户指导</li>
            </ul>
            <p style="margin-top: 1rem;"><strong style="color: var(--text-primary);">时长：</strong>3-5个工作日</p>
          </div>

          <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid var(--line);">
            <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">适合谁</div>
            <p class="text-body" style="color: var(--text-secondary);">
              第一次创业，不知道如何注册公司<br>
              嫌流程麻烦，想省心中介代办
            </p>
          </div>

          <button onclick="goToPayment()" class="btn-pdf" style="width: 100%; margin-bottom: 1rem;">
            立即购买 · ¥299
          </button>
          <button onclick="backToLanding()" class="action" style="display: block; text-align: center;">
            返回首页
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderNeedsMappingIntro() {
  return `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding: 3rem 0;">
          <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">非标准化服务</div>
          <h2 class="text-headline" style="margin-bottom: 1rem;">需求梳理</h2>

          <div style="margin-bottom: 2rem;">
            <div style="font-size: 2rem; color: var(--accent); margin-bottom: 0.5rem;">¥299</div>
            <div class="text-label" style="color: var(--text-tertiary);">1对1视频通话</div>
          </div>

          <div class="text-body" style="color: var(--text-secondary); margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;"><strong style="color: var(--text-primary);">服务内容：</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 0.5rem;">· 45-60分钟1对1视频通话</li>
              <li style="margin-bottom: 0.5rem;">· 帮你梳理当前卡在哪个节点</li>
              <li style="margin-bottom: 0.5rem;">· 找到最适合你的OPC路径</li>
              <li style="margin-bottom: 0.5rem;">· 获得个性化的行动清单</li>
            </ul>
          </div>

          <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid var(--line);">
            <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">你会得到</div>
            <p class="text-body" style="color: var(--text-secondary);">
              一份完整的OPC路径图<br>
              知道下一步应该做什么<br>
              避免常见的创业坑
            </p>
          </div>

          <button onclick="goToPayment()" class="btn-pdf" style="width: 100%; margin-bottom: 1rem;">
            立即预约 · ¥299
          </button>
          <button onclick="backToLanding()" class="action" style="display: block; text-align: center;">
            返回首页
          </button>
        </div>
      </div>
    </div>
  `;
}

function goToPayment() {
  const service = state.selectedService;
  const amount = 299; // 两个服务都是 ¥299

  // 直接进入支付流程
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding: 3rem 0; text-align: center;">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">Step 1/3 — 输入你的微信</div>
          <p class="text-body" style="color: var(--text-secondary); margin-bottom: 1.5rem;">
            ${getServiceConfirmText()}
          </p>
          <input
            type="text"
            id="wechat-input"
            placeholder="请输入你的微信号"
            value="${state.userWechatId}"
            style="
              width: 100%;
              max-width: 280px;
              padding: 0.875rem 1rem;
              background: var(--surface);
              border: 1px solid var(--line);
              color: var(--text-primary);
              font-size: 0.875rem;
              text-align: center;
              outline: none;
            "
          >
          <div style="margin-top: 1rem;">
            <button onclick="goToPaymentQR()" class="btn-pdf" style="background: var(--text-tertiary);">
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getServiceConfirmText() {
  const service = state.selectedService;
  if (service === 'company-registration') {
    return '购买"公司注册代办"服务后，我会添加你的微信';
  } else if (service === 'needs-mapping') {
    return '购买"需求梳理"服务后，我会添加你的微信预约时间';
  }
  return '服务完成后，我会添加你的微信';
}

function goToPaymentQR() {
  const input = document.getElementById('wechat-input');
  if (!input || !input.value.trim()) {
    input.classList.add('input-error');
    input.style.borderColor = 'var(--danger)';
    let errorMsg = document.getElementById('wechat-error');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.id = 'wechat-error';
      errorMsg.className = 'error-message';
      input.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = '请输入你的微信号';
    return;
  }
  input.classList.remove('input-error');
  input.style.borderColor = '';
  const errorMsg = document.getElementById('wechat-error');
  if (errorMsg) errorMsg.remove();
  state.userWechatId = input.value.trim();
  showPaymentQR();
}

function showPaymentQR() {
  const app = document.getElementById('app');
  const service = state.selectedService;
  const serviceName = service === 'company-registration' ? '公司注册代办' : '需求梳理';

  app.innerHTML = `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding: 3rem 0; text-align: center;">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">Step 2/3 — 扫码支付</div>

          <div style="display: inline-block; padding: 0.75rem; background: #fff; margin-bottom: 1.5rem;">
            <img src="wechat-pay.jpg" alt="微信支付" style="width: 220px; height: auto; display: block;">
          </div>

          <div style="font-size: 1.5rem; color: var(--accent); margin-bottom: 0.5rem;">
            ¥299
          </div>
          <div class="text-label" style="margin-bottom: 1.5rem; color: var(--text-tertiary);">
            ${serviceName}
          </div>

          <div style="margin-bottom: 1.5rem;">
            <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">我的微信</div>
            <div style="font-size: 1rem; color: var(--accent); letter-spacing: 0.1em;">bcrf2025</div>
          </div>

          <div style="padding: 1rem; border: 1px solid var(--line); margin-bottom: 1.5rem; text-align: left;">
            <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">支付后请完成</div>
            <ol style="list-style: decimal; padding-left: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8;">
              <li>截图付款凭证</li>
              <li>添加微信 <span style="color: var(--accent);">bcrf2025</span></li>
              <li>发送截图和服务类型</li>
              <li>我会确认并进入服务流程</li>
            </ol>
          </div>

          <button onclick="confirmPayment()" class="btn-pdf" style="background: var(--success);">
            我已支付 ✓
          </button>
        </div>
      </div>
    </div>
  `;
}

// 节点模态框
function openNodeModal(nodeId) {
  const modal = document.getElementById('node-modal');
  const nodesGrid = document.getElementById('nodes-grid');

  // 查找节点数据
  const node = window.NODES.find(n => n.id === nodeId);
  if (!node) return;

  window.SELECTED_NODE = node;

  // 同步URL到 hash
  if (node.slug) {
    history.replaceState(null, '', '#/nodes/' + node.slug);
  }

  // 填充标题和分类
  document.getElementById('modal-category').textContent =
    `${node.difficulty} · ${node.category}`;
  document.getElementById('modal-title').textContent = node.title;

  // 显示loading
  document.getElementById('modal-content').innerHTML =
    '<div class="spinner" style="margin: 2rem auto;"></div>';

  // 显示模态框
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // 调用AI生成内容
  generateNodeContent(node);
}

function closeNodeModal() {
  const modal = document.getElementById('node-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  history.replaceState(null, '', '#/');
}

async function generateNodeContent(node) {
  const contentEl = document.getElementById('modal-content');

  try {
    const response = await fetch('http://localhost:3001/api/generate-node-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_id: node.id,
        title: node.title,
        summary: node.summary
      })
    });

    if (!response.ok) throw new Error('生成失败');

    const data = await response.json();
    contentEl.innerHTML = data.content;
  } catch (error) {
    // 降级：显示节点摘要
    contentEl.innerHTML = `
      <p style="margin-bottom: 1rem;">${node.summary}</p>
      <p class="text-label" style="color: var(--text-tertiary);">内容生成中...</p>
    `;
  }
}

function consultForNode() {
  const node = window.SELECTED_NODE;
  if (!node) return;

  closeNodeModal();
  selectService('needs-mapping');
}

// 节点网格渲染
async function loadNodes() {
  try {
    const response = await fetch('http://localhost:3001/api/nodes');
    const json = await response.json();
    window.NODES = json.data;
    renderNodesGrid(json.data);
  } catch (error) {
    console.error('Load nodes error:', error);
  }
}

function renderNodesGrid(nodes, filter) {
  const grid = document.getElementById('nodes-grid');
  if (!grid) return;

  const filtered = filter && filter !== 'all'
    ? nodes.filter(n => n.difficulty === filter)
    : nodes;

  // Japanese Ma 不对称卡片 — 无gap，用border分割
  grid.innerHTML = filtered.map((node, idx) => {
    // 偶数行特殊尺寸制造不对称感
    const isWide = idx % 3 === 0;
    return `
    <div style="
      background: var(--surface);
      padding: 2rem 1.5rem;
      cursor: pointer;
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      transition: background 0.4s ease;
      ${isWide ? 'grid-column: span 2;' : ''}
    "
         onclick="openNodeModalWithAccess(${node.id})"
         onmouseenter="this.style.background='rgba(192,57,43,0.03)'"
         onmouseleave="this.style.background='var(--surface)'">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <div class="text-label" style="color: var(--accent); letter-spacing: 0.15em;">
          ${String(node.id).padStart(2, '0')}
        </div>
        <div class="text-label" style="color: var(--text-tertiary);">
          ${node.difficulty}
        </div>
      </div>
      <h3 style="font-size: 1.125rem; font-weight: 300; color: var(--text-primary); margin-bottom: 0.75rem; letter-spacing: -0.01em;">
        ${node.title}
      </h3>
      <p class="text-body" style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8;">
        ${node.summary}
      </p>
      ${node.price_consult ? `
        <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--line);">
          <span class="text-label" style="color: var(--text-tertiary);">咨询 </span>
          <span style="color: var(--accent); font-weight: 300;">¥${node.price_consult}</span>
        </div>
      ` : ''}
    </div>
  `}).join('');
}

function filterNodes(difficulty) {
  // 更新按钮状态 — Japanese Ma 左对齐风格
  document.querySelectorAll('[id^="filter-"]').forEach(btn => {
    btn.style.color = 'var(--text-secondary)';
    btn.style.borderBottom = '1px solid var(--line)';
  });
  const activeBtn = document.getElementById('filter-' + difficulty);
  if (activeBtn) {
    activeBtn.style.color = 'var(--text-primary)';
    activeBtn.style.borderBottom = '1px solid var(--accent)';
  }

  renderNodesGrid(window.NODES, difficulty);
}

// Hash 路由系统
function navigateTo(path) {
  window.location.hash = '#/' + path;
}

window.addEventListener('hashchange', handleHashRoute);

function handleHashRoute() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/nodes/')) {
    const slug = hash.replace('#/nodes/', '');
    const node = window.NODES?.find(n => n.slug === slug);
    if (node) {
      window.SELECTED_NODE = node;
      openNodeModal(node.id);
    }
  }
}

// ============================================
// 用户认证系统
// ============================================

function initAuth() {
  // 从 localStorage 恢复登录状态
  const savedToken = localStorage.getItem('opc_token');
  const savedEmail = localStorage.getItem('opc_email');
  const savedSubscription = localStorage.getItem('opc_subscription');

  if (savedToken && savedEmail) {
    state.user = { email: savedEmail, token: savedToken };
  }

  if (savedSubscription) {
    try {
      state.subscription = JSON.parse(savedSubscription);
    } catch (e) {
      state.subscription = null;
    }
  }

  renderAuthSection();
}

function renderAuthSection() {
  const authSection = document.getElementById('auth-section');
  if (!authSection) return;

  if (state.user) {
    authSection.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 0.75rem; color: var(--text-secondary);">${state.user.email}</span>
        <button onclick="logout()" style="
          background: none;
          border: 1px solid var(--line);
          color: var(--text-secondary);
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.375rem 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--line)'">
          登出
        </button>
      </div>
    `;
  } else {
    authSection.innerHTML = `
      <button onclick="openAuthModal('login')" style="
        background: none;
        border: 1px solid var(--line);
        color: var(--text-secondary);
        font-size: 0.625rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.375rem 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
      " onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--line)'">
        登录
      </button>
    `;
  }
}

function openAuthModal(mode) {
  state.authMode = mode || 'login';
  const modal = document.getElementById('auth-modal');
  const content = document.getElementById('auth-modal-content');

  content.innerHTML = renderAuthForm();
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  state.authMode = 'login';
}

function renderAuthForm() {
  const isLogin = state.authMode === 'login';

  return `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.125rem; font-weight: 400; color: var(--text-primary); margin-bottom: 0.25rem;">
        ${isLogin ? '登录' : '注册'}
      </h3>
      <p class="text-label" style="color: var(--text-tertiary);">
        ${isLogin ? '登录后访问更多节点' : '创建账号开始使用'}
      </p>
    </div>

    <form onsubmit="handleAuthSubmit(event)">
      <input
        type="email"
        id="auth-email"
        class="auth-input"
        placeholder="邮箱地址"
        required
        style="margin-bottom: 0.75rem;"
      >
      <input
        type="password"
        id="auth-password"
        class="auth-input"
        placeholder="密码"
        required
        minlength="6"
      >
      <div id="auth-error" class="error-message" style="margin-bottom: 1rem; display: none;"></div>
      <button type="submit" class="btn-pdf" style="width: 100%; margin-bottom: 1rem;">
        ${isLogin ? '登录' : '注册'}
      </button>
    </form>

    <div style="text-align: center; padding-top: 1rem; border-top: 1px solid var(--line);">
      <span class="text-label" style="color: var(--text-tertiary); margin-right: 0.5rem;">
        ${isLogin ? '还没有账号？' : '已有账号？'}
      </span>
      <button onclick="toggleAuthMode()" style="
        background: none;
        border: none;
        color: var(--accent);
        font-size: 0.75rem;
        cursor: pointer;
        text-decoration: underline;
      ">
        ${isLogin ? '立即注册' : '立即登录'}
      </button>
    </div>
  `;
}

function toggleAuthMode() {
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  const content = document.getElementById('auth-modal-content');
  content.innerHTML = renderAuthForm();
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl = document.getElementById('auth-error');
  const isLogin = state.authMode === 'login';

  errorEl.style.display = 'none';
  errorEl.textContent = '';

  try {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch('http://localhost:3001' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || (isLogin ? '登录失败' : '注册失败'));
    }

    // 登录成功后保存状态
    state.user = { email, token: data.token };
    localStorage.setItem('opc_token', data.token);
    localStorage.setItem('opc_email', email);

    closeAuthModal();
    renderAuthSection();

  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
  }
}

function logout() {
  state.user = null;
  localStorage.removeItem('opc_token');
  localStorage.removeItem('opc_email');
  renderAuthSection();
}

// ============================================
// 订阅系统
// ============================================

function openSubscriptionModal() {
  state.selectedPlan = null;
  const modal = document.getElementById('subscription-modal');
  const confirmBtn = document.getElementById('confirm-subscription-btn');

  // 重置选择状态
  document.querySelectorAll('#plan-monthly, #plan-yearly').forEach(el => {
    el.classList.remove('selected');
  });
  confirmBtn.disabled = true;
  confirmBtn.style.opacity = '0.5';
  confirmBtn.style.cursor = 'not-allowed';
  confirmBtn.textContent = '选择订阅方案';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSubscriptionModal() {
  const modal = document.getElementById('subscription-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  state.selectedPlan = null;
}

function selectSubscriptionPlan(plan) {
  state.selectedPlan = plan;

  // 更新选中状态
  document.querySelectorAll('#plan-monthly, #plan-yearly').forEach(el => {
    el.classList.remove('selected');
  });
  document.getElementById('plan-' + plan).classList.add('selected');

  // 启用确认按钮
  const confirmBtn = document.getElementById('confirm-subscription-btn');
  confirmBtn.disabled = false;
  confirmBtn.style.opacity = '1';
  confirmBtn.style.cursor = 'pointer';

  const planName = plan === 'monthly' ? '月付 ¥9.9' : '年付 ¥99';
  confirmBtn.textContent = '确认订阅 · ' + planName;
}

async function confirmSubscription() {
  if (!state.selectedPlan) return;

  const confirmBtn = document.getElementById('confirm-subscription-btn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '处理中...';

  // Mock 支付 API
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 保存订阅状态
  state.subscription = {
    plan: state.selectedPlan,
    paid: true,
    startDate: new Date().toISOString()
  };
  localStorage.setItem('opc_subscription', JSON.stringify(state.subscription));

  closeSubscriptionModal();

  // 提示成功并刷新节点
  showToast('订阅成功！开始探索全部节点');
}

function showToast(message) {
  const existing = document.getElementById('toast-message');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-message';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface);
      border: 1px solid var(--success);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      font-size: 0.875rem;
      z-index: 9999;
      animation: fadeUp 0.3s ease;
    ">
      ${message}
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// 节点访问控制
// ============================================

function checkNodeAccess(nodeId) {
  // 节点 01 是免费的（OPC适配测试）
  if (nodeId === 1) {
    return { allowed: true, requiresSubscription: false };
  }

  // 其他节点（02-40）需要订阅
  if (state.subscription && state.subscription.paid) {
    return { allowed: true, requiresSubscription: false };
  }

  return { allowed: false, requiresSubscription: true };
}

function openNodeModalWithAccess(nodeId) {
  const access = checkNodeAccess(nodeId);

  if (!access.allowed && access.requiresSubscription) {
    // 需要登录或订阅
    if (!state.user) {
      openAuthModal('login');
    } else {
      openSubscriptionModal();
    }
    return false;
  }

  openNodeModal(nodeId);
  return true;
}

// 覆盖原有的 openNodeModal
const originalOpenNodeModal = openNodeModal;
function openNodeModal(nodeId) {
  // 如果未登录，先引导登录
  if (!state.user) {
    openAuthModal('login');
    return;
  }

  // 检查订阅状态（节点 02-40）
  const access = checkNodeAccess(nodeId);
  if (!access.allowed && access.requiresSubscription) {
    openSubscriptionModal();
    return;
  }

  // 执行原来的打开模态框逻辑
  originalOpenNodeModal(nodeId);
}

// ============================================
// API 请求拦截器
// ============================================

const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
  // 添加 token 到请求头
  if (state.user && state.user.token) {
    options.headers = options.headers || {};
    if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
      options.headers['Authorization'] = 'Bearer ' + state.user.token;
    }
  }
  return originalFetch(url, options);
};
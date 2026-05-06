const state = {
  currentQuestion: 0,
  answers: {},
  results: null,
  loading: false,
  userWechatId: '',
  paid: false,
  error: null,
  showLanding: true
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
              10道题，5分钟，AI告诉你是否适合做OPC（一人公司）。<br>
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
                    <div style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">AI个性分析</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">DeepSeek V4 深度解读</div>
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
    const response = await fetch('/api/analyze', {
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
    recommendations: ["优先选择轻资产OPC项目", "利用AI工具降低启动成本", "3个月内先跑通最小闭环"]
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
  render();
}

document.addEventListener('DOMContentLoaded', render);

// 临时桩函数 - 任务6将实现完整版本
function selectService(serviceType) {
  console.warn('selectService called with:', serviceType);
  // 临时实现：刷新页面
  alert('服务选择功能即将上线，请稍后...');
}

// 节点模态框
function openNodeModal(nodeId) {
  const modal = document.getElementById('node-modal');
  const nodesGrid = document.getElementById('nodes-grid');

  // 查找节点数据
  const node = window.NODES.find(n => n.id === nodeId);
  if (!node) return;

  window.SELECTED_NODE = node;

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
}

async function generateNodeContent(node) {
  const contentEl = document.getElementById('modal-content');

  try {
    const response = await fetch('/api/generate-node-content', {
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
      <p class="text-label" style="color: var(--text-tertiary);">AI内容生成中...</p>
    `;
  }
}

function consultForNode() {
  const node = window.SELECTED_NODE;
  if (!node) return;

  closeNodeModal();
  selectService('needs-mapping');
}
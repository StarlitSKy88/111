const state = {
  currentQuestion: 0,
  answers: {},
  results: null,
  loading: false,
  manualParts: [],
  manualComplete: false,
  error: null
};

async function loadQuestions() {
  const response = await fetch('questions.json');
  return await response.json();
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

  document.querySelectorAll('.opt').forEach(btn => {
    btn.classList.remove('selected');
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

// Generate manual with multi-part progress
async function generateManualWithProgress() {
  const container = document.getElementById('manual-content');
  if (!container || !state.results) return;

  state.manualParts = [];
  state.manualComplete = false;

  // Show initial progress
  container.innerHTML = `
    <div style="padding: 2rem 0;">
      <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">正在生成OPC项目手册...</div>
      <div class="progress-bar" style="--progress: 0%"></div>
      <div id="manual-progress" class="text-label" style="margin-top: 0.75rem;">Part 1/4 准备中...</div>
    </div>
  `;

  const progressEl = document.getElementById('manual-progress');
  const barEl = container.querySelector('.progress-bar');

  // Generate each part
  const parts = ['part1', 'part2', 'part3', 'part4'];
  const partNames = ['综合评估', '素质分析', '优势短板', '行动计划'];

  for (let i = 0; i < parts.length; i++) {
    progressEl.textContent = `Part ${i + 1}/4 ${partNames[i]} 生成中...`;
    barEl.style.setProperty('--progress', (i * 25) + '%');

    try {
      const response = await fetch('/api/generate-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: state.answers,
          results: state.results,
          manualProgress: parts[i]
        })
      });

      if (response.ok) {
        const data = await response.json();
        state.manualParts.push(data.content);
        barEl.style.setProperty('--progress', ((i + 1) * 25) + '%');
      } else {
        // Use fallback content
        state.manualParts.push(getFallbackContent(parts[i]));
      }
    } catch (error) {
      state.manualParts.push(getFallbackContent(parts[i]));
    }

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Complete
  barEl.style.setProperty('--progress', '100%');
  progressEl.textContent = '生成完成！';
  state.manualComplete = true;

  // Display the complete manual
  await displayCompleteManual();
}

// Fallback content by part
function getFallbackContent(part) {
  const contents = {
    part1: `【Part 1 综合评估】

你的适配度得分：78分，属于"高度适合"级别。

这意味着你具备成为一人公司创始人的基础素质。你有强烈的动机和行动力，这在创业初期非常重要。

你的核心优势：
1. 动机强，行动力足 — 这是创业成功的最重要因素
2. 有一定副业经验 — 你不是完全从零开始
3. 时间投入可保证 — 你愿意为OPC投入时间

你的核心短板：
1. 资本储备不足 — 需要谨慎控制初期投入
2. 人脉资源有限 — 需要主动拓展渠道
3. 耐心需要加强 — 创业是长期战役

基于你的情况，建议：
1. 优先选择轻资产OPC项目
2. 利用AI工具降低启动成本
3. 3个月内先跑通最小闭环`,

    part2: `【Part 2 创始人12项素质评估】

生存必备维度（及格线9分）：
1. 现金流意识 — 建议保持6个月生活备用金
2. 优先级排序 — 每天只做3件最重要的事
3. 拒绝能力 — 学会对免费咨询说不

效率核心维度（及格线9分）：
4. AI工具驾驭 — 2026年最重要的能力
5. 产品化思维 — 必须卖可复制的产品
6. 极简运营 — 用现成工具，不要自己开发

护城河维度（及格线6分）：
7. 垂直领域积累 — 专注于一个细分领域
8. 私域流量运营 — 80%收入来自老客户
9. 客户服务能力 — 提供超出预期的服务

反脆弱维度（及格线6分）：
10. 风险隔离 — 个人和公司资产分离
11. 快速迭代 — MVP思维，3个月不盈利就放弃
12. 心态自律 — 能忍受孤独，快速从失败中恢复`,

    part3: `【Part 3 优势发挥与短板改进】

你的Top3优势：
1. 动机强 → 把这股劲用在获客上，不要浪费在无谓的学习上
2. 有经验 → 用已有经验快速验证商业模式，不要重复踩坑
3. 时间投入 → 保证每天4小时专注工作在核心收入环节

你的Top3短板改进：
1. 资本不足 → 先做轻资产项目，不要在产品开发上重投入。用AI工具提效，降低成本
2. 人脉有限 → 从线上渠道开始，通过内容输出逐步建立个人品牌和客户信任
3. 耐心不够 → 设置明确的里程碑和止损点，用小步快跑代替大步试错

扬长避短策略：
- 用你的行动力优势弥补人脉短板，主动出击获取客户
- 用AI工具弥补资本短板，降低启动成本
- 用快速迭代弥补耐心短板，通过频繁反馈保持动力`,

    part4: `【Part 4 第一周行动计划】

Day 1：定位确认
- 确定你的最小细分领域
- 写下你的定位宣言（不超过50字）
- 目标：找到你的前10个潜在客户

Day 2：产品设计
- 设计你的第一个MVP
- 确定定价（参考：99-399元起步）
- 确定交付方式

Day 3：渠道选择
- 选择3个最适合你的获客渠道
- 列出每个渠道的具体执行步骤

Day 4-7：初步接触
- 联系前10个潜在客户
- 收集反馈，验证需求
- 根据反馈调整产品

月度里程碑：
- 第1个月：获得前10个付费客户
- 第2个月：验证PMF
- 第3个月：建立稳定收入流

风险预警：
- 最可能失败：急于求成，没有耐心
- 如何规避：设置明确的止损点和里程碑
- 如果失败：复盘，调整，继续尝试`
  };

  return contents[part] || '';
}

// Display the complete manual
async function displayCompleteManual() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  const fullManual = state.manualParts.join('\n\n');

  container.innerHTML = `
    <div style="padding: 1.5rem 0;">
      <!-- Payment Section -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div class="text-label" style="margin-bottom: 1rem; color: var(--accent);">扫码支付9.9元获取完整手册</div>
        <div style="display: inline-block; padding: 1rem; background: #fff; border-radius: 4px; margin-bottom: 1rem;">
          <img src="wechat-pay.jpg" alt="微信支付" style="width: 160px; height: 160px; display: block;">
        </div>
        <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          添加微信 <span style="color: var(--accent);">bcrf2025</span> 转账后发送手册
        </div>
        <button onclick="showWechatID()" class="action" style="border-bottom: none; background: var(--accent); color: #fff; padding: 0.75rem 1.5rem;">
          已支付？查看我的微信
        </button>
      </div>

      <!-- Preview Section (collapsed) -->
      <div id="manual-preview" style="margin-top: 2rem;">
        <button onclick="toggleManualPreview()" id="preview-toggle" class="action" style="width: 100%; text-align: center;">
          查看手册预览 ▼
        </button>
        <div id="preview-content" class="hidden" style="margin-top: 1.5rem; padding: 1.5rem; border: 1px solid var(--line); text-align: left; max-height: 300px; overflow-y: auto;">
          <pre style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.7; color: var(--text-secondary);">${fullManual.substring(0, 1500)}...</pre>
        </div>
      </div>
    </div>
  `;
}

// Toggle manual preview
function toggleManualPreview() {
  const content = document.getElementById('preview-content');
  const toggle = document.getElementById('preview-toggle');
  if (content && toggle) {
    content.classList.toggle('hidden');
    toggle.textContent = content.classList.contains('hidden') ? '查看手册预览 ▼' : '收起预览 ▲';
  }
}

// Show WeChat ID
function showWechatID() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 2rem 0; text-align: center;">
      <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">添加我的微信</div>
      <div style="font-size: 1.5rem; font-weight: 300; color: var(--text-primary); margin-bottom: 1.5rem; letter-spacing: 0.1em;">
        <span style="color: var(--accent);">bcrf2025</span>
      </div>
      <p class="text-body" style="color: var(--text-secondary);">
        长按复制微信号，添加到微信后<br>
        发送"OPC手册"即可收到完整资料
      </p>
      <div style="margin-top: 2rem; padding: 1.5rem; border: 1px solid var(--line); display: inline-block;">
        <img src="wechat-qr.jpg" alt="微信二维码" style="width: 120px; height: 120px;">
        <div class="text-label" style="margin-top: 0.75rem; color: var(--text-tertiary);">扫码也可以</div>
      </div>
    </div>
  `;
}

// Share Card
function generateShareCard() {
  const container = document.getElementById('share-container');
  if (container) {
    container.classList.remove('hidden');
    container.classList.add('fade-up');
  }
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
  const duration = 1600;
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
              <div class="text-label" style="margin-bottom: 1rem; color: #22c55e;">优势</div>
              <ul style="list-style: none;">
                ${r.strengths.map(s => `
                  <li style="margin-bottom: 0.625rem; font-size: 0.875rem; color: var(--text-secondary);">· ${s}</li>
                `).join('')}
              </ul>
            </div>
            <div>
              <div class="text-label" style="margin-bottom: 1rem; color: #ef4444;">短板</div>
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
                包含：综合评估 · 素质分析 · 优势短板 · 行动计划<br>
                <span style="font-size: 0.75rem;">完整手册不少于5000字</span>
              </p>
              <button onclick="generateManualWithProgress()" class="btn-pdf">
                生成完整手册 · 9.9元
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button onclick="restart()" class="action">重新测试</button>
          <button onclick="generateShareCard()" class="action">生成分享</button>
          <a href="#" class="action">咨询详情</a>
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
        <p class="text-body" style="color: var(--text-secondary);">豆包正在分析你的答案...</p>
      </div>
    </div>
  `;
}

// Main render
async function render() {
  const app = document.getElementById('app');
  const questions = await loadQuestions();
  window.QUESTIONS = questions.questions;

  if (state.loading) {
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

function restart() {
  state.currentQuestion = 0;
  state.answers = {};
  state.results = null;
  state.manualParts = [];
  state.manualComplete = false;
  state.error = null;
  render();
}

document.addEventListener('DOMContentLoaded', render);
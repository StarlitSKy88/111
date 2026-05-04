const state = {
  currentQuestion: 0,
  answers: {},
  results: null,
  loading: false,
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

          <!-- Options — ultra minimal, mobile-first -->
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

// Generate OPC Manual
async function generateOPCManual() {
  const container = document.getElementById('manual-content');
  if (!container || !state.results) return;

  try {
    const response = await fetch('/api/generate-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: state.answers,
        results: state.results
      })
    });

    if (response.ok) {
      const manual = await response.json();
      container.innerHTML = `
        <div style="padding: 1.5rem 0;">
          ${['目标用户', '痛点方案', '推广渠道', '第一周计划'].map((label, i) => `
            <div style="margin-bottom: ${i < 3 ? '1.5rem' : '0'};">
              <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">${label}</div>
              <div class="text-body" style="color: var(--text-primary);">${Object.values(manual)[i]}</div>
            </div>
          `).join('')}
        </div>
      `;
      const pdfBtn = document.getElementById('pdf-btn');
      if (pdfBtn) pdfBtn.classList.remove('hidden');
    }
  } catch (error) {
    container.innerHTML = `
      <div class="text-body" style="color: var(--text-tertiary); padding: 1.5rem 0;">
        请启动后端服务以生成完整项目手册
      </div>
    `;
  }
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

// PDF Export
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

        <!-- OPC Manual -->
        <div class="result-section">
          <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">OPC项目手册</div>
          <div id="manual-content">
            <div style="display: flex; align-items: center; gap: 0.875rem; padding: 1.5rem 0;">
              <div class="spinner"></div>
              <span class="text-label">正在生成...</span>
            </div>
          </div>
          <button id="pdf-btn" onclick="downloadPDF()" class="btn-pdf hidden">
            下载PDF报告
          </button>
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
        animateScore(state.results.fit_score, () => {
          generateOPCManual();
        });
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
  state.error = null;
  render();
}

document.addEventListener('DOMContentLoaded', render);
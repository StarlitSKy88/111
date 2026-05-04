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

function renderQuestion(question, index, total) {
  const progress = ((index) / total) * 100;
  return `
    <div class="ma-layout py-12 md:py-20">
      <div class="ma-center animate-fadeIn" style="animation-delay: 0ms">
        <!-- Progress -->
        <div class="mb-16">
          <div class="flex justify-between text-xs text-gray-500 mb-3 tracking-widest uppercase">
            <span>问题 ${index + 1} / ${total}</span>
            <span>${Math.round(progress)}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Question -->
        <h2 class="text-headline mb-12 text-gray-100">${question.text}</h2>

        <!-- Options -->
        <div class="space-y-3">
          ${question.options.map(opt => `
            <button class="option-btn" onclick="selectOption(${question.id}, '${opt.key}', event)" data-key="${opt.key}">
              <div class="flex items-center">
                <span class="w-8 h-8 rounded flex items-center justify-center mr-4 text-xs font-medium border border-gray-700 text-gray-400">${opt.key}</span>
                <span class="text-gray-200">${opt.text}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function selectOption(questionId, key, event) {
  state.answers[questionId] = key;

  // Update visual state
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected');
    btn.querySelector('span:first-child').classList.remove('border-crimson', 'text-crimson');
    btn.querySelector('span:first-child').classList.add('border-gray-700', 'text-gray-400');
  });

  const selectedBtn = event.target.closest('.option-btn');
  selectedBtn.classList.add('selected');
  selectedBtn.querySelector('span:first-child').classList.remove('border-gray-700', 'text-gray-400');
  selectedBtn.querySelector('span:first-child').classList.add('border-crimson', 'text-crimson');

  // Proceed after brief pause
  setTimeout(() => {
    const questions = window.QUESTIONS || [];
    if (state.currentQuestion < questions.length - 1) {
      state.currentQuestion++;
      render();
    } else {
      showResult();
    }
  }, 400);
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
      state.error = error.message || '分析失败，显示模拟结果';
    }
    console.error('Analysis error:', error);
    state.results = generateMockResults();
  }

  state.loading = false;
  render();
}

function generateMockResults() {
  return {
    fit_score: 78,
    fit_level: "高度适合",
    summary: "你是一个非常适合做OPC的人选。你有强烈的动机和行动力，具备一定的副业经验，时间投入有保障。",
    strengths: ["动机强，行动力足", "有一定副业经验", "时间投入可保证"],
    weaknesses: ["资本储备不足", "人脉资源有限", "耐心需要加强"],
    recommendations: ["优先选择轻资产OPC项目", "利用AI工具降低启动成本", "3个月内先跑通最小闭环"]
  };
}

async function generateOPCManual() {
  const manualContent = document.getElementById('manual-content');
  if (!manualContent || !state.results) return;

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
      manualContent.innerHTML = `
        <div class="space-y-6">
          <div class="card card-accent">
            <div class="text-xs text-crimson tracking-widest uppercase mb-2">目标用户</div>
            <div class="text-gray-300">${manual.target_user || '待生成...'}</div>
          </div>
          <div class="card card-accent">
            <div class="text-xs text-crimson tracking-widest uppercase mb-2">痛点方案</div>
            <div class="text-gray-300">${manual.pain_point || '待生成...'}</div>
          </div>
          <div class="card card-accent">
            <div class="text-xs text-crimson tracking-widest uppercase mb-2">推广渠道</div>
            <div class="text-gray-300">${manual.channel || '待生成...'}</div>
          </div>
          <div class="card card-accent">
            <div class="text-xs text-crimson tracking-widest uppercase mb-2">第一周计划</div>
            <div class="text-gray-300">${manual.week1_plan || '待生成...'}</div>
          </div>
        </div>
      `;
      document.getElementById('download-pdf-btn').classList.remove('hidden');
    }
  } catch (error) {
    manualContent.innerHTML = `<p class="text-center text-gray-500 py-8">请启动后端服务以生成完整项目手册</p>`;
  }
}

function generateShareCard() {
  const container = document.getElementById('share-card-container');
  if (container) {
    container.classList.remove('hidden');
    container.classList.add('animate-fadeIn');
  }
}

function downloadShareCard() {
  const card = document.getElementById('share-card');
  if (!card) return;

  html2canvas(card, {
    backgroundColor: '#111110',
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `opc-result-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const r = state.results;
  doc.setFillColor(17, 17, 16);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(192, 57, 43);
  doc.text('OPC适配度分析报告', 105, 25, { align: 'center' });

  doc.setFontSize(52);
  doc.text(`${r.fit_score}`, 105, 60, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(150);
  doc.text(r.fit_level + ' · 适合做OPC', 105, 72, { align: 'center' });

  doc.setDrawColor(192, 57, 43);
  doc.setLineWidth(0.5);
  doc.line(60, 82, 150, 82);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('总体评估', 20, 95);
  doc.setFontSize(10);
  doc.setTextColor(180);
  const summaryLines = doc.splitTextToSize(r.summary, 170);
  doc.text(summaryLines, 20, 103);

  let y = 100 + summaryLines.length * 6;
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(11);
  doc.text('优势', 20, y);
  doc.setTextColor(180);
  doc.setFontSize(9);
  r.strengths.forEach((s, i) => {
    y += 6;
    doc.text(`· ${s}`, 25, y);
  });

  y += 5;
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(11);
  doc.text('短板', 110, y - 18);
  doc.setTextColor(180);
  doc.setFontSize(9);
  r.weaknesses.forEach((w, i) => {
    y += 6;
    doc.text(`· ${w}`, 115, y);
  });

  y += 12;
  doc.setTextColor(192, 57, 43);
  doc.setFontSize(11);
  doc.text('推荐行动', 20, y);
  doc.setTextColor(180);
  doc.setFontSize(9);
  r.recommendations.forEach((rec, i) => {
    y += 6;
    doc.text(`${i + 1}. ${rec}`, 25, y);
  });

  y += 12;
  doc.setTextColor(168, 85, 247);
  doc.setFontSize(11);
  doc.text('下一步建议', 20, y);
  doc.setTextColor(180);
  doc.setFontSize(9);
  y += 6;
  doc.text('完成测试后，你将获得个性化的OPC项目手册。', 25, y);
  y += 6;
  doc.text('扫描二维码，获取你的专属方案。', 25, y);

  doc.save(`OPC报告_${Date.now()}.pdf`);
}

function animateScore(targetScore, callback) {
  const scoreEl = document.getElementById('score-value');
  const scoreContainer = document.getElementById('score-container');
  let current = 0;
  const duration = 2000;
  const steps = 60;
  const increment = targetScore / steps;
  const interval = duration / steps;

  scoreContainer.classList.add('animate-scoreReveal');

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(timer);
      if (callback) callback();
    }
    scoreEl.textContent = Math.floor(current);
  }, interval);
}

function renderResult() {
  const r = state.results;
  return `
    <div class="ma-layout py-12 md:py-20">
      <div class="ma-center animate-fadeIn" style="animation-delay: 0ms">

        <!-- Score Section -->
        <div class="text-center mb-16">
          <div class="text-xs text-gray-500 tracking-widest uppercase mb-6">你的OPC适配度</div>
          <div id="score-container" class="opacity-0">
            <div id="score-value" class="score-number">0</div>
            <div class="text-xl text-gray-400 mt-4 font-light">${r.fit_level}</div>
            <div class="text-sm text-gray-600 mt-1 tracking-wider">适合做OPC</div>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="card card-accent mb-10">
          <h3 class="text-xs text-crimson tracking-widest uppercase mb-4">总体评估</h3>
          <p class="text-body text-gray-300 leading-relaxed">${r.summary}</p>
        </div>

        <!-- Strengths & Weaknesses Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div class="card">
            <h4 class="text-xs text-green-400 tracking-widest uppercase mb-4">优势</h4>
            <ul class="space-y-3">
              ${r.strengths.map(s => `<li class="flex items-start text-gray-300"><span class="text-green-400 mr-3 mt-1">·</span>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="card">
            <h4 class="text-xs text-red-400 tracking-widest uppercase mb-4">短板</h4>
            <ul class="space-y-3">
              ${r.weaknesses.map(w => `<li class="flex items-start text-gray-300"><span class="text-red-400 mr-3 mt-1">·</span>${w}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="card card-accent mb-10">
          <h4 class="text-xs text-crimson tracking-widest uppercase mb-6">推荐行动路径</h4>
          <ul class="space-y-4">
            ${r.recommendations.map((rec, i) => `
              <li class="flex items-start">
                <span class="w-7 h-7 rounded flex items-center justify-center mr-4 text-xs font-medium border border-crimson text-crimson flex-shrink-0">${i+1}</span>
                <span class="text-gray-300 pt-1">${rec}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- OPC Manual Section -->
        <div class="card mb-10">
          <h4 class="text-xs text-purple-400 tracking-widest uppercase mb-6">OPC项目手册</h4>
          <div id="manual-content">
            <div class="flex items-center justify-center py-8">
              <div class="loading-spinner mr-4"></div>
              <span class="text-gray-500 text-sm tracking-wider">正在生成个性化项目计划...</span>
            </div>
          </div>
          <button id="download-pdf-btn" onclick="downloadPDF()" class="hidden mt-6 w-full btn-primary">
            下载PDF报告
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-4 justify-center mb-8">
          <button onclick="restart()" class="btn-secondary">
            重新测试
          </button>
          <button onclick="generateShareCard()" class="btn-primary">
            生成分享卡片
          </button>
          <a href="#" class="btn-secondary">
            咨询详情
          </a>
        </div>

        <!-- Share Card Container -->
        <div id="share-card-container" class="hidden mt-8">
          <div id="share-card" class="rounded-lg p-8 mb-6">
            <div class="text-center mb-6">
              <div class="text-sm text-crimson tracking-widest uppercase mb-3">OPC适配度测试</div>
              <div id="share-score" class="text-7xl font-extralight text-crimson mb-3">${r.fit_score}</div>
              <div class="text-lg text-gray-400 font-light">${r.fit_level} · 适合做OPC</div>
            </div>
            <div class="text-sm text-gray-500 text-center leading-relaxed px-4 mb-6">
              我刚刚完成了OPC适配自测，发现自己${r.fit_level}！你也来试试吧。
            </div>
            <div class="text-center text-xs text-gray-600 py-4 border-t border-gray-800">
              扫码测试 → 开启你的OPC之路
            </div>
          </div>
          <button onclick="downloadShareCard()" class="w-full btn-primary">
            保存分享图片
          </button>
        </div>
      </div>
    </div>
  `;
}

async function render() {
  const app = document.getElementById('app');
  const questions = await loadQuestions();
  window.QUESTIONS = questions.questions;

  if (state.loading) {
    app.innerHTML = `
      <div class="ma-layout min-h-screen">
        <div class="ma-center flex flex-col items-center justify-center">
          <div class="loading-spinner mb-6"></div>
          <p class="text-gray-400 text-lg mb-2 font-light">豆包正在分析你的答案...</p>
          <p class="text-gray-600 text-sm tracking-wider">预计需要 3-5 秒</p>
        </div>
      </div>
    `;
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

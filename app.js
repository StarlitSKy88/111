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
    <div class="animate-fadeIn">
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-400 mb-2">
          <span>问题 ${index + 1} / ${total}</span>
          <span>${Math.round(progress)}% 进度</span>
        </div>
        <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500 ease-out" style="width: ${progress}%"></div>
        </div>
      </div>
      <h2 class="text-xl md:text-2xl font-bold mb-8 leading-relaxed">${question.text}</h2>
      <div class="space-y-3">
        ${question.options.map(opt => `
          <button class="option-btn w-full text-left p-5 rounded-xl border-2 border-gray-700 bg-gray-900/50 hover:border-orange-500 hover:bg-gray-800 active:scale-98 transition-all duration-200 group" onclick="selectOption(${question.id}, '${opt.key}', event)">
            <div class="flex items-center">
              <span class="w-10 h-10 rounded-xl bg-gray-800 group-hover:bg-orange-500/20 flex items-center justify-center mr-4 text-lg font-bold text-orange-400 group-hover:text-orange-300 transition-colors">${opt.key}</span>
              <span class="text-gray-200 text-base">${opt.text}</span>
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function selectOption(questionId, key, event) {
  state.answers[questionId] = key;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('border-orange-500', 'bg-orange-500/10');
    btn.classList.add('border-gray-700');
  });
  event.target.closest('.option-btn').classList.remove('border-gray-700');
  event.target.closest('.option-btn').classList.add('border-orange-500', 'bg-orange-500/10');

  setTimeout(() => {
    const questions = window.QUESTIONS || [];
    if (state.currentQuestion < questions.length - 1) {
      state.currentQuestion++;
      render();
    } else {
      showResult();
    }
  }, 350);
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
        <div class="space-y-4">
          <div class="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <div class="text-orange-400 font-bold mb-1 flex items-center"><span class="mr-2">🎯</span>目标用户</div>
            <div class="text-gray-200">${manual.target_user || '待生成...'}</div>
          </div>
          <div class="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div class="text-blue-400 font-bold mb-1 flex items-center"><span class="mr-2">💡</span>痛点方案</div>
            <div class="text-gray-200">${manual.pain_point || '待生成...'}</div>
          </div>
          <div class="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div class="text-green-400 font-bold mb-1 flex items-center"><span class="mr-2">📢</span>推广渠道</div>
            <div class="text-gray-200">${manual.channel || '待生成...'}</div>
          </div>
          <div class="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div class="text-purple-400 font-bold mb-1 flex items-center"><span class="mr-2">📅</span>第一周计划</div>
            <div class="text-gray-200">${manual.week1_plan || '待生成...'}</div>
          </div>
        </div>
      `;
      document.getElementById('download-pdf-btn').classList.remove('hidden');
      document.getElementById('download-pdf-btn').classList.add('animate-fadeIn');
    }
  } catch (error) {
    manualContent.innerHTML = `<p class="text-center text-gray-500 py-4">请启动后端服务以生成完整项目手册</p>`;
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
    backgroundColor: '#111827',
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
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(249, 115, 22);
  doc.text('OPC适配度分析报告', 105, 25, { align: 'center' });

  doc.setFontSize(56);
  doc.text(`${r.fit_score}`, 105, 60, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(150);
  doc.text(r.fit_level + ' · 适合做OPC', 105, 72, { align: 'center' });

  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.line(60, 82, 150, 82);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('总体评估', 20, 95);
  doc.setFontSize(10);
  doc.setTextColor(180);
  const summaryLines = doc.splitTextToSize(r.summary, 170);
  doc.text(summaryLines, 20, 103);

  let y = 100 + summaryLines.length * 6;
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(12);
  doc.text('✓ 你的优势', 20, y);
  doc.setTextColor(180);
  doc.setFontSize(10);
  r.strengths.forEach((s, i) => {
    y += 7;
    doc.text(`• ${s}`, 25, y);
  });

  y += 5;
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(12);
  doc.text('✗ 需要补足的', 110, y - 20);
  doc.setTextColor(180);
  doc.setFontSize(10);
  r.weaknesses.forEach((w, i) => {
    y += 7;
    doc.text(`• ${w}`, 115, y);
  });

  y += 12;
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(12);
  doc.text('推荐行动', 20, y);
  doc.setTextColor(180);
  doc.setFontSize(10);
  r.recommendations.forEach((rec, i) => {
    y += 7;
    doc.text(`${i + 1}. ${rec}`, 25, y);
  });

  y += 15;
  doc.setTextColor(168, 85, 247);
  doc.setFontSize(12);
  doc.text('下一步建议', 20, y);
  doc.setTextColor(180);
  doc.setFontSize(10);
  y += 7;
  doc.text('完成测试后，你将获得个性化的OPC项目手册。', 25, y);
  y += 7;
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

  scoreContainer.classList.add('scale-100');
  scoreContainer.classList.remove('scale-50', 'opacity-0');

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(timer);
      scoreEl.classList.add('text-orange-400');
      if (callback) callback();
    }
    scoreEl.textContent = Math.floor(current);
    scoreEl.classList.add('scale-110');
    setTimeout(() => scoreEl.classList.remove('scale-110'), 50);
  }, interval);
}

function renderResult() {
  const r = state.results;
  return `
    <div class="animate-fadeIn">
      <div class="text-center mb-10">
        <div id="score-container" class="opacity-0 scale-50 transition-all duration-700">
          <div class="text-sm text-gray-500 mb-2 uppercase tracking-wider">你的OPC适配度</div>
          <div id="score-value" class="text-6xl md:text-7xl font-black text-orange-500">0</div>
          <div class="text-xl text-gray-300 mt-3 font-medium">${r.fit_level}</div>
          <div class="text-sm text-gray-500 mt-1">适合做OPC</div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur rounded-2xl p-6 mb-6 border border-gray-800">
        <h3 class="text-lg font-bold text-orange-400 mb-4 flex items-center">
          <span class="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mr-3">📊</span>
          总体评估
        </h3>
        <p class="text-gray-300 leading-relaxed text-lg">${r.summary}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gradient-to-br from-gray-900/90 to-green-900/10 backdrop-blur rounded-2xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all">
          <h4 class="font-bold text-green-400 mb-4 flex items-center text-lg">
            <span class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-2">✓</span>
            你的优势
          </h4>
          <ul class="space-y-2">
            ${r.strengths.map(s => `<li class="flex items-start text-gray-300"><span class="text-green-400 mr-2 mt-1">•</span>${s}</li>`).join('')}
          </ul>
        </div>
        <div class="bg-gradient-to-br from-gray-900/90 to-red-900/10 backdrop-blur rounded-2xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all">
          <h4 class="font-bold text-red-400 mb-4 flex items-center text-lg">
            <span class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mr-2">✗</span>
            需要补足的
          </h4>
          <ul class="space-y-2">
            ${r.weaknesses.map(w => `<li class="flex items-start text-gray-300"><span class="text-red-400 mr-2 mt-1">•</span>${w}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="bg-gradient-to-br from-gray-900/90 to-orange-900/10 backdrop-blur rounded-2xl p-6 mb-6 border border-orange-500/20">
        <h4 class="font-bold text-orange-400 mb-5 flex items-center text-lg">
          <span class="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mr-2">🎯</span>
          推荐行动路径
        </h4>
        <ul class="space-y-3">
          ${r.recommendations.map((rec, i) => `
            <li class="flex items-start bg-gray-800/50 rounded-xl p-4">
              <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mr-3 flex-shrink-0 font-bold text-gray-900">${i+1}</span>
              <span class="text-gray-200">${rec}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="bg-gradient-to-br from-purple-900/30 to-gray-900/80 backdrop-blur rounded-2xl p-6 mb-6 border border-purple-500/30">
        <h4 class="font-bold text-purple-400 mb-5 flex items-center text-lg">
          <span class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-2">📋</span>
          OPC项目手册
        </h4>
        <div id="manual-content" class="text-sm">
          <div class="flex items-center justify-center py-6">
            <div class="loading-spinner mr-3"></div>
            <span class="text-gray-400">正在生成个性化项目计划...</span>
          </div>
        </div>
        <button id="download-pdf-btn" onclick="downloadPDF()" class="hidden mt-4 w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span class="mr-2">📄</span> 下载PDF报告
        </button>
      </div>

      <div class="flex flex-wrap gap-3 justify-center mb-6">
        <button onclick="restart()" class="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all flex items-center border border-gray-700">
          <span class="mr-2">🔄</span> 重新测试
        </button>
        <button onclick="generateShareCard()" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 rounded-xl text-gray-900 font-medium transition-all flex items-center shadow-lg shadow-orange-500/20">
          <span class="mr-2">📱</span> 生成分享卡片
        </button>
        <a href="#" class="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 rounded-xl text-white font-medium transition-all flex items-center shadow-lg shadow-orange-500/20">
          <span class="mr-2">💬</span> 咨询详情
        </a>
      </div>

      <div id="share-card-container" class="hidden mt-6">
        <div id="share-card" class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border-2 border-orange-500/40 shadow-2xl shadow-orange-500/10">
          <div class="text-center mb-6">
            <div class="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">OPC适配度测试</div>
            <div id="share-score" class="text-8xl font-black bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-3">${r.fit_score}</div>
            <div class="text-xl text-gray-300">${r.fit_level} · 适合做OPC</div>
          </div>
          <div class="text-sm text-gray-400 text-center mb-5 leading-relaxed px-4">
            我刚刚完成了OPC适配自测，发现自己${r.fit_level}！你也来试试吧，看看自己适不适合做一人公司。
          </div>
          <div class="text-center text-xs text-gray-500 py-4 border-t border-gray-700">
            扫码测试 → 开启你的OPC之路
          </div>
        </div>
        <button onclick="downloadShareCard()" class="mt-4 w-full px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl hover:from-green-500 hover:to-green-400 text-white font-medium transition-all flex items-center justify-center shadow-lg shadow-green-500/20">
          <span class="mr-2">💾</span> 保存分享图片
        </button>
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
      <div class="flex flex-col items-center justify-center min-h-96">
        <div class="relative mb-6">
          <div class="w-20 h-20 rounded-full border-4 border-gray-800"></div>
          <div class="w-20 h-20 rounded-full border-4 border-orange-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p class="text-gray-400 text-lg mb-2">豆包正在分析你的答案...</p>
        <p class="text-gray-500 text-sm">预计需要 3-5 秒</p>
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
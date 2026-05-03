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
  return `
    <div class="animate-fadeIn">
      <div class="text-sm text-orange-400 mb-2">问题 ${index + 1} / ${total}</div>
      <h2 class="text-2xl font-bold mb-6">${question.text}</h2>
      <div class="space-y-3">
        ${question.options.map(opt => `
          <button class="option-btn w-full text-left p-4 rounded-lg border border-gray-700 bg-gray-900 hover:border-orange-500" onclick="selectOption(${question.id}, '${opt.key}', event)">
            <span class="text-orange-400 mr-2">${opt.key}.</span>
            ${opt.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function selectOption(questionId, key, event) {
  state.answers[questionId] = key;

  document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
  event.target.closest('.option-btn').classList.add('selected');

  setTimeout(() => {
    const questions = window.QUESTIONS || [];
    if (state.currentQuestion < questions.length - 1) {
      state.currentQuestion++;
      render();
    } else {
      showResult();
    }
  }, 300);
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
    summary: "你是一个非常适合做OPC的人选。",
    strengths: ["动机强，行动力足", "有一定副业经验", "时间投入可保证"],
    weaknesses: ["资本储备不足", "人脉资源有限"],
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
        <div class="mb-3"><span class="text-orange-400 font-bold">🎯 目标用户：</span>${manual.target_user || '待生成'}</div>
        <div class="mb-3"><span class="text-blue-400 font-bold">💡 痛点方案：</span>${manual.pain_point || '待生成'}</div>
        <div class="mb-3"><span class="text-green-400 font-bold">📢 推广渠道：</span>${manual.channel || '待生成'}</div>
        <div class="mb-3"><span class="text-purple-400 font-bold">📅 第一周计划：</span>${manual.week1_plan || '待生成'}</div>
      `;
      document.getElementById('download-pdf-btn').classList.remove('hidden');
    }
  } catch (error) {
    manualContent.innerHTML = `<p class="text-center text-gray-500">请启动后端服务以生成完整项目手册</p>`;
  }
}

function generateShareCard() {
  const container = document.getElementById('share-card-container');
  if (container) {
    container.classList.remove('hidden');
  }
}

function downloadShareCard() {
  const card = document.getElementById('share-card');
  if (!card) return;

  html2canvas(card, {
    backgroundColor: '#111827',
    scale: 2
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
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('OPC适配度分析报告', 105, 20, { align: 'center' });

  doc.setFontSize(48);
  doc.setTextColor(249, 115, 22);
  doc.text(`${r.fit_score}`, 105, 45, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(r.fit_level + '做OPC', 105, 55, { align: 'center' });

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('总体评估', 20, 70);
  doc.setFontSize(10);
  doc.text(r.summary, 20, 78);

  doc.setFontSize(12);
  doc.text('你的优势', 20, 92);
  doc.setFontSize(10);
  r.strengths.forEach((s, i) => doc.text(`• ${s}`, 25, 98 + i * 6));

  doc.setFontSize(12);
  doc.text('需要补足的', 110, 92);
  r.weaknesses.forEach((w, i) => doc.text(`• ${w}`, 115, 98 + i * 6));

  doc.setFontSize(12);
  doc.text('推荐行动', 20, 120);
  doc.setFontSize(10);
  r.recommendations.forEach((rec, i) => doc.text(`${i + 1}. ${rec}`, 25, 126 + i * 6));

  doc.save(`OPC报告_${Date.now()}.pdf`);
}

function animateScore(targetScore, callback) {
  const scoreEl = document.getElementById('score-value');
  let current = 0;
  const duration = 1500;
  const steps = 60;
  const increment = targetScore / steps;
  const interval = duration / steps;

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
    <div class="animate-fadeIn">
      <div class="text-center mb-8">
        <div id="score-container" class="opacity-0">
          <div id="score-value" class="text-6xl font-bold text-orange-500">0</div>
          <div class="text-xl text-gray-400 mt-2">${r.fit_level}做OPC</div>
        </div>
      </div>
      <div class="bg-gray-900 rounded-xl p-6 mb-6">
        <h3 class="text-lg font-bold text-orange-400 mb-3">总体评估</h3>
        <p class="text-gray-300 leading-relaxed">${r.summary}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-900 rounded-xl p-5">
          <h4 class="font-bold text-green-400 mb-3">✓ 你的优势</h4>
          <ul class="text-sm text-gray-300 space-y-2">
            ${r.strengths.map(s => `<li>• ${s}</li>`).join('')}
          </ul>
        </div>
        <div class="bg-gray-900 rounded-xl p-5">
          <h4 class="font-bold text-red-400 mb-3">✗ 需要补足的</h4>
          <ul class="text-sm text-gray-300 space-y-2">
            ${r.weaknesses.map(w => `<li>• ${w}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="bg-gray-900 rounded-xl p-6 mb-6">
        <h4 class="font-bold text-orange-400 mb-3">推荐行动路径</h4>
        <ul class="text-sm text-gray-300 space-y-2">
          ${r.recommendations.map((rec, i) => `<li class="flex items-start"><span class="text-orange-500 mr-2">${i+1}.</span>${rec}</li>`).join('')}
        </ul>
      </div>
      <div class="bg-gray-900 rounded-xl p-6 mb-6">
        <h4 class="font-bold text-purple-400 mb-3">🎯 OPC项目手册</h4>
        <div id="manual-content" class="text-sm text-gray-300 space-y-2">
          <p class="text-center text-gray-500">正在生成个性化项目计划...</p>
        </div>
        <button id="download-pdf-btn" onclick="downloadPDF()" class="hidden mt-4 w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 text-white">
          📄 下载PDF报告
        </button>
      </div>
      <div class="text-center flex flex-wrap gap-3 justify-center">
        <button onclick="restart()" class="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700">重新测试</button>
        <button onclick="generateShareCard()" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg hover:opacity-90">📱 生成分享卡片</button>
        <a href="#" class="px-6 py-3 bg-orange-600 rounded-lg hover:bg-orange-500 inline-block">咨询详情</a>
      </div>
      <div id="share-card-container" class="mt-6 hidden">
        <div id="share-card" class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-orange-500/30">
          <div class="text-center mb-4">
            <div class="text-4xl font-bold shimmer">OPC适配度</div>
            <div class="text-6xl font-bold text-orange-500 my-2">${r.fit_score}</div>
            <div class="text-lg text-gray-400">${r.fit_level}</div>
          </div>
          <div class="text-sm text-gray-400 text-center mb-4">
            我刚刚完成了OPC适配自测，你也可以试试！
          </div>
          <div class="text-center text-xs text-gray-500">扫码测试 →</div>
        </div>
        <button onclick="downloadShareCard()" class="mt-3 w-full px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 text-white">
          保存图片
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
    app.innerHTML = `<div class="flex flex-col items-center justify-center min-h-64"><div class="loading-spinner mb-4"></div><p class="text-gray-400">豆包正在分析你的答案...</p></div>`;
  } else if (state.results) {
    app.innerHTML = renderResult();
    setTimeout(() => {
      const container = document.getElementById('score-container');
      if (container) {
        container.classList.remove('opacity-0');
        container.classList.add('animate-score');
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
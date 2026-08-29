lucide.createIcons();

// Local Storage Keys
const STORAGE_KEY = 'codecrafters_mood_logs';

// Default initial starter logs so the chart is never empty on first load
const defaultEntries = [
  { date: 'Aug 23', score: 3, mood: 'Neutral', emoji: '😐', note: 'Usual workday routine.' },
  { date: 'Aug 24', score: 4, mood: 'Good', emoji: '🙂', note: 'Finished project module on time.' },
  { date: 'Aug 25', score: 2, mood: 'Low', emoji: '😔', note: 'Felt tired and overwhelmed.' },
  { date: 'Aug 26', score: 4, mood: 'Good', emoji: '🙂', note: 'Went for an evening walk.' },
  { date: 'Aug 27', score: 5, mood: 'Great', emoji: '🤩', note: 'Productive and energizing day!' }
];

let moodLogs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultEntries;
let selectedMood = null;
let chartInstance = null;

// DOM Elements
const welcomeView = document.getElementById('welcomeView');
const humanCaptchaCheck = document.getElementById('humanCaptchaCheck');
const enterAppBtn = document.getElementById('enterAppBtn');
const journalView = document.getElementById('journalView');

const moodButtons = document.querySelectorAll('.mood-btn');
const moodNoteInput = document.getElementById('moodNoteInput');
const saveMoodBtn = document.getElementById('saveMoodBtn');
const logsContainer = document.getElementById('logsContainer');
const avgScoreBadge = document.getElementById('avgScoreBadge');
const currentDateBadge = document.getElementById('currentDateBadge');
const clearLogsBtn = document.getElementById('clearLogsBtn');

// Modals & Triggers
const sosModal = document.getElementById('sosModal');
const sosBtn = document.getElementById('sosBtn');
const openHelpBtn = document.getElementById('openHelpBtn');
const closeSosBtn = document.getElementById('closeSosBtn');

// Set formatted current date in UI
const today = new Date();
currentDateBadge.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Captcha Check Handler
humanCaptchaCheck.addEventListener('change', (e) => {
  if (e.target.checked) {
    enterAppBtn.removeAttribute('disabled');
    enterAppBtn.className = "w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer";
  } else {
    enterAppBtn.setAttribute('disabled', 'true');
    enterAppBtn.className = "w-full py-3.5 bg-slate-800 text-slate-400 font-semibold text-sm rounded-xl cursor-not-allowed transition flex items-center justify-center gap-2";
  }
});

enterAppBtn.onclick = () => {
  welcomeView.classList.add('hidden');
  journalView.classList.remove('hidden');
  initChart();
  renderLogs();
};

// Mood Picker Handler
moodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    moodButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = {
      score: parseInt(btn.dataset.score),
      mood: btn.dataset.mood,
      emoji: btn.querySelector('span').textContent
    };

    // If score is 1 (Awful), trigger SOS breakdown modal recommendation
    if (selectedMood.score === 1) {
      setTimeout(() => {
        sosModal.classList.remove('hidden');
      }, 350);
    }
  });
});

// Save Mood Entry
saveMoodBtn.addEventListener('click', () => {
  if (!selectedMood) {
    alert('Please select a mood emoji above first!');
    return;
  }

  const note = moodNoteInput.value.trim();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const newEntry = {
    date: dateStr,
    score: selectedMood.score,
    mood: selectedMood.mood,
    emoji: selectedMood.emoji,
    note: note || 'No note added.'
  };

  moodLogs.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moodLogs));

  // Reset inputs
  moodNoteInput.value = '';
  moodButtons.forEach(b => b.classList.remove('selected'));
  selectedMood = null;

  renderLogs();
  updateChartData();
});

// Render Log Cards
function renderLogs() {
  logsContainer.innerHTML = '';
  const recentLogs = [...moodLogs].reverse().slice(0, 4);

  if (recentLogs.length === 0) {
    logsContainer.innerHTML = '<p class="text-slate-500 italic text-center py-2">No entries yet. Log your first mood above!</p>';
    return;
  }

  recentLogs.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3';
    item.innerHTML = `
      <div class="flex items-start gap-2.5">
        <span class="text-xl">${entry.emoji}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-200">${entry.mood}</span>
            <span class="text-[10px] text-slate-500">${entry.date}</span>
          </div>
          <p class="text-slate-400 text-[11px] mt-0.5">${entry.note}</p>
        </div>
      </div>
      <span class="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-900/50">${entry.score}/5</span>
    `;
    logsContainer.appendChild(item);
  });

  // Calculate Average
  const total = moodLogs.reduce((acc, curr) => acc + curr.score, 0);
  const avg = (total / moodLogs.length).toFixed(1);
  avgScoreBadge.textContent = `Avg: ${avg} / 5`;
}

// Chart.js Setup
function initChart() {
  const ctx = document.getElementById('moodChart').getContext('2d');
  
  const labels = moodLogs.map(l => l.date);
  const scores = moodLogs.map(l => l.score);

  // Gradient fill for chart line
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood Level',
        data: scores,
        borderColor: '#6366f1',
        borderWidth: 2.5,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#818cf8',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            color: '#64748b',
            font: { size: 10 }
          },
          grid: { color: 'rgba(51, 65, 85, 0.25)' }
        },
        x: {
          ticks: {
            color: '#64748b',
            font: { size: 10 }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 8
        }
      }
    }
  });
}

function updateChartData() {
  if (!chartInstance) return;
  chartInstance.data.labels = moodLogs.map(l => l.date);
  chartInstance.data.datasets[0].data = moodLogs.map(l => l.score);
  chartInstance.update();
}

// Reset Local Data
clearLogsBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset your mood history?')) {
    localStorage.removeItem(STORAGE_KEY);
    moodLogs = [];
    renderLogs();
    updateChartData();
  }
});

// Modal Event Listeners
sosBtn.onclick = () => sosModal.classList.remove('hidden');
openHelpBtn.onclick = () => sosModal.classList.remove('hidden');
closeSosBtn.onclick = () => sosModal.classList.add('hidden');
sosModal.onclick = (e) => {
  if (e.target === sosModal) sosModal.classList.add('hidden');
};

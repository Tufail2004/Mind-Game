document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
  requireAuth();

  const categorySelect = document.getElementById('categorySelect');
  const startButton = document.getElementById('startQuizBtn');
  startButton.disabled = true;

  const user = getUser();
  if (user) {
    document.getElementById('welcomeHeading').textContent = `Hi ${user.name}! 👋🎉`;
  }

  try {
    const questions = await apiFetch('/questions');
    const categories = [...new Set(questions.map((question) => question.category))].sort();
    categorySelect.innerHTML = categories.length
      ? categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')
      : '<option value="">No quiz categories available</option>';
    startButton.disabled = categories.length === 0;
  } catch (error) {
    categorySelect.innerHTML = '<option value="">Could not load categories</option>';
    console.error('Failed to load quiz categories:', error.message);
  }

  try {
    const profile = await apiFetch('/users/profile');
    const { stats, recent } = profile;

    document.getElementById('statQuizzes').textContent = stats.quizzesPlayed;
    document.getElementById('statHighest').textContent = stats.highestScore;
    document.getElementById('statAverage').textContent = `${stats.averageScore}%`;
    document.getElementById('statCorrect').textContent = stats.totalCorrect;

    renderRecent(recent);
  } catch (error) {
    console.error('Failed to load profile:', error.message);
  }

  startButton.addEventListener('click', () => {
    const category = categorySelect.value;
    if (!category) return;
    const difficulty = document.getElementById('difficultySelect').value;
    location.href = `quiz.html?category=${encodeURIComponent(category)}&difficulty=${difficulty}`;
  });
}

function renderRecent(recent) {
  const list = document.getElementById('recentList');
  if (!recent || recent.length === 0) return; // keep the placeholder text

  list.innerHTML = '';
  for (const r of recent) {
    const item = document.createElement('div');
    item.className = 'recent-item';
    const date = new Date(r.createdAt).toLocaleDateString();
    item.innerHTML = `
      <div><strong>${escapeHtml(r.category)}</strong> <span class="muted">(${escapeHtml(r.difficulty)})</span></div>
      <div><span class="pct num">${r.percentage}%</span> <span class="muted">· ${r.score} pts · ${date}</span></div>
    `;
    list.appendChild(item);
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

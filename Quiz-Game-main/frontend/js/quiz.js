const SECONDS_PER_QUESTION = 30;
const POINTS = { easy: 10, medium: 20, hard: 30 };
const LETTERS = ['A', 'B', 'C', 'D'];

let questions = [];
let currentIndex = 0;
let answers = []; // { questionId, selected } — selected is null when unanswered
let liveScore = 0;
let timerId = null;
let timeLeft = SECONDS_PER_QUESTION;
let quizStartTime = null;
let category = '';
let difficulty = 'mixed';
let answered = false;

document.addEventListener('DOMContentLoaded', initQuiz);

async function initQuiz() {
  requireAuth();

  const params = new URLSearchParams(location.search);
  category = params.get('category');
  difficulty = params.get('difficulty') || 'mixed';

  if (!category) {
    showError('No category selected. Please pick one from the dashboard.');
    return;
  }

  try {
    const data = await apiFetch(
      `/quiz/questions?category=${encodeURIComponent(category)}&difficulty=${difficulty}`
    );
    questions = data.questions;
    quizStartTime = Date.now();

    document.getElementById('loadingBox').classList.add('hidden');
    document.getElementById('quizBox').classList.remove('hidden');
    renderQuestion();
  } catch (error) {
    showError(error.message);
  }
}

function renderQuestion() {
  answered = false;
  const q = questions[currentIndex];

  document.getElementById('questionCounter').textContent =
    `Question ${currentIndex + 1} / ${questions.length}`;
  document.getElementById('progressFill').style.width =
    `${(currentIndex / questions.length) * 100}%`;

  const badge = document.getElementById('difficultyBadge');
  const labels = { easy: '😊 Easy peasy', medium: '🤩 Tricky', hard: '🧠 Super hard' };
  badge.textContent = labels[q.difficulty] || q.difficulty;
  badge.className = `difficulty-badge ${q.difficulty}`;

  document.getElementById('questionText').textContent = q.question;

  const optionsBox = document.getElementById('options');
  optionsBox.innerHTML = '';
  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.answer = option;
    btn.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span></span>`;
    btn.querySelector('span:last-child').textContent = option;
    btn.addEventListener('click', () => selectAnswer(option, btn));
    optionsBox.appendChild(btn);
  });

  document.getElementById('explanationBox').classList.add('hidden');
  document.getElementById('nextBtn').classList.add('hidden');

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = SECONDS_PER_QUESTION;
  updateTimerDisplay();
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      onTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer');
  el.textContent = timeLeft;
  const low = timeLeft <= 10;
  el.classList.toggle('low', low);
  document.getElementById('timerWrap').classList.toggle('low', low);
}

function selectAnswer(selectedText, clickedBtn) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);

  const q = questions[currentIndex];
  answers.push({ questionId: q._id, selected: selectedText });

  markOptions(q, clickedBtn);

  if (selectedText === q.correctAnswer) {
    liveScore += POINTS[q.difficulty] || 0;
    document.getElementById('liveScore').textContent = liveScore;
  }

  showExplanation(q);
  showNextButton();
}

function onTimeout() {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  answers.push({ questionId: q._id, selected: null });

  markOptions(q, null);
  showExplanation(q);
  showNextButton();
}

function markOptions(question, clickedBtn) {
  document.querySelectorAll('.option-btn').forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === question.correctAnswer) {
      btn.classList.add('correct');
    } else if (btn === clickedBtn) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('dim');
    }
  });
}

function showExplanation(question) {
  const box = document.getElementById('explanationBox');
  document.getElementById('explanationText').textContent =
    question.explanation || 'No explanation available.';
  box.classList.remove('hidden');
}

function showNextButton() {
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent =
    currentIndex === questions.length - 1 ? 'See Results 🏁' : 'Next Question →';
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = nextQuestion;
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= questions.length) {
    finishQuiz();
    return;
  }
  const card = document.getElementById('questionCard');
  card.classList.remove('fade-in');
  void card.offsetWidth;
  card.classList.add('fade-in');
  renderQuestion();
}

async function finishQuiz() {
  const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);

  try {
    const result = await apiFetch('/quiz/result', {
      method: 'POST',
      body: JSON.stringify({ category, difficulty, answers, timeTaken }),
    });
    sessionStorage.setItem('lastResult', JSON.stringify({ ...result, category, difficulty }));
    location.href = 'result.html';
  } catch (error) {
    showError(error.message);
  }
}

function showError(message) {
  document.getElementById('loadingBox').classList.add('hidden');
  document.getElementById('quizBox').classList.add('hidden');
  document.getElementById('errorText').textContent = message;
  document.getElementById('errorBox').classList.remove('hidden');
}

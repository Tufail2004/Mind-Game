document.addEventListener('DOMContentLoaded', () => {
  requireGuest(); // already playing? skip the name screen
  document.getElementById('nameForm').addEventListener('submit', handleNameSubmit);
  document.getElementById('playerName').focus();
});

function showError(message) {
  const box = document.getElementById('formError');
  box.textContent = message;
  box.classList.remove('hidden');
}

function setLoading(button, loading, label) {
  button.disabled = loading;
  button.textContent = loading ? 'Getting ready… ⏳' : label;
}

async function handleNameSubmit(event) {
  event.preventDefault();
  const button = document.getElementById('submitBtn');
  const name = document.getElementById('playerName').value.trim();

  if (name.length < 2) {
    showError('Please tell us your name (at least 2 letters) 😊');
    return;
  }

  setLoading(button, true);

  try {
    const data = await apiFetch('/auth/play', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    setToken(data.token);
    setUser(data.user);
    location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message);
    setLoading(button, false, "Let's play! 🚀");
  }
}

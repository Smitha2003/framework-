// Result Page Logic
function displayBrainTypeResult() {
  const brainType = Auth.getQuizResult();

  if (!brainType) {
    window.location.href = 'quiz.html';
    return;
  }

  const info = QuizLogic.getBrainTypeInfo(brainType);

  // Update page with brain type info
  document.getElementById('emoji').textContent = info.emoji;
  document.getElementById('brain-type-title').textContent = info.title;
  document.getElementById('brain-type-description').textContent = info.description;
  document.getElementById('strength').textContent = info.strength;
  document.getElementById('challenge').textContent = info.challenge;
  document.getElementById('dashboard-info').textContent = info.dashboard;
  document.getElementById('brain-type-name').textContent = info.title;
}

function navigateToSignup() {
  window.location.href = 'signup.html';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  displayBrainTypeResult();
});

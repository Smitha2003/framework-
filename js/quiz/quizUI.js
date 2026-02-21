// Quiz UI Module
let currentQuestionIndex = 0;
let userAnswers = new Array(QuizLogic.questions.length).fill(null);

function renderQuestion() {
  const question = QuizLogic.questions[currentQuestionIndex];
  
  // Update progress
  const progress = ((currentQuestionIndex + 1) / QuizLogic.questions.length) * 100;
  document.getElementById('progress').style.width = progress + '%';
  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = QuizLogic.questions.length;

  // Update question text
  document.getElementById('question-text').textContent = question.text;

  // Render answers
  const answersContainer = document.getElementById('answers-container');
  answersContainer.innerHTML = '';

  question.answers.forEach((answer, index) => {
    const answerBtn = document.createElement('button');
    answerBtn.className = 'answer-option';
    answerBtn.textContent = answer.text;
    
    if (userAnswers[currentQuestionIndex] === index) {
      answerBtn.classList.add('selected');
    }

    answerBtn.addEventListener('click', () => selectAnswer(index));
    answersContainer.appendChild(answerBtn);
  });

  // Update navigation buttons
  document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
  document.getElementById('next-btn').textContent = 
    currentQuestionIndex === QuizLogic.questions.length - 1 ? 'See Results' : 'Next →';
}

function selectAnswer(answerIndex) {
  userAnswers[currentQuestionIndex] = answerIndex;
  
  // Update UI
  document.querySelectorAll('.answer-option').forEach((btn, index) => {
    btn.classList.toggle('selected', index === answerIndex);
  });
}

function nextQuestion() {
  if (userAnswers[currentQuestionIndex] === null) {
    alert('Please select an answer before proceeding');
    return;
  }

  if (currentQuestionIndex === QuizLogic.questions.length - 1) {
    // Last question - show results
    showResults();
    return;
  }

  currentQuestionIndex++;
  renderQuestion();
  window.scrollTo(0, 0);
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    window.scrollTo(0, 0);
  }
}

function showResults() {
  // Hide quiz section
  document.getElementById('quiz-section').classList.add('hidden');
  document.getElementById('results-section').classList.remove('hidden');

  // Calculate brain type after a delay
  setTimeout(() => {
    const result = QuizLogic.calculateBrainType(userAnswers);
    
    // Save result
    Auth.saveQuizResult(result.primary);

    // Redirect to result page after another delay
    setTimeout(() => {
      window.location.href = 'result.html';
    }, 1500);
  }, 2000);
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderQuestion();
});

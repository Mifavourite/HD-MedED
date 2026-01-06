/* =========================
   Medical Terminology Game Logic
========================= */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

(function gameModule() {
  let score = 0;
  let correct = 0;
  let streak = 0;
  let totalQuestions = 0;
  let currentQuestion = null;
  let selectedAnswer = null;
  
  // DOM elements
  const scoreEl = qs('#score');
  const correctEl = qs('#correct');
  const streakEl = qs('#streak');
  const totalQuestionsEl = qs('#totalQuestions');
  const questionNumEl = qs('#questionNum');
  const questionTextEl = qs('#questionText');
  const questionHintEl = qs('#questionHint');
  const answersSection = qs('#answersSection');
  const answerBtns = qsa('.answer-btn');
  const nextBtn = qs('#nextBtn');
  const hintBtn = qs('#hintBtn');
  const explanationCard = qs('#explanationCard');
  const explanationText = qs('#explanationText');
  const explanationDetails = qs('#explanationDetails');
  const showExplanations = qs('#showExplanations');
  const randomizeOrder = qs('#randomizeOrder');
  const difficultySelect = qs('#difficulty');
  
  // Initialize game
  function init() {
    loadQuestion();
    updateStats();
    
    // Answer button handlers
    answerBtns.forEach(btn => {
      btn.addEventListener('click', () => handleAnswerClick(btn));
    });
    
    // Next button handler
    nextBtn.addEventListener('click', () => {
      loadQuestion();
      resetQuestionState();
    });
    
    // Hint button handler
    hintBtn.addEventListener('click', () => {
      if (currentQuestion && currentQuestion.term) {
        questionHintEl.textContent = `Hint: The term "${currentQuestion.term}" contains the root word related to "${currentQuestion.meaning.split(' ')[0]}".`;
        questionHintEl.style.display = 'block';
      }
    });
  }
  
  // Load a new question
  function loadQuestion() {
    const difficulty = difficultySelect.value;
    currentQuestion = MedicalTermsDB.generateQuestion(difficulty);
    totalQuestions++;
    
    questionNumEl.textContent = totalQuestions;
    questionTextEl.textContent = currentQuestion.question;
    questionHintEl.textContent = '';
    questionHintEl.style.display = 'none';
    
    // Update answer buttons
    answerBtns.forEach((btn, index) => {
      btn.textContent = currentQuestion.answers[index];
      btn.disabled = false;
      btn.classList.remove('correct', 'incorrect', 'selected');
    });
    
    nextBtn.style.display = 'none';
    explanationCard.style.display = 'none';
    selectedAnswer = null;
  }
  
  // Handle answer click
  function handleAnswerClick(btn) {
    if (btn.disabled) return;
    
    const answerIndex = parseInt(btn.dataset.answer);
    selectedAnswer = answerIndex;
    
    // Disable all buttons
    answerBtns.forEach(b => b.disabled = true);
    
    // Mark selected answer
    btn.classList.add('selected');
    
    // Check if correct
    const isCorrect = answerIndex === currentQuestion.correctIndex;
    
    if (isCorrect) {
      btn.classList.add('correct');
      score += 10 + (streak * 2);
      correct++;
      streak++;
    } else {
      btn.classList.add('incorrect');
      streak = 0;
      // Highlight correct answer
      answerBtns[currentQuestion.correctIndex].classList.add('correct');
    }
    
    updateStats();
    
    // Show explanation
    if (showExplanations.checked) {
      showExplanation();
    }
    
    nextBtn.style.display = 'block';
  }
  
  // Show explanation
  function showExplanation() {
    explanationText.innerHTML = currentQuestion.explanation;
    explanationDetails.innerHTML = `
      <strong>Term:</strong> ${currentQuestion.term}<br>
      <strong>Meaning:</strong> ${currentQuestion.meaning}
    `;
    explanationCard.style.display = 'block';
  }
  
  // Reset question state
  function resetQuestionState() {
    answerBtns.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('correct', 'incorrect', 'selected');
    });
    nextBtn.style.display = 'none';
    explanationCard.style.display = 'none';
    selectedAnswer = null;
  }
  
  // Update statistics
  function updateStats() {
    scoreEl.textContent = score;
    correctEl.textContent = correct;
    streakEl.textContent = streak;
    totalQuestionsEl.textContent = totalQuestions;
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

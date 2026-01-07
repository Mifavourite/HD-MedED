/* =========================
   Medical Terminology Game Logic
========================= */

// Use the qs and qsa already defined in script.js — DO NOT redefine them here
// const qs = s => document.querySelector(s);
// const qsa = s => Array.from(document.querySelectorAll(s));

// Medical Terms Database
const MedicalTermsDB = {
  easy: [
    { term: "Cardiology", meaning: "Study of the heart", root: "cardi/o", explanation: "The prefix 'cardi/o' means heart." },
    { term: "Dermatology", meaning: "Study of the skin", root: "derm/o", explanation: "The prefix 'derm/o' means skin." },
    { term: "Osteopathy", meaning: "Treatment of bone disorders", root: "oste/o", explanation: "'Oste/o' refers to bone." },
  ],
  medium: [
    { term: "Nephrology", meaning: "Study of the kidneys", root: "nephr/o", explanation: "'Nephr/o' means kidney." },
    { term: "Hepatitis", meaning: "Inflammation of the liver", root: "hepat/o", explanation: "'Hepat/o' refers to liver." },
    { term: "Arthritis", meaning: "Inflammation of joints", root: "arthr/o", explanation: "'Arthr/o' means joint." },
  ],
  hard: [
    { term: "Myocarditis", meaning: "Inflammation of the heart muscle", root: "my/o + cardi/o", explanation: "Combines 'my/o' (muscle) and 'cardi/o' (heart)." },
    { term: "Encephalopathy", meaning: "Disease of the brain", root: "encephal/o", explanation: "'Encephal/o' means brain." },
    { term: "Cholecystitis", meaning: "Inflammation of the gallbladder", root: "cholecyst/o", explanation: "'Cholecyst/o' refers to gallbladder." },
  ],

  // ← FIXED: Added missing comma after the hard array
  generateQuestion(difficulty = 'medium') {
    const pool = this[difficulty] || this.medium;
    if (pool.length === 0) return null;

    const item = pool[Math.floor(Math.random() * pool.length)];

    // Generate 3 wrong answers from other terms in the same difficulty
    const wrongOptions = pool
      .filter(t => t.meaning !== item.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(t => t.meaning);

    // Combine correct + wrong, then shuffle
    const answers = [item.meaning, ...wrongOptions].sort(() => 0.5 - Math.random());
    const correctIndex = answers.indexOf(item.meaning);

    return {
      question: `What does the term "${item.term}" mean?`,
      answers,
      correctIndex,
      explanation: item.explanation,
      term: item.term,
      meaning: item.meaning
    };
  }
};

// Make it globally available (safe even if already exists)
window.MedicalTermsDB = MedicalTermsDB;

(function gameModule() {
  let score = 0;
  let correct = 0;
  let streak = 0;
  let totalQuestions = 0;
  let currentQuestion = null;

  // DOM elements — using qs/qsa from script.js
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
  const difficultySelect = qs('#difficulty');

  function init() {
    loadQuestion();
    updateStats();

    // Answer clicks
    answerBtns.forEach(btn => {
      btn.addEventListener('click', () => handleAnswerClick(btn));
    });

    // Next question
    nextBtn.addEventListener('click', () => {
      loadQuestion();
      resetQuestionState();
    });

    // Hint
    hintBtn.addEventListener('click', () => {
      if (currentQuestion) {
        questionHintEl.textContent = `Hint: The root relates to something about "${currentQuestion.meaning.split(' ').slice(0, 2).join(' ')}..."`;
        questionHintEl.style.display = 'block';
      }
    });
  }

  function loadQuestion() {
    const difficulty = difficultySelect.value;
    currentQuestion = MedicalTermsDB.generateQuestion(difficulty);
    
    if (!currentQuestion) {
      questionTextEl.textContent = "No questions available for this difficulty.";
      return;
    }

    totalQuestions++;
    questionNumEl.textContent = totalQuestions;
    questionTextEl.textContent = currentQuestion.question;
    questionHintEl.textContent = '';
    questionHintEl.style.display = 'none';

    // Populate answers
    answerBtns.forEach((btn, index) => {
      btn.textContent = currentQuestion.answers[index] || '—';
      btn.disabled = false;
      btn.classList.remove('correct', 'incorrect', 'selected');
    });

    nextBtn.style.display = 'none';
    explanationCard.style.display = 'none';
  }

  function handleAnswerClick(btn) {
    if (btn.disabled) return;

    const answerIndex = parseInt(btn.dataset.answer);
    const isCorrect = answerIndex === currentQuestion.correctIndex;

    // Disable all buttons
    answerBtns.forEach(b => b.disabled = true);
    btn.classList.add('selected');

    if (isCorrect) {
      btn.classList.add('correct');
      score += 10 + (streak * 2);
      correct++;
      streak++;
    } else {
      btn.classList.add('incorrect');
      streak = 0;
      answerBtns[currentQuestion.correctIndex].classList.add('correct');
    }

    updateStats();

    if (showExplanations.checked) {
      showExplanation();
    }

    nextBtn.style.display = 'block';
  }

  function showExplanation() {
    explanationText.textContent = currentQuestion.explanation;
    explanationDetails.innerHTML = `
      <strong>Term:</strong> ${currentQuestion.term}<br>
      <strong>Meaning:</strong> ${currentQuestion.meaning}
    `;
    explanationCard.style.display = 'block';
  }

  function resetQuestionState() {
    answerBtns.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('correct', 'incorrect', 'selected');
    });
    questionHintEl.style.display = 'none';
  }

  function updateStats() {
    scoreEl.textContent = score;
    correctEl.textContent = correct;
    streakEl.textContent = streak;
    totalQuestionsEl.textContent = totalQuestions;
  }

  // Start the game when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* =========================
   Public Health Game Logic
========================= */

// Use the qs and qsa already defined in script.js — DO NOT redefine them here
// const qs = s => document.querySelector(s);
// const qsa = s => Array.from(document.querySelectorAll(s));

const PublicHealthGameDB = (() => {
  const domains = [
    {
      mode: "outbreak",
      label: "Outbreak Response",
      hazards: ["cholera", "measles", "Lassa fever", "influenza", "typhoid"],
      settings: ["school cluster", "urban settlement", "rural community", "market area", "displacement camp"],
      actions: {
        easy: [
          "Start case reporting and line listing immediately",
          "Promote handwashing and safe water messages",
          "Set up isolation and referral pathways"
        ],
        medium: [
          "Activate incident coordination and partner communication",
          "Deploy rapid response teams for active case search",
          "Strengthen contact tracing with daily follow-up"
        ],
        hard: [
          "Integrate lab confirmation, surveillance, and risk communication",
          "Use hotspot mapping to target control interventions",
          "Evaluate response indicators and adjust strategy quickly"
        ]
      }
    },
    {
      mode: "prevention",
      label: "Prevention and Behavior Change",
      hazards: ["hypertension", "type 2 diabetes", "malaria", "vaccine hesitancy", "maternal anemia"],
      settings: ["faith-based community", "secondary school", "primary healthcare center", "workplace", "village square"],
      actions: {
        easy: [
          "Share simple prevention steps in local language",
          "Encourage regular screening and early care-seeking",
          "Promote healthy diet, sleep, and physical activity"
        ],
        medium: [
          "Design community campaigns using trusted local voices",
          "Track attendance and behavior change indicators",
          "Link high-risk groups to routine preventive services"
        ],
        hard: [
          "Build multi-sector prevention plans with community leaders",
          "Use evidence to adapt messaging by audience segment",
          "Measure outcomes and scale what works"
        ]
      }
    },
    {
      mode: "healthSystems",
      label: "Health Systems and Coordination",
      hazards: ["drug stockouts", "referral delays", "staff shortages", "fragmented services", "low continuity of care"],
      settings: ["district hospital", "primary care network", "maternal clinic", "emergency unit", "community outreach post"],
      actions: {
        easy: [
          "Clarify team roles and escalation pathways",
          "Standardize triage and referral documentation",
          "Improve patient flow and appointment follow-up"
        ],
        medium: [
          "Strengthen supply monitoring and reorder systems",
          "Coordinate multidisciplinary case reviews",
          "Use service data to reduce missed care"
        ],
        hard: [
          "Implement quality-improvement cycles across facilities",
          "Align financing, workforce planning, and service targets",
          "Integrate digital tracking for continuity of care"
        ]
      }
    },
    {
      mode: "dataInsight",
      label: "Data and Surveillance",
      hazards: ["under-reporting", "late alerts", "clustered hotspots", "seasonal spikes", "incomplete records"],
      settings: ["local surveillance desk", "regional command center", "facility dashboard", "community reporting hub", "mobile outreach team"],
      actions: {
        easy: [
          "Validate reports before weekly submission",
          "Use simple dashboards to monitor trends",
          "Flag unusual increases for review"
        ],
        medium: [
          "Compare data across facilities to identify anomalies",
          "Map hotspots to prioritize interventions",
          "Link surveillance findings to field response"
        ],
        hard: [
          "Build predictive risk models for early warning",
          "Combine epidemiologic and environmental datasets",
          "Drive resource allocation using real-time indicators"
        ]
      }
    }
  ];

  const distractors = [
    "Wait for cases to rise before acting",
    "Focus only on treatment and ignore prevention",
    "Delay communication to avoid public concern",
    "Use one strategy for every community",
    "Ignore community feedback and local context",
    "Skip data validation due to time pressure",
    "Respond without role coordination",
    "Prioritize visibility over impact"
  ];

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildQuestion(domain, difficulty, i) {
    const hazard = domain.hazards[i % domain.hazards.length];
    const setting = domain.settings[(i + 1) % domain.settings.length];
    const correct = domain.actions[difficulty][i % domain.actions[difficulty].length];

    const wrong = shuffle(
      distractors.filter(d => d !== correct)
    ).slice(0, 3);

    const answers = shuffle([correct, ...wrong]);

    return {
      question: `In a ${setting} facing ${hazard}, which action best supports ${domain.label.toLowerCase()} at ${difficulty} level?`,
      answers,
      correctIndex: answers.indexOf(correct),
      explanation: `${correct}. This approach supports coordinated, evidence-based public health action.`,
      term: domain.label,
      meaning: hazard
    };
  }

  function generateBank(size = 1000) {
    const bank = [];
    const levels = ["easy", "medium", "hard"];

    for (let i = 0; i < size; i++) {
      const domain = domains[i % domains.length];
      const difficulty = levels[i % levels.length];
      bank.push({
        id: i + 1,
        mode: domain.mode,
        difficulty,
        ...buildQuestion(domain, difficulty, i)
      });
    }
    return bank;
  }

  const QUESTION_BANK = generateBank(1000);

  function getQuestion(mode = "outbreak", difficulty = "medium") {
    const pool = QUESTION_BANK.filter(q => q.mode === mode && q.difficulty === difficulty);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return {
    QUESTION_BANK,
    getQuestion
  };
})();

window.PublicHealthGameDB = PublicHealthGameDB;

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
  const gameModeSelect = qs('#gameMode');
  const randomizeOrder = qs('#randomizeOrder');

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

    difficultySelect.addEventListener('change', () => {
      loadQuestion();
      resetQuestionState();
    });

    gameModeSelect.addEventListener('change', () => {
      loadQuestion();
      resetQuestionState();
    });

    // Hint
    hintBtn.addEventListener('click', () => {
      if (currentQuestion) {
        questionHintEl.textContent = `Hint: Focus on prevention, coordination, and population-level impact for "${currentQuestion.meaning}".`;
        questionHintEl.style.display = 'block';
      }
    });
  }

  function loadQuestion() {
    const difficulty = difficultySelect.value;
    const mode = gameModeSelect.value;
    currentQuestion = PublicHealthGameDB.getQuestion(mode, difficulty);
    
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
    const answerOptions = randomizeOrder.checked
      ? [...currentQuestion.answers].sort(() => 0.5 - Math.random())
      : currentQuestion.answers;
    const correctedIndex = answerOptions.indexOf(currentQuestion.answers[currentQuestion.correctIndex]);
    currentQuestion.correctIndex = correctedIndex;

    answerBtns.forEach((btn, index) => {
      btn.textContent = answerOptions[index] || '—';
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

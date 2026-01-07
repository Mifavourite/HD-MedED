// assets/js/medical-terms.js
const MedicalTermsDB = {
  easy: [
    { term: "Cardiology", meaning: "Study of the heart", root: "cardi/o", explanation: "The prefix 'cardi/o' means heart." },
    { term: "Dermatology", meaning: "Study of the skin", root: "derm/o", explanation: "The prefix 'derm/o' means skin." },
    { term: "Osteopathy", meaning: "Treatment of bone disorders", root: "oste/o", explanation: "'Oste/o' refers to bone." },
    // Add more easy terms here
  ],
  medium: [
    { term: "Nephrology", meaning: "Study of the kidneys", root: "nephr/o", explanation: "'Nephr/o' means kidney." },
    { term: "Hepatitis", meaning: "Inflammation of the liver", root: "hepat/o", explanation: "'Hepat/o' refers to liver." },
    { term: "Arthritis", meaning: "Inflammation of joints", root: "arthr/o", explanation: "'Arthr/o' means joint." },
    // Add more
  ],
  hard: [
    { term: "Myocarditis", meaning: "Inflammation of the heart muscle", root: "my/o + cardi/o", explanation: "Combines 'my/o' (muscle) and 'cardi/o' (heart)." },
    { term: "Encephalopathy", meaning: "Disease of the brain", root: "encephal/o", explanation: "'Encephal/o' means brain." },
    { term: "Cholecystitis", meaning: "Inflammation of the gallbladder", root: "cholecyst/o", explanation: "'Cholecyst/o' refers to gallbladder." },
    // Add more challenging ones
  ],

  generateQuestion(difficulty = 'medium') {
    const pool = this[difficulty] || this.medium;
    const item = pool[Math.floor(Math.random() * pool.length)];

    // Generate 3 wrong answers from other terms in the same difficulty
    const wrongOptions = pool
      .filter(t => t.meaning !== item.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(t => t.meaning);

    // Combine and shuffle answers
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

// Make it globally available
window.MedicalTermsDB = MedicalTermsDB;

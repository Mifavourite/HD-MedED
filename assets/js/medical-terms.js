// assets/js/medical-terms.js

const MedicalTermsDB = {
  easy: [
    { term: "Cardiology", meaning: "Study of the heart", explanation: "'Cardi/o' refers to the heart." },
    { term: "Dermatology", meaning: "Study of the skin", explanation: "'Derm/o' or 'dermat/o' means skin." },
    { term: "Neurology", meaning: "Study of the nervous system", explanation: "'Neur/o' refers to nerves." },
    { term: "Osteopathy", meaning: "Treatment involving bone manipulation", explanation: "'Oste/o' means bone." },
    { term: "Pediatrics", meaning: "Branch of medicine dealing with children", explanation: "'Ped/o' refers to child." }
  ],
  medium: [
    { term: "Nephrology", meaning: "Study of the kidneys", explanation: "'Nephr/o' means kidney." },
    { term: "Hepatology", meaning: "Study of the liver", explanation: "'Hepat/o' refers to liver." },
    { term: "Arthritis", meaning: "Inflammation of the joints", explanation: "'Arthr/o' means joint." },
    { term: "Gastroenterology", meaning: "Study of the stomach and intestines", explanation: "Combines 'gastr/o' (stomach) and 'enter/o' (intestines)." },
    { term: "Endocrinology", meaning: "Study of hormones and glands", explanation: "'Endocrin/o' refers to internal secretions." }
  ],
  hard: [
    { term: "Myocarditis", meaning: "Inflammation of the heart muscle", explanation: "Combines 'my/o' (muscle) and 'cardi/o' (heart)." },
    { term: "Encephalitis", meaning: "Inflammation of the brain", explanation: "'Encephal/o' means brain." },
    { term: "Cholecystectomy", meaning: "Surgical removal of the gallbladder", explanation: "'Cholecyst/o' refers to gallbladder." },
    { term: "Pneumothorax", meaning: "Collapsed lung due to air in the chest cavity", explanation: "'Pneum/o' means air or lung." },
    { term: "Osteomyelitis", meaning: "Inflammation of bone and marrow", explanation: "Combines 'oste/o' (bone) and 'myel/o' (marrow)." }
  ],

  generateQuestion(difficulty = 'medium') {
    const pool = this[difficulty] || this.medium;
    if (pool.length === 0) return null;

    const item = pool[Math.floor(Math.random() * pool.length)];

    // Get 3 wrong meanings from the same pool
    let wrongOptions = pool
      .filter(t => t.meaning !== item.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(t => t.meaning);

    // If not enough wrongs, fall back to other difficulties
    if (wrongOptions.length < 3) {
      const fallback = [...this.easy, ...this.medium, ...this.hard]
        .filter(t => t.meaning !== item.meaning);
      wrongOptions = fallback
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - wrongOptions.length)
        .map(t => t.meaning);
    }

    // Shuffle answers
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

// Make it available globally for game.js
window.MedicalTermsDB = MedicalTermsDB;

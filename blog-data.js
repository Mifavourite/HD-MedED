// ===== HELPERS DYNASTY MEDED BLOG DATA =====
// Add new posts at the TOP of this array daily

const blogPosts = [
    {
        id: 1,
        title: "Cardiovascular Physiology: Understanding Heart Conduction",
        date: "2024-01-15",
        category: "Physiology",
        readTime: "4 min read",
        tags: ["cardiology", "ECG", "heart", "conduction"],
        content: `
            <p>The heart's electrical conduction system is a marvel of biological engineering. Today we explore the pathway that keeps your heart beating rhythmically.</p>
            
            <p><strong>Key Components:</strong></p>
            <ul>
                <li><strong>SA Node:</strong> Natural pacemaker (60-100 bpm)</li>
                <li><strong>AV Node:</strong> Gatekeeper that delays impulse</li>
                <li><strong>Bundle of His:</strong> Conducts to ventricles</li>
                <li><strong>Purkinje Fibers:</strong> Rapid ventricular activation</li>
            </ul>
            
            <p><strong>Clinical Correlation:</strong> Understanding this pathway is crucial for interpreting ECGs and diagnosing arrhythmias.</p>
            
            <p><em>Tip: Practice drawing the conduction pathway daily until it becomes second nature.</em></p>
        `
    },
    {
        id: 2,
        title: "Antibiotic Classes: Mnemonics for Medical Students",
        date: "2024-01-14",
        category: "Pharmacology",
        readTime: "3 min read",
        tags: ["antibiotics", "mnemonics", "pharmacology", "drugs"],
        content: `
            <p>Memorizing antibiotic classes can be challenging. Here are some effective mnemonics to make it easier:</p>
            
            <p><strong>Beta-Lactams:</strong> "PC Ceph" - Penicillins, Cephalosporins, Carbapenems, Monobactams</p>
            
            <p><strong>Macrolides:</strong> "ACE" - Azithromycin, Clarithromycin, Erythromycin</p>
            
            <p><strong>Fluoroquinolones:</strong> "3C's & L" - Ciprofloxacin, Levofloxacin, Moxifloxacin</p>
            
            <p><strong>Key Mechanism Points:</strong></p>
            <ul>
                <li>Beta-lactams inhibit cell wall synthesis</li>
                <li>Macrolides inhibit protein synthesis</li>
                <li>Fluoroquinolones inhibit DNA gyrase</li>
            </ul>
        `
    },
    {
        id: 3,
        title: "Active Recall: The Most Effective Study Technique",
        date: "2024-01-13",
        category: "Study Tips",
        readTime: "5 min read",
        tags: ["study techniques", "active recall", "learning", "medical school"],
        content: `
            <p>Active recall is arguably the most effective study technique for medical students. Instead of passively re-reading, you actively retrieve information from memory.</p>
            
            <p><strong>How to Implement Active Recall:</strong></p>
            <ol>
                <li>Study a topic for 20-30 minutes</li>
                <li>Close your books and write down everything you remember</li>
                <li>Check what you missed and review those points</li>
                <li>Repeat after increasing time intervals</li>
            </ol>
            
            <p><strong>Tools for Active Recall:</strong></p>
            <ul>
                <li>Anki flashcards</li>
                <li>Self-testing questions</li>
                <li>Teaching concepts to others</li>
                <li>Practice questions banks</li>
            </ul>
            
            <p><em>Research shows active recall can improve retention by 50-70% compared to passive review.</em></p>
        `
    },
    {
        id: 4,
        title: "Brachial Plexus: Simplified Anatomy Guide",
        date: "2024-01-12",
        category: "Anatomy",
        readTime: "4 min read",
        tags: ["anatomy", "brachial plexus", "upper limb", "nerves"],
        content: `
            <p>The brachial plexus doesn't have to be intimidating. Let's break it down systematically.</p>
            
            <p><strong>Mnemonic: "Robert Taylor Drinks Cold Beer"</strong></p>
            <ul>
                <li><strong>R</strong>oots (C5-T1)</li>
                <li><strong>T</strong>runks (Upper, Middle, Lower)</li>
                <li><strong>D</strong>ivisions (Anterior, Posterior)</li>
                <li><strong>C</strong>ords (Lateral, Posterior, Medial)</li>
                <li><strong>B</strong>ranches (Major nerves)</li>
            </ul>
            
            <p><strong>Major Nerves & Testing:</strong></p>
            <ul>
                <li>Musculocutaneous: Elbow flexion</li>
                <li>Radial: Wrist extension</li>
                <li>Median: Thumb opposition</li>
                <li>Ulnar: Finger abduction</li>
                <li>Axillary: Shoulder abduction</li>
            </ul>
        `
    },
    {
        id: 5,
        title: "Clinical Case: Chest Pain Differential Diagnosis",
        date: "2024-01-11",
        category: "Clinical",
        readTime: "6 min read",
        tags: ["clinical cases", "chest pain", "diagnosis", "emergency"],
        content: `
            <p><strong>Case Presentation:</strong> 55-year-old male presents with sudden onset chest pain radiating to left arm.</p>
            
            <p><strong>Critical Differentials:</strong></p>
            <ul>
                <li>Acute Coronary Syndrome (MI)</li>
                <li>Pulmonary Embolism</li>
                <li>Aortic Dissection</li>
                <li>Pneumothorax</li>
                <li>Pericarditis</li>
            </ul>
            
            <p><strong>Key History Questions:</strong></p>
            <ul>
                <li>Character of pain (crushing, sharp, tearing)?</li>
                <li>Associated symptoms (SOB, diaphoresis, nausea)?</li>
                <li>Risk factors (smoking, hypertension, diabetes)?</li>
                <li>What relieves the pain?</li>
            </ul>
            
            <p><strong>Immediate Workup:</strong> ECG, Troponin, CXR, ABG</p>
            
            <p><em>Remember: Time is muscle in cardiac events.</em></p>
        `
    },
    {
        id: 6,
        title: "Renin-Angiotensin-Aldosterone System (RAAS)",
        date: "2024-01-10",
        category: "Physiology",
        readTime: "3 min read",
        tags: ["RAAS", "blood pressure", "physiology", "kidney"],
        content: `
            <p>The RAAS system is crucial for blood pressure regulation and fluid balance.</p>
            
            <p><strong>Pathway Summary:</strong></p>
            <ol>
                <li>Low BP → Kidney releases Renin</li>
                <li>Renin converts Angiotensinogen → Angiotensin I</li>
                <li>ACE converts Angiotensin I → Angiotensin II</li>
                <li>Angiotensin II causes vasoconstriction + Aldosterone release</li>
                <li>Aldosterone → Sodium/water retention → Increased BP</li>
            </ol>
            
            <p><strong>Clinical Applications:</strong></p>
            <ul>
                <li>ACE inhibitors block conversion to Angiotensin II</li>
                <li>ARBs block Angiotensin II receptors</li>
                <li>Both used in hypertension and heart failure</li>
            </ul>
        `
    }
    // ADD NEW POSTS HERE DAILY - Always add at the TOP of the array
];

// Utility functions for blog management
const blogUtils = {
    // Sort posts by date (newest first)
    getSortedPosts: () => {
        return blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    // Get posts by category
    getPostsByCategory: (category) => {
        if (category === 'all') return blogUtils.getSortedPosts();
        return blogUtils.getSortedPosts().filter(post => post.category === category);
    },
    
    // Search posts
    searchPosts: (query) => {
        const lowerQuery = query.toLowerCase();
        return blogUtils.getSortedPosts().filter(post => 
            post.title.toLowerCase().includes(lowerQuery) ||
            post.content.toLowerCase().includes(lowerQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },
    
    // Get total post count
    getTotalPosts: () => blogPosts.length,
    
    // Get categories with counts
    getCategories: () => {
        const categories = {};
        blogPosts.forEach(post => {
            categories[post.category] = (categories[post.category] || 0) + 1;
        });
        return categories;
    }
};

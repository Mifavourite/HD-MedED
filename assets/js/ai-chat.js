/* =========================
   AI Chatbot Module
   ========================= */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

// Wait for DOM to be ready
function initAIChat() {
  const messagesContainer = qs('#aiChatMessages');
  const chatInput = qs('#aiChatInput');
  const sendBtn = qs('#aiSendBtn');
  
  if (!messagesContainer || !chatInput || !sendBtn) {
    console.error('AI Chat: Required elements not found', { messagesContainer, chatInput, sendBtn });
    return;
  }
  
  console.log('AI Chat: Initializing...');
  
(function aiChatModule() {

  // Knowledge base for healthcare/medical questions
  const knowledgeBase = {
    terminology: {
      keywords: ['terminology', 'term', 'definition', 'meaning', 'what is', 'define'],
      responses: [
        "Medical terminology is the language used by healthcare professionals. Terms are often derived from Greek and Latin roots. For example, 'cardio' means heart, 'pulmo' means lung.",
        "Understanding medical terminology helps you communicate effectively in healthcare. Most terms follow patterns: prefix (beginning), root (middle), and suffix (end).",
        "Learning medical terminology: break down words into parts, use flashcards, practice with real cases, and create associations."
      ]
    },
    study: {
      keywords: ['study', 'learn', 'memorize', 'remember', 'how to', 'tips', 'strategy'],
      responses: [
        "Effective study strategies for medical students: active recall, spaced repetition, teach others, use mnemonics, and practice with case studies.",
        "Create a study schedule: 25-50 minute focused sessions with 5-10 minute breaks. Use the Pomodoro Technique for better retention.",
        "Study groups are powerful: explain concepts to others, quiz each other, share resources, and stay accountable together."
      ]
    },
    anatomy: {
      keywords: ['anatomy', 'body', 'organ', 'system', 'structure', 'physiology'],
      responses: [
        "Human anatomy is the study of body structures. Start with systems: skeletal, muscular, cardiovascular, respiratory, nervous, digestive, etc.",
        "Use 3D models, anatomy apps, and dissection videos. Practice labeling diagrams and create your own sketches.",
        "Remember: anatomy describes structure, physiology describes function. Understanding both together gives complete knowledge."
      ]
    },
    career: {
      keywords: ['career', 'job', 'residency', 'specialty', 'future', 'path'],
      responses: [
        "Healthcare offers diverse career paths: clinical practice, research, public health, healthcare administration, medical education, and more.",
        "Explore specialties through shadowing, rotations, and networking. Consider your interests: patient interaction level, work-life balance, and long-term goals.",
        "Build your resume: volunteer, research, leadership roles, and maintain excellent grades. Seek mentors in your field of interest."
      ]
    },
    general: {
      keywords: [],
      responses: [
        "I'm here to help with healthcare and medical education questions! You can ask me about medical terminology, study strategies, anatomy, career paths, or any medical concepts.",
        "Helpers Dynasty focuses on supporting healthcare students and professionals. We offer study sessions, mentorship, and educational resources.",
        "For more detailed help, consider joining our study sessions or connecting with a mentor through Helpers Dynasty. Check our events page for upcoming sessions!"
      ]
    }
  };

  // Generate AI response based on user input
  function generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Determine category
    let category = 'general';
    let maxMatches = 0;
    
    for (const [cat, data] of Object.entries(knowledgeBase)) {
      if (cat === 'general') continue;
      const matches = data.keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        category = cat;
      }
    }
    
    // Get random response from category
    const responses = knowledgeBase[category].responses;
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Add contextual follow-up
    if (category !== 'general') {
      response += " Would you like to know more about this topic, or do you have another question?";
    }
    
    return response;
  }

  // Add typing indicator
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message ai-assistant';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="ai-typing-indicator">
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Remove typing indicator
  function hideTypingIndicator() {
    const indicator = qs('#typingIndicator');
    if (indicator) indicator.remove();
  }

  // Add message to chat
  function addMessage(text, isUser = false) {
    hideTypingIndicator();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${isUser ? 'ai-user' : 'ai-assistant'}`;
    
    const content = text.split('\n').map(para => `<p>${escapeHTML(para)}</p>`).join('');
    
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Escape HTML to prevent injection
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Handle send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI thinking (realistic delay)
    setTimeout(() => {
      const response = generateResponse(message);
      addMessage(response, false);
    }, 1000 + Math.random() * 1500); // 1-2.5 seconds delay
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
  });
})();
  } // End of initAIChat
}

// Initialize AI chat when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIChat);
} else {
  initAIChat();
}

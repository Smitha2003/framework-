// Authentication Module
const Auth = {
  // Predefined users with their cognitive styles
  users: {
    architect: { password: 'architect123', brainType: 'Architect' },
    sprinter: { password: 'sprinter123', brainType: 'Sprinter' },
    dreamer: { password: 'dreamer123', brainType: 'Dreamer' },
    juggler: { password: 'juggler123', brainType: 'Juggler' },
    minimalist: { password: 'minimalist123', brainType: 'Minimalist' }
  },

  // Validate login credentials
  login(username, password) {
    const user = this.users[username.toLowerCase()];
    
    if (user && user.password === password) {
      return {
        success: true,
        username: username.toLowerCase(),
        brainType: user.brainType
      };
    }
    
    return {
      success: false,
      error: 'Invalid username or password'
    };
  },

  // Set current user session
  setCurrentUser(username, brainType) {
    localStorage.setItem('currentUser', username);
    localStorage.setItem('userBrainType', brainType);
  },

  // Get current user
  getCurrentUser() {
    return localStorage.getItem('currentUser');
  },

  // Get user's brain type
  getUserBrainType() {
    return localStorage.getItem('userBrainType');
  },

  // Logout
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userBrainType');
    localStorage.removeItem('quizResult');
    // clear any session-scoped dashboard data (e.g. Eisenhower temporary items)
    try { sessionStorage.clear(); } catch (e) { /* ignore */ }
    window.location.href = 'login.html';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('currentUser');
  },

  // Save quiz result
  saveQuizResult(brainType) {
    localStorage.setItem('quizResult', brainType);
  },

  // Get quiz result
  getQuizResult() {
    return localStorage.getItem('quizResult');
  }
};

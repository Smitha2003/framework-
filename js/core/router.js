// Router Module - Handles page navigation
const Router = {
  // Navigate to a page and store in history
  navigate(page) {
    window.location.href = page;
  },

  // Get current page
  getCurrentPage() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || 'index.html';
    return filename;
  },

  // Redirect if not authenticated (except for login, quiz, result, signup)
  requireAuth() {
    const currentPage = this.getCurrentPage();
    const publicPages = ['index.html', 'login.html', 'quiz.html', 'result.html', 'signup.html'];
    
    if (!publicPages.includes(currentPage)) {
      const user = localStorage.getItem('currentUser');
      if (!user) {
        window.location.href = 'login.html';
      }
    }
  },

  // Redirect if already authenticated
  requireNoAuth() {
    const currentPage = this.getCurrentPage();
    const user = localStorage.getItem('currentUser');
    
    if (user && currentPage === 'login.html') {
      window.location.href = 'dashboard.html';
    }
  }
};

// Run on every page load
document.addEventListener('DOMContentLoaded', () => {
  Router.requireAuth();
});

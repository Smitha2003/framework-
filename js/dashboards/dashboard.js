// Main Dashboard Logic
function initializeDashboard() {
  // Get current user
  const username = Auth.getCurrentUser();
  const brainType = Auth.getUserBrainType();

  if (!username || !brainType) {
    // User is not authenticated, redirect to login
    window.location.href = 'login.html';
    return;
  }

  // Set greeting
  const hour = new Date().getHours();
  let greetingText = 'Good morning';
  if (hour >= 12 && hour < 18) {
    greetingText = 'Good afternoon';
  } else if (hour >= 18) {
    greetingText = 'Good evening';
  }

  document.getElementById('greeting').textContent = greetingText + ',';
  document.getElementById('username').textContent = capitalizeFirst(username);

  // Get brain type info (QuizLogic keys are lowercase)
  const brainTypeInfo = QuizLogic.getBrainTypeInfo(brainType.toLowerCase());
  document.getElementById('brain-type-badge').textContent = `${brainTypeInfo.emoji} ${brainType}`;

  // Load appropriate dashboard based on brain type
  // render sidebar and then load content
  if (typeof renderSidebar === 'function') renderSidebar(brainType);
  loadBrainTypeDashboard(brainType);
}

function loadBrainTypeDashboard(brainType) {
  const contentContainer = document.getElementById('dashboard-content');

  // Clear loading state
  contentContainer.innerHTML = '';

  switch (brainType) {
    case 'Architect':
      renderArchitectDashboard(contentContainer);
      break;
    case 'Sprinter':
      renderSprinterDashboard(contentContainer);
      break;
    case 'Dreamer':
      renderDreamerDashboard(contentContainer);
      break;
    case 'Juggler':
      renderJugglerDashboard(contentContainer);
      break;
    case 'Minimalist':
      renderMinimalistDashboard(contentContainer);
      break;
    default:
      contentContainer.innerHTML = '<p>Brain type not found</p>';
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    Auth.logout();
  }
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Router.requireAuth();
  initializeDashboard();
});

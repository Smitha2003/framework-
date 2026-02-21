// Login Page Logic
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Disable button
  const btn = document.querySelector('.auth-btn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  // Simulate API delay
  setTimeout(() => {
    // Authenticate user
    const result = Auth.login(username, password);

    if (result.success) {
      // Set current user session
      Auth.setCurrentUser(result.username, result.brainType);

      // Show success message
      showAlert('Login successful! Redirecting to dashboard...', 'success');

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      // Show error message
      showAlert(result.error, 'error');

      // Reset button
      btn.disabled = false;
      btn.textContent = 'Log In';

      // Clear password field
      document.getElementById('password').value = '';
    }
  }, 1000);
}

function showAlert(message, type) {
  const form = document.getElementById('login-form');
  
  // Remove existing alert if any
  const existingAlert = form.previousElementSibling;
  if (existingAlert && existingAlert.classList.contains('alert')) {
    existingAlert.remove();
  }

  // Create new alert
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  form.parentElement.insertBefore(alert, form);

  // Remove alert after 5 seconds (except success)
  if (type !== 'success') {
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Router.requireNoAuth();
});

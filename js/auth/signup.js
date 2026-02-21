// Sign Up Simulation Logic
function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Validation
  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters', 'error');
    return;
  }

  // Disable button
  const btn = document.querySelector('.auth-btn');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  // Simulate API delay
  setTimeout(() => {
    // Clear form
    document.getElementById('signup-form').reset();

    // Show success message
    showAlert('Account created successfully! Welcome to framework()', 'success');

    // Reset button
    btn.disabled = false;
    btn.textContent = 'Create Account';

    // Note: The button click doesn't navigate to anywhere as per requirements (simulation)
  }, 1500);
}

function showAlert(message, type) {
  const form = document.getElementById('signup-form');
  
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

  // Remove alert after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Router.requireNoAuth();
});

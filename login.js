// login.js - Handles login page functionality
// Google Apps Script Web App URL - Replace with your actual URL
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// Login form submission handler
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showLoginError('Please enter both username and password.');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    // Make login request
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'login',
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store user session in localStorage
            const userSession = {
                username: username,
                department: data.department,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(userSession));

            // Redirect to department-specific page
            redirectToDepartmentPage(data.department);
        } else {
            showLoginError(data.message || 'Login failed. Please check your credentials.');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showLoginError('Network error. Please check your connection and try again.');
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Redirect user to their department-specific page
function redirectToDepartmentPage(department) {
    const departmentPages = {
        // START WITH OTCSALES DEPARTMENT ONLY
        'OTCSALES': 'otcsales.html',

        // ADD MORE DEPARTMENTS HERE AS YOU EXPAND:
        // 'PURCHASING': 'purchasing.html',
        // 'ACCOUNTING': 'accounting.html',
        // etc...

        // Backward compatibility for existing departments
        'HR': 'hr.html'
    };

    const page = departmentPages[department];
    if (page) {
        window.location.href = page;
    } else {
        // Fallback to login page if department not recognized
        console.warn('Unknown department:', department);
        alert('Unknown department. Please contact your administrator.');
        window.location.href = 'index.html';
    }
}

// Show error message on login page
function showLoginError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Check if user is already logged in (redirect to department page if so)
function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            // Check if session is not too old (e.g., 8 hours)
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            if (hoursDiff < 8) { // Session valid for 8 hours
                redirectToDepartmentPage(user.department);
                return;
            } else {
                // Session expired, remove it
                localStorage.removeItem('currentUser');
            }
        } catch (e) {
            // Invalid session data, remove it
            localStorage.removeItem('currentUser');
        }
    }
}

// Clear any existing error messages when user starts typing
function clearLoginErrors() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv.style.display !== 'none') {
        errorDiv.style.display = 'none';
    }
}

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session
    checkExistingSession();

    // Set up form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);

        // Clear errors when user starts typing
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', clearLoginErrors);
        });
    }
});
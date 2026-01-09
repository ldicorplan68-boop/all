// otcsales.js - OTCSALES Department Page Functionality
// Google Apps Script Web App URL - Replace with your actual URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwtYTG8CJUywLMfrJbihTmpthK1129HbuE6zIxTSsoNXA-86bNFZNeSHB-uX-daJDA/exec';

// Global variables
let currentUser = null;
const DEPARTMENT = 'OTCSALES';

// Check authentication and initialize page
function initializeOTCSALESPage() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            redirectToLogin();
            return;
        }

        currentUser = JSON.parse(userData);

        // Validate session
        if (!isValidSession(currentUser) || currentUser.department !== DEPARTMENT) {
            handleSessionExpired();
            return;
        }

        // Setup page UI
        setupUserInterface();
        setupEventListeners();

        // Load OTCSALES data immediately
        loadOTCSALESData();

    } catch (error) {
        console.error('OTCSALES page initialization error:', error);
        redirectToLogin();
    }
}

// Validate user session
function isValidSession(user) {
    if (!user || !user.username || !user.department) {
        return false;
    }

    // Check if session is not too old (8 hours)
    if (user.loginTime) {
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        return hoursDiff < 8;
    }

    return true;
}

// Handle expired session
function handleSessionExpired() {
    localStorage.removeItem('currentUser');
    alert('Your session has expired or you do not have access to this department. Please log in again.');
    redirectToLogin();
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}

// Setup user interface
function setupUserInterface() {
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = `Logged in as: ${currentUser.username}`;
    }

    // Update page title
    document.title = `OTCSALES Department - ${currentUser.username}`;
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        redirectToLogin();
    }
}

// Load OTCSALES data
function loadOTCSALESData() {
    showLoadingState('Loading OTCSALES data...');

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getDepartmentData',
            username: currentUser.username,
            department: DEPARTMENT
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            displayOTCSALESData(data.headers, data.data);
        } else {
            handleApiError(data.message || 'Failed to load OTCSALES data');
        }
    })
    .catch(error => {
        console.error('OTCSALES data fetch error:', error);
        handleApiError('Network error. Please check your connection and try again.');
    });
}

// Display OTCSALES data
function displayOTCSALESData(headers, rows) {
    const dataContainer = document.getElementById('dataContainer');

    if (!dataContainer) return;

    let html = `<div class="data-section">
        <h2>OTCSALES Department Data</h2>`;

    if (!rows || rows.length === 0) {
        html += '<p class="no-data">No OTCSALES data available.</p>';
    } else {
        html += '<div class="data-stats">Total records: ' + rows.length + '</div>';
        html += '<div class="table-container"><table class="data-table">';

        // Table headers
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';

        // Table data
        html += '<tbody>';
        rows.forEach((row, index) => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
    }

    html += '</div>';
    dataContainer.innerHTML = html;
}

// Show loading state
function showLoadingState(message = 'Loading data...') {
    const dataContainer = document.getElementById('dataContainer');
    if (dataContainer) {
        dataContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

// Handle API errors
function handleApiError(message) {
    const dataContainer = document.getElementById('dataContainer');
    if (dataContainer) {
        dataContainer.innerHTML = `
            <div class="error-state">
                <p class="error-message">⚠️ ${message}</p>
                <button onclick="loadOTCSALESData()" class="btn btn-secondary">Retry</button>
            </div>
        `;
    }

    console.error('OTCSALES data error:', message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeOTCSALESPage);
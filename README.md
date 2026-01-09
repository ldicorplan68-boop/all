# Department Access System

A complete web-based system for department-based access control using Google Sheets, Google Apps Script, and GitHub Pages. Now supporting **33 departments** with dedicated pages for each department.

## Project Structure

```
department-access-system/
├── index.html                    # Login page
├── apps-script-code.gs           # Google Apps Script backend code (copy to GAS)
├── login.js                      # Login page JavaScript
├── otcsales.html                 # OTC Sales department page
├── otcsales.js                   # OTC Sales department logic
├── css/
│   └── styles.css               # All styling
├── Documentation:
│   ├── README.md                   # Project overview
│   └── SETUP.md                    # Step-by-step setup guide
└── README.md                                   # This file
```

## Features

- **Secure Authentication**: Username/password validation via Google Apps Script
- **1 Department Page**: Dedicated page for OTCSALES department
- **Department-Specific Access**: Users can only access their assigned department data
- **Session Management**: Automatic session handling with localStorage (8-hour timeout)
- **Clean Interface**: Simple, logo-free department pages
- **Google Sheets Integration**: Data stored securely in Google Sheets
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and loading states
- **Direct Access**: Users login once and go directly to their department

## 📋 Overview

A streamlined Department Access System for **OTCSALES** department with secure authentication and **separate Google Sheets** for data storage.

## 🚀 Quick Setup

**Follow the [Simple Setup Guide](SETUP.md)** for step-by-step instructions to get your system running in minutes.

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet named "DepartmentAccessSystem"
2. Create the following sheets (tabs):

**Users Sheet:**
| Username | Password | Department |
|----------|----------|------------|
| john.doe | pass123  | Accounting |
| jane.smith| pass456 | HR        |

**Department Sheets** (create one for each department):
- ACCOUNTING, ADMIN, ART, AUDIT, BRAND, CEV, CMD, CNC, DEPOT LUZON, ENGINEERING
- EXECUTIVE, FEI SALES, HRMD, LEGAL, LOGISTICS, MIS, MMD, NM, OTCSALES
- PAYROLL, PMO, PRODUCTION, PROMO, PURCHASING, QA, QC, REGULATORY
- RND, SM, TECHNICAL, TOLLING, TREASURY, VETREG, WV

Each department sheet should have relevant data columns.

### 2. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create new project named "DepartmentAccessAPI"
3. **Option 1**: Copy the code from `apps-script-code.gs` file and paste it into the script editor
4. **Option 2**: Copy the code from the "Google Apps Script Code" section below
5. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
   - Copy the deployment URL

### 3. Update API URLs

Replace `YOUR_DEPLOYMENT_ID` in these files:
- `login.js`
- All department JavaScript files (33 files):
  - `accounting.js`, `admin.js`, `art.js`, `audit.js`, `brand.js`, `cev.js`, `cmd.js`, `cnc.js`
  - `depot-luzon.js`, `engineering.js`, `executive.js`, `fei-sales.js`, `hrmd.js`, `legal.js`
  - `logistics.js`, `mis.js`, `mmd.js`, `nm.js`, `otcsales.js`, `payroll.js`, `pmo.js`
  - `production.js`, `promo.js`, `purchasing.js`, `qa.js`, `qc.js`, `regulatory.js`
  - `rnd.js`, `sm.js`, `technical.js`, `tolling.js`, `treasury.js`, `vetreg.js`, `wv.js`
  - Legacy: `hr.js`

With your actual Apps Script deployment ID.

### 4. GitHub Pages Deployment

1. Create new GitHub repository
2. Upload all files
3. Enable GitHub Pages in repository settings
4. Access your site at: `https://yourusername.github.io/repository-name/`

## File Descriptions

### HTML Files
- `index.html`: Login page with authentication form
- `otcsales.html`: OTC Sales department page

### JavaScript Files
- `login.js`: Handles login form submission, authentication, and redirects to department pages
- `otcsales.js`: OTC Sales department functionality

### Google Apps Script
- `apps-script-code.gs`: Backend API code to copy into Google Apps Script (deploy as Web App)

### CSS
- `css/styles.css`: Complete styling for all components with responsive design

## Google Apps Script Code

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch(action) {
      case 'login':
        return login(data.username, data.password);
      case 'getDepartmentData':
        return getDepartmentData(data.username, data.department);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function login(username, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === password) {
      const department = data[i][2];
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          department: department,
          message: 'Login successful'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({success: false, message: 'Invalid credentials'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDepartmentData(username, requestedDepartment) {
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const userData = usersSheet.getDataRange().getValues();

  let userDepartment = null;
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0] === username) {
      userDepartment = userData[i][2];
      break;
    }
  }

  if (!userDepartment) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'User not found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (userDepartment !== requestedDepartment) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Access denied'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const deptSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(requestedDepartment);
  if (!deptSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Department not found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = deptSheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      headers: headers,
      data: rows
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Security Features

- **Server-side validation**: All access requests validated on Google Apps Script
- **Department authorization**: Users can only access their assigned department
- **Session management**: Automatic logout after 8 hours
- **Input validation**: Client and server-side input validation
- **CORS protection**: Apps Script handles cross-origin requests

## Customization

### Adding New Departments
1. Create department HTML and JavaScript files (use existing department files as templates)
2. Add department mapping to `redirectToDepartmentPage` function in `login.js`
3. Add department icon to `DEPARTMENT_ICONS` object in `department-icons.js`
4. Create new sheet in Google Sheets
5. Add users to Users sheet with new department

### Styling Changes
Modify `css/styles.css` to customize appearance:
- Color scheme: Update CSS custom properties
- Layout: Adjust grid templates and spacing
- Animations: Modify keyframes and transitions

### Session Timeout
Change session timeout in any department JavaScript file (e.g., `accounting.js`):
```javascript
const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
return hoursDiff < 8; // Change 8 to desired hours
```

## Troubleshooting

### Common Issues

1. **"Invalid action" error**: Check API URL and Apps Script deployment
2. **"Access denied"**: Verify user department matches in Google Sheets
3. **Buttons not enabling**: Check JavaScript console for errors
4. **Data not loading**: Verify sheet names and permissions

### Debug Mode
Add to browser console to debug:
```javascript
// Check current session
console.log(JSON.parse(localStorage.getItem('currentUser')));

// Test API connection
fetch('YOUR_API_URL', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({action: 'login', username: 'test', password: 'test'})
}).then(r => r.json()).then(console.log);
```

## Production Considerations

- **HTTPS**: Ensure all connections use HTTPS
- **Password hashing**: Implement proper password hashing
- **Rate limiting**: Add rate limiting to Apps Script
- **Logging**: Implement user activity logging
- **Backup**: Regular Google Sheets backups

## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Verify Apps Script logs in Google Cloud Console
3. Test API endpoints directly with curl/Postman
4. Ensure all file paths are correct in repository

## License

This project is provided as-is for educational purposes.
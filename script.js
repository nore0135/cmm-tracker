// ===== CHANGE THIS TO YOUR APPS SCRIPT URL =====
const API_URL = "https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent/exec";
// Example: https://script.google.com/macros/d/1abc123xyz/usercontent/exec

// ===== Load data when page opens =====
window.addEventListener('load', function() {
  loadParts();
});

// ===== FUNCTION: Get all parts from Google Sheets =====
async function loadParts() {
  try {
    const response = await fetch(API_URL + "?action=getAllParts");
    const data = await response.json();
    
    displayParts(data);
    updateDashboard(data);
  } catch (error) {
    console.error('Error loading parts:', error);
    document.getElementById('partsList').innerHTML = '<p>Error loading parts</p>';
  }
}

// ===== FUNCTION: Show parts on the page =====
function displayParts(data) {
  const partsList = document.getElementById('partsList');
  
  if (data.length <= 1) { // Only headers
    partsList.innerHTML = '<p>No parts added yet</p>';
    return;
  }

  let html = '';
  
  for (let i = 1; i < data.length; i++) {
    const part = data[i];
    const status = part[7] || 'pending';
    const statusClass = status === 'completed' ? 'completed' : 'pending';
    
    html += `
      <div class="part-item">
        <div class="part-info">
          <h3>${part[1]}</h3>
          <p>Part #: ${part[2]}</p>
          <p>Holes: ${part[3]} | Spots: ${part[4]} | Surface: ${part[5]}</p>
        </div>
        <span class="status ${statusClass}">${status.toUpperCase()}</span>
      </div>
    `;
  }
  
  partsList.innerHTML = html;
}

// ===== FUNCTION: Update dashboard stats =====
function updateDashboard(data) {
  let total = data.length - 1;
  let completed = 0;
  let pending = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === 'completed') completed++;
    else pending++;
  }
  
  document.getElementById('stats').innerHTML = `
    <div class="stat-card">
      <p>Total Parts</p>
      <h3>${total}</h3>
    </div>
    <div class="stat-card">
      <p>Completed</p>
      <h3 style="color: green;">${completed}</h3>
    </div>
    <div class="stat-card">
      <p>Pending</p>
      <h3 style="color: red;">${pending}</h3>
    </div>
  `;
}

// ===== FUNCTION: Add new part =====
function addPart(event) {
  event.preventDefault();
  
  const partName = document.getElementById('partName').value;
  const partNumber = document.getElementById('partNumber').value;
  
  fetch(API_URL + "?action=addPart", {
    method: 'POST',
    payload: JSON.stringify({
      action: 'addPart',
      partName: partName,
      partNumber: partNumber
    })
  })
  .then(response => response.text())
  .then(result => {
    alert('Part added successfully!');
    document.getElementById('partName').value = '';
    document.getElementById('partNumber').value = '';
    loadParts(); // Refresh the list
  })
  .catch(error => console.error('Error:', error));
}

// ===== FUNCTION: Check PDF updates =====
function checkUpdates() {
  const month = document.getElementById('monthSelect').value;
  const year = new Date().getFullYear();
  
  fetch(API_URL + `?action=checkAllPDFs&month=${month}&year=${year}`)
    .then(response => response.json())
    .then(data => {
      let html = '<h3>Update Status for ' + month + '/' + year + '</h3>';
      
      data.forEach(update => {
        const statusClass = update.status === 'completed' ? 'completed' : 'pending';
        html += `
          <div class="monthly-item">
            <p>Part ${update.partId}</p>
            <span class="status ${statusClass}">${update.status}</span>
          </div>
        `;
      });
      
      document.getElementById('monthlyStatus').innerHTML = html;
    })
    .catch(error => console.error('Error:', error));
}

// Add change listener to month selector
document.getElementById('monthSelect')?.addEventListener('change', checkUpdates);

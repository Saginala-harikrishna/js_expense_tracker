// dashboard.js
// === Initialization ===
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const totalSpentEl = document.getElementById('totalSpent');
const transactionCountEl = document.getElementById('transactionCount');
const budgetLimitEl = document.getElementById('budgetLimit');
const progressFill = document.getElementById('progressFill');
const remainingText = document.getElementById('remainingText');
const budgetInput = document.getElementById('budgetInput');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const filters = document.querySelectorAll('.filter');
const searchBox = document.getElementById('searchBox');
const sortOrder = document.getElementById('sortOrder');
const logoutBtn = document.getElementById('logoutBtn');
const currentDate = document.getElementById('currentDate');

// === State ===
let expenses = [];
let budgetLimit = 0;
let user = JSON.parse(localStorage.getItem('loggedInUser'));

// === Check Auth ===
if (!user) {
  alert('Please login first.');
  window.location.href = 'login.html';
}

// === Initialization Calls ===
document.addEventListener('DOMContentLoaded', () => {
  currentDate.textContent = new Date().toLocaleDateString();
  loadData();
  renderExpenses();
  renderStats();
});

// === Event Listeners ===
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const expense = {
    id: Date.now(),
    title: titleInput.value,
    amount: parseFloat(amountInput.value),
    category: categorySelect.value,
    date: new Date().toISOString(),
  };
  expenses.push(expense);
  saveData();
  renderExpenses();
  renderStats();
  expenseForm.reset();
});

setBudgetBtn.addEventListener('click', () => {
  const input = parseFloat(budgetInput.value);
  if (!isNaN(input)) {
    budgetLimit = input;
    saveData();
    renderStats();
  }
});

clearDataBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all data?')) {
    expenses = [];
    budgetLimit = 0;
    saveData();
    renderExpenses();
    renderStats();
  }
});

filters.forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    btn.classList.add('active');
    renderExpenses();
  });
});

searchBox.addEventListener('input', renderExpenses);
sortOrder.addEventListener('change', renderExpenses);
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  alert("user logout");
  window.location.href = 'index.html';
});

// === Core Functions ===
function saveData() {
  const userData = {
    expenses,
    budgetLimit
  };
  localStorage.setItem(user.username + '_data', JSON.stringify(userData));
}

function loadData() {
  const stored = JSON.parse(localStorage.getItem(user.username + '_data'));
  if (stored) {
    expenses = stored.expenses || [];
    budgetLimit = stored.budgetLimit || 0;
  }
}

function renderExpenses() {
  const filter = document.querySelector('.filter.active').textContent;
  const search = searchBox.value.toLowerCase();
  const sort = sortOrder.value;

  let filtered = expenses.filter(exp => {
    return (filter === 'All' || exp.category === filter) &&
           (exp.title.toLowerCase().includes(search));
  });

  filtered.sort((a, b) => {
    return sort === 'newest' ? b.id - a.id : a.id - b.id;
  });

  expensesList.innerHTML = '';
filtered.forEach((exp) => {
  const div = document.createElement('div');
  div.className = 'expense-item';
  div.innerHTML = `
    <div class="expense-details">
      <p><strong>${exp.title}</strong> - $${exp.amount.toFixed(2)}</p>
      <p>${exp.category} | ${new Date(exp.date).toLocaleDateString()}</p>
    </div>
    <button onclick="deleteExpense(${exp.id})">🗑️</button>
  `;
  expensesList.appendChild(div);
});

}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveData();
  renderExpenses();
  renderStats();
}

function renderStats() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalSpentEl.textContent = `$${total.toFixed(2)}`;
  transactionCountEl.textContent = expenses.length;
  budgetLimitEl.textContent = `$${budgetLimit.toFixed(2)}`;
  const percent = budgetLimit > 0 ? Math.min((total / budgetLimit) * 100, 100) : 0;
  progressFill.style.width = `${percent}%`;
  const remaining = budgetLimit - total;
  remainingText.textContent = remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `⚠️ Over budget by $${Math.abs(remaining).toFixed(2)}`;
  remainingText.style.color = remaining < 0 ? 'red' : 'green';
  drawCharts();
}

// === Chart Drawing ===
function drawCharts() {
  // Category Chart
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Monthly Chart
  const monthlyTotals = {};
  expenses.forEach(e => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
  });

  const monthlyChart = new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(monthlyTotals),
      datasets: [{
        label: 'Expenses',
        data: Object.values(monthlyTotals),
        backgroundColor: '#3498db'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

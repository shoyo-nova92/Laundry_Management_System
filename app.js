// Campus Laundry Management System - Main Application
class LaundryApp {
  constructor() {
    this.currentUser = null;
    this.nextStudentNumber = 0;
    this.init();
  }

  init() {
    this.loadData();
    this.setupEventListeners();
    this.setupQuantityControls();
    this.handleConfirmOrderRedirect();
    this.checkSession();
  }

  // Data Management

  loadData() {
    const users = localStorage.getItem('laundry_users');
    const orders = localStorage.getItem('laundry_orders');
    const nextStudentNum = localStorage.getItem('laundry_next_student_number');
    this.users = users ? JSON.parse(users) : [];
    this.orders = orders ? JSON.parse(orders) : [];
    this.nextStudentNumber = nextStudentNum ? parseInt(nextStudentNum) : 0;
  }

  saveData() {
    localStorage.setItem('laundry_users', JSON.stringify(this.users));
    localStorage.setItem('laundry_orders', JSON.stringify(this.orders));
    localStorage.setItem('laundry_next_student_number', this.nextStudentNumber.toString());
  }

  // Session Management

  checkSession() {
    const session = sessionStorage.getItem('laundry_session');
    if (session) {
      this.currentUser = JSON.parse(session);
      this.showDashboard();
    } else {
      this.showAuth();
    }
  }

  saveSession(user) {
    sessionStorage.setItem('laundry_session', JSON.stringify(user));
  }

  clearSession() {
    sessionStorage.removeItem('laundry_session');
    this.currentUser = null;
  }

  // Event Listeners

  setupEventListeners() {
    // Auth tabs
    document.getElementById('loginTab').addEventListener('click', () => this.switchAuthTab('login'));
    document.getElementById('signupTab').addEventListener('click', () => this.switchAuthTab('signup'));

    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
  }

  // Auth Tab Switching

  switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (tab === 'login') {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
    } else {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
    }
  }

  // Authentication

  handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const role = document.getElementById('loginRole').value;

    const user = this.users.find(u => u.email === email && u.role === role);

    if (user) {
      // Password check disabled for demo purposes - add if needed
      this.currentUser = user;
      this.saveSession(user);
      this.showDashboard();
      this.showNotification('Login successful!', 'success');
    } else {
      this.showNotification('Invalid credentials or role', 'error');
    }
  }

  handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const role = document.getElementById('signupRole').value;

    // Check if email already exists
    if (this.users.find(u => u.email === email)) {
      this.showNotification('Email already exists', 'error');
      return;
    }

    // Generate student ID if student
    let studentId = null;
    if (role === 'student') {
      this.nextStudentNumber++;
      studentId = `STU-${this.nextStudentNumber.toString().padStart(3, '0')}`;
    }

    const newUser = {
      id: this.generateId(),
      name,
      email,
      password, // For demo only, no hashing
      role,
      studentId,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveData();

    this.showNotification('Account created successfully!', 'success');
    this.switchAuthTab('login');

    // Pre-fill login form
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginRole').value = role;
  }

  handleLogout() {
    this.clearSession();
    this.showAuth();
    this.showNotification('Logged out successfully', 'success');
  }

  // Dashboard Management

  showAuth() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('studentDashboard').style.display = 'none';
    document.getElementById('vendorDashboard').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('userName').textContent = this.currentUser.name;
    document.getElementById('userRole').textContent = this.currentUser.role === 'student' ? 'Student' : 'Laundry Staff';

    if (this.currentUser.role === 'student') {
      this.showStudentDashboard();
    } else {
      this.showVendorDashboard();
    }
  }

  showStudentDashboard() {
    document.getElementById('studentDashboard').style.display = 'block';
    document.getElementById('vendorDashboard').style.display = 'none';
    this.updateStudentDashboard();
  }

  showVendorDashboard() {
    document.getElementById('studentDashboard').style.display = 'none';
    document.getElementById('vendorDashboard').style.display = 'block';
    // Vendor dashboard code...
  }

  // Student Dashboard Updates

  updateStudentDashboard() {
    this.updateCurrentOrderStatus();
    this.updateOrderHistory();
  }

  updateCurrentOrderStatus() {
    const currentOrder = this.orders.find(order =>
      order.studentId === this.currentUser.studentId &&
      ['pending', 'confirmed', 'ready'].includes(order.status)
    );

    const statusDiv = document.getElementById('currentOrderStatus');

    if (currentOrder) {
      statusDiv.innerHTML = `
        <p><strong>Items:</strong> ${currentOrder.items}</p>
        <p><strong>Status:</strong> ${this.getStatusText(currentOrder.status)}</p>
        <p><strong>Instructions:</strong> ${currentOrder.specialInstructions || '-'}</p>`;
    } else {
      statusDiv.textContent = 'No active order';
    }
  }

  updateOrderHistory() {
    const historyDiv = document.getElementById('orderHistory');
    const studentOrders = this.orders.filter(order => order.studentId === this.currentUser.studentId && order.completedAt);

    if (!studentOrders.length) {
      historyDiv.textContent = 'No previous orders';
      return;
    }
    historyDiv.innerHTML = studentOrders.map(order => `
      <div class="order-item">
        <p><strong>Items:</strong> ${order.items}</p>
        <p><strong>Status:</strong> ${this.getStatusText(order.status)}</p>
        <p><strong>Completed:</strong> ${this.formatDate(order.completedAt)}</p>
      </div>
    `).join('');
  }

  getStatusText(status) {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed - In Progress';
      case 'ready': return 'Ready for Pickup';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Utility

  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
      container.removeChild(notification);
    }, 3000);
  }

  // New methods for quantity control & order confirmation

  setupQuantityControls() {
    const orderTable = document.querySelector('#placeOrderSection tbody');
    orderTable.addEventListener('click', e => {
      if (e.target.classList.contains('plus') || e.target.classList.contains('minus')) {
        const row = e.target.closest('tr');
        const input = row.querySelector('.qty-input');
        let currentVal = parseInt(input.value);
        if (e.target.classList.contains('plus')) {
          input.value = currentVal + 1;
        } else if (e.target.classList.contains('minus') && currentVal > 0) {
          input.value = currentVal - 1;
        }
        this.updateTotalQuantity();
      }
    });
  }

  updateTotalQuantity() {
    const qtyInputs = document.querySelectorAll('#placeOrderSection .qty-input');
    let total = 0;
    qtyInputs.forEach(input => {
      total += Number(input.value);
    });
    document.getElementById('totalQty').value = total;
  }

  handleConfirmOrderRedirect() {
    document.getElementById('confirmOrderBtn').addEventListener('click', () => {
      const total = Number(document.getElementById('totalQty').value);
      if (total === 0) {
        this.showNotification('Please select at least one item before confirming your order.', 'warning');
        return;
      }
      const orderDetails = [];
      const rows = document.querySelectorAll('#placeOrderSection tbody tr');
      rows.forEach(row => {
        const item = row.getAttribute('data-item');
        const qty = Number(row.querySelector('.qty-input').value);
        if (qty > 0) {
          orderDetails.push({ item, quantity: qty });
        }
      });
      sessionStorage.setItem('currentOrderDetails', JSON.stringify(orderDetails));
      window.location.href = 'qr.html';
    });
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new LaundryApp();
});

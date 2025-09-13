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

        // Student forms
        document.getElementById('laundryOrderForm').addEventListener('submit', (e) => this.handleNewOrder(e));

        // Vendor actions
        document.getElementById('scanQrBtn').addEventListener('click', () => this.handleQrScan());
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
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;

        const user = this.users.find(u => u.email === email && u.role === role);
        
        if (user) {
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
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
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
            password,
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
        
        this.updateVendorDashboard();
    }

    // Student Dashboard Updates
    updateStudentDashboard() {
        this.updateCurrentOrderStatus();
        this.updateOrderHistory();
        this.updateNewOrderForm();
    }

    updateCurrentOrderStatus() {
        const currentOrder = this.orders.find(order => 
            order.studentId === this.currentUser.studentId && 
            ['pending', 'confirmed', 'ready'].includes(order.status)
        );

        const statusDiv = document.getElementById('currentOrderStatus');
        
        if (currentOrder) {
            statusDiv.innerHTML = `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-id">Order #${currentOrder.id}</span>
                        <span class="order-date">${this.formatDate(currentOrder.createdAt)}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Items:</strong> ${currentOrder.items}</p>
                        <p><strong>Status:</strong> <span class="status-${currentOrder.status}">${this.getStatusText(currentOrder.status)}</span></p>
                        ${currentOrder.specialInstructions ? `<p><strong>Instructions:</strong> ${currentOrder.specialInstructions}</p>` : ''}
                    </div>
                </div>
            `;

            // Show QR code if order is confirmed or ready
            if (['confirmed', 'ready'].includes(currentOrder.status)) {
                this.showQRCode(currentOrder.id);
            } else {
                document.getElementById('qrCodeSection').style.display = 'none';
            }
        } else {
            statusDiv.innerHTML = '<p class="status-message">No active order</p>';
            document.getElementById('qrCodeSection').style.display = 'none';
        }
    }

    updateOrderHistory() {
        const studentOrders = this.orders
            .filter(order => order.studentId === this.currentUser.studentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const historyDiv = document.getElementById('orderHistory');
        
        if (studentOrders.length === 0) {
            historyDiv.innerHTML = '<p>No previous orders</p>';
            return;
        }

        historyDiv.innerHTML = studentOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-date">${this.formatDate(order.createdAt)}</span>
                </div>
                <div class="order-details">
                    <p><strong>Items:</strong> ${order.items}</p>
                    <p><strong>Status:</strong> <span class="status-${order.status}">${this.getStatusText(order.status)}</span></p>
                    ${order.completedAt ? `<p><strong>Completed:</strong> ${this.formatDate(order.completedAt)}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    updateNewOrderForm() {
        const hasActiveOrder = this.orders.find(order => 
            order.studentId === this.currentUser.studentId && 
            ['pending', 'confirmed', 'ready'].includes(order.status)
        );

        document.getElementById('newOrderForm').style.display = hasActiveOrder ? 'none' : 'block';
    }

    // Vendor Dashboard Updates
    updateVendorDashboard() {
        this.updatePendingRequests();
        this.updateActiveOrders();
    }

    updatePendingRequests() {
        const pendingOrders = this.orders.filter(order => order.status === 'pending');
        const pendingDiv = document.getElementById('pendingRequests');
        
        if (pendingOrders.length === 0) {
            pendingDiv.innerHTML = '<p>No pending requests</p>';
            return;
        }

        pendingDiv.innerHTML = pendingOrders.map(order => {
            const student = this.users.find(u => u.studentId === order.studentId);
            return `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${this.formatDate(order.createdAt)}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Student:</strong> ${student ? student.name : 'Unknown'}</p>
                        <p><strong>Student ID:</strong> ${order.studentId}</p>
                        <p><strong>Items:</strong> ${order.items}</p>
                        ${order.specialInstructions ? `<p><strong>Instructions:</strong> ${order.specialInstructions}</p>` : ''}
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-success" onclick="app.confirmOrder('${order.id}')">Confirm Order</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateActiveOrders() {
        const activeOrders = this.orders.filter(order => 
            ['confirmed', 'ready'].includes(order.status)
        );
        const activeDiv = document.getElementById('activeOrders');
        
        if (activeOrders.length === 0) {
            activeDiv.innerHTML = '<p>No active orders</p>';
            return;
        }

        activeDiv.innerHTML = activeOrders.map(order => {
            const student = this.users.find(u => u.studentId === order.studentId);
            return `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${this.formatDate(order.createdAt)}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Student:</strong> ${student ? student.name : 'Unknown'}</p>
                        <p><strong>Student ID:</strong> ${order.studentId}</p>
                        <p><strong>Items:</strong> ${order.items}</p>
                        <p><strong>Status:</strong> <span class="status-${order.status}">${this.getStatusText(order.status)}</span></p>
                    </div>
                    <div class="order-actions">
                        ${order.status === 'confirmed' ? 
                            `<button class="btn btn-warning" onclick="app.markOrderReady('${order.id}')">Mark as Ready</button>` : 
                            `<button class="btn btn-success" onclick="app.deliverOrder('${order.id}')">Mark as Delivered</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    // Order Management
    handleNewOrder(e) {
        e.preventDefault();
        const items = document.getElementById('laundryItems').value;
        const specialInstructions = document.getElementById('specialInstructions').value;

        const newOrder = {
            id: this.generateId(),
            studentId: this.currentUser.studentId,
            items,
            specialInstructions,
            status: 'pending',
            createdAt: new Date().toISOString(),
            confirmedAt: null,
            readyAt: null,
            completedAt: null
        };

        this.orders.push(newOrder);
        this.saveData();

        // Clear form
        document.getElementById('laundryItems').value = '';
        document.getElementById('specialInstructions').value = '';

        this.updateStudentDashboard();
        this.showNotification('Order placed successfully!', 'success');
    }

    confirmOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'confirmed';
            order.confirmedAt = new Date().toISOString();
            this.saveData();
            
            this.updateVendorDashboard();
            this.showNotification('Order confirmed successfully!', 'success');
        }
    }

    markOrderReady(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'ready';
            order.readyAt = new Date().toISOString();
            this.saveData();
            
            this.updateVendorDashboard();
            this.showNotification('Order marked as ready!', 'success');
        }
    }

    deliverOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'delivered';
            order.completedAt = new Date().toISOString();
            this.saveData();
            
            this.updateVendorDashboard();
            this.showNotification('Order delivered successfully!', 'success');
        }
    }

    // QR Code Management
    handleQrScan() {
        const qrInput = document.getElementById('qrInput').value.trim();
        if (!qrInput) {
            this.showNotification('Please enter a QR code', 'error');
            return;
        }

        // Simple QR code format: ORDER-{orderId}
        if (qrInput.startsWith('ORDER-')) {
            const orderId = qrInput.replace('ORDER-', '');
            const order = this.orders.find(o => o.id === orderId);
            
            if (order) {
                if (order.status === 'pending') {
                    this.confirmOrder(orderId);
                } else if (order.status === 'confirmed') {
                    this.markOrderReady(orderId);
                } else if (order.status === 'ready') {
                    this.deliverOrder(orderId);
                } else {
                    this.showNotification('Invalid order status for this action', 'error');
                }
            } else {
                this.showNotification('Order not found', 'error');
            }
        } else {
            this.showNotification('Invalid QR code format', 'error');
        }

        document.getElementById('qrInput').value = '';
    }

    showQRCode(orderId) {
        const qrCodeSection = document.getElementById('qrCodeSection');
        const qrCodeDiv = document.getElementById('qrCode');
        
        qrCodeSection.style.display = 'block';
        
        // Simple QR code representation (in a real app, you'd use a QR library)
        const qrText = `ORDER-${orderId}`;
        qrCodeDiv.innerHTML = `
            <div class="qr-code">
                <div style="font-family: monospace; font-size: 24px; padding: 20px; background: white; border: 2px solid #333; display: inline-block;">
                    ${qrText}
                </div>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">QR Code: ${qrText}</p>
            </div>
        `;
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pending Confirmation',
            'confirmed': 'Confirmed - In Progress',
            'ready': 'Ready for Pickup',
            'delivered': 'Delivered'
        };
        return statusMap[status] || status;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the application
const app = new LaundryApp();

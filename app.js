// Campus Laundry Management System - Main Application
class LaundryApp {
    constructor() {
        this.currentUser = null;
        this.nextStudentNumber = 0;
        this.laundryItems = [
            'PANT', 'JEANS', 'SHIRT', 'T-SHIRT', 'KURTA', 'PYJAMA', 
            'TRACK PANT', 'SHORTS', 'UNDERGARMENT', 'BOXER', 'SOCKS PAIR', 
            'BED SHEET', 'PILLOW COVER', 'HAND TOWEL', 'HANDKERCHIEF', 'BATH TOWEL', 'OTHER'
        ];
        this.currentOrderItems = {}; // Track current order items
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkSession();
    }

    // Data Management
    loadData() {
        try {
            const users = localStorage.getItem('laundry_users');
            const orders = localStorage.getItem('laundry_orders');
            const nextStudentNum = localStorage.getItem('laundry_next_student_number');

            this.users = users ? JSON.parse(users) : [];
            this.orders = orders ? JSON.parse(orders) : [];
            this.nextStudentNumber = nextStudentNum ? parseInt(nextStudentNum) : 0;

            // Validate data structure
            if (!Array.isArray(this.users)) this.users = [];
            if (!Array.isArray(this.orders)) this.orders = [];
            if (isNaN(this.nextStudentNumber)) this.nextStudentNumber = 0;

            console.log('Data loaded successfully:', { users: this.users.length, orders: this.orders.length });
        } catch (error) {
            console.error('Error loading data:', error);
            this.users = [];
            this.orders = [];
            this.nextStudentNumber = 0;
        }
    }

    saveData() {
        try {
            localStorage.setItem('laundry_users', JSON.stringify(this.users));
            localStorage.setItem('laundry_orders', JSON.stringify(this.orders));
            localStorage.setItem('laundry_next_student_number', this.nextStudentNumber.toString());
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data. Please try again.', 'error');
        }
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
        document.getElementById('editOrderBtn').addEventListener('click', () => this.enableOrderEditing());

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

        // Find user by email and role
        const user = this.users.find(u => u.email === email && u.role === role);
        
        if (user) {
            // Verify password if provided (for demo, we'll do simple string comparison)
            if (password && user.password !== password) {
                this.showNotification('Invalid password', 'error');
                return;
            }
            
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

        // Validate password strength
        if (password && !this.validatePassword(password)) {
            this.showNotification('Password must be at least 8 characters with uppercase letter and symbol', 'error');
            return;
        }

        // Check if email already exists for any role
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
            password: password || '', // Store password as-is for demo
            role,
            studentId,
            createdAt: new Date().toISOString(),
            lastLogin: null
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
        this.initializeLaundryItems();
    }

    // Initialize laundry items selection interface
    initializeLaundryItems() {
        const tableBody = document.getElementById('laundryItemsTable');
        if (!tableBody) return;

        // Clear existing items
        tableBody.innerHTML = '';
        this.currentOrderItems = {};

        // Create items from the laundry items list
        this.laundryItems.forEach(item => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            rowDiv.innerHTML = `
                <div class="item-name">${item}</div>
                <div class="quantity-controls">
                    <button type="button" class="quantity-btn" onclick="app.decreaseQuantity('${item}')">-</button>
                    <span class="quantity-display" id="qty-${item}">0</span>
                    <button type="button" class="quantity-btn" onclick="app.increaseQuantity('${item}')">+</button>
                </div>
            `;
            tableBody.appendChild(rowDiv);
            this.currentOrderItems[item] = 0;
        });

        this.updateTotal();
    }

    // Handle quantity increase
    increaseQuantity(item) {
        if (this.currentOrderItems[item] === undefined) {
            this.currentOrderItems[item] = 0;
        }
        this.currentOrderItems[item]++;
        this.updateQuantityDisplay(item);
        this.updateTotal();
    }

    // Handle quantity decrease
    decreaseQuantity(item) {
        if (this.currentOrderItems[item] === undefined) {
            this.currentOrderItems[item] = 0;
        }
        if (this.currentOrderItems[item] > 0) {
            this.currentOrderItems[item]--;
            this.updateQuantityDisplay(item);
            this.updateTotal();
        }
    }

    // Update quantity display for specific item
    updateQuantityDisplay(item) {
        const display = document.getElementById(`qty-${item}`);
        if (display) {
            display.textContent = this.currentOrderItems[item] || 0;
        }
    }

    // Update total items count
    updateTotal() {
        const total = Object.values(this.currentOrderItems).reduce((sum, qty) => sum + qty, 0);
        const totalDisplay = document.getElementById('totalItems');
        if (totalDisplay) {
            totalDisplay.textContent = total;
        }
    }

    // Enable order editing (before confirmation)
    enableOrderEditing() {
        // This will be implemented when we add order editing functionality
        this.showNotification('Order editing enabled', 'success');
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
                    <p><strong>Items:</strong> ${this.formatOrderItems(order.items)}</p>
                    <p><strong>Total Items:</strong> ${order.totalItems || Object.values(order.items).reduce((sum, qty) => sum + qty, 0)}</p>
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
                        <p><strong>Items:</strong> ${this.formatOrderItems(order.items)}</p>
                        <p><strong>Total Items:</strong> ${order.totalItems || Object.values(order.items).reduce((sum, qty) => sum + qty, 0)}</p>
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
                        <p><strong>Items:</strong> ${this.formatOrderItems(order.items)}</p>
                        <p><strong>Total Items:</strong> ${order.totalItems || Object.values(order.items).reduce((sum, qty) => sum + qty, 0)}</p>
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
        const specialInstructions = document.getElementById('specialInstructions').value;

        // Validate that at least one item is selected
        const totalItems = Object.values(this.currentOrderItems).reduce((sum, qty) => sum + qty, 0);
        if (totalItems === 0) {
            this.showNotification('Please select at least one item', 'error');
            return;
        }

        // Filter out items with 0 quantity
        const selectedItems = {};
        Object.keys(this.currentOrderItems).forEach(item => {
            if (this.currentOrderItems[item] > 0) {
                selectedItems[item] = this.currentOrderItems[item];
            }
        });

        const newOrder = {
            id: this.generateId(),
            studentId: this.currentUser.studentId,
            items: selectedItems, // Now an object with item names and quantities
            totalItems: totalItems,
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
        this.initializeLaundryItems(); // Reset the laundry items selection
        document.getElementById('specialInstructions').value = '';

        this.updateStudentDashboard();
        this.showNotification('Order placed successfully!', 'success');
        
        // Redirect to QR page
        setTimeout(() => {
            window.location.href = `qr-page.html?orderId=${newOrder.id}`;
        }, 1500);
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

    // Format order items for display
    formatOrderItems(items) {
        if (typeof items === 'string') {
            return items; // Legacy format
        }
        
        if (typeof items === 'object' && items !== null) {
            return Object.entries(items)
                .filter(([item, qty]) => qty > 0)
                .map(([item, qty]) => `${qty} ${item}`)
                .join(', ');
        }
        
        return 'No items';
    }

    // Password validation function
    validatePassword(password) {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false; // Must have uppercase
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false; // Must have symbol
        return true;
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

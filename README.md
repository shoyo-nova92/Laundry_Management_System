# Campus Laundry Management System

A complete, client-side web application for managing laundry services on campus. Built with vanilla HTML, CSS, and JavaScript - no external dependencies required!

## 🚀 Quick Start

1. **Download all files** to a folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`

2. **Open in browser**:
   - Double-click `index.html` or
   - Open with any modern web browser

3. **Start using**:
   - No installation or setup required!
   - All data is stored locally in your browser

## 📱 Features

### For Students
- **Sign up** with name, email, and role selection
- **Place laundry orders** with item descriptions and special instructions
- **Track order status** in real-time (Pending → Confirmed → Ready → Delivered)
- **View order history** with timestamps
- **QR code generation** for order pickup verification
- **Mobile-responsive** interface

### For Laundry Staff
- **View pending requests** from students
- **Confirm orders** after physical verification
- **Update order status** (mark as ready, delivered)
- **QR code scanning** for order processing
- **Manage active orders** efficiently

## 🎯 Demo Script

### 1. Student Registration & Order
1. Open the application
2. Click "Sign Up" tab
3. Fill in details:
   - Name: "John Doe"
   - Email: "john@student.edu"
   - Role: "Student"
4. Click "Sign Up"
5. Login with the same credentials
6. Fill out laundry order form:
   - Items: "2 shirts, 1 jeans, 3 t-shirts"
   - Instructions: "Cold wash, no fabric softener"
7. Click "Place Order"

### 2. Staff Processing
1. Open a new browser tab/window
2. Sign up as staff:
   - Name: "Jane Smith"
   - Email: "jane@laundry.edu"
   - Role: "Laundry Staff"
3. Login as staff
4. See the pending request from John
5. Click "Confirm Order"
6. Order status changes to "Confirmed - In Progress"
7. Click "Mark as Ready" when laundry is done
8. Order shows "Ready for Pickup"

### 3. Student Pickup
1. Go back to student tab
2. See order status updated to "Ready for Pickup"
3. QR code is displayed for pickup verification
4. Staff can scan the QR code to mark as delivered

## 🗄️ Data Model

### Users
```javascript
{
  id: "unique_id",
  name: "Full Name",
  email: "email@domain.com",
  password: "optional_password",
  role: "student" | "vendor",
  studentId: "STU-001", // only for students
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Orders
```javascript
{
  id: "unique_order_id",
  studentId: "STU-001",
  items: "2 shirts, 1 jeans",
  specialInstructions: "Cold wash only",
  status: "pending" | "confirmed" | "ready" | "delivered",
  createdAt: "2024-01-01T00:00:00.000Z",
  confirmedAt: "2024-01-01T01:00:00.000Z", // null if not confirmed
  readyAt: "2024-01-01T02:00:00.000Z",     // null if not ready
  completedAt: "2024-01-01T03:00:00.000Z"  // null if not delivered
}
```

## 🔧 Technical Details

### Storage
- **localStorage**: Persistent data storage across browser sessions
- **sessionStorage**: Current user session management
- **No external APIs**: Completely self-contained

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- No JavaScript frameworks required

### File Structure
```
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── app.js             # JavaScript application logic
└── README.md          # This documentation
```

## 🎨 UI/UX Features

### Design Principles
- **Mobile-first**: Optimized for mobile devices
- **Clean interface**: Minimal, intuitive design
- **Color-coded status**: Visual status indicators
- **Responsive layout**: Works on all screen sizes

### Color Palette
- Primary: Purple gradient (#667eea to #764ba2)
- Success: Green (#28a745)
- Warning: Yellow (#ffc107)
- Danger: Red (#dc3545)
- Neutral: Gray tones

## 🔄 Order Workflow

1. **Student places order** → Status: `pending`
2. **Staff confirms order** → Status: `confirmed`
3. **Staff marks ready** → Status: `ready`
4. **Staff delivers order** → Status: `delivered`

## 🚨 Error Handling

- Form validation for required fields
- Duplicate email prevention
- Order status validation
- User-friendly error messages
- Session persistence across page reloads

## 🔐 Security Notes

- **Demo purposes only**: No real authentication
- **Local storage**: Data persists only in browser
- **No server**: All processing happens client-side
- **QR codes**: Simple text-based for demo

## 🛠️ Customization

### Adding Features
- Modify `app.js` for new functionality
- Update `styles.css` for visual changes
- Extend `index.html` for new UI elements

### Data Persistence
- Data survives browser restarts
- Clear browser data to reset application
- Export/import not implemented (can be added)

## 📱 Mobile Usage

- Touch-friendly buttons and forms
- Responsive grid layout
- Optimized for portrait orientation
- Swipe-friendly interface

## 🐛 Troubleshooting

### Common Issues
1. **Data not saving**: Check if localStorage is enabled
2. **Login not working**: Verify email and role match
3. **Orders not showing**: Check if user has correct role
4. **QR codes not working**: Ensure order is confirmed or ready

### Reset Application
- Clear browser localStorage
- Refresh the page
- Start fresh with new accounts

## 🎓 Learning Objectives

This project demonstrates:
- **Vanilla JavaScript**: No frameworks required
- **Local storage**: Client-side data persistence
- **Role-based access**: Different views for different users
- **State management**: Managing application state
- **Responsive design**: Mobile-first approach
- **Form handling**: User input processing
- **Event handling**: Interactive user interface

## 📈 Future Enhancements

Potential improvements for a real system:
- Real QR code generation library
- Backend API integration
- Real authentication system
- Email notifications
- Payment processing
- Order tracking with timestamps
- Staff scheduling
- Inventory management
- Reporting and analytics

---

**Built with ❤️ for campus laundry management**

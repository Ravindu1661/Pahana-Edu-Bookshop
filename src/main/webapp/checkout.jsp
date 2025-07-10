<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
// Check if user is logged in and has customer role
if (session.getAttribute("user") == null ||
    !"CUSTOMER".equals(session.getAttribute("userRole"))) {
    response.sendRedirect("login-signup.jsp");
    return;
}
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - Pahana Edu</title>
    <link rel="stylesheet" href="assets/css/customer-style.css">
    <link rel="stylesheet" href="assets/css/checkout.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>📚 Pahana Edu</h2>
            </div>
            
            <div class="nav-menu">
                <a href="customer-dashboard.jsp" class="nav-link">Home</a>
                <a href="products.jsp" class="nav-link">Products</a>
                <a href="about.jsp" class="nav-link">About</a>
                <a href="contact.jsp" class="nav-link">Contact</a>
            </div>
            
            <div class="nav-actions">
                <div class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </div>
                
                <div class="user-menu">
                    <span class="user-name">Hello, ${sessionScope.userName}</span>
                    <div class="dropdown">
                        <button class="dropdown-btn"><i class="fas fa-user"></i></button>
                        <div class="dropdown-content">
                            <a href="profile.jsp">Profile</a>
                            <a href="orders.jsp">My Orders</a>
                            <a href="logout">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Page Header -->
    <div class="page-header">
        <div class="container">
            <h1>Checkout</h1>
            <p>Complete your order</p>
        </div>
    </div>

    <!-- Checkout Section -->
    <section class="checkout-section">
        <div class="container">
            <div class="checkout-layout">
                <!-- Checkout Form -->
                <div class="checkout-form">
                    <form id="checkoutForm">
                        <!-- Step 1: Order Review -->
                        <div class="checkout-step active" id="step1">
                            <h3><i class="fas fa-shopping-cart"></i> Order Review</h3>
                            <div class="step-content">
                                <div class="order-items" id="orderItems">
                                    <!-- Order items will be loaded here -->
                                </div>
                                <div class="step-actions">
                                    <button type="button" class="btn btn-primary" onclick="nextStep(2)">
                                        Continue to Shipping <i class="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Shipping Information -->
                        <div class="checkout-step" id="step2">
                            <h3><i class="fas fa-truck"></i> Shipping Information</h3>
                            <div class="step-content">
                                <div class="form-group">
                                    <label for="fullName">Full Name *</label>
                                    <input type="text" id="fullName" name="fullName" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="contactNumber">Contact Number *</label>
                                    <input type="tel" id="contactNumber" name="contactNumber" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="shippingAddress">Shipping Address *</label>
                                    <textarea id="shippingAddress" name="shippingAddress" rows="4" required
                                              placeholder="Enter your full address with house number, street, city, and postal code"></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="orderNotes">Order Notes (Optional)</label>
                                    <textarea id="orderNotes" name="orderNotes" rows="3" 
                                              placeholder="Any special instructions for your order"></textarea>
                                </div>
                                
                                <div class="step-actions">
                                    <button type="button" class="btn btn-secondary" onclick="prevStep(1)">
                                        <i class="fas fa-arrow-left"></i> Back
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="nextStep(3)">
                                        Continue to Payment <i class="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Payment Method -->
                        <div class="checkout-step" id="step3">
                            <h3><i class="fas fa-credit-card"></i> Payment Method</h3>
                            <div class="step-content">
                                <div class="payment-methods">
                                    <div class="payment-option">
                                        <input type="radio" id="cashOnDelivery" name="paymentMethod" value="cod" checked>
                                        <label for="cashOnDelivery">
                                            <div class="payment-info">
                                                <i class="fas fa-money-bill-wave"></i>
                                                <div>
                                                    <h4>Cash on Delivery</h4>
                                                    <p>Pay when you receive your order</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div class="payment-option">
                                        <input type="radio" id="onlinePayment" name="paymentMethod" value="online">
                                        <label for="onlinePayment">
                                            <div class="payment-info">
                                                <i class="fas fa-credit-card"></i>
                                                <div>
                                                    <h4>Online Payment</h4>
                                                    <p>Pay securely with card or mobile payment</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="step-actions">
                                    <button type="button" class="btn btn-secondary" onclick="prevStep(2)">
                                        <i class="fas fa-arrow-left"></i> Back
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-check"></i> Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Order Summary -->
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    
                    <div class="summary-items" id="summaryItems">
                        <!-- Summary items will be loaded here -->
                    </div>
                    
                    <div class="summary-totals">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span id="subtotal">Rs. 0.00</span>
                        </div>
                        
                        <div class="summary-row">
                            <span>Shipping:</span>
                            <span id="shipping">Rs. 250.00</span>
                        </div>
                        
                        <div class="summary-row discount">
                            <span>Discount:</span>
                            <span id="discount">Rs. 0.00</span>
                        </div>
                        
                        <hr>
                        
                        <div class="summary-row total">
                            <strong>
                                <span>Total:</span>
                                <span id="total">Rs. 0.00</span>
                            </strong>
                        </div>
                    </div>
                    
                    <div class="security-info">
                        <i class="fas fa-shield-alt"></i>
                        <span>Your order is secure with SSL encryption</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Order Success Modal -->
    <div class="modal" id="orderSuccessModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-check-circle"></i> Order Placed Successfully!</h3>
            </div>
            <div class="modal-body">
                <p>Thank you for your order. Your order has been placed successfully.</p>
                <div class="order-details">
                    <p><strong>Order ID:</strong> <span id="orderIdDisplay"></span></p>
                    <p><strong>Total Amount:</strong> <span id="totalAmountDisplay"></span></p>
                    <p><strong>Delivery:</strong> 3-5 business days</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="viewOrder()">View Order</button>
                <button class="btn btn-secondary" onclick="continueShopping()">Continue Shopping</button>
                <button class="btn btn-success" onclick="printReceipt()">Print Receipt</button>
            </div>
        </div>
    </div>

    <!-- Loading Spinner -->
    <div class="loading-spinner" id="loadingSpinner">
        <div class="spinner"></div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <div class="toast-content">
            <span id="toastMessage"></span>
            <button class="toast-close" onclick="hideToast()">×</button>
        </div>
    </div>

    <script src="assets/js/checkout.js"></script>
</body>
</html>
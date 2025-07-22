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
    <title>Shopping Cart - Pahana Edu</title>
    <link rel="stylesheet" href="assets/css/customer-style.css">
    <link rel="stylesheet" href="assets/css/cart.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .applied-promo {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: #e8f5e9;
            border: 1px solid #4caf50;
            border-radius: 8px;
            margin-bottom: 15px;
            color: #2e7d32;
            font-size: 14px;
        }
        
        .applied-promo i {
            color: #4caf50;
        }
        
        .remove-promo {
            margin-left: auto;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .remove-promo:hover {
            background: rgba(0,0,0,0.1);
            color: #333;
        }
        
        #appliedPromoDisplay {
            display: none;
        }
    </style>
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
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Search books...">
                    <button id="searchBtn"><i class="fas fa-search"></i></button>
                </div>
                
                <div class="cart-icon active">
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
            <h1>Shopping Cart</h1>
            <p>Review your selected items</p>
        </div>
    </div>

    <!-- Cart Section -->
    <section class="cart-section">
        <div class="container">
            <div class="cart-layout">
                <!-- Cart Items -->
                <div class="cart-main">
                    <div class="cart-header-row">
                        <h2>Your Items</h2>
                        <button class="btn btn-secondary clear-cart" onclick="clearCart()">
                            <i class="fas fa-trash"></i> Clear Cart
                        </button>
                    </div>
                    
                    <div class="cart-items-container" id="cartItemsContainer">
                        <!-- Cart items will be loaded here -->
                    </div>
                    
                    <div class="cart-actions">
                        <a href="products.jsp" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Continue Shopping
                        </a>
                    </div>
                </div>
                
                <!-- Cart Summary -->
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    
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
                    
                    <!-- Applied Promo Display -->
                    <div id="appliedPromoDisplay"></div>
                    
                    <div class="promo-code">
                        <input type="text" id="promoInput" placeholder="Enter promo code">
                        <button class="btn btn-secondary" onclick="applyPromoCode()">Apply</button>
                    </div>
                    
                    <button class="btn btn-primary checkout-btn" onclick="proceedToCheckout()">
                        <i class="fas fa-lock"></i> Proceed to Checkout
                    </button>
                    
                    <div class="security-info">
                        <i class="fas fa-shield-alt"></i>
                        <span>Secure checkout with SSL encryption</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Empty Cart State -->
    <div class="empty-cart" id="emptyCartState" style="display: none;">
        <div class="container">
            <div class="empty-cart-content">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any books to your cart yet.</p>
                <a href="products.jsp" class="btn btn-primary">
                    <i class="fas fa-book"></i> Browse Books
                </a>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>📚 Pahana Edu</h3>
                    <p>Your trusted online bookstore for all educational and recreational reading needs.</p>
                </div>
                
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="customer-dashboard.jsp">Home</a></li>
                        <li><a href="products.jsp">Products</a></li>
                        <li><a href="about.jsp">About Us</a></li>
                        <li><a href="contact.jsp">Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Contact Info</h4>
                    <ul>
                        <li><i class="fas fa-phone"></i> +94 11 234 5678</li>
                        <li><i class="fas fa-envelope"></i> info@pahanaedu.lk</li>
                        <li><i class="fas fa-map-marker-alt"></i> Colombo, Sri Lanka</li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>

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

    <script src="assets/js/customer-dashboard.js"></script>
    <script src="assets/js/cart.js"></script>
</body>
</html>
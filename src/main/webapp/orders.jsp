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
    <title>My Orders - Pahana Edu</title>
    <link rel="stylesheet" href="assets/css/customer-style.css">
    <link rel="stylesheet" href="assets/css/orders.css">
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
                            <a href="orders.jsp" class="active">My Orders</a>
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
            <h1>My Orders</h1>
            <p>Track and manage your orders</p>
        </div>
    </div>

    <!-- Orders Section -->
    <section class="orders-section">
        <div class="container">
            <!-- Order Filters -->
            <div class="order-filters">
                <div class="filter-buttons">
                    <button class="filter-btn active" data-status="all">All Orders</button>
                    <button class="filter-btn" data-status="pending">Pending</button>
                    <button class="filter-btn" data-status="confirmed">Confirmed</button>
                    <button class="filter-btn" data-status="shipped">Shipped</button>
                    <button class="filter-btn" data-status="delivered">Delivered</button>
                    <button class="filter-btn" data-status="cancelled">Cancelled</button>
                </div>
                
                <div class="search-box">
                    <input type="text" id="orderSearch" placeholder="Search orders by ID or product name...">
                    <i class="fas fa-search"></i>
                </div>
            </div>

            <!-- Orders List -->
            <div class="orders-list" id="ordersList">
                <!-- Orders will be loaded here -->
            </div>

            <!-- Empty State -->
            <div class="empty-state" id="emptyState" style="display: none;">
                <i class="fas fa-box-open"></i>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <a href="products.jsp" class="btn btn-primary">Browse Products</a>
            </div>
        </div>
    </section>

    <!-- Order Details Modal -->
    <div class="modal" id="orderDetailsModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-receipt"></i> Order Details</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body" id="orderDetailsBody">
                <!-- Order details will be loaded here -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="printOrderDetails()">Print Order</button>
                <button class="btn btn-success" onclick="downloadReceipt()">Download Receipt</button>
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

    <script src="assets/js/orders.js"></script>
</body>
</html>
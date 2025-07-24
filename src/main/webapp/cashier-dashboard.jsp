<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
// Check if user is logged in and has cashier role
if (session.getAttribute("user") == null ||
!"CASHIER".equals(session.getAttribute("userRole"))) {
response.sendRedirect("login-signup.jsp");
return;
}
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cashier Dashboard - PahanaEdu</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="assets/css/cashier-dashboard.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-2 d-md-block sidebar collapse">
                <div class="position-sticky pt-3">
                    <div class="text-center py-4">
                        <h5 class="text-white">
                            <i class="fas fa-graduation-cap"></i> PahanaEdu
                        </h5>
                        <p class="text-light small mb-0">Cashier Panel</p>
                        <hr class="text-light">
                        <p class="text-light small mb-0">Welcome, ${sessionScope.user.firstName}!</p>
                    </div>
                    
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="#" onclick="showSection('dashboard')">
                                <i class="fas fa-tachometer-alt"></i>Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showSection('new-order')">
                                <i class="fas fa-plus-circle"></i>New Order
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showSection('my-orders')">
                                <i class="fas fa-receipt"></i>My Orders
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showSection('customer-orders')">
                                <i class="fas fa-shopping-bag"></i>Customer Orders
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showSection('items')">
                                <i class="fas fa-search"></i>Browse Items
                            </a>
                        </li>
                        <li class="nav-item">
                            <hr class="text-light">
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="logout">
                                <i class="fas fa-sign-out-alt"></i>Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Main content -->
            <main class="col-md-10 ms-sm-auto main-content">
                <!-- Top Navigation -->
                <nav class="navbar navbar-expand-lg navbar-light bg-white rounded mb-4 shadow-sm">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">
                            <i class="fas fa-cash-register"></i> PahanaEdu Cashier Dashboard
                        </a>
                        <div class="navbar-nav ms-auto">
                            <div class="welcome-text">
                                <i class="fas fa-user-circle"></i> 
                                Welcome, ${sessionScope.user.firstName} ${sessionScope.user.lastName}!
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Dashboard Section -->
                <div id="dashboard" class="content-section active">
                    <h2 class="section-title">
                        <i class="fas fa-chart-line"></i> Dashboard Overview
                    </h2>
                    
                    <!-- Statistics Cards -->
                    <div class="row" id="statsContainer">
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card today-orders">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Today's Orders</div>
                                        <div class="stat-number text-primary" id="todayOrders">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">Orders processed today</small>
                                    </div>
                                    <i class="fas fa-receipt stat-icon text-primary"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card today-revenue">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Today's Revenue</div>
                                        <div class="stat-number text-success" id="todayRevenue">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">Revenue generated today</small>
                                    </div>
                                    <i class="fas fa-dollar-sign stat-icon text-success"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card total-orders">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Total Orders</div>
                                        <div class="stat-number text-warning" id="totalOrders">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">All time orders</small>
                                    </div>
                                    <i class="fas fa-shopping-cart stat-icon text-warning"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card total-items">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Available Items</div>
                                        <div class="stat-number text-info" id="totalItems">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">Items in stock</small>
                                    </div>
                                    <i class="fas fa-box stat-icon text-info"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="data-table">
                                <h5 class="mb-3">
                                    <i class="fas fa-bolt"></i> Quick Actions
                                </h5>
                                <div class="row">
                                    <div class="col-md-3 mb-2">
                                        <button class="btn btn-primary w-100" onclick="showSection('new-order')">
                                            <i class="fas fa-plus-circle"></i> Create New Order
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <button class="btn btn-success w-100" onclick="showSection('items')">
                                            <i class="fas fa-search"></i> Browse Items
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <button class="btn btn-info w-100" onclick="showSection('my-orders')">
                                            <i class="fas fa-receipt"></i> View My Orders
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <button class="btn btn-warning w-100" onclick="loadDashboardStats()">
                                            <i class="fas fa-sync-alt"></i> Refresh Stats
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- New Order Section -->
                <div id="new-order" class="content-section">
                    <h2 class="section-title">
                        <i class="fas fa-plus-circle"></i> Create New Order
                    </h2>
                    
                    <div class="row">
                        <!-- Customer Info -->
                        <div class="col-md-4">
                            <div class="data-table">
                                <h5 class="mb-3">
                                    <i class="fas fa-user"></i> Customer Information
                                </h5>
                                <form id="customerForm">
                                    <div class="mb-3">
                                        <label for="customerName" class="form-label">Customer Name *</label>
                                        <input type="text" class="form-control" id="customerName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="customerPhone" class="form-label">Phone Number</label>
                                        <input type="text" class="form-control" id="customerPhone">
                                    </div>
                                    <div class="mb-3">
                                        <label for="customerEmail" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="customerEmail">
                                    </div>
                                    <div class="mb-3">
                                        <label for="orderType" class="form-label">Order Type</label>
                                        <select class="form-control" id="orderType">
                                            <option value="walk_in">Walk-in</option>
                                            <option value="phone">Phone Order</option>
                                            <option value="whatsapp">WhatsApp Order</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="paymentMethod" class="form-label">Payment Method</label>
                                        <select class="form-control" id="paymentMethod">
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="online">Online</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="orderNotes" class="form-label">Notes</label>
                                        <textarea class="form-control" id="orderNotes" rows="2"></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Item Search -->
                        <div class="col-md-4">
                            <div class="data-table">
                                <h5 class="mb-3">
                                    <i class="fas fa-search"></i> Search Items
                                </h5>
                                <div class="mb-3">
                                    <input type="text" class="form-control" id="itemSearchInput" 
                                           placeholder="Search by title or author..." onkeyup="searchItems()">
                                </div>
                                <div id="itemSearchResults" class="item-results">
                                    <!-- Search results will appear here -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Order Items -->
                        <div class="col-md-4">
                            <div class="data-table">
                                <h5 class="mb-3">
                                    <i class="fas fa-shopping-cart"></i> Order Items
                                </h5>
                                <div id="orderItems">
                                    <p class="text-muted text-center">No items added yet</p>
                                </div>
                                <hr>
                                <div class="order-summary">
                                    <div class="d-flex justify-content-between">
                                        <span>Subtotal:</span>
                                        <span id="orderSubtotal">Rs. 0.00</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Discount:</span>
                                        <span id="orderDiscount">Rs. 0.00</span>
                                    </div>
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span id="orderTotal">Rs. 0.00</span>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="promoCodeInput" 
                                               placeholder="Promo code (optional)">
                                        <button class="btn btn-outline-secondary" onclick="validatePromoCode()">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <button class="btn btn-success w-100" onclick="createOrder()">
                                        <i class="fas fa-check"></i> Create Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- My Orders Section -->
                <div id="my-orders" class="content-section">
                    <h2 class="section-title">
                        <i class="fas fa-receipt"></i> My Orders
                    </h2>
                    
                    <div class="data-table">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-table"></i> Orders Created by Me
                            </h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="loadMyOrders()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover" id="myOrdersTable">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Total</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="myOrdersTableBody">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            Loading orders...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Customer Orders Section -->
                <div id="customer-orders" class="content-section">
                    <h2 class="section-title">
                        <i class="fas fa-shopping-bag"></i> Customer Orders (Online)
                    </h2>
                    
                    <div class="data-table">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-table"></i> Online Customer Orders
                            </h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="loadCustomerOrders()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover" id="customerOrdersTable">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="customerOrdersTableBody">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            Loading customer orders...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Items Section -->
                <div id="items" class="content-section">
                    <h2 class="section-title">
                        <i class="fas fa-search"></i> Browse Items
                    </h2>
                    
                    <div class="data-table">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-table"></i> Available Items
                            </h5>
                            <div class="d-flex gap-2">
                                <input type="text" class="form-control" id="itemBrowseSearch" 
                                       placeholder="Search items..." style="width: 250px;">
                                <button class="btn btn-outline-primary btn-sm" onclick="loadItems()">
                                    <i class="fas fa-sync-alt"></i> Refresh
                                </button>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover" id="itemsTable">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="itemsTableBody">
                                    <tr>
                                        <td colspan="7" class="text-center py-4">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            Loading items...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Print Order Modal -->
    <div class="modal fade" id="printOrderModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Print Order Receipt</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="printOrderContent">
                    <!-- Print content will be generated here -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="printOrder()">
                        <i class="fas fa-print"></i> Print
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Cashier Dashboard JS -->
    <script src="assets/js/cashier-dashboard.js"></script>
</body>
</html>
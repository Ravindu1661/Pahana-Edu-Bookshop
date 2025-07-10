<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    if (session.getAttribute("user") == null || 
        !"ADMIN".equals(session.getAttribute("userRole"))) {
        response.sendRedirect("login-signup.jsp");
        return;
    }
%>
<div class="billing-container">
    <div class="page-header">
        <h2>💳 Order & Billing Management</h2>
        <button class="btn btn-primary" id="refreshOrdersBtn">
            <i class="icon-refresh"></i> Refresh Orders
        </button>
    </div>
    
    <!-- Order Statistics -->
    <div class="stats-section">
        <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
                <h3>Total Orders</h3>
                <span id="totalOrders" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
                <h3>Pending Orders</h3>
                <span id="pendingOrders" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
                <h3>Confirmed Orders</h3>
                <span id="confirmedOrders" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🚚</div>
            <div class="stat-info">
                <h3>Shipped Orders</h3>
                <span id="shippedOrders" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
                <h3>Total Revenue</h3>
                <span id="totalRevenue" class="stat-number">Rs. 0</span>
            </div>
        </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
        <div class="filter-group">
            <label for="statusFilter">Filter by Status:</label>
            <select id="statusFilter" onchange="filterOrders()">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="paymentFilter">Filter by Payment:</label>
            <select id="paymentFilter" onchange="filterOrders()">
                <option value="">All Payments</option>
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="dateFilter">Filter by Date:</label>
            <select id="dateFilter" onchange="filterOrders()">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
            </select>
        </div>
        
        <button class="btn btn-secondary" onclick="loadOrders()">
            <i class="icon-refresh"></i> Refresh
        </button>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
        <table id="ordersTable">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="ordersTableBody">
                <tr>
                    <td colspan="9" class="loading">Loading orders...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Order Details Modal -->
<div id="orderDetailsModal" class="modal">
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h3 id="orderModalTitle">Order Details</h3>
            <button class="modal-close" onclick="closeOrderModal()">×</button>
        </div>
        
        <div class="modal-body">
            <div class="order-info-section">
                <div class="order-basic-info">
                    <h4>📋 Order Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Order ID:</label>
                            <span id="detailOrderId">-</span>
                        </div>
                        <div class="info-item">
                            <label>Customer:</label>
                            <span id="detailCustomerName">-</span>
                        </div>
                        <div class="info-item">
                            <label>Email:</label>
                            <span id="detailCustomerEmail">-</span>
                        </div>
                        <div class="info-item">
                            <label>Contact:</label>
                            <span id="detailContactNumber">-</span>
                        </div>
                        <div class="info-item">
                            <label>Payment Method:</label>
                            <span id="detailPaymentMethod">-</span>
                        </div>
                        <div class="info-item">
                            <label>Order Date:</label>
                            <span id="detailOrderDate">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="shipping-info">
                    <h4>🚚 Shipping Information</h4>
                    <div class="info-item full-width">
                        <label>Shipping Address:</label>
                        <p id="detailShippingAddress">-</p>
                    </div>
                </div>
            </div>
            
            <div class="order-items-section">
                <h4>📦 Order Items</h4>
                <div class="items-table-container">
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="orderItemsTableBody">
                            <tr>
                                <td colspan="4" class="loading">Loading items...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="order-total">
                    <div class="total-row">
                        <span class="total-label">Total Amount:</span>
                        <span class="total-amount" id="detailTotalAmount">Rs. 0.00</span>
                    </div>
                </div>
            </div>
            
            <div class="status-management-section">
                <h4>⚙️ Status Management</h4>
                <div class="status-controls">
                    <div class="form-group">
                        <label for="newOrderStatus">Update Status:</label>
                        <select id="newOrderStatus">
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="updateOrderStatus()">
                        <i class="icon-save"></i> Update Status
                    </button>
                </div>
            </div>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeOrderModal()">Close</button>
        </div>
    </div>
</div>

<!-- Message Toast -->
<div id="messageToast" class="toast">
    <div class="toast-content">
        <span id="toastMessage"></span>
        <button class="toast-close" onclick="hideToast()">×</button>
    </div>
</div>

<!-- Include CSS and JS -->
<link rel="stylesheet" href="assets/css/Admin/admin-Billing.css">
<script src="assets/js/Admin/admin-Billing.js"></script>
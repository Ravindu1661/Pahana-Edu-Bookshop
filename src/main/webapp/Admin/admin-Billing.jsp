<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    if (session.getAttribute("user") == null || 
        !"ADMIN".equals(session.getAttribute("userRole"))) {
        response.sendRedirect("login-signup.jsp");
        return;
    }
%>

<div class="container">
    <!-- Page Header -->
    <div class="billing-header">
        <h2>💳 Order & Billing Management</h2>
    </div>
    
    <!-- Statistics Cards -->
    <div class="stats-container">
        <div class="stat-card">
            <span class="stat-icon">📦</span>
            <h4>Total Orders</h4>
            <span id="totalOrders" class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">⏳</span>
            <h4>Pending Orders</h4>
            <span id="pendingOrders" class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">✅</span>
            <h4>Confirmed Orders</h4>
            <span id="confirmedOrders" class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">🚚</span>
            <h4>Shipped Orders</h4>
            <span id="shippedOrders" class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">📋</span>
            <h4>Delivered Orders</h4>
            <span id="deliveredOrders" class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">💰</span>
            <h4>Total Revenue</h4>
            <span id="totalRevenue" class="stat-number">Rs. 0</span>
        </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
        <div class="filter-controls">
            <div class="filter-group">
                <label for="statusFilter">Status:</label>
                <select id="statusFilter">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="paymentFilter">Payment:</label>
                <select id="paymentFilter">
                    <option value="">All Payments</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="dateFilter">Date:</label>
                <select id="dateFilter">
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>
        </div>
        
        <button class="refresh-btn" id="refreshOrdersBtn">
            <i class="fas fa-sync"></i> Refresh
        </button>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
        <table class="orders-table">
            <thead>
                <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th>TOTAL AMOUNT</th>
                    <th>PAYMENT METHOD</th>
                    <th>STATUS</th>
                    <th>ORDER DATE</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody id="ordersTableBody">
                <tr>
                    <td colspan="8" class="loading">
                        <div class="loading-spinner"></div>
                        Loading orders...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Order Details Modal -->
<div id="orderDetailsModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle">Order Details</h3>
            <button class="modal-close" onclick="closeOrderModal()">×</button>
        </div>
        
        <div class="modal-body">
            <div class="order-details">
                <!-- Order Information -->
                <div class="detail-section">
                    <h4>📋 Order Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value" id="detailOrderId">-</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Customer:</span>
                        <span class="detail-value" id="detailCustomerName">-</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value" id="detailCustomerEmail">-</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value" id="detailContactNumber">-</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value" id="detailPaymentMethod">-</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Order Date:</span>
                        <span class="detail-value" id="detailOrderDate">-</span>
                    </div>
                </div>
                
                <!-- Shipping Information -->
                <div class="detail-section">
                    <h4>🚚 Shipping Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value" id="detailShippingAddress">-</span>
                    </div>
                </div>
                
                <!-- Order Items -->
                <div class="detail-section">
                    <h4>📦 Order Items</h4>
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
                    
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #3498db; text-align: right;">
                        <strong style="font-size: 1.1rem; color: #27ae60;">
                            Total Amount: <span id="detailTotalAmount">Rs. 0.00</span>
                        </strong>
                    </div>
                </div>
                
                <!-- Status Management -->
                <div class="detail-section">
                    <h4>⚙️ Status Management</h4>
                    <div class="status-controls">
                        <label for="newOrderStatus" style="font-weight: 500;">Update Status:</label>
                        <select id="newOrderStatus">
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button class="btn-update" onclick="updateOrderStatus()">
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-view" onclick="closeOrderModal()">Close</button>
        </div>
    </div>
</div>

<!-- Toast Notification -->
<div id="toast" class="toast">
    <div class="toast-content">
        <span id="toastMessage"></span>
        <button class="toast-close" onclick="hideToast()">×</button>
    </div>
</div>

<!-- Include FontAwesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- Include CSS -->
<link rel="stylesheet" href="assets/css/Admin/admin-Billing.css">
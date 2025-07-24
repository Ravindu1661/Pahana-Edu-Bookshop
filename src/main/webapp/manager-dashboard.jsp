<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
// Check if user is logged in and has manager role
if (session.getAttribute("user") == null ||
!"MANAGER".equals(session.getAttribute("userRole"))) {
response.sendRedirect("login-signup.jsp");
return;
}
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard - PahanaEdu</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="assets/css/manager-dashboard.css" rel="stylesheet">
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
                        <p class="text-light small mb-0">Manager Panel</p>
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
                            <a class="nav-link" href="#" onclick="showSection('users')">
                                <i class="fas fa-users"></i>User Management
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showSection('items')">
                                <i class="fas fa-box"></i>Item Management
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="showSection('orders')">
                                <i class="fas fa-shopping-cart"></i>Order Management
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
                            <i class="fas fa-graduation-cap"></i> PahanaEdu Manager Dashboard
                        </a>
                        <div class="navbar-nav ms-auto">
                            <div class="welcome-text">
                                <i class="fas fa-user-circle"></i> 
                                Welcome back, ${sessionScope.user.firstName} ${sessionScope.user.lastName}!
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
                            <div class="stat-card users">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Total Users</div>
                                        <div class="stat-number text-primary" id="totalUsers">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">Registered users</small>
                                    </div>
                                    <i class="fas fa-users stat-icon text-primary"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card items">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Total Items</div>
                                        <div class="stat-number text-success" id="totalItems">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">Available products</small>
                                    </div>
                                    <i class="fas fa-box stat-icon text-success"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card orders">
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
                            <div class="stat-card revenue">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="stat-label">Total Revenue</div>
                                        <div class="stat-number text-danger" id="totalRevenue">
                                            <i class="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <small class="text-muted">All time revenue</small>
                                    </div>
                                    <i class="fas fa-dollar-sign stat-icon text-danger"></i>
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
                                        <button class="btn btn-primary w-100" onclick="showCreateUserModal()">
                                            <i class="fas fa-user-plus"></i> Add New User
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <button class="btn btn-success w-100" onclick="showCreateItemModal()">
                                            <i class="fas fa-plus"></i> Add New Item
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-2">
                                        <button class="btn btn-info w-100" onclick="showSection('orders')">
                                            <i class="fas fa-eye"></i> View Orders
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

                <!-- Users Section -->
                <div id="users" class="content-section">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="section-title mb-0">
                            <i class="fas fa-users"></i> User Management
                        </h2>
                        <button class="btn btn-primary" onclick="showCreateUserModal()">
                            <i class="fas fa-plus"></i> Add New User
                        </button>
                    </div>
                    
                    <div class="data-table">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-table"></i> Users List
                            </h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="loadUsers()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover" id="usersTable">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="usersTableBody">
                                    <tr>
                                        <td colspan="7" class="text-center py-4">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            Loading users...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Items Section -->
                <div id="items" class="content-section">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="section-title mb-0">
                            <i class="fas fa-box"></i> Item Management
                        </h2>
                        <button class="btn btn-primary" onclick="showCreateItemModal()">
                            <i class="fas fa-plus"></i> Add New Item
                        </button>
                    </div>
                    
                    <div class="data-table">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-table"></i> Items List
                            </h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="loadItems()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover" id="itemsTable">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title & Image</th>
                                        <th>Author</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="itemsTableBody">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            Loading items...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Orders Section -->
                <div id="orders" class="content-section">
                    <h2 class="section-title">
                        <i class="fas fa-shopping-cart"></i> Order Management
                    </h2>
                    
                    <div class="data-table">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">
                                <i class="fas fa-table"></i> Orders List
                            </h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="loadOrders()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-hover" id="ordersTable">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer Name</th>
                                        <th>Email</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                        <th>Payment Method</th>
                                        <th>Order Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="ordersTableBody">
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
            </main>
        </div>
    </div>

    <!-- User Modal -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="userModalTitle">
                        <i class="fas fa-user-plus"></i> Add User
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="userForm" novalidate>
                        <input type="hidden" id="userId" name="userId">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="firstName" class="form-label">
                                        <i class="fas fa-user"></i> First Name *
                                    </label>
                                    <input type="text" class="form-control" id="firstName" name="firstName" required 
                                           placeholder="Enter first name">
                                    <div class="invalid-feedback">
                                        Please provide a valid first name.
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="lastName" class="form-label">
                                        <i class="fas fa-user"></i> Last Name *
                                    </label>
                                    <input type="text" class="form-control" id="lastName" name="lastName" required 
                                           placeholder="Enter last name">
                                    <div class="invalid-feedback">
                                        Please provide a valid last name.
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">
                                <i class="fas fa-envelope"></i> Email Address *
                            </label>
                            <input type="email" class="form-control" id="email" name="email" required 
                                   placeholder="Enter email address">
                            <div class="invalid-feedback">
                                Please provide a valid email address.
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="phone" class="form-label">
                                <i class="fas fa-phone"></i> Phone Number
                            </label>
                            <input type="text" class="form-control" id="phone" name="phone" 
                                   placeholder="Enter phone number">
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="role" class="form-label">
                                        <i class="fas fa-user-tag"></i> Role *
                                    </label>
                                    <select class="form-control" id="role" name="role" required>
                                        <option value="">Select Role</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="CASHIER">Cashier</option>
                                        <option value="CUSTOMER">Customer</option>
                                    </select>
                                    <div class="invalid-feedback">
                                        Please select a role.
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">
                                        <i class="fas fa-toggle-on"></i> Status
                                    </label>
                                    <select class="form-control" id="status" name="status">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">
                                <i class="fas fa-lock"></i> Password
                            </label>
                            <input type="password" class="form-control" id="password" name="password" 
                                   placeholder="Enter password">
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i> 
                                Leave empty to keep current password (for updates)
                            </small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveUser()">
                        <i class="fas fa-save"></i> Save User
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Item Modal -->
    <div class="modal fade" id="itemModal" tabindex="-1" aria-labelledby="itemModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="itemModalTitle">
                        <i class="fas fa-plus"></i> Add Item
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="itemForm" novalidate>
                        <input type="hidden" id="itemId" name="itemId">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="title" class="form-label">
                                        <i class="fas fa-book"></i> Item Title *
                                    </label>
                                    <input type="text" class="form-control" id="title" name="title" required 
                                           placeholder="Enter item title">
                                    <div class="invalid-feedback">
                                        Please provide a valid item title.
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="author" class="form-label">
                                        <i class="fas fa-user-edit"></i> Author *
                                    </label>
                                    <input type="text" class="form-control" id="author" name="author" required 
                                           placeholder="Enter author name">
                                    <div class="invalid-feedback">
                                        Please provide a valid author name.
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="categoryId" class="form-label">
                                        <i class="fas fa-tags"></i> Category *
                                    </label>
                                    <select class="form-control" id="categoryId" name="categoryId" required>
                                        <option value="">Select Category</option>
                                        <!-- Categories will be loaded dynamically -->
                                    </select>
                                    <div class="invalid-feedback">
                                        Please select a category.
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="itemStatus" class="form-label">
                                        <i class="fas fa-toggle-on"></i> Status
                                    </label>
                                    <select class="form-control" id="itemStatus" name="status">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="price" class="form-label">
                                        <i class="fas fa-dollar-sign"></i> Price (Rs.) *
                                    </label>
                                    <input type="number" class="form-control" id="price" name="price" 
                                           step="0.01" min="0" required placeholder="0.00">
                                    <div class="invalid-feedback">
                                        Please provide a valid price.
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="offerPrice" class="form-label">
                                        <i class="fas fa-percentage"></i> Offer Price (Rs.)
                                    </label>
                                    <input type="number" class="form-control" id="offerPrice" name="offerPrice" 
                                           step="0.01" min="0" placeholder="0.00">
                                    <small class="text-muted">Leave empty if no offer</small>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="stock" class="form-label">
                                        <i class="fas fa-boxes"></i> Stock Quantity *
                                    </label>
                                    <input type="number" class="form-control" id="stock" name="stock" 
                                           min="0" required placeholder="0">
                                    <div class="invalid-feedback">
                                        Please provide a valid stock quantity.
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">
                                <i class="fas fa-align-left"></i> Description
                            </label>
                            <textarea class="form-control" id="description" name="description" rows="4" 
                                      placeholder="Enter item description (optional)"></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label for="itemImage" class="form-label">
                                <i class="fas fa-image"></i> Item Image
                            </label>
                            <input type="file" class="form-control" id="itemImage" name="itemImage" 
                                   accept="image/*" onchange="previewImage(this)">
                            <input type="hidden" id="imagePath" name="imagePath">
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i> 
                                Select an image file (JPG, PNG, GIF). Max size: 5MB
                            </small>
                            
                            <!-- Image Preview -->
                            <div id="imagePreview" class="mt-3" style="display: none;">
                                <h6>Image Preview:</h6>
                                <img id="previewImg" src="" alt="Preview" 
                                     style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveItem()">
                        <i class="fas fa-save"></i> Save Item
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading Modal -->
    <div class="modal fade" id="loadingModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body text-center py-4">
                    <div class="loading-spinner mx-auto mb-3"></div>
                    <h6>Processing...</h6>
                    <p class="text-muted mb-0">Please wait while we process your request.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Manager Dashboard JS -->
    <script src="assets/js/manager-dashboard.js"></script>
</body>
</html>
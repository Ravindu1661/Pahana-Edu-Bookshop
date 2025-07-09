<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    if (session.getAttribute("user") == null || 
        !"ADMIN".equals(session.getAttribute("userRole"))) {
        response.sendRedirect("login-signup.jsp");
        return;
    }
%>
<div class="users-container">
    <div class="page-header">
        <h2>👥 User Management</h2>
        <button class="btn btn-primary" id="addUserBtn">
            <i class="icon-plus"></i> Add New User
        </button>
    </div>
    
    <!-- User Statistics -->
    <div class="stats-section">
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <h3>Total Users</h3>
                <span id="totalUsers" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🔐</div>
            <div class="stat-info">
                <h3>Admin Users</h3>
                <span id="adminCount" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">👔</div>
            <div class="stat-info">
                <h3>Manager Users</h3>
                <span id="managerCount" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
                <h3>Cashier Users</h3>
                <span id="cashierCount" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🛒</div>
            <div class="stat-info">
                <h3>Customer Users</h3>
                <span id="customerCount" class="stat-number">0</span>
            </div>
        </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
        <div class="filter-group">
            <label for="roleFilter">Filter by Role:</label>
            <select id="roleFilter" onchange="filterUsers()">
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHIER">Cashier</option>
                <option value="CUSTOMER">Customer</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="statusFilter">Filter by Status:</label>
            <select id="statusFilter" onchange="filterUsers()">
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
            </select>
        </div>
        
        <button class="btn btn-secondary" onclick="loadUsers()">
            <i class="icon-refresh"></i> Refresh
        </button>
    </div>

    <!-- Users Table -->
    <div class="table-container">
        <table id="usersTable">
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
                    <td colspan="7" class="loading">Loading users...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- User Modal -->
<div id="userModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle">Add New User</h3>
            <button class="modal-close" onclick="closeUserModal()">×</button>
        </div>
        
        <div class="modal-body">
            <form id="userForm">
                <input type="hidden" id="userId" name="userId">
                <input type="hidden" id="isEdit" name="isEdit" value="false">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name <span class="required">*</span></label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="email">Email <span class="required">*</span></label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="text" id="phone" name="phone">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password <span class="required">*</span></label>
                        <input type="password" id="password" name="password" placeholder="Enter password">
                        <small class="form-help">Leave blank to keep current password when editing</small>
                    </div>
                    <div class="form-group">
                        <label for="role">Role <span class="required">*</span></label>
                        <select id="role" name="role" required>
                            <option value="">Select Role</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="CASHIER">Cashier</option>
                            <option value="CUSTOMER">Customer</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="status">Status</label>
                        <select id="status" name="status">
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <!-- Empty for layout -->
                    </div>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeUserModal()">Cancel</button>
            <button type="submit" form="userForm" class="btn btn-primary" id="submitBtn">
                <i class="icon-save"></i> Save User
            </button>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="modal">
    <div class="modal-content modal-sm">
        <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="modal-close" onclick="closeDeleteModal()">×</button>
        </div>
        
        <div class="modal-body">
            <p>Are you sure you want to delete this user?</p>
            <p><strong id="deleteUserName"></strong></p>
            <p class="text-warning">This action cannot be undone.</p>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                <i class="icon-trash"></i> Delete User
            </button>
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

<!-- Include CSS -->
<link rel="stylesheet" href="assets/css/Admin/admin-Manage-Users.css">
<script src="assets/js/Admin/admin-Manage-Users.js"></script>
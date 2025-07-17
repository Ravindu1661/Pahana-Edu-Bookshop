<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
    if (session.getAttribute("user") == null || 
        !"ADMIN".equals(session.getAttribute("userRole"))) {
        response.sendRedirect("login-signup.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - Admin Dashboard</title>
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="assets/css/Admin/admin-dashboard.css">
    <link rel="stylesheet" href="assets/css/Admin/admin-Manage-Users.ss">
    <link rel="stylesheet" href="assets/css/Admin/admin-Manage-Item.ss">
    <link rel="stylesheet" href="assets/css/Admin/admin-Billing.ss">
    
    <!-- FontAwesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>📚 Pahana Edu Admin</h2>
            </div>
            <nav class="sidebar-nav">
                <ul class="nav-list">
                    <li>
                        <a href="#" data-page="Admin/admin-Manage-Users.jsp" class="nav-link active">
                            <i class="fas fa-users"></i>
                            <span> User Management</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-page="Admin/admin-Manage-Items.jsp" class="nav-link">
                            <i class="fas fa-box"></i>
                            <span> Item Management</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-page="Admin/admin-Billing.jsp" class="nav-link">
                            <i class="fas fa-credit-card"></i>
                            <span> Billing & Orders</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" data-page="Admin/admin-System-Settings.jsp" class="nav-link">
                            <i class="fas fa-cog"></i>
                            <span> System Settings</span>
                        </a>
                    </li>
                    <li class="nav-divider"></li>
                    <li>
                        <a href="${pageContext.request.contextPath}/logout" class="nav-link logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span> Logout</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Header -->
            <header class="dashboard-header">
                <div class="header-left">
                    <h1>🔧 Admin Dashboard</h1>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <div class="user-details">
                            <span class="user-name">Welcome, ${sessionScope.userFirstName} ${sessionScope.userLastName}!</span>
                            <span class="user-role">Role: ${sessionScope.userRole}</span>
                        </div>
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Dynamic Content Area -->
            <main class="content-area" id="content-area">
                <!-- Initial Welcome Content -->
                <div class="welcome-content">
                    <div class="welcome-card">
                        <h2>🎯 Welcome to Admin Dashboard</h2>
                        <p>Select a menu item from the sidebar to get started.</p>
                        <div class="quick-stats">
                            <div class="quick-stat-item">
                                <i class="fas fa-users"></i>
                                <span>Manage Users</span>
                            </div>
                            <div class="quick-stat-item">
                                <i class="fas fa-box"></i>
                                <span>Manage Items</span>
                            </div>
                            <div class="quick-stat-item">
                                <i class="fas fa-chart-bar"></i>
                                <span>View Reports</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Global Toast Notification -->
    <div id="messageToast" class="toast">
        <div class="toast-content">
            <span id="toastMessage"></span>
            <button class="toast-close" onclick="hideToast()">×</button>
        </div>
    </div>

    <!-- JavaScript Files -->
    <script src="assets/js/Admin/admin-dashboard.js"></script>
</body>
</html>
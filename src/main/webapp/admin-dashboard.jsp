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
    <link href="assets/css/Admin/admin-dashboard.css" rel="stylesheet"> 
</head>
<body>
    <div class="dashboard-container">
        <div class="sidebar">
            <h2>Pahana Edu Admin</h2>
            <ul class="nav-list">
                <li><a href="#" data-page="Admin/admin-Manage-Users.jsp" class="nav-link active">👥 User Management</a></li>
                <li><a href="#" data-page="Admin/admin-Manage-Items.jsp" class="nav-link">🏪 Item</a></li>
                <li><a href="#" data-page="Admin/admin-Billing.jsp" class="nav-link">💳 Billing</a></li>
                <li><a href="#" data-page="Admin/admin-System-Settings.jsp" class="nav-link">⚙️ Settings</a></li>
                <li><a href="${pageContext.request.contextPath}/logout" class="nav-link logout">🚪 Logout</a></li>
            </ul>
        </div>
        <div class="main-content">
            <header class="header">
                <h1>🔧 Admin Dashboard</h1>
                <div class="user-info">
                    <span>Welcome, ${sessionScope.userFirstName} ${sessionScope.userLastName}!</span>
                    <span>Role: ${sessionScope.userRole}</span>
                </div>
            </header>
            <div class="content-area" id="content-area">
                <!-- Content will be loaded here -->
            </div>
        </div>
    </div>

    <!-- External JS File -->
    <script src="assets/js/Admin/admin-dashboard.js"></script>
    <script src="assets/js/Admin/admin-Manage-Users.js"></script>
    <script src="assets/js/Admin/admin-Manage-Item.js"></script>
    <script src="assets/js/Admin/admin-Billing.js"></script>
</body>
</html>

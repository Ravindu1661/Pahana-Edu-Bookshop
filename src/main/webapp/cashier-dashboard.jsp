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
<html>
<head>
    <meta charset="UTF-8">
    <title>Pahana Edu - Cashier Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f39c12;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 {
            margin: 0;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .logout-btn {
            background-color: #e74c3c;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
        }
        .logout-btn:hover {
            background-color: #c0392b;
        }
        .welcome-section {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .welcome-section h2 {
            color: #f39c12;
            margin-bottom: 20px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature-card {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .feature-card h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .feature-card p {
            color: #7f8c8d;
            font-size: 14px;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <header class="header">
            <h1>💰 Cashier Dashboard</h1>
            <div class="user-info">
                <span>Welcome, ${sessionScope.userFirstName} ${sessionScope.userLastName}!</span>
                <a href="logout" class="logout-btn">Logout</a>
            </div>
        </header>
        
        <div class="welcome-section">
            <h2>Sales & Customer Service Panel</h2>
            <p>Welcome to the Pahana Edu Cashier Dashboard. Process sales and assist customers.</p>
            <p><strong>Email:</strong> ${sessionScope.userEmail}</p>
            <p><strong>Role:</strong> ${sessionScope.userRole}</p>
        </div>
        
        <div class="features">
            <div class="feature-card">
                <div class="icon">💳</div>
                <h3>Process Sales</h3>
                <p>Handle customer purchases and process payments efficiently.</p>
            </div>
            
            <div class="feature-card">
                <div class="icon">👥</div>
                <h3>Customer Lookup</h3>
                <p>Search and view customer information for better service.</p>
            </div>
            
            <div class="feature-card">
                <div class="icon">📦</div>
                <h3>Product Search</h3>
                <p>Find books and products quickly using search functionality.</p>
            </div>
            
            <div class="feature-card">
                <div class="icon">🧾</div>
                <h3>Generate Receipt</h3>
                <p>Print receipts and manage transaction records.</p>
            </div>
            
            <div class="feature-card">
                <div class="icon">📊</div>
                <h3>Daily Reports</h3>
                <p>View daily sales reports and transaction summaries.</p>
            </div>
            
            <div class="feature-card">
                <div class="icon">🔄</div>
                <h3>Returns & Refunds</h3>
                <p>Process returns and handle refund requests from customers.</p>
            </div>
        </div>
    </div>
</body>
</html>
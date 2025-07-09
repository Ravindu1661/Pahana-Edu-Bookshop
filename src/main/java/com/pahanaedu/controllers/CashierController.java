package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Cashier Controller - Handles cashier operations
 * Only accessible by users with CASHIER role
 */
@WebServlet("/cashier/*")
public class CashierController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("CashierController: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("CashierController: Failed to initialize UserDAO - " + e.getMessage());
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check cashier authentication
        if (!isCashierAuthenticated(request)) {
            response.sendRedirect("login.jsp");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            // Redirect to cashier dashboard
            response.sendRedirect("cashier-dashboard.jsp");
            return;
        }
        
        switch (pathInfo) {
            case "/customers":
                handleGetCustomers(request, response);
                break;
            case "/sales":
                handleGetSales(request, response);
                break;
            case "/stats":
                handleGetStats(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check cashier authentication
        if (!isCashierAuthenticated(request)) {
            sendErrorResponse(response, "Access denied. Cashier authentication required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/process-sale":
                handleProcessSale(request, response);
                break;
            case "/search-customer":
                handleSearchCustomer(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authenticated as cashier
     */
    private boolean isCashierAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && User.ROLE_CASHIER.equals(userRole);
    }
    
    /**
     * Handle get customers request
     */
    private void handleGetCustomers(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<User> customers = userDAO.getUsersByRole(User.ROLE_CUSTOMER);
            
            // Convert to JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"customers\": [");
            
            for (int i = 0; i < customers.size(); i++) {
                User customer = customers.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(customer.getId()).append(",")
                    .append("\"firstName\": \"").append(escapeJsonString(customer.getFirstName())).append("\",")
                    .append("\"lastName\": \"").append(escapeJsonString(customer.getLastName())).append("\",")
                    .append("\"email\": \"").append(escapeJsonString(customer.getEmail())).append("\",")
                    .append("\"phone\": \"").append(escapeJsonString(customer.getPhone())).append("\",")
                    .append("\"status\": \"").append(escapeJsonString(customer.getStatus())).append("\",")
                    .append("\"fullName\": \"").append(escapeJsonString(customer.getFullName())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting customers - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving customers\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get sales request
     */
    private void handleGetSales(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // This would be implemented with actual sales data
            // For now, return dummy data
            String jsonResponse = "{\"success\": true, \"sales\": [" +
                "{\"id\": 1, \"customer\": \"John Doe\", \"amount\": 250.00, \"date\": \"2024-01-15\"}," +
                "{\"id\": 2, \"customer\": \"Jane Smith\", \"amount\": 180.50, \"date\": \"2024-01-15\"}" +
                "]}";
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting sales - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving sales\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get statistics request
     */
    private void handleGetStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int totalCustomers = userDAO.getUserCountByRole(User.ROLE_CUSTOMER);
            
            // Dummy statistics - in real application, get from sales/orders table
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"totalCustomers\": %d, " +
                "\"todaySales\": 15, " +
                "\"todayRevenue\": 2500.00, " +
                "\"pendingOrders\": 5" +
                "}}",
                totalCustomers
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle process sale request
     */
    private void handleProcessSale(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get sale parameters
            String customerId = request.getParameter("customerId");
            String amount = request.getParameter("amount");
            String items = request.getParameter("items");
            
            // Validate inputs
            if (customerId == null || customerId.trim().isEmpty()) {
                sendErrorResponse(response, "Customer ID is required");
                return;
            }
            
            if (amount == null || amount.trim().isEmpty()) {
                sendErrorResponse(response, "Amount is required");
                return;
            }
            
            // This would be implemented with actual sales processing
            // For now, return success
            System.out.println("CashierController: Processing sale - Customer: " + customerId + 
                             ", Amount: " + amount + ", Items: " + items);
            
            sendSuccessResponse(response, "Sale processed successfully");
            
        } catch (Exception e) {
            System.err.println("CashierController: Error processing sale - " + e.getMessage());
            sendErrorResponse(response, "Error processing sale");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle search customer request
     */
    private void handleSearchCustomer(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String searchTerm = request.getParameter("searchTerm");
            
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                sendErrorResponse(response, "Search term is required");
                return;
            }
            
            // This would be implemented with actual search functionality
            // For now, return dummy data
            String jsonResponse = "{\"success\": true, \"customers\": [" +
                "{\"id\": 1, \"name\": \"John Doe\", \"email\": \"john@example.com\", \"phone\": \"0771234567\"}" +
                "]}";
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("CashierController: Error searching customer - " + e.getMessage());
            sendErrorResponse(response, "Error searching customer");
        } finally {
            out.close();
        }
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        PrintWriter out = response.getWriter();
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
    }
    
    /**
     * Escape JSON string
     */
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }
    
    @Override
    public void destroy() {
        System.out.println("CashierController: Controller being destroyed");
        userDAO = null;
        super.destroy();
    }
}
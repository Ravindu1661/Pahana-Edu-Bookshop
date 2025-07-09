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
 * Manager Controller - Handles manager operations
 * Only accessible by users with MANAGER role
 */
@WebServlet("/manager/*")
public class ManagerController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("ManagerController: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("ManagerController: Failed to initialize UserDAO - " + e.getMessage());
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check manager authentication
        if (!isManagerAuthenticated(request)) {
            response.sendRedirect("login.jsp");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            // Redirect to manager dashboard
            response.sendRedirect("manager-dashboard.jsp");
            return;
        }
        
        switch (pathInfo) {
            case "/customers":
                handleGetCustomers(request, response);
                break;
            case "/customer-stats":
                handleGetCustomerStats(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check manager authentication
        if (!isManagerAuthenticated(request)) {
            sendErrorResponse(response, "Access denied. Manager authentication required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/update-customer":
                handleUpdateCustomer(request, response);
                break;
            case "/toggle-customer-status":
                handleToggleCustomerStatus(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authenticated as manager
     */
    private boolean isManagerAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && User.ROLE_MANAGER.equals(userRole);
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
            System.err.println("ManagerController: Error getting customers - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving customers\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get customer statistics request
     */
    private void handleGetCustomerStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<User> customers = userDAO.getUsersByRole(User.ROLE_CUSTOMER);
            
            int totalCustomers = customers.size();
            int activeCustomers = 0;
            int inactiveCustomers = 0;
            
            for (User customer : customers) {
                if (User.STATUS_ACTIVE.equals(customer.getStatus())) {
                    activeCustomers++;
                } else {
                    inactiveCustomers++;
                }
            }
            
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"totalCustomers\": %d, " +
                "\"activeCustomers\": %d, " +
                "\"inactiveCustomers\": %d" +
                "}}",
                totalCustomers, activeCustomers, inactiveCustomers
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting customer stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update customer request
     */
    private void handleUpdateCustomer(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get parameters
            String customerIdStr = request.getParameter("customerId");
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String status = request.getParameter("status");
            
            if (customerIdStr == null || customerIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Customer ID is required");
                return;
            }
            
            int customerId = Integer.parseInt(customerIdStr);
            
            // Get existing customer
            User existingCustomer = userDAO.getUserById(customerId);
            if (existingCustomer == null) {
                sendErrorResponse(response, "Customer not found");
                return;
            }
            
            // Ensure user is customer
            if (!User.ROLE_CUSTOMER.equals(existingCustomer.getRole())) {
                sendErrorResponse(response, "Access denied. Can only update customers.");
                return;
            }
            
            // Check if email is being changed and if it already exists
            if (email != null && !email.equals(existingCustomer.getEmail())) {
                if (userDAO.emailExistsExcluding(email, customerId)) {
                    sendErrorResponse(response, "Email address already exists");
                    return;
                }
            }
            
            // Update customer object
            if (firstName != null) existingCustomer.setFirstName(firstName.trim());
            if (lastName != null) existingCustomer.setLastName(lastName.trim());
            if (email != null) existingCustomer.setEmail(email.trim());
            if (phone != null) existingCustomer.setPhone(phone.trim());
            if (status != null) existingCustomer.setStatus(status.trim());
            
            // Update customer
            if (userDAO.updateUser(existingCustomer)) {
                sendSuccessResponse(response, "Customer updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update customer");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid customer ID");
        } catch (Exception e) {
            System.err.println("ManagerController: Error updating customer - " + e.getMessage());
            sendErrorResponse(response, "Error updating customer");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle toggle customer status request
     */
    private void handleToggleCustomerStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String customerIdStr = request.getParameter("customerId");
            
            if (customerIdStr == null || customerIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Customer ID is required");
                return;
            }
            
            int customerId = Integer.parseInt(customerIdStr);
            
            // Get existing customer
            User existingCustomer = userDAO.getUserById(customerId);
            if (existingCustomer == null) {
                sendErrorResponse(response, "Customer not found");
                return;
            }
            
            // Ensure user is customer
            if (!User.ROLE_CUSTOMER.equals(existingCustomer.getRole())) {
                sendErrorResponse(response, "Access denied. Can only modify customers.");
                return;
            }
            
            // Toggle status
            String newStatus = User.STATUS_ACTIVE.equals(existingCustomer.getStatus()) 
                              ? User.STATUS_INACTIVE 
                              : User.STATUS_ACTIVE;
            
            existingCustomer.setStatus(newStatus);
            
            // Update customer
            if (userDAO.updateUser(existingCustomer)) {
                String message = User.STATUS_ACTIVE.equals(newStatus) 
                                ? "Customer activated successfully" 
                                : "Customer deactivated successfully";
                sendSuccessResponse(response, message);
            } else {
                sendErrorResponse(response, "Failed to update customer status");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid customer ID");
        } catch (Exception e) {
            System.err.println("ManagerController: Error toggling customer status - " + e.getMessage());
            sendErrorResponse(response, "Error updating customer status");
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
        System.out.println("ManagerController: Controller being destroyed");
        userDAO = null;
        super.destroy();
    }
}
package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonObject;
import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.models.Order;

/**
 * Admin Update Order Status Controller
 */
@WebServlet("/admin/update-order-status")
public class AdminUpdateOrderStatusController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private OrderDAO orderDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            System.out.println("AdminUpdateOrderStatusController: Initialized successfully");
        } catch (Exception e) {
            System.err.println("AdminUpdateOrderStatusController: Failed to initialize - " + e.getMessage());
            throw new ServletException("Failed to initialize", e);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin authentication
        if (!isAdminAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Admin privileges required.");
            return;
        }
        
        handleUpdateOrderStatus(request, response);
    }
    
    /**
     * Check if user is authorized (admin)
     */
    private boolean isAdminAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && "ADMIN".equals(userRole);
    }
    
    /**
     * Handle update order status request
     */
    private void handleUpdateOrderStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String orderIdStr = request.getParameter("orderId");
            String newStatus = request.getParameter("status");
            
            // Validation
            if (orderIdStr == null || orderIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Order ID is required");
                return;
            }
            
            if (newStatus == null || newStatus.trim().isEmpty()) {
                sendErrorResponse(response, "Status is required");
                return;
            }
            
            int orderId;
            try {
                orderId = Integer.parseInt(orderIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid order ID format");
                return;
            }
            
            // Validate status
            if (!isValidStatus(newStatus)) {
                sendErrorResponse(response, "Invalid status value");
                return;
            }
            
            // Get current order
            Order currentOrder = orderDAO.getOrderById(orderId);
            if (currentOrder == null) {
                sendErrorResponse(response, "Order not found");
                return;
            }
            
            // Check if status change is valid
            if (!isValidStatusTransition(currentOrder.getStatus(), newStatus)) {
                sendErrorResponse(response, "Invalid status transition from " + 
                                getStatusDisplay(currentOrder.getStatus()) + " to " + getStatusDisplay(newStatus));
                return;
            }
            
            // Update order status
            boolean success = orderDAO.updateOrderStatus(orderId, newStatus);
            
            if (success) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order status updated to " + getStatusDisplay(newStatus));
                responseObj.addProperty("orderId", orderId);
                responseObj.addProperty("newStatus", newStatus);
                responseObj.addProperty("previousStatus", currentOrder.getStatus());
                
                out.print(responseObj.toString());
                
                System.out.println("AdminUpdateOrderStatusController: Order " + orderId + 
                                 " status updated from " + currentOrder.getStatus() + " to " + newStatus);
                
            } else {
                sendErrorResponse(response, "Failed to update order status");
            }
            
        } catch (Exception e) {
            System.err.println("AdminUpdateOrderStatusController: Error updating order status - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error updating order status: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Validate status value
     */
    private boolean isValidStatus(String status) {
        return status.equals(Order.STATUS_PENDING) ||
               status.equals(Order.STATUS_CONFIRMED) ||
               status.equals(Order.STATUS_SHIPPED) ||
               status.equals(Order.STATUS_DELIVERED) ||
               status.equals(Order.STATUS_CANCELLED);
    }
    
    /**
     * Check if status transition is valid
     */
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Business rules for status transitions
        
        // Cannot change from delivered
        if (Order.STATUS_DELIVERED.equals(currentStatus) && !Order.STATUS_DELIVERED.equals(newStatus)) {
            return false;
        }
        
        // Cannot change from cancelled (except to cancelled again)
        if (Order.STATUS_CANCELLED.equals(currentStatus) && !Order.STATUS_CANCELLED.equals(newStatus)) {
            return false;
        }
        
        // Cannot go back to pending from other statuses
        if (!Order.STATUS_PENDING.equals(currentStatus) && Order.STATUS_PENDING.equals(newStatus)) {
            return false;
        }
        
        // Cannot ship directly from pending (must confirm first)
        if (Order.STATUS_PENDING.equals(currentStatus) && Order.STATUS_SHIPPED.equals(newStatus)) {
            return false;
        }
        
        // Cannot deliver directly from pending or confirmed (must ship first)
        if ((Order.STATUS_PENDING.equals(currentStatus) || Order.STATUS_CONFIRMED.equals(currentStatus)) 
            && Order.STATUS_DELIVERED.equals(newStatus)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get status display text
     */
    private String getStatusDisplay(String status) {
        switch (status) {
            case Order.STATUS_PENDING:
                return "Pending";
            case Order.STATUS_CONFIRMED:
                return "Confirmed";
            case Order.STATUS_SHIPPED:
                return "Shipped";
            case Order.STATUS_DELIVERED:
                return "Delivered";
            case Order.STATUS_CANCELLED:
                return "Cancelled";
            default:
                return "Unknown";
        }
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        JsonObject responseObj = new JsonObject();
        responseObj.addProperty("success", false);
        responseObj.addProperty("message", message);
        
        out.print(responseObj.toString());
        out.flush();
    }
    
    @Override
    public void destroy() {
        System.out.println("AdminUpdateOrderStatusController: Being destroyed");
        orderDAO = null;
        super.destroy();
    }
}
package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.List;

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
 * Admin Order Statistics Controller
 */
@WebServlet("/admin/order-stats")
public class AdminOrderStatsController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private OrderDAO orderDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            System.out.println("AdminOrderStatsController: Initialized successfully");
        } catch (Exception e) {
            System.err.println("AdminOrderStatsController: Failed to initialize - " + e.getMessage());
            throw new ServletException("Failed to initialize", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin authentication
        if (!isAdminAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Admin privileges required.");
            return;
        }
        
        handleGetOrderStats(request, response);
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
     * Handle get order statistics request
     */
    private void handleGetOrderStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            System.out.println("AdminOrderStatsController: Getting order statistics...");
            
            // Get all orders
            List<Order> allOrders = orderDAO.getAllOrders();
            
            // Calculate statistics
            int totalOrders = allOrders.size();
            int pendingOrders = 0;
            int confirmedOrders = 0;
            int shippedOrders = 0;
            int deliveredOrders = 0;
            int cancelledOrders = 0;
            BigDecimal totalRevenue = BigDecimal.ZERO;
            
            for (Order order : allOrders) {
                // Count by status
                switch (order.getStatus()) {
                    case Order.STATUS_PENDING:
                        pendingOrders++;
                        break;
                    case Order.STATUS_CONFIRMED:
                        confirmedOrders++;
                        break;
                    case Order.STATUS_SHIPPED:
                        shippedOrders++;
                        break;
                    case Order.STATUS_DELIVERED:
                        deliveredOrders++;
                        break;
                    case Order.STATUS_CANCELLED:
                        cancelledOrders++;
                        break;
                }
                
                // Calculate revenue (exclude cancelled orders)
                if (!Order.STATUS_CANCELLED.equals(order.getStatus())) {
                    totalRevenue = totalRevenue.add(order.getTotalAmount());
                }
            }
            
            // Build response
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Statistics retrieved successfully");
            
            JsonObject statsObj = new JsonObject();
            statsObj.addProperty("totalOrders", totalOrders);
            statsObj.addProperty("pendingOrders", pendingOrders);
            statsObj.addProperty("confirmedOrders", confirmedOrders);
            statsObj.addProperty("shippedOrders", shippedOrders);
            statsObj.addProperty("deliveredOrders", deliveredOrders);
            statsObj.addProperty("cancelledOrders", cancelledOrders);
            statsObj.addProperty("totalRevenue", totalRevenue);
            
            responseObj.add("stats", statsObj);
            
            out.print(responseObj.toString());
            
            System.out.println("AdminOrderStatsController: Statistics calculated - " +
                             "Total: " + totalOrders + ", Pending: " + pendingOrders + 
                             ", Revenue: " + totalRevenue);
            
        } catch (Exception e) {
            System.err.println("AdminOrderStatsController: Error getting statistics - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving statistics: " + e.getMessage());
        } finally {
            out.close();
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
        System.out.println("AdminOrderStatsController: Being destroyed");
        orderDAO = null;
        super.destroy();
    }
}
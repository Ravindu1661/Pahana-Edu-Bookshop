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

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.models.Order;

/**
 * Customer Orders Controller - Enhanced with Promo Code Support
 */
@WebServlet("/customer/orders/*")
public class CustomerOrdersController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private OrderDAO orderDAO;
    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            new Gson();
            System.out.println("CustomerOrdersController: Initialized successfully with promo code support");
        } catch (Exception e) {
            System.err.println("CustomerOrdersController: Failed to initialize - " + e.getMessage());
            throw new ServletException("Failed to initialize", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check customer authentication
        if (!isAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Please login as customer.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            handleGetUserOrders(request, response);
        } else if (pathInfo.matches("/\\d+")) {
            // Get specific order by ID
            int orderId = Integer.parseInt(pathInfo.substring(1));
            handleGetOrderById(request, response, orderId);
        } else {
            sendErrorResponse(response, "Invalid operation");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check customer authentication
        if (!isAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Please login as customer.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo != null && pathInfo.matches("/\\d+/cancel")) {
            // Cancel order
            int orderId = Integer.parseInt(pathInfo.split("/")[1]);
            handleCancelOrder(request, response, orderId);
        } else {
            sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authorized (customer) - Updated for your user structure
     */
    private boolean isAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            System.out.println("CustomerOrdersController: No session found");
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        System.out.println("CustomerOrdersController: isLoggedIn=" + isLoggedIn + ", userRole=" + userRole);
        
        return Boolean.TRUE.equals(isLoggedIn) && "CUSTOMER".equals(userRole);
    }
    
    /**
     * Get current user ID from session
     */
    private Integer getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return (Integer) session.getAttribute("userId");
        }
        return null;
    }
    
    /**
     * Handle get user orders request - Enhanced with promo code support
     */
    private void handleGetUserOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            Integer userId = getCurrentUserId(request);
            if (userId == null) {
                System.out.println("CustomerOrdersController: No user ID in session");
                sendErrorResponse(response, "User not logged in");
                return;
            }
            
            System.out.println("CustomerOrdersController: Getting orders for user ID: " + userId);
            
            // Get user orders
            List<Order> orders = orderDAO.getOrdersByUser(userId);
            
            System.out.println("CustomerOrdersController: Found " + orders.size() + " orders");
            
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Orders retrieved successfully");
            
            JsonArray ordersArray = new JsonArray();
            for (Order order : orders) {
                JsonObject orderObj = createOrderJsonObject(order);
                ordersArray.add(orderObj);
            }
            
            responseObj.add("orders", ordersArray);
            responseObj.addProperty("count", orders.size());
            
            out.print(responseObj.toString());
            
            System.out.println("CustomerOrdersController: Successfully returned " + orders.size() + " orders with promo code data");
            
        } catch (Exception e) {
            System.err.println("CustomerOrdersController: Error getting user orders - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving orders: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get order by ID request - Enhanced with promo code support
     */
    private void handleGetOrderById(HttpServletRequest request, HttpServletResponse response, int orderId) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            Integer userId = getCurrentUserId(request);
            if (userId == null) {
                sendErrorResponse(response, "User not logged in");
                return;
            }
            
            // Get order by ID
            Order order = orderDAO.getOrderById(orderId);
            
            if (order == null) {
                sendErrorResponse(response, "Order not found");
                return;
            }
            
            // Check if order belongs to current user
            if (order.getUserId() != userId) {
                sendErrorResponse(response, "Access denied");
                return;
            }
            
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Order retrieved successfully");
            
            JsonObject orderObj = createOrderJsonObject(order);
            responseObj.add("order", orderObj);
            
            out.print(responseObj.toString());
            
            System.out.println("CustomerOrdersController: Successfully returned order " + orderId + " with promo code data");
            
        } catch (Exception e) {
            System.err.println("CustomerOrdersController: Error getting order by ID - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving order");
        } finally {
            out.close();
        }
    }
    
    /**
     * Create comprehensive order JSON object with promo code support
     */
    private JsonObject createOrderJsonObject(Order order) {
        JsonObject orderObj = new JsonObject();
        
        // Basic order information
        orderObj.addProperty("id", order.getId());
        orderObj.addProperty("userId", order.getUserId());
        orderObj.addProperty("totalAmount", order.getTotalAmount());
        orderObj.addProperty("status", order.getStatus());
        orderObj.addProperty("shippingAddress", order.getShippingAddress());
        orderObj.addProperty("contactNumber", order.getContactNumber());
        orderObj.addProperty("paymentMethod", order.getPaymentMethod());
        orderObj.addProperty("createdAt", order.getCreatedAt().toString());
        orderObj.addProperty("customerName", order.getCustomerName());
        orderObj.addProperty("orderNotes", order.getOrderNotes());
        
        // Enhanced pricing information with promo code support
        if (order.getSubtotal() != null) {
            orderObj.addProperty("subtotal", order.getSubtotal());
        }
        
        if (order.getShippingAmount() != null) {
            orderObj.addProperty("shippingAmount", order.getShippingAmount());
        }
        
        if (order.getDiscountAmount() != null) {
            orderObj.addProperty("discountAmount", order.getDiscountAmount());
        }
        
        // Promo code information
        if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
            orderObj.addProperty("promoCode", order.getPromoCode());
            System.out.println("CustomerOrdersController: Order " + order.getId() + " has promo code: " + order.getPromoCode());
        }
        
        // Transaction ID for online payments
        if (order.getTransactionId() != null && !order.getTransactionId().trim().isEmpty()) {
            orderObj.addProperty("transactionId", order.getTransactionId());
        }
        
        // Calculate breakdown for frontend compatibility
        BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal shipping = order.getShippingAmount() != null ? order.getShippingAmount() : BigDecimal.ZERO;
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        
        // If we don't have breakdown data, calculate from order items
        if (subtotal.equals(BigDecimal.ZERO) && order.getOrderItems() != null) {
            subtotal = order.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Apply free shipping rule
            shipping = subtotal.compareTo(new BigDecimal("3000")) >= 0 ? BigDecimal.ZERO : new BigDecimal("250");
            
            // Calculate discount if total amount is available
            if (order.getTotalAmount() != null) {
                BigDecimal expectedTotal = subtotal.add(shipping);
                discount = expectedTotal.subtract(order.getTotalAmount());
                if (discount.compareTo(BigDecimal.ZERO) < 0) {
                    discount = BigDecimal.ZERO;
                }
            }
        }
        
        // Add calculated values for frontend
        orderObj.addProperty("calculatedSubtotal", subtotal);
        orderObj.addProperty("calculatedShipping", shipping);
        orderObj.addProperty("calculatedDiscount", discount);
        
        // Add order items with enhanced details
        JsonArray itemsArray = new JsonArray();
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> {
                JsonObject itemObj = new JsonObject();
                itemObj.addProperty("id", item.getId());
                itemObj.addProperty("itemId", item.getItemId());
                itemObj.addProperty("quantity", item.getQuantity());
                itemObj.addProperty("price", item.getPrice());
                itemObj.addProperty("itemTitle", item.getItemTitle());
                itemObj.addProperty("itemAuthor", item.getItemAuthor());
                itemObj.addProperty("itemImagePath", item.getItemImagePath());
                
                // Calculate item total
                BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
                itemObj.addProperty("itemTotal", itemTotal);
                
                itemsArray.add(itemObj);
            });
        }
        orderObj.add("orderItems", itemsArray);
        
        // Add summary information for frontend
        orderObj.addProperty("itemCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
        int totalQuantity = order.getOrderItems() != null ? 
            order.getOrderItems().stream().mapToInt(item -> item.getQuantity()).sum() : 0;
        orderObj.addProperty("totalQuantity", totalQuantity);
        
        // Add promo code savings information
        if (discount.compareTo(BigDecimal.ZERO) > 0 && order.getPromoCode() != null) {
            orderObj.addProperty("promoSavings", discount);
            orderObj.addProperty("hasPromoDiscount", true);
        } else {
            orderObj.addProperty("hasPromoDiscount", false);
        }
        
        // Add payment status information
        if ("online".equals(order.getPaymentMethod())) {
            orderObj.addProperty("isOnlinePayment", true);
            orderObj.addProperty("paymentStatus", order.getTransactionId() != null ? "completed" : "pending");
        } else {
            orderObj.addProperty("isOnlinePayment", false);
            orderObj.addProperty("paymentStatus", "cod");
        }
        
        return orderObj;
    }
    
    /**
     * Handle cancel order request
     */
    private void handleCancelOrder(HttpServletRequest request, HttpServletResponse response, int orderId) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            Integer userId = getCurrentUserId(request);
            if (userId == null) {
                sendErrorResponse(response, "User not logged in");
                return;
            }
            
            // Get order by ID
            Order order = orderDAO.getOrderById(orderId);
            
            if (order == null) {
                sendErrorResponse(response, "Order not found");
                return;
            }
            
            // Check if order belongs to current user
            if (order.getUserId() != userId) {
                sendErrorResponse(response, "Access denied");
                return;
            }
            
            // Check if order can be cancelled
            if (!order.canBeCancelled()) {
                sendErrorResponse(response, "Order cannot be cancelled in current status: " + order.getStatus());
                return;
            }
            
            // Update order status to cancelled
            boolean success = orderDAO.updateOrderStatus(orderId, Order.STATUS_CANCELLED);
            
            if (success) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order cancelled successfully");
                responseObj.addProperty("orderId", orderId);
                responseObj.addProperty("newStatus", Order.STATUS_CANCELLED);
                
                // If order had promo code, log the cancellation
                if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                    System.out.println("CustomerOrdersController: Cancelled order " + orderId + 
                                     " with promo code: " + order.getPromoCode());
                }
                
                out.print(responseObj.toString());
                
                System.out.println("CustomerOrdersController: Order cancelled - ID: " + orderId);
            } else {
                sendErrorResponse(response, "Failed to cancel order");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerOrdersController: Error cancelling order - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error cancelling order");
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
        System.out.println("CustomerOrdersController: Being destroyed");
        orderDAO = null;
        super.destroy();
    }
}
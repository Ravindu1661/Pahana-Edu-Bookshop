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

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.models.Order;
import com.pahanaedu.models.User;

/**
 * Customer Orders Controller - Updated for your database structure
 */
@WebServlet("/customer/orders/*")
public class CustomerOrdersController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private OrderDAO orderDAO;
    private Gson gson;
    
    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            gson = new Gson();
            System.out.println("CustomerOrdersController: Initialized successfully");
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
     * Handle get user orders request
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
                JsonObject orderObj = new JsonObject();
                orderObj.addProperty("id", order.getId());
                orderObj.addProperty("userId", order.getUserId());
                orderObj.addProperty("totalAmount", order.getTotalAmount());
                orderObj.addProperty("status", order.getStatus());
                orderObj.addProperty("shippingAddress", order.getShippingAddress());
                orderObj.addProperty("contactNumber", order.getContactNumber());
                orderObj.addProperty("paymentMethod", order.getPaymentMethod());
                orderObj.addProperty("createdAt", order.getCreatedAt().toString());
                orderObj.addProperty("customerName", order.getCustomerName());
                
                // Add order items
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
                        itemsArray.add(itemObj);
                    });
                }
                orderObj.add("orderItems", itemsArray);
                
                ordersArray.add(orderObj);
            }
            
            responseObj.add("orders", ordersArray);
            responseObj.addProperty("count", orders.size());
            
            out.print(responseObj.toString());
            
            System.out.println("CustomerOrdersController: Successfully returned " + orders.size() + " orders");
            
        } catch (Exception e) {
            System.err.println("CustomerOrdersController: Error getting user orders - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving orders: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get order by ID request
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
            
            JsonObject orderObj = new JsonObject();
            orderObj.addProperty("id", order.getId());
            orderObj.addProperty("userId", order.getUserId());
            orderObj.addProperty("totalAmount", order.getTotalAmount());
            orderObj.addProperty("status", order.getStatus());
            orderObj.addProperty("shippingAddress", order.getShippingAddress());
            orderObj.addProperty("contactNumber", order.getContactNumber());
            orderObj.addProperty("paymentMethod", order.getPaymentMethod());
            orderObj.addProperty("createdAt", order.getCreatedAt().toString());
            orderObj.addProperty("customerName", order.getCustomerName());
            
            // Add order items
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
                    itemsArray.add(itemObj);
                });
            }
            orderObj.add("orderItems", itemsArray);
            
            responseObj.add("order", orderObj);
            
            out.print(responseObj.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerOrdersController: Error getting order by ID - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving order");
        } finally {
            out.close();
        }
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
                sendErrorResponse(response, "Order cannot be cancelled in current status");
                return;
            }
            
            // Update order status to cancelled
            boolean success = orderDAO.updateOrderStatus(orderId, Order.STATUS_CANCELLED);
            
            if (success) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order cancelled successfully");
                responseObj.addProperty("orderId", orderId);
                
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
        gson = null;
        super.destroy();
    }
}
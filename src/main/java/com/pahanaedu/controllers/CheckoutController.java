package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;

import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.dao.CartDAO;
import com.pahanaedu.dao.ItemDAO;
import com.pahanaedu.models.Order;
import com.pahanaedu.models.OrderItem;
import com.pahanaedu.models.Cart;
import com.pahanaedu.models.Item;
import com.pahanaedu.models.User;

/**
 * Checkout Controller - Handles checkout and order placement operations
 */
@WebServlet("/checkout/*")
public class CheckoutController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private OrderDAO orderDAO;
    private CartDAO cartDAO;
    private ItemDAO itemDAO;
    private Gson gson;
    
    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            cartDAO = new CartDAO();
            itemDAO = new ItemDAO();
            gson = new Gson();
            System.out.println("CheckoutController: DAOs initialized successfully");
        } catch (Exception e) {
            System.err.println("CheckoutController: Failed to initialize DAOs - " + e.getMessage());
            throw new ServletException("Failed to initialize DAOs", e);
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
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/place-order":
                handlePlaceOrder(request, response);
                break;
            case "/validate-order":
                handleValidateOrder(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
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
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/order-summary":
                handleGetOrderSummary(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authorized (customer)
     */
    private boolean isAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && User.ROLE_CUSTOMER.equals(userRole);
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
     * Handle place order request
     */
    private void handlePlaceOrder(HttpServletRequest request, HttpServletResponse response) 
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
            
            // Read JSON request body
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                jsonBuilder.append(line);
            }
            
            String jsonString = jsonBuilder.toString();
            JsonObject jsonObject = JsonParser.parseString(jsonString).getAsJsonObject();
            
            // Extract order data
            String fullName = jsonObject.get("fullName").getAsString();
            String contactNumber = jsonObject.get("contactNumber").getAsString();
            String shippingAddress = jsonObject.get("shippingAddress").getAsString();
            String orderNotes = jsonObject.has("orderNotes") ? jsonObject.get("orderNotes").getAsString() : "";
            String paymentMethod = jsonObject.get("paymentMethod").getAsString();
            BigDecimal totalAmount = jsonObject.get("totalAmount").getAsBigDecimal();
            
            // Validate required fields
            if (fullName == null || fullName.trim().isEmpty()) {
                sendErrorResponse(response, "Full name is required");
                return;
            }
            
            if (contactNumber == null || contactNumber.trim().isEmpty()) {
                sendErrorResponse(response, "Contact number is required");
                return;
            }
            
            if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
                sendErrorResponse(response, "Shipping address is required");
                return;
            }
            
            // Get cart items
            List<Cart> cartItems = cartDAO.getCartItems(userId);
            
            if (cartItems.isEmpty()) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            // Create order
            Order order = new Order();
            order.setUserId(userId);
            order.setTotalAmount(totalAmount);
            order.setShippingAddress(shippingAddress);
            order.setContactNumber(contactNumber);
            order.setPaymentMethod(paymentMethod);
            order.setStatus(Order.STATUS_PENDING);
            
            // Convert cart items to order items
            List<OrderItem> orderItems = new ArrayList<>();
            for (Cart cartItem : cartItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setItemId(cartItem.getItemId());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getEffectivePrice());
                orderItems.add(orderItem);
            }
            
            order.setOrderItems(orderItems);
            
            // Validate stock availability
            for (OrderItem orderItem : orderItems) {
                Item item = itemDAO.getItemById(orderItem.getItemId());
                if (item == null || !item.isActive()) {
                    sendErrorResponse(response, "One or more items are no longer available");
                    return;
                }
                
                if (item.getStock() < orderItem.getQuantity()) {
                    sendErrorResponse(response, "Insufficient stock for item: " + item.getTitle());
                    return;
                }
            }
            
            // Create order in database
            int orderId = orderDAO.createOrder(order);
            
            if (orderId > 0) {
                // Clear cart after successful order
                cartDAO.clearCart(userId);
                
                // Update stock quantities
                for (OrderItem orderItem : orderItems) {
                    Item item = itemDAO.getItemById(orderItem.getItemId());
                    int newStock = item.getStock() - orderItem.getQuantity();
                    itemDAO.updateStock(orderItem.getItemId(), newStock);
                }
                
                // Send success response
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order placed successfully");
                responseObj.addProperty("orderId", orderId);
                responseObj.addProperty("totalAmount", totalAmount);
                
                out.print(responseObj.toString());
                
                System.out.println("CheckoutController: Order placed successfully - ID: " + orderId);
                
            } else {
                sendErrorResponse(response, "Failed to place order. Please try again.");
            }
            
        } catch (Exception e) {
            System.err.println("CheckoutController: Error placing order - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error processing order: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle validate order request
     */
    private void handleValidateOrder(HttpServletRequest request, HttpServletResponse response) 
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
            
            // Get cart items
            List<Cart> cartItems = cartDAO.getCartItems(userId);
            
            if (cartItems.isEmpty()) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            // Validate each item
            List<String> errors = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;
            
            for (Cart cartItem : cartItems) {
                Item item = itemDAO.getItemById(cartItem.getItemId());
                
                if (item == null || !item.isActive()) {
                    errors.add("Item '" + cartItem.getItemTitle() + "' is no longer available");
                    continue;
                }
                
                if (item.getStock() < cartItem.getQuantity()) {
                    errors.add("Insufficient stock for '" + item.getTitle() + 
                              "'. Available: " + item.getStock() + ", Requested: " + cartItem.getQuantity());
                    continue;
                }
                
                totalAmount = totalAmount.add(cartItem.getEffectivePrice().multiply(new BigDecimal(cartItem.getQuantity())));
            }
            
            if (!errors.isEmpty()) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", false);
                responseObj.addProperty("message", "Validation failed");
                
                JsonArray errorArray = new JsonArray();
                for (String error : errors) {
                    errorArray.add(error);
                }
                responseObj.add("errors", errorArray);
                
                out.print(responseObj.toString());
            } else {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order validation successful");
                responseObj.addProperty("totalAmount", totalAmount);
                responseObj.addProperty("itemCount", cartItems.size());
                
                out.print(responseObj.toString());
            }
            
        } catch (Exception e) {
            System.err.println("CheckoutController: Error validating order - " + e.getMessage());
            sendErrorResponse(response, "Error validating order");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get order summary request
     */
    private void handleGetOrderSummary(HttpServletRequest request, HttpServletResponse response) 
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
            
            // Get cart items
            List<Cart> cartItems = cartDAO.getCartItems(userId);
            
            if (cartItems.isEmpty()) {
                sendErrorResponse(response, "Cart is empty");
                return;
            }
            
            // Calculate totals
            BigDecimal subtotal = BigDecimal.ZERO;
            int totalItems = 0;
            
            for (Cart cartItem : cartItems) {
                subtotal = subtotal.add(cartItem.getEffectivePrice().multiply(new BigDecimal(cartItem.getQuantity())));
                totalItems += cartItem.getQuantity();
            }
            
            BigDecimal shipping = subtotal.compareTo(new BigDecimal("3000")) >= 0 ? 
                                 BigDecimal.ZERO : new BigDecimal("250");
            BigDecimal total = subtotal.add(shipping);
            
            // Build response
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("subtotal", subtotal);
            responseObj.addProperty("shipping", shipping);
            responseObj.addProperty("total", total);
            responseObj.addProperty("itemCount", totalItems);
            responseObj.addProperty("cartItemCount", cartItems.size());
            
            JsonArray itemsArray = new JsonArray();
            for (Cart cartItem : cartItems) {
                JsonObject itemObj = new JsonObject();
                itemObj.addProperty("id", cartItem.getId());
                itemObj.addProperty("itemId", cartItem.getItemId());
                itemObj.addProperty("title", cartItem.getItemTitle());
                itemObj.addProperty("author", cartItem.getItemAuthor());
                itemObj.addProperty("price", cartItem.getEffectivePrice());
                itemObj.addProperty("quantity", cartItem.getQuantity());
                itemObj.addProperty("imagePath", cartItem.getItemImagePath());
                itemsArray.add(itemObj);
            }
            
            responseObj.add("items", itemsArray);
            
            out.print(responseObj.toString());
            
        } catch (Exception e) {
            System.err.println("CheckoutController: Error getting order summary - " + e.getMessage());
            sendErrorResponse(response, "Error retrieving order summary");
        } finally {
            out.close();
        }
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        JsonObject responseObj = new JsonObject();
        responseObj.addProperty("success", true);
        responseObj.addProperty("message", message);
        
        out.print(responseObj.toString());
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
        
        JsonObject responseObj = new JsonObject();
        responseObj.addProperty("success", false);
        responseObj.addProperty("message", message);
        
        out.print(responseObj.toString());
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
        System.out.println("CheckoutController: Controller being destroyed");
        orderDAO = null;
        cartDAO = null;
        itemDAO = null;
        gson = null;
        super.destroy();
    }
}
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

import com.pahanaedu.dao.CategoryDAO;
import com.pahanaedu.dao.ItemDAO;
import com.pahanaedu.dao.CartDAO;
import com.pahanaedu.models.Category;
import com.pahanaedu.models.Item;
import com.pahanaedu.models.Cart;
import com.pahanaedu.models.User;

/**
 * Customer Controller - Handles customer-facing operations
 * Only accessible by users with CUSTOMER role
 */
@WebServlet("/customer/*")
public class CustomerController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private ItemDAO itemDAO;
    private CategoryDAO categoryDAO;
    private CartDAO cartDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            itemDAO = new ItemDAO();
            categoryDAO = new CategoryDAO();
            cartDAO = new CartDAO();
            System.out.println("CustomerController: DAOs initialized successfully");
        } catch (Exception e) {
            System.err.println("CustomerController: Failed to initialize DAOs - " + e.getMessage());
            throw new ServletException("Failed to initialize DAOs", e);
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
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/categories":
                handleGetCategories(request, response);
                break;
            case "/products/list":
                handleGetProducts(request, response);
                break;
            case "/products/recent":
                handleGetRecentProducts(request, response);
                break;
            case "/products/featured":
                handleGetFeaturedProducts(request, response);
                break;
            case "/cart/items":
                handleGetCartItems(request, response);
                break;
            case "/cart/count":
                handleGetCartCount(request, response);
                break;
            default:
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
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/cart/add":
                handleAddToCart(request, response);
                break;
            case "/cart/update":
                handleUpdateCart(request, response);
                break;
            case "/cart/remove":
                handleRemoveFromCart(request, response);
                break;
            case "/cart/clear":
                handleClearCart(request, response);
                break;
            case "/cart/apply-promo":
                handleApplyPromo(request, response);
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
     * Handle get categories request
     */
    private void handleGetCategories(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<Category> categories = categoryDAO.getActiveCategories();
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"categories\": [");
            
            for (int i = 0; i < categories.size(); i++) {
                Category category = categories.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(category.getId()).append(",")
                    .append("\"name\": \"").append(escapeJsonString(category.getName())).append("\",")
                    .append("\"description\": \"").append(escapeJsonString(category.getDescription())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting categories - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving categories\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get products request
     */
    private void handleGetProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String categoryFilter = request.getParameter("category");
            String searchQuery = request.getParameter("search");
            
            List<Item> items;
            
            if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                items = itemDAO.searchItems(searchQuery.trim());
            } else if (categoryFilter != null && !categoryFilter.trim().isEmpty()) {
                int categoryId = Integer.parseInt(categoryFilter);
                items = itemDAO.getItemsByCategory(categoryId);
            } else {
                items = itemDAO.getActiveItems();
            }
            
            out.print(buildItemsJsonResponse(items));
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting products - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving products\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get recent products request
     */
    private void handleGetRecentProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String limitStr = request.getParameter("limit");
            int limit = limitStr != null ? Integer.parseInt(limitStr) : 8;
            
            List<Item> items = itemDAO.getRecentItems(limit);
            out.print(buildItemsJsonResponse(items, "products"));
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting recent products - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving recent products\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get featured products request
     */
    private void handleGetFeaturedProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String limitStr = request.getParameter("limit");
            int limit = limitStr != null ? Integer.parseInt(limitStr) : 6;
            
            // For demo, return items with offers as featured
            List<Item> items = itemDAO.getFeaturedItems(limit);
            out.print(buildItemsJsonResponse(items, "products"));
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting featured products - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving featured products\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle add to cart request
     */
    private void handleAddToCart(HttpServletRequest request, HttpServletResponse response) 
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
            
            String productIdStr = request.getParameter("productId");
            String quantityStr = request.getParameter("quantity");
            
            if (productIdStr == null || quantityStr == null) {
                sendErrorResponse(response, "Product ID and quantity are required");
                return;
            }
            
            int productId = Integer.parseInt(productIdStr);
            int quantity = Integer.parseInt(quantityStr);
            
            if (quantity <= 0) {
                sendErrorResponse(response, "Quantity must be greater than 0");
                return;
            }
            
            // Check if product exists and is active
            Item item = itemDAO.getItemById(productId);
            if (item == null || !item.isActive()) {
                sendErrorResponse(response, "Product not found or not available");
                return;
            }
            
            // Check stock
            if (item.getStock() < quantity) {
                sendErrorResponse(response, "Insufficient stock. Only " + item.getStock() + " items available");
                return;
            }
            
            // Add to cart
            if (cartDAO.addToCart(userId, productId, quantity)) {
                sendSuccessResponse(response, "Product added to cart successfully");
            } else {
                sendErrorResponse(response, "Failed to add product to cart");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid number format");
        } catch (Exception e) {
            System.err.println("CustomerController: Error adding to cart - " + e.getMessage());
            sendErrorResponse(response, "Error adding product to cart");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get cart items request
     */
    private void handleGetCartItems(HttpServletRequest request, HttpServletResponse response) 
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
            
            List<Cart> cartItems = cartDAO.getCartItems(userId);
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"items\": [");
            
            for (int i = 0; i < cartItems.size(); i++) {
                Cart cartItem = cartItems.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(cartItem.getId()).append(",")
                    .append("\"productId\": ").append(cartItem.getItemId()).append(",")
                    .append("\"title\": \"").append(escapeJsonString(cartItem.getItemTitle())).append("\",")
                    .append("\"author\": \"").append(escapeJsonString(cartItem.getItemAuthor())).append("\",")
                    .append("\"price\": ").append(cartItem.getEffectivePrice()).append(",")
                    .append("\"originalPrice\": ").append(cartItem.getOriginalPrice() != null ? cartItem.getOriginalPrice() : "null").append(",")
                    .append("\"quantity\": ").append(cartItem.getQuantity()).append(",")
                    .append("\"imagePath\": \"").append(escapeJsonString(cartItem.getItemImagePath())).append("\",")
                    .append("\"stock\": ").append(cartItem.getItemStock())
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting cart items - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving cart items\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get cart count request
     */
    private void handleGetCartCount(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            Integer userId = getCurrentUserId(request);
            if (userId == null) {
                out.print("{\"success\": true, \"count\": 0}");
                return;
            }
            
            int count = cartDAO.getCartItemCount(userId);
            out.print("{\"success\": true, \"count\": " + count + "}");
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting cart count - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving cart count\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update cart request
     */
    private void handleUpdateCart(HttpServletRequest request, HttpServletResponse response) 
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
            
            String cartItemIdStr = request.getParameter("cartItemId");
            String quantityStr = request.getParameter("quantity");
            
            if (cartItemIdStr == null || quantityStr == null) {
                sendErrorResponse(response, "Cart item ID and quantity are required");
                return;
            }
            
            int cartItemId = Integer.parseInt(cartItemIdStr);
            int quantity = Integer.parseInt(quantityStr);
            
            if (quantity <= 0) {
                sendErrorResponse(response, "Quantity must be greater than 0");
                return;
            }
            
            // Verify cart item belongs to user
            Cart cartItem = cartDAO.getCartItemById(cartItemId);
            if (cartItem == null || !cartItem.getUserId().equals(userId)) {
                sendErrorResponse(response, "Cart item not found");
                return;
            }
            
            // Check stock
            Item item = itemDAO.getItemById(cartItem.getItemId());
            if (item == null || item.getStock() < quantity) {
                sendErrorResponse(response, "Insufficient stock");
                return;
            }
            
            // Update cart
            if (cartDAO.updateCartItemQuantity(cartItemId, quantity)) {
                sendSuccessResponse(response, "Cart updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update cart");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid number format");
        } catch (Exception e) {
            System.err.println("CustomerController: Error updating cart - " + e.getMessage());
            sendErrorResponse(response, "Error updating cart");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle remove from cart request
     */
    private void handleRemoveFromCart(HttpServletRequest request, HttpServletResponse response) 
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
            
            String cartItemIdStr = request.getParameter("cartItemId");
            
            if (cartItemIdStr == null) {
                sendErrorResponse(response, "Cart item ID is required");
                return;
            }
            
            int cartItemId = Integer.parseInt(cartItemIdStr);
            
            // Verify cart item belongs to user
            Cart cartItem = cartDAO.getCartItemById(cartItemId);
            if (cartItem == null || !cartItem.getUserId().equals(userId)) {
                sendErrorResponse(response, "Cart item not found");
                return;
            }
            
            // Remove from cart
            if (cartDAO.removeFromCart(cartItemId)) {
                sendSuccessResponse(response, "Item removed from cart successfully");
            } else {
                sendErrorResponse(response, "Failed to remove item from cart");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid cart item ID");
        } catch (Exception e) {
            System.err.println("CustomerController: Error removing from cart - " + e.getMessage());
            sendErrorResponse(response, "Error removing item from cart");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle clear cart request
     */
    private void handleClearCart(HttpServletRequest request, HttpServletResponse response) 
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
            
            // Clear cart
            if (cartDAO.clearCart(userId)) {
                sendSuccessResponse(response, "Cart cleared successfully");
            } else {
                sendErrorResponse(response, "Failed to clear cart");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error clearing cart - " + e.getMessage());
            sendErrorResponse(response, "Error clearing cart");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle apply promo code request
     */
    private void handleApplyPromo(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String promoCode = request.getParameter("promoCode");
            
            if (promoCode == null || promoCode.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code is required");
                return;
            }
            
            // Demo promo codes
            double discount = 0;
            String message = "";
            
            switch (promoCode.toUpperCase()) {
                case "SAVE10":
                    discount = 0.10; // 10% discount
                    message = "10% discount applied";
                    break;
                case "SAVE20":
                    discount = 0.20; // 20% discount
                    message = "20% discount applied";
                    break;
                case "FREESHIP":
                    discount = 250; // Free shipping (Rs. 250)
                    message = "Free shipping applied";
                    break;
                default:
                    sendErrorResponse(response, "Invalid promo code");
                    return;
            }
            
            out.print("{\"success\": true, \"message\": \"" + message + "\", \"discount\": " + discount + "}");
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error applying promo - " + e.getMessage());
            sendErrorResponse(response, "Error applying promo code");
        } finally {
            out.close();
        }
    }
    
    /**
     * Build JSON response for items
     */
    private String buildItemsJsonResponse(List<Item> items) {
        return buildItemsJsonResponse(items, "items");
    }
    
    private String buildItemsJsonResponse(List<Item> items, String arrayName) {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{\"success\": true, \"").append(arrayName).append("\": [");
        
        for (int i = 0; i < items.size(); i++) {
            Item item = items.get(i);
            if (i > 0) jsonBuilder.append(",");
            
            jsonBuilder.append("{")
                .append("\"id\": ").append(item.getId()).append(",")
                .append("\"title\": \"").append(escapeJsonString(item.getTitle())).append("\",")
                .append("\"author\": \"").append(escapeJsonString(item.getAuthor())).append("\",")
                .append("\"categoryId\": ").append(item.getCategoryId()).append(",")
                .append("\"categoryName\": \"").append(escapeJsonString(item.getCategoryName())).append("\",")
                .append("\"price\": ").append(item.getPrice()).append(",")
                .append("\"offerPrice\": ").append(item.getOfferPrice() != null ? item.getOfferPrice() : "null").append(",")
                .append("\"stock\": ").append(item.getStock()).append(",")
                .append("\"description\": \"").append(escapeJsonString(item.getDescription())).append("\",")
                .append("\"imagePath\": \"").append(escapeJsonString(item.getImagePath())).append("\",")
                .append("\"status\": \"").append(escapeJsonString(item.getStatus())).append("\"")
                .append("}");
        }
        
        jsonBuilder.append("]}");
        return jsonBuilder.toString();
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
        System.out.println("CustomerController: Controller being destroyed");
        itemDAO = null;
        categoryDAO = null;
        cartDAO = null;
        super.destroy();
    }
}
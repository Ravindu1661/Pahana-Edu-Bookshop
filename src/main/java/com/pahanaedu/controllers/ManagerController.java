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

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.dao.ItemDAO;
import com.pahanaedu.dao.CategoryDAO;
import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.models.User;
import com.pahanaedu.models.Item;
import com.pahanaedu.models.Category;
import com.pahanaedu.models.Order;

/**
 * Manager Controller - Handles manager operations
 * Only accessible by users with MANAGER role
 */
@WebServlet("/manager/*")
public class ManagerController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    private ItemDAO itemDAO;
    private CategoryDAO categoryDAO;
    private OrderDAO orderDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            itemDAO = new ItemDAO();
            categoryDAO = new CategoryDAO();
            orderDAO = new OrderDAO();
            System.out.println("ManagerController: All DAOs initialized successfully");
        } catch (Exception e) {
            System.err.println("ManagerController: Failed to initialize DAOs - " + e.getMessage());
            throw new ServletException("Failed to initialize DAOs", e);
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
            response.sendRedirect("manager-dashboard.jsp");
            return;
        }
        
        switch (pathInfo) {
            case "/users":
                handleGetUsers(request, response);
                break;
            case "/user-stats":
                handleGetUserStats(request, response);
                break;
            case "/items":
                handleGetItems(request, response);
                break;
            case "/categories":
                handleGetCategories(request, response);
                break;
            case "/item-stats":
                handleGetItemStats(request, response);
                break;
            case "/orders":
                handleGetOrders(request, response);
                break;
            case "/order-stats":
                handleGetOrderStats(request, response);
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
            // User operations
            case "/create-user":
                handleCreateUser(request, response);
                break;
            case "/update-user":
                handleUpdateUser(request, response);
                break;
            // Item operations
            case "/create-item":
                handleCreateItem(request, response);
                break;
            case "/update-item":
                handleUpdateItem(request, response);
                break;
            case "/delete-item":
                handleDeleteItem(request, response);
                break;
            case "/create-category":
                handleCreateCategory(request, response);
                break;
            // Order operations
            case "/update-order-status":
                handleUpdateOrderStatus(request, response);
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
     * Handle get users request
     */
    private void handleGetUsers(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String roleFilter = request.getParameter("role");
            List<User> users;
            
            if (roleFilter != null && !roleFilter.trim().isEmpty()) {
                users = userDAO.getUsersByRole(roleFilter);
            } else {
                users = userDAO.getAllUsers();
            }
            
            // Remove admin users from the list (managers can't see admins)
            users.removeIf(user -> User.ROLE_ADMIN.equals(user.getRole()));
            
            // Convert to JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"users\": [");
            
            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(user.getId()).append(",")
                    .append("\"firstName\": \"").append(escapeJsonString(user.getFirstName())).append("\",")
                    .append("\"lastName\": \"").append(escapeJsonString(user.getLastName())).append("\",")
                    .append("\"email\": \"").append(escapeJsonString(user.getEmail())).append("\",")
                    .append("\"phone\": \"").append(escapeJsonString(user.getPhone())).append("\",")
                    .append("\"role\": \"").append(escapeJsonString(user.getRole())).append("\",")
                    .append("\"status\": \"").append(escapeJsonString(user.getStatus())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting users - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving users\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get user statistics request
     */
    private void handleGetUserStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int managerCount = userDAO.getUserCountByRole(User.ROLE_MANAGER);
            int cashierCount = userDAO.getUserCountByRole(User.ROLE_CASHIER);
            int customerCount = userDAO.getUserCountByRole(User.ROLE_CUSTOMER);
            int totalUsers = managerCount + cashierCount + customerCount;
            
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"totalUsers\": %d, " +
                "\"managerCount\": %d, " +
                "\"cashierCount\": %d, " +
                "\"customerCount\": %d" +
                "}}",
                totalUsers, managerCount, cashierCount, customerCount
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting user stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get items request
     */
    private void handleGetItems(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String categoryFilter = request.getParameter("category");
            String statusFilter = request.getParameter("status");
            List<Item> items;
            
            if (categoryFilter != null && !categoryFilter.trim().isEmpty()) {
                int categoryId = Integer.parseInt(categoryFilter);
                items = itemDAO.getItemsByCategory(categoryId);
            } else if (statusFilter != null && !statusFilter.trim().isEmpty()) {
                items = itemDAO.getItemsByStatus(statusFilter);
            } else {
                items = itemDAO.getAllItems();
            }
            
            // Convert to JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"items\": [");
            
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
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting items - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving items\"}");
        } finally {
            out.close();
        }
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
            
            // Convert to JSON
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
            System.err.println("ManagerController: Error getting categories - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving categories\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get item statistics request
     */
    private void handleGetItemStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int activeItems = itemDAO.countItemsByStatus(Item.STATUS_ACTIVE);
            int inactiveItems = itemDAO.countItemsByStatus(Item.STATUS_INACTIVE);
            int outOfStockItems = itemDAO.countItemsByStatus(Item.STATUS_OUT_OF_STOCK);
            int totalItems = activeItems + inactiveItems + outOfStockItems;
            int totalCategories = categoryDAO.getActiveCategories().size();
            
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"totalItems\": %d, " +
                "\"activeItems\": %d, " +
                "\"inactiveItems\": %d, " +
                "\"outOfStockItems\": %d, " +
                "\"totalCategories\": %d" +
                "}}",
                totalItems, activeItems, inactiveItems, outOfStockItems, totalCategories
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting item stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get orders request
     */
    private void handleGetOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<Order> orders = orderDAO.getAllOrders();
            
            // Convert to JSON (simplified)
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"orders\": [");
            
            for (int i = 0; i < orders.size(); i++) {
                Order order = orders.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(order.getId()).append(",")
                    .append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",")
                    .append("\"customerEmail\": \"").append(escapeJsonString(order.getCustomerEmail())).append("\",")
                    .append("\"totalAmount\": ").append(order.getTotalAmount()).append(",")
                    .append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",")
                    .append("\"paymentMethod\": \"").append(escapeJsonString(order.getPaymentMethod())).append("\",")
                    .append("\"createdAt\": \"").append(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting orders - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving orders\"}");
        } finally {
            out.close();
        }
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
            List<Order> allOrders = orderDAO.getAllOrders();
            
            int totalOrders = allOrders.size();
            int pendingOrders = 0;
            int confirmedOrders = 0;
            int shippedOrders = 0;
            int deliveredOrders = 0;
            int cancelledOrders = 0;
            BigDecimal totalRevenue = BigDecimal.ZERO;
            
            for (Order order : allOrders) {
                String status = order.getStatus();
                switch (status != null ? status : "unknown") {
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
                    BigDecimal amount = order.getTotalAmount();
                    if (amount != null) {
                        totalRevenue = totalRevenue.add(amount);
                    }
                }
            }
            
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"totalOrders\": %d, " +
                "\"pendingOrders\": %d, " +
                "\"confirmedOrders\": %d, " +
                "\"shippedOrders\": %d, " +
                "\"deliveredOrders\": %d, " +
                "\"cancelledOrders\": %d, " +
                "\"totalRevenue\": %s" +
                "}}",
                totalOrders, pendingOrders, confirmedOrders, shippedOrders, 
                deliveredOrders, cancelledOrders, totalRevenue
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error getting order stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle create user request
     */
    private void handleCreateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String password = request.getParameter("password");
            String role = request.getParameter("role");
            String status = request.getParameter("status");
            
            // Managers can only create CASHIER and CUSTOMER roles
            if (role != null && User.ROLE_ADMIN.equals(role)) {
                sendErrorResponse(response, "Cannot create admin users");
                return;
            }
            
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                role == null || role.trim().isEmpty()) {
                
                sendErrorResponse(response, "All fields are required");
                return;
            }
            
            if (userDAO.emailExists(email.trim())) {
                sendErrorResponse(response, "Email address already exists");
                return;
            }
            
            User newUser = new User(firstName.trim(), lastName.trim(), email.trim(), 
                                   password, phone, role.trim());
            
            if (status != null && !status.trim().isEmpty()) {
                newUser.setStatus(status.trim());
            }
            
            if (userDAO.createUserByAdmin(newUser)) {
                sendSuccessResponse(response, "User created successfully");
            } else {
                sendErrorResponse(response, "Failed to create user");
            }
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error creating user - " + e.getMessage());
            sendErrorResponse(response, "Error creating user");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update user request
     */
    private void handleUpdateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String userIdStr = request.getParameter("userId");
            
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "User ID is required");
                return;
            }
            
            int userId = Integer.parseInt(userIdStr);
            
            User existingUser = userDAO.getUserById(userId);
            if (existingUser == null) {
                sendErrorResponse(response, "User not found");
                return;
            }
            
            // Managers cannot update admin users
            if (User.ROLE_ADMIN.equals(existingUser.getRole())) {
                sendErrorResponse(response, "Cannot update admin users");
                return;
            }
            
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String role = request.getParameter("role");
            String status = request.getParameter("status");
            String password = request.getParameter("password");
            
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                email == null || email.trim().isEmpty()) {
                
                sendErrorResponse(response, "First name, last name, and email are required");
                return;
            }
            
            if (email != null && !email.equals(existingUser.getEmail())) {
                if (userDAO.emailExistsExcluding(email, userId)) {
                    sendErrorResponse(response, "Email address already exists");
                    return;
                }
            }
            
            existingUser.setFirstName(firstName.trim());
            existingUser.setLastName(lastName.trim());
            existingUser.setEmail(email.trim());
            
            if (phone != null) {
                existingUser.setPhone(phone.trim());
            }
            
            if (status != null && !status.trim().isEmpty()) {
                existingUser.setStatus(status.trim());
            }
            
            // Managers cannot change role to ADMIN
            if (role != null && !role.trim().isEmpty() && !User.ROLE_ADMIN.equals(role.trim())) {
                existingUser.setRole(role.trim());
            }
            
            if (password != null && !password.trim().isEmpty()) {
                if (userDAO.updatePassword(existingUser.getEmail(), password)) {
                    System.out.println("ManagerController: Password updated for user - " + existingUser.getEmail());
                } else {
                    sendErrorResponse(response, "Failed to update password");
                    return;
                }
            }
            
            if (userDAO.updateUser(existingUser)) {
                sendSuccessResponse(response, "User updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        } catch (Exception e) {
            System.err.println("ManagerController: Error updating user - " + e.getMessage());
            sendErrorResponse(response, "Error updating user");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle create item request
     */
    private void handleCreateItem(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String title = request.getParameter("title");
            String author = request.getParameter("author");
            String categoryIdStr = request.getParameter("categoryId");
            String priceStr = request.getParameter("price");
            String offerPriceStr = request.getParameter("offerPrice");
            String stockStr = request.getParameter("stock");
            String description = request.getParameter("description");
            String imagePath = request.getParameter("imagePath");
            String status = request.getParameter("status");
            
            if (title == null || title.trim().isEmpty() ||
                author == null || author.trim().isEmpty() ||
                categoryIdStr == null || categoryIdStr.trim().isEmpty() ||
                priceStr == null || priceStr.trim().isEmpty() ||
                stockStr == null || stockStr.trim().isEmpty()) {
                
                sendErrorResponse(response, "Title, author, category, price, and stock are required");
                return;
            }
            
            Item newItem = new Item();
            newItem.setTitle(title.trim());
            newItem.setAuthor(author.trim());
            newItem.setCategoryId(Integer.parseInt(categoryIdStr));
            newItem.setPrice(new BigDecimal(priceStr));
            
            if (offerPriceStr != null && !offerPriceStr.trim().isEmpty()) {
                newItem.setOfferPrice(new BigDecimal(offerPriceStr));
            }
            
            newItem.setStock(Integer.parseInt(stockStr));
            newItem.setDescription(description != null ? description.trim() : "");
            newItem.setImagePath(imagePath != null ? imagePath.trim() : "");
            newItem.setStatus(status != null && !status.trim().isEmpty() ? status.trim() : Item.STATUS_ACTIVE);
            
            if (itemDAO.createItem(newItem)) {
                sendSuccessResponse(response, "Item created successfully");
            } else {
                sendErrorResponse(response, "Failed to create item");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid number format in input");
        } catch (Exception e) {
            System.err.println("ManagerController: Error creating item - " + e.getMessage());
            sendErrorResponse(response, "Error creating item");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update item request
     */
    private void handleUpdateItem(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String itemIdStr = request.getParameter("itemId");
            
            if (itemIdStr == null || itemIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Item ID is required");
                return;
            }
            
            int itemId = Integer.parseInt(itemIdStr);
            
            Item existingItem = itemDAO.getItemById(itemId);
            if (existingItem == null) {
                sendErrorResponse(response, "Item not found");
                return;
            }
            
            String title = request.getParameter("title");
            String author = request.getParameter("author");
            String categoryIdStr = request.getParameter("categoryId");
            String priceStr = request.getParameter("price");
            String offerPriceStr = request.getParameter("offerPrice");
            String stockStr = request.getParameter("stock");
            String description = request.getParameter("description");
            String imagePath = request.getParameter("imagePath");
            String status = request.getParameter("status");
            
            if (title != null) existingItem.setTitle(title.trim());
            if (author != null) existingItem.setAuthor(author.trim());
            if (categoryIdStr != null) existingItem.setCategoryId(Integer.parseInt(categoryIdStr));
            if (priceStr != null) existingItem.setPrice(new BigDecimal(priceStr));
            if (offerPriceStr != null && !offerPriceStr.trim().isEmpty()) {
                existingItem.setOfferPrice(new BigDecimal(offerPriceStr));
            } else {
                existingItem.setOfferPrice(null);
            }
            if (stockStr != null) existingItem.setStock(Integer.parseInt(stockStr));
            if (description != null) existingItem.setDescription(description.trim());
            if (imagePath != null) existingItem.setImagePath(imagePath.trim());
            if (status != null) existingItem.setStatus(status.trim());
            
            if (itemDAO.updateItem(existingItem)) {
                sendSuccessResponse(response, "Item updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update item");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid number format");
        } catch (Exception e) {
            System.err.println("ManagerController: Error updating item - " + e.getMessage());
            sendErrorResponse(response, "Error updating item");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle delete item request
     */
    private void handleDeleteItem(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String itemIdStr = request.getParameter("itemId");
            
            if (itemIdStr == null || itemIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Item ID is required");
                return;
            }
            
            int itemId = Integer.parseInt(itemIdStr);
            
            Item existingItem = itemDAO.getItemById(itemId);
            if (existingItem == null) {
                sendErrorResponse(response, "Item not found");
                return;
            }
            
            if (itemDAO.deleteItem(itemId)) {
                sendSuccessResponse(response, "Item deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete item");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid item ID");
        } catch (Exception e) {
            System.err.println("ManagerController: Error deleting item - " + e.getMessage());
            sendErrorResponse(response, "Error deleting item");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle create category request
     */
    private void handleCreateCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String name = request.getParameter("name");
            String description = request.getParameter("description");
            
            if (name == null || name.trim().isEmpty()) {
                sendErrorResponse(response, "Category name is required");
                return;
            }
            
            if (categoryDAO.categoryNameExists(name.trim())) {
                sendErrorResponse(response, "Category name already exists");
                return;
            }
            
            Category newCategory = new Category(name.trim(), description != null ? description.trim() : "");
            
            if (categoryDAO.createCategory(newCategory)) {
                sendSuccessResponse(response, "Category created successfully");
            } else {
                sendErrorResponse(response, "Failed to create category");
            }
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error creating category - " + e.getMessage());
            sendErrorResponse(response, "Error creating category");
        } finally {
            out.close();
        }
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
            
            if (!isValidStatus(newStatus)) {
                sendErrorResponse(response, "Invalid status value: " + newStatus);
                return;
            }
            
            Order currentOrder = orderDAO.getOrderById(orderId);
            if (currentOrder == null) {
                sendErrorResponse(response, "Order not found with ID: " + orderId);
                return;
            }
            
            boolean success = orderDAO.updateOrderStatus(orderId, newStatus);
            
            if (success) {
                String jsonResponse = String.format(
                    "{\"success\": true, \"message\": \"Order status updated to %s\", \"orderId\": %d, \"newStatus\": \"%s\"}",
                    getStatusDisplay(newStatus), orderId, newStatus
                );
                out.print(jsonResponse);
            } else {
                sendErrorResponse(response, "Failed to update order status in database");
            }
            
        } catch (Exception e) {
            System.err.println("ManagerController: Error updating order status - " + e.getMessage());
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
     * Get status display text
     */
    private String getStatusDisplay(String status) {
        if (status == null) return "Unknown";
        
        switch (status) {
            case Order.STATUS_PENDING: return "Pending";
            case Order.STATUS_CONFIRMED: return "Confirmed";
            case Order.STATUS_SHIPPED: return "Shipped";
            case Order.STATUS_DELIVERED: return "Delivered";
            case Order.STATUS_CANCELLED: return "Cancelled";
            default: return "Unknown";
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
        itemDAO = null;
        categoryDAO = null;
        orderDAO = null;
        super.destroy();
    }
}
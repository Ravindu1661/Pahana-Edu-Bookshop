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

import com.pahanaedu.dao.CategoryDAO;
import com.pahanaedu.dao.ItemDAO;
import com.pahanaedu.models.Category;
import com.pahanaedu.models.Item;
import com.pahanaedu.models.User;

/**
 * Item Controller - Handles item management operations
 * Only accessible by users with ADMIN or MANAGER roles
 */
@WebServlet("/admin/items/*")
public class ItemController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private ItemDAO itemDAO;
    private CategoryDAO categoryDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            itemDAO = new ItemDAO();
            categoryDAO = new CategoryDAO();
            System.out.println("ItemController: DAOs initialized successfully");
        } catch (Exception e) {
            System.err.println("ItemController: Failed to initialize DAOs - " + e.getMessage());
            throw new ServletException("Failed to initialize DAOs", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin/manager authentication
        if (!isAuthorized(request)) {
            response.sendRedirect("../login.jsp");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            handleGetItems(request, response);
            return;
        }
        
        switch (pathInfo) {
            case "/list":
                handleGetItems(request, response);
                break;
            case "/categories":
                handleGetCategories(request, response);
                break;
            case "/stats":
                handleGetItemStats(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin/manager authentication
        if (!isAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Authorization required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/create":
                handleCreateItem(request, response);
                break;
            case "/update":
                handleUpdateItem(request, response);
                break;
            case "/delete":
                handleDeleteItem(request, response);
                break;
            case "/create-category":
                handleCreateCategory(request, response);
                break;
            case "/update-category":
                handleUpdateCategory(request, response);
                break;
            case "/delete-category":
                handleDeleteCategory(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authorized (admin or manager)
     */
    private boolean isAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && 
               (User.ROLE_ADMIN.equals(userRole) || User.ROLE_MANAGER.equals(userRole));
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
                    .append("\"referenceNo\": \"").append(escapeJsonString(item.getReferenceNo())).append("\",")
                    .append("\"status\": \"").append(escapeJsonString(item.getStatus())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("ItemController: Error getting items - " + e.getMessage());
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
            System.err.println("ItemController: Error getting categories - " + e.getMessage());
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
            System.err.println("ItemController: Error getting item stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
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
            // Get form parameters
            String title = request.getParameter("title");
            String author = request.getParameter("author");
            String categoryIdStr = request.getParameter("categoryId");
            String priceStr = request.getParameter("price");
            String offerPriceStr = request.getParameter("offerPrice");
            String stockStr = request.getParameter("stock");
            String description = request.getParameter("description");
            String imagePath = request.getParameter("imagePath");
            String status = request.getParameter("status");
            
            // Validate inputs
            if (title == null || title.trim().isEmpty() ||
                author == null || author.trim().isEmpty() ||
                categoryIdStr == null || categoryIdStr.trim().isEmpty() ||
                priceStr == null || priceStr.trim().isEmpty() ||
                stockStr == null || stockStr.trim().isEmpty()) {
                
                sendErrorResponse(response, "Title, author, category, price, and stock are required");
                return;
            }
            
            // Create item object
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
            
            // Create item
            if (itemDAO.createItem(newItem)) {
                sendSuccessResponse(response, "Item created successfully");
            } else {
                sendErrorResponse(response, "Failed to create item");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid number format in input");
        } catch (Exception e) {
            System.err.println("ItemController: Error creating item - " + e.getMessage());
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
            
            // Get existing item
            Item existingItem = itemDAO.getItemById(itemId);
            if (existingItem == null) {
                sendErrorResponse(response, "Item not found");
                return;
            }
            
            // Update item properties
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
            
            // Update item
            if (itemDAO.updateItem(existingItem)) {
                sendSuccessResponse(response, "Item updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update item");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid number format");
        } catch (Exception e) {
            System.err.println("ItemController: Error updating item - " + e.getMessage());
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
            
            // Check if item exists
            Item existingItem = itemDAO.getItemById(itemId);
            if (existingItem == null) {
                sendErrorResponse(response, "Item not found");
                return;
            }
            
            // Delete item
            if (itemDAO.deleteItem(itemId)) {
                sendSuccessResponse(response, "Item deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete item");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid item ID");
        } catch (Exception e) {
            System.err.println("ItemController: Error deleting item - " + e.getMessage());
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
            
            // Check if category name already exists
            if (categoryDAO.categoryNameExists(name.trim())) {
                sendErrorResponse(response, "Category name already exists");
                return;
            }
            
            // Create category
            Category newCategory = new Category(name.trim(), description != null ? description.trim() : "");
            
            if (categoryDAO.createCategory(newCategory)) {
                sendSuccessResponse(response, "Category created successfully");
            } else {
                sendErrorResponse(response, "Failed to create category");
            }
            
        } catch (Exception e) {
            System.err.println("ItemController: Error creating category - " + e.getMessage());
            sendErrorResponse(response, "Error creating category");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update category request
     */
    private void handleUpdateCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String categoryIdStr = request.getParameter("categoryId");
            String name = request.getParameter("name");
            String description = request.getParameter("description");
            String status = request.getParameter("status");
            
            if (categoryIdStr == null || categoryIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Category ID is required");
                return;
            }
            
            int categoryId = Integer.parseInt(categoryIdStr);
            
            // Get existing category
            Category existingCategory = categoryDAO.getCategoryById(categoryId);
            if (existingCategory == null) {
                sendErrorResponse(response, "Category not found");
                return;
            }
            
            // Check if name is being changed and if it already exists
            if (name != null && !name.equals(existingCategory.getName())) {
                if (categoryDAO.categoryNameExistsExcluding(name, categoryId)) {
                    sendErrorResponse(response, "Category name already exists");
                    return;
                }
            }
            
            // Update category
            if (name != null) existingCategory.setName(name.trim());
            if (description != null) existingCategory.setDescription(description.trim());
            if (status != null) existingCategory.setStatus(status.trim());
            
            if (categoryDAO.updateCategory(existingCategory)) {
                sendSuccessResponse(response, "Category updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update category");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        } catch (Exception e) {
            System.err.println("ItemController: Error updating category - " + e.getMessage());
            sendErrorResponse(response, "Error updating category");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle delete category request
     */
    private void handleDeleteCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String categoryIdStr = request.getParameter("categoryId");
            
            if (categoryIdStr == null || categoryIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Category ID is required");
                return;
            }
            
            int categoryId = Integer.parseInt(categoryIdStr);
            
            // Check if category exists
            Category existingCategory = categoryDAO.getCategoryById(categoryId);
            if (existingCategory == null) {
                sendErrorResponse(response, "Category not found");
                return;
            }
            
            // Check if category has items
            int itemCount = categoryDAO.countItemsInCategory(categoryId);
            if (itemCount > 0) {
                sendErrorResponse(response, "Cannot delete category with existing items");
                return;
            }
            
            // Delete category
            if (categoryDAO.deleteCategory(categoryId)) {
                sendSuccessResponse(response, "Category deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete category");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        } catch (Exception e) {
            System.err.println("ItemController: Error deleting category - " + e.getMessage());
            sendErrorResponse(response, "Error deleting category");
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
        System.out.println("ItemController: Controller being destroyed");
        itemDAO = null;
        categoryDAO = null;
        super.destroy();
    }
}
package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Item;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for Item operations
 */
public class ItemDAO {
    
    // SQL Queries
    private static final String INSERT_ITEM = 
        "INSERT INTO items (title, author, category_id, price, offer_price, stock, description, image_path, reference_no, status) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    private static final String SELECT_ALL_ITEMS = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "ORDER BY i.created_at DESC";
    
    private static final String SELECT_ITEMS_BY_CATEGORY = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.category_id = ? ORDER BY i.created_at DESC";
    
    private static final String SELECT_ITEMS_BY_STATUS = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.status = ? ORDER BY i.created_at DESC";
    
    private static final String SELECT_ITEM_BY_ID = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.id = ?";
    
    private static final String SELECT_ITEM_BY_REFERENCE = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.reference_no = ?";
    
    private static final String UPDATE_ITEM = 
        "UPDATE items SET title = ?, author = ?, category_id = ?, price = ?, offer_price = ?, " +
        "stock = ?, description = ?, image_path = ?, status = ? WHERE id = ?";
    
    private static final String DELETE_ITEM = 
        "DELETE FROM items WHERE id = ?";
    
    private static final String CHECK_REFERENCE_EXISTS = 
        "SELECT COUNT(*) FROM items WHERE reference_no = ?";
    
    private static final String CHECK_REFERENCE_EXISTS_EXCLUDING_ID = 
        "SELECT COUNT(*) FROM items WHERE reference_no = ? AND id != ?";
    
    private static final String COUNT_ITEMS_BY_STATUS = 
        "SELECT COUNT(*) FROM items WHERE status = ?";
    
    private static final String GET_NEXT_REFERENCE_NUMBER = 
        "SELECT COUNT(*) + 1 FROM items";
    
    // Customer-specific queries
    private static final String SELECT_ACTIVE_ITEMS = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.status = 'active' ORDER BY i.created_at DESC";
    
    private static final String SEARCH_ITEMS = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.status = 'active' AND (i.title LIKE ? OR i.author LIKE ?) " +
        "ORDER BY i.created_at DESC";
    
    private static final String SELECT_RECENT_ITEMS = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.status = 'active' " +
        "ORDER BY i.created_at DESC " +
        "LIMIT ?";
    
    private static final String SELECT_FEATURED_ITEMS = 
        "SELECT i.*, c.name as category_name FROM items i " +
        "LEFT JOIN categories c ON i.category_id = c.id " +
        "WHERE i.status = 'active' AND i.offer_price IS NOT NULL AND i.offer_price > 0 " +
        "ORDER BY i.created_at DESC " +
        "LIMIT ?";
    
    // Stock management queries
    private static final String UPDATE_STOCK = 
        "UPDATE items SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String DECREASE_STOCK = 
        "UPDATE items SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stock >= ?";
    
    private static final String INCREASE_STOCK = 
        "UPDATE items SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String GET_CURRENT_STOCK = 
        "SELECT stock FROM items WHERE id = ?";
    
    private static final String UPDATE_ITEM_STATUS = 
        "UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    /**
     * Generate unique reference number
     */
    public String generateReferenceNumber() {
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        
        try {
            connection = DatabaseConnection.getConnection();
            statement = connection.prepareStatement(GET_NEXT_REFERENCE_NUMBER);
            
            resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                int nextNumber = resultSet.getInt(1);
                String refNo = String.format("REF-%04d", nextNumber); // 4-digit padding
                System.out.println("ItemDAO: Generated reference number: " + refNo);
                return refNo;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error generating reference number - " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (resultSet != null) resultSet.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                System.err.println("ItemDAO: Error closing resources in generateReferenceNumber - " + e.getMessage());
            }
        }
        
        // Fallback to timestamp-based reference
        long timestamp = System.currentTimeMillis();
        String fallbackRef = "REF-" + timestamp;
        System.out.println("ItemDAO: Using fallback reference number: " + fallbackRef);
        return fallbackRef;
    }
    /**
     * Create new item
     */
    public boolean createItem(Item item) {
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet generatedKeys = null;
        
        try {
            connection = DatabaseConnection.getConnection();
            
            // Generate reference number if not provided
            if (item.getReferenceNo() == null || item.getReferenceNo().trim().isEmpty()) {
                String refNo = generateReferenceNumber();
                item.setReferenceNo(refNo);
                System.out.println("ItemDAO: Generated reference number: " + refNo);
            }
            
            // Ensure reference number is unique
            int attempts = 0;
            while (referenceExists(item.getReferenceNo()) && attempts < 5) {
                String newRefNo = generateReferenceNumber();
                item.setReferenceNo(newRefNo);
                attempts++;
                System.out.println("ItemDAO: Reference conflict, trying new: " + newRefNo);
            }
            
            if (attempts >= 5) {
                System.err.println("ItemDAO: Failed to generate unique reference number after 5 attempts");
                return false;
            }
            
            System.out.println("ItemDAO: Final reference number: " + item.getReferenceNo());
            
            // Prepare statement
            statement = connection.prepareStatement(INSERT_ITEM, Statement.RETURN_GENERATED_KEYS);
            
            // Set parameters with null checks
            statement.setString(1, item.getTitle() != null ? item.getTitle().trim() : "");
            statement.setString(2, item.getAuthor() != null ? item.getAuthor().trim() : "");
            statement.setInt(3, item.getCategoryId());
            statement.setBigDecimal(4, item.getPrice());
            
            // Handle offer price (can be null)
            if (item.getOfferPrice() != null) {
                statement.setBigDecimal(5, item.getOfferPrice());
            } else {
                statement.setNull(5, java.sql.Types.DECIMAL);
            }
            
            statement.setInt(6, item.getStock());
            
            // Handle description (can be null)
            if (item.getDescription() != null && !item.getDescription().trim().isEmpty()) {
                statement.setString(7, item.getDescription().trim());
            } else {
                statement.setNull(7, java.sql.Types.LONGVARCHAR);
            }
            
            // Handle image path (can be null)
            if (item.getImagePath() != null && !item.getImagePath().trim().isEmpty()) {
                statement.setString(8, item.getImagePath().trim());
            } else {
                statement.setNull(8, java.sql.Types.LONGVARCHAR);
            }
            
            // Reference number (NOT NULL in database)
            statement.setString(9, item.getReferenceNo());
            
            // Status with default
            String status = item.getStatus();
            if (status == null || status.trim().isEmpty()) {
                status = "active"; // Default status
            }
            statement.setString(10, status);
            
            // Debug: Print the prepared statement parameters
            System.out.println("ItemDAO: Executing INSERT with parameters:");
            System.out.println("  1. title = " + item.getTitle());
            System.out.println("  2. author = " + item.getAuthor());
            System.out.println("  3. category_id = " + item.getCategoryId());
            System.out.println("  4. price = " + item.getPrice());
            System.out.println("  5. offer_price = " + item.getOfferPrice());
            System.out.println("  6. stock = " + item.getStock());
            System.out.println("  7. description = " + (item.getDescription() != null ? item.getDescription().length() + " chars" : "null"));
            System.out.println("  8. image_path = " + (item.getImagePath() != null ? item.getImagePath().length() + " chars" : "null"));
            System.out.println("  9. reference_no = " + item.getReferenceNo());
            System.out.println("  10. status = " + status);
            
            // Execute the statement
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                // Get generated ID
                generatedKeys = statement.getGeneratedKeys();
                if (generatedKeys.next()) {
                    item.setId(generatedKeys.getInt(1));
                    System.out.println("ItemDAO: Item created successfully - ID: " + item.getId() + ", Title: " + item.getTitle());
                    return true;
                } else {
                    System.err.println("ItemDAO: No generated keys returned");
                    return false;
                }
            } else {
                System.err.println("ItemDAO: No rows affected during insert");
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: SQL Error creating item - " + e.getMessage());
            System.err.println("ItemDAO: SQL State: " + e.getSQLState());
            System.err.println("ItemDAO: Error Code: " + e.getErrorCode());
            e.printStackTrace();
            
            // Check for specific SQL errors
            if (e.getErrorCode() == 1062) { // Duplicate entry
                System.err.println("ItemDAO: Duplicate reference number detected");
            } else if (e.getErrorCode() == 1364) { // Field doesn't have default value
                System.err.println("ItemDAO: Missing required field value");
            } else if (e.getErrorCode() == 1452) { // Foreign key constraint
                System.err.println("ItemDAO: Invalid category_id - foreign key constraint failed");
            }
            
            return false;
        } catch (Exception e) {
            System.err.println("ItemDAO: Unexpected error creating item - " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            // Clean up resources
            try {
                if (generatedKeys != null) generatedKeys.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                System.err.println("ItemDAO: Error closing resources - " + e.getMessage());
            }
        }
    }
    
    /**
     * Get all items
     */
    public List<Item> getAllItems() {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_ITEMS)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting all items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Get items by category
     */
    public List<Item> getItemsByCategory(int categoryId) {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ITEMS_BY_CATEGORY)) {
            
            statement.setInt(1, categoryId);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting items by category - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Get items by status
     */
    public List<Item> getItemsByStatus(String status) {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ITEMS_BY_STATUS)) {
            
            statement.setString(1, status);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting items by status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Get item by ID
     */
    public Item getItemById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ITEM_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractItemFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting item by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get item by reference number
     */
    public Item getItemByReference(String referenceNo) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ITEM_BY_REFERENCE)) {
            
            statement.setString(1, referenceNo);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractItemFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting item by reference - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Update item
     */
    public boolean updateItem(Item item) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_ITEM)) {
            
            statement.setString(1, item.getTitle());
            statement.setString(2, item.getAuthor());
            statement.setInt(3, item.getCategoryId());
            statement.setBigDecimal(4, item.getPrice());
            statement.setBigDecimal(5, item.getOfferPrice());
            statement.setInt(6, item.getStock());
            statement.setString(7, item.getDescription());
            statement.setString(8, item.getImagePath());
            statement.setString(9, item.getStatus());
            statement.setInt(10, item.getId());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("ItemDAO: Item updated successfully - " + item.getTitle());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error updating item - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Delete item
     */
    public boolean deleteItem(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_ITEM)) {
            
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("ItemDAO: Item deleted successfully - ID: " + id);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error deleting item - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if reference number exists
     */
    public boolean referenceExists(String referenceNo) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_REFERENCE_EXISTS)) {
            
            statement.setString(1, referenceNo);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error checking reference existence - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if reference number exists excluding current ID
     */
    public boolean referenceExistsExcluding(String referenceNo, int excludeId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_REFERENCE_EXISTS_EXCLUDING_ID)) {
            
            statement.setString(1, referenceNo);
            statement.setInt(2, excludeId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error checking reference existence (excluding ID) - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Count items by status
     */
    public int countItemsByStatus(String status) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_ITEMS_BY_STATUS)) {
            
            statement.setString(1, status);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error counting items by status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    // ==================== CUSTOMER METHODS ====================
    
    /**
     * Get active items only (for customer view)
     */
    public List<Item> getActiveItems() {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_ITEMS)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting active items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Search items by title or author
     */
    public List<Item> searchItems(String searchQuery) {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SEARCH_ITEMS)) {
            
            String searchPattern = "%" + searchQuery + "%";
            statement.setString(1, searchPattern);
            statement.setString(2, searchPattern);
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error searching items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Get recent items (newest first)
     */
    public List<Item> getRecentItems(int limit) {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_RECENT_ITEMS)) {
            
            statement.setInt(1, limit);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting recent items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Get featured items (items with offers)
     */
    public List<Item> getFeaturedItems(int limit) {
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_FEATURED_ITEMS)) {
            
            statement.setInt(1, limit);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting featured items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    // ==================== STOCK MANAGEMENT METHODS ====================
    
    /**
     * Update item stock
     */
    public boolean updateStock(int itemId, int newStock) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_STOCK)) {
            
            statement.setInt(1, newStock);
            statement.setInt(2, itemId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("ItemDAO: Stock updated successfully for item ID: " + itemId + ", New stock: " + newStock);
                
                // Update status based on stock
                if (newStock == 0) {
                    updateItemStatus(itemId, "out_of_stock");
                } else {
                    updateItemStatus(itemId, "active");
                }
                
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error updating stock - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Decrease item stock
     */
    public boolean decreaseStock(int itemId, int quantity) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DECREASE_STOCK)) {
            
            statement.setInt(1, quantity);
            statement.setInt(2, itemId);
            statement.setInt(3, quantity);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("ItemDAO: Stock decreased successfully for item ID: " + itemId + ", Quantity: " + quantity);
                
                // Check if stock is now zero and update status
                int currentStock = getCurrentStock(itemId);
                if (currentStock == 0) {
                    updateItemStatus(itemId, "out_of_stock");
                }
                
                return true;
            } else {
                System.out.println("ItemDAO: Insufficient stock for item ID: " + itemId);
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error decreasing stock - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Increase item stock
     */
    public boolean increaseStock(int itemId, int quantity) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INCREASE_STOCK)) {
            
            statement.setInt(1, quantity);
            statement.setInt(2, itemId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("ItemDAO: Stock increased successfully for item ID: " + itemId + ", Quantity: " + quantity);
                
                // If item was out of stock, make it active
                Item item = getItemById(itemId);
                if (item != null && "out_of_stock".equals(item.getStatus())) {
                    updateItemStatus(itemId, "active");
                }
                
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error increasing stock - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get current stock for an item
     */
    public int getCurrentStock(int itemId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(GET_CURRENT_STOCK)) {
            
            statement.setInt(1, itemId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt("stock");
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting current stock - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Check if item has sufficient stock
     */
    public boolean hasSufficientStock(int itemId, int requiredQuantity) {
        int currentStock = getCurrentStock(itemId);
        return currentStock >= requiredQuantity;
    }
    
    /**
     * Update item status
     */
    public boolean updateItemStatus(int itemId, String status) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_ITEM_STATUS)) {
            
            statement.setString(1, status);
            statement.setInt(2, itemId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("ItemDAO: Status updated successfully for item ID: " + itemId + ", Status: " + status);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error updating status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Bulk update stock for multiple items
     */
    public boolean bulkUpdateStock(List<Integer> itemIds, List<Integer> quantities) {
        if (itemIds.size() != quantities.size()) {
            System.err.println("ItemDAO: Item IDs and quantities lists must have the same size");
            return false;
        }
        
        Connection connection = null;
        PreparedStatement statement = null;
        
        try {
            connection = DatabaseConnection.getConnection();
            connection.setAutoCommit(false); // Start transaction
            
            statement = connection.prepareStatement(DECREASE_STOCK);
            
            for (int i = 0; i < itemIds.size(); i++) {
                int itemId = itemIds.get(i);
                int quantity = quantities.get(i);
                
                statement.setInt(1, quantity);
                statement.setInt(2, itemId);
                statement.setInt(3, quantity);
                statement.addBatch();
            }
            
            int[] results = statement.executeBatch();
            
            // Check if all updates were successful
            boolean allSuccessful = true;
            for (int result : results) {
                if (result == 0) {
                    allSuccessful = false;
                    break;
                }
            }
            
            if (allSuccessful) {
                connection.commit();
                System.out.println("ItemDAO: Bulk stock update successful for " + itemIds.size() + " items");
                
                // Update status for items that are now out of stock
                for (int itemId : itemIds) {
                    int currentStock = getCurrentStock(itemId);
                    if (currentStock == 0) {
                        updateItemStatus(itemId, "out_of_stock");
                    }
                }
                
                return true;
            } else {
                connection.rollback();
                System.err.println("ItemDAO: Bulk stock update failed - insufficient stock for one or more items");
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error in bulk stock update - " + e.getMessage());
            e.printStackTrace();
            
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    System.err.println("ItemDAO: Error rolling back transaction - " + rollbackEx.getMessage());
                }
            }
        } finally {
            try {
                if (statement != null) statement.close();
                if (connection != null) {
                    connection.setAutoCommit(true);
                    connection.close();
                }
            } catch (SQLException e) {
                System.err.println("ItemDAO: Error closing resources - " + e.getMessage());
            }
        }
        
        return false;
    }
    
    /**
     * Get low stock items (stock <= threshold)
     */
    public List<Item> getLowStockItems(int threshold) {
        String sql = "SELECT i.*, c.name as category_name FROM items i " +
                    "LEFT JOIN categories c ON i.category_id = c.id " +
                    "WHERE i.stock <= ? AND i.status = 'active' " +
                    "ORDER BY i.stock ASC";
        
        List<Item> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            
            statement.setInt(1, threshold);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                items.add(extractItemFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error getting low stock items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Get out of stock items
     */
    public List<Item> getOutOfStockItems() {
        return getItemsByStatus("out_of_stock");
    }
    
    /**
     * Extract Item object from ResultSet
     */
    private Item extractItemFromResultSet(ResultSet resultSet) throws SQLException {
        Item item = new Item();
        item.setId(resultSet.getInt("id"));
        item.setTitle(resultSet.getString("title"));
        item.setAuthor(resultSet.getString("author"));
        item.setCategoryId(resultSet.getInt("category_id"));
        item.setCategoryName(resultSet.getString("category_name"));
        item.setPrice(resultSet.getBigDecimal("price"));
        item.setOfferPrice(resultSet.getBigDecimal("offer_price"));
        item.setStock(resultSet.getInt("stock"));
        item.setDescription(resultSet.getString("description"));
        item.setImagePath(resultSet.getString("image_path"));
        item.setReferenceNo(resultSet.getString("reference_no"));
        item.setStatus(resultSet.getString("status"));
        item.setCreatedAt(resultSet.getTimestamp("created_at"));
        item.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        return item;
    }
}
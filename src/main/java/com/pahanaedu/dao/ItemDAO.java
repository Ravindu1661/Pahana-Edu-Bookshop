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
    
    /**
     * Generate unique reference number
     */
    public String generateReferenceNumber() {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(GET_NEXT_REFERENCE_NUMBER)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                int nextNumber = resultSet.getInt(1);
                return String.format("REF-%03d", nextNumber);
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error generating reference number - " + e.getMessage());
            e.printStackTrace();
        }
        
        // Fallback to timestamp-based reference
        return "REF-" + System.currentTimeMillis();
    }
    
    /**
     * Create new item
     */
    public boolean createItem(Item item) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_ITEM, Statement.RETURN_GENERATED_KEYS)) {
            
            // Generate reference number if not provided
            if (item.getReferenceNo() == null || item.getReferenceNo().trim().isEmpty()) {
                item.setReferenceNo(generateReferenceNumber());
            }
            
            statement.setString(1, item.getTitle());
            statement.setString(2, item.getAuthor());
            statement.setInt(3, item.getCategoryId());
            statement.setBigDecimal(4, item.getPrice());
            statement.setBigDecimal(5, item.getOfferPrice());
            statement.setInt(6, item.getStock());
            statement.setString(7, item.getDescription());
            statement.setString(8, item.getImagePath());
            statement.setString(9, item.getReferenceNo());
            statement.setString(10, item.getStatus());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet generatedKeys = statement.getGeneratedKeys();
                if (generatedKeys.next()) {
                    item.setId(generatedKeys.getInt(1));
                }
                System.out.println("ItemDAO: Item created successfully - " + item.getTitle());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("ItemDAO: Error creating item - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
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
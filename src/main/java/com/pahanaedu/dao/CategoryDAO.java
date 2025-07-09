package com.pahanaedu.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Category;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for Category operations
 */
public class CategoryDAO {
    
    // SQL Queries
    private static final String INSERT_CATEGORY = 
        "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)";
    
    private static final String SELECT_ALL_CATEGORIES = 
        "SELECT * FROM categories ORDER BY name ASC";
    
    private static final String SELECT_ACTIVE_CATEGORIES = 
        "SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC";
    
    private static final String SELECT_CATEGORY_BY_ID = 
        "SELECT * FROM categories WHERE id = ?";
    
    private static final String UPDATE_CATEGORY = 
        "UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?";
    
    private static final String DELETE_CATEGORY = 
        "DELETE FROM categories WHERE id = ?";
    
    private static final String CHECK_CATEGORY_NAME_EXISTS = 
        "SELECT COUNT(*) FROM categories WHERE name = ?";
    
    private static final String CHECK_CATEGORY_NAME_EXISTS_EXCLUDING_ID = 
        "SELECT COUNT(*) FROM categories WHERE name = ? AND id != ?";
    
    private static final String COUNT_ITEMS_IN_CATEGORY = 
        "SELECT COUNT(*) FROM items WHERE category_id = ?";
    
    /**
     * Create new category
     */
    public boolean createCategory(Category category) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_CATEGORY)) {
            
            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setString(3, category.getStatus());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("CategoryDAO: Category created successfully - " + category.getName());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error creating category - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get all categories
     */
    public List<Category> getAllCategories() {
        List<Category> categories = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_CATEGORIES)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                categories.add(extractCategoryFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error getting all categories - " + e.getMessage());
            e.printStackTrace();
        }
        
        return categories;
    }
    
    /**
     * Get active categories only
     */
    public List<Category> getActiveCategories() {
        List<Category> categories = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_CATEGORIES)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                categories.add(extractCategoryFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error getting active categories - " + e.getMessage());
            e.printStackTrace();
        }
        
        return categories;
    }
    
    /**
     * Get category by ID
     */
    public Category getCategoryById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_CATEGORY_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractCategoryFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error getting category by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Update category
     */
    public boolean updateCategory(Category category) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_CATEGORY)) {
            
            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setString(3, category.getStatus());
            statement.setInt(4, category.getId());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("CategoryDAO: Category updated successfully - " + category.getName());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error updating category - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Delete category
     */
    public boolean deleteCategory(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_CATEGORY)) {
            
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("CategoryDAO: Category deleted successfully - ID: " + id);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error deleting category - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if category name exists
     */
    public boolean categoryNameExists(String name) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_CATEGORY_NAME_EXISTS)) {
            
            statement.setString(1, name);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error checking category name existence - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if category name exists excluding current ID
     */
    public boolean categoryNameExistsExcluding(String name, int excludeId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_CATEGORY_NAME_EXISTS_EXCLUDING_ID)) {
            
            statement.setString(1, name);
            statement.setInt(2, excludeId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error checking category name existence (excluding ID) - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Count items in category
     */
    public int countItemsInCategory(int categoryId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_ITEMS_IN_CATEGORY)) {
            
            statement.setInt(1, categoryId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("CategoryDAO: Error counting items in category - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Extract Category object from ResultSet
     */
    private Category extractCategoryFromResultSet(ResultSet resultSet) throws SQLException {
        Category category = new Category();
        category.setId(resultSet.getInt("id"));
        category.setName(resultSet.getString("name"));
        category.setDescription(resultSet.getString("description"));
        category.setStatus(resultSet.getString("status"));
        category.setCreatedAt(resultSet.getTimestamp("created_at"));
        category.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        return category;
    }
}
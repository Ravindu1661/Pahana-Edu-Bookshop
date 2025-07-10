package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Cart;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for Cart operations
 */
public class CartDAO {
    
    // SQL Queries
    private static final String INSERT_CART_ITEM = 
        "INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)";
    
    private static final String SELECT_CART_ITEMS = 
        "SELECT c.*, i.title, i.author, i.price, i.offer_price, i.image_path, i.stock " +
        "FROM cart c " +
        "JOIN items i ON c.item_id = i.id " +
        "WHERE c.user_id = ? AND i.status = 'active' " +
        "ORDER BY c.updated_at DESC";
    
    private static final String SELECT_CART_ITEM_BY_ID = 
        "SELECT c.*, i.title, i.author, i.price, i.offer_price, i.image_path, i.stock " +
        "FROM cart c " +
        "JOIN items i ON c.item_id = i.id " +
        "WHERE c.id = ?";
    
    private static final String UPDATE_CART_QUANTITY = 
        "UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String DELETE_CART_ITEM = 
        "DELETE FROM cart WHERE id = ?";
    
    private static final String DELETE_USER_CART = 
        "DELETE FROM cart WHERE user_id = ?";
    
    private static final String COUNT_CART_ITEMS = 
        "SELECT SUM(quantity) FROM cart c " +
        "JOIN items i ON c.item_id = i.id " +
        "WHERE c.user_id = ? AND i.status = 'active'";
    
    private static final String CHECK_EXISTING_CART_ITEM = 
        "SELECT id, quantity FROM cart WHERE user_id = ? AND item_id = ?";
    
    /**
     * Add item to cart or update quantity if exists
     */
    public boolean addToCart(int userId, int itemId, int quantity) {
        try (Connection connection = DatabaseConnection.getConnection()) {
            
            // Check if item already exists in cart
            try (PreparedStatement checkStmt = connection.prepareStatement(CHECK_EXISTING_CART_ITEM)) {
                checkStmt.setInt(1, userId);
                checkStmt.setInt(2, itemId);
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    // Item exists, update quantity
                    int cartId = rs.getInt("id");
                    int currentQuantity = rs.getInt("quantity");
                    return updateCartItemQuantity(cartId, currentQuantity + quantity);
                }
            }
            
            // Item doesn't exist, insert new
            try (PreparedStatement statement = connection.prepareStatement(INSERT_CART_ITEM)) {
                statement.setInt(1, userId);
                statement.setInt(2, itemId);
                statement.setInt(3, quantity);
                
                int rowsAffected = statement.executeUpdate();
                
                if (rowsAffected > 0) {
                    System.out.println("CartDAO: Item added to cart - User: " + userId + ", Item: " + itemId);
                    return true;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error adding to cart - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get all cart items for a user
     */
    public List<Cart> getCartItems(int userId) {
        List<Cart> cartItems = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_CART_ITEMS)) {
            
            statement.setInt(1, userId);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                cartItems.add(extractCartFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error getting cart items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return cartItems;
    }
    
    /**
     * Get cart item by ID
     */
    public Cart getCartItemById(int cartItemId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_CART_ITEM_BY_ID)) {
            
            statement.setInt(1, cartItemId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractCartFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error getting cart item by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Update cart item quantity
     */
    public boolean updateCartItemQuantity(int cartItemId, int newQuantity) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_CART_QUANTITY)) {
            
            statement.setInt(1, newQuantity);
            statement.setInt(2, cartItemId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("CartDAO: Cart item quantity updated - ID: " + cartItemId + ", Quantity: " + newQuantity);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error updating cart item quantity - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Remove item from cart
     */
    public boolean removeFromCart(int cartItemId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_CART_ITEM)) {
            
            statement.setInt(1, cartItemId);
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("CartDAO: Cart item removed - ID: " + cartItemId);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error removing from cart - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Clear entire cart for a user
     */
    public boolean clearCart(int userId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_USER_CART)) {
            
            statement.setInt(1, userId);
            int rowsAffected = statement.executeUpdate();
            
            System.out.println("CartDAO: Cart cleared for user - ID: " + userId + ", Items removed: " + rowsAffected);
            return true; // Return true even if no items were removed
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error clearing cart - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get total count of items in cart for a user
     */
    public int getCartItemCount(int userId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_CART_ITEMS)) {
            
            statement.setInt(1, userId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("CartDAO: Error getting cart item count - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Extract Cart object from ResultSet
     */
    private Cart extractCartFromResultSet(ResultSet resultSet) throws SQLException {
        Cart cart = new Cart();
        cart.setId(resultSet.getInt("id"));
        cart.setUserId(resultSet.getInt("user_id"));
        cart.setItemId(resultSet.getInt("item_id"));
        cart.setQuantity(resultSet.getInt("quantity"));
        cart.setAddedAt(resultSet.getTimestamp("added_at"));
        cart.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        
        // Item details
        cart.setItemTitle(resultSet.getString("title"));
        cart.setItemAuthor(resultSet.getString("author"));
        cart.setItemPrice(resultSet.getBigDecimal("price"));
        cart.setItemOfferPrice(resultSet.getBigDecimal("offer_price"));
        cart.setItemImagePath(resultSet.getString("image_path"));
        cart.setItemStock(resultSet.getInt("stock"));
        
        return cart;
    }
}
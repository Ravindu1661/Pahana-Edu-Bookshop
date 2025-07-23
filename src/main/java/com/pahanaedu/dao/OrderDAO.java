package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Order;
import com.pahanaedu.models.OrderItem;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for Order operations - Enhanced with promo code support
 */
public class OrderDAO {
    
    // SQL Queries - Updated with new fields
    private static final String INSERT_ORDER = 
        "INSERT INTO orders (user_id, total_amount, subtotal, shipping_amount, discount_amount, " +
        "promo_code, status, shipping_address, contact_number, payment_method, transaction_id, order_notes) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    private static final String INSERT_ORDER_ITEM = 
        "INSERT INTO order_items (order_id, item_id, quantity, price) " +
        "VALUES (?, ?, ?, ?)";
    
    private static final String SELECT_ORDER_BY_ID = 
        "SELECT o.*, " +
        "CONCAT(u.first_name, ' ', u.last_name) as customer_name, " +
        "u.email as customer_email " +
        "FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "WHERE o.id = ?";
    
    private static final String SELECT_ORDERS_BY_USER = 
        "SELECT o.*, " +
        "CONCAT(u.first_name, ' ', u.last_name) as customer_name, " +
        "u.email as customer_email " +
        "FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "WHERE o.user_id = ? " +
        "ORDER BY o.created_at DESC";
    
    private static final String SELECT_ALL_ORDERS = 
        "SELECT o.*, " +
        "CONCAT(u.first_name, ' ', u.last_name) as customer_name, " +
        "u.email as customer_email " +
        "FROM orders o " +
        "LEFT JOIN users u ON o.user_id = u.id " +
        "ORDER BY o.created_at DESC";
    
    private static final String SELECT_ORDER_ITEMS = 
        "SELECT oi.*, " +
        "i.title as item_title, " +
        "i.author as item_author, " +
        "i.image_path as item_image_path, " +
        "i.reference_no as item_reference_no " +
        "FROM order_items oi " +
        "LEFT JOIN items i ON oi.item_id = i.id " +
        "WHERE oi.order_id = ?";
    
    private static final String UPDATE_ORDER_STATUS = 
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String UPDATE_PAYMENT_STATUS = 
        "UPDATE orders SET payment_status = ?, transaction_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String COUNT_ORDERS_BY_STATUS = 
        "SELECT COUNT(*) FROM orders WHERE status = ?";
    
    private static final String COUNT_USER_ORDERS = 
        "SELECT COUNT(*) FROM orders WHERE user_id = ?";
    
    /**
     * Create new order with order items - Enhanced with promo support
     */
    public int createOrder(Order order) {
        Connection connection = null;
        PreparedStatement orderStatement = null;
        PreparedStatement itemStatement = null;
        
        try {
            connection = DatabaseConnection.getConnection();
            connection.setAutoCommit(false); // Start transaction
            
            // Insert order with all new fields
            orderStatement = connection.prepareStatement(INSERT_ORDER, Statement.RETURN_GENERATED_KEYS);
            orderStatement.setInt(1, order.getUserId());
            orderStatement.setBigDecimal(2, order.getTotalAmount());
            
            // New fields - handle null values properly
            orderStatement.setBigDecimal(3, order.getSubtotal() != null ? order.getSubtotal() : order.getTotalAmount());
            orderStatement.setBigDecimal(4, order.getShippingAmount() != null ? order.getShippingAmount() : BigDecimal.ZERO);
            orderStatement.setBigDecimal(5, order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);
            
            if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                orderStatement.setString(6, order.getPromoCode());
            } else {
                orderStatement.setNull(6, java.sql.Types.VARCHAR);
            }
            
            orderStatement.setString(7, order.getStatus());
            orderStatement.setString(8, order.getShippingAddress());
            orderStatement.setString(9, order.getContactNumber());
            orderStatement.setString(10, order.getPaymentMethod() != null ? order.getPaymentMethod() : "cod");
            
            if (order.getTransactionId() != null && !order.getTransactionId().trim().isEmpty()) {
                orderStatement.setString(11, order.getTransactionId());
            } else {
                orderStatement.setNull(11, java.sql.Types.VARCHAR);
            }
            
            if (order.getOrderNotes() != null && !order.getOrderNotes().trim().isEmpty()) {
                orderStatement.setString(12, order.getOrderNotes());
            } else {
                orderStatement.setNull(12, java.sql.Types.LONGVARCHAR);
            }
            
            int rowsAffected = orderStatement.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet generatedKeys = orderStatement.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int orderId = generatedKeys.getInt(1);
                    order.setId(orderId);
                    
                    // Insert order items
                    itemStatement = connection.prepareStatement(INSERT_ORDER_ITEM);
                    
                    for (OrderItem item : order.getOrderItems()) {
                        itemStatement.setInt(1, orderId);
                        itemStatement.setInt(2, item.getItemId());
                        itemStatement.setInt(3, item.getQuantity());
                        itemStatement.setBigDecimal(4, item.getPrice());
                        itemStatement.addBatch();
                    }
                    
                    itemStatement.executeBatch();
                    
                    connection.commit(); // Commit transaction
                    System.out.println("OrderDAO: Order created successfully - ID: " + orderId + 
                                     (order.getPromoCode() != null ? ", Promo: " + order.getPromoCode() : "") +
                                     (order.getDiscountAmount() != null ? ", Discount: " + order.getDiscountAmount() : ""));
                    return orderId;
                }
            }
            
            connection.rollback(); // Rollback on failure
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error creating order - " + e.getMessage());
            e.printStackTrace();
            
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    System.err.println("OrderDAO: Error rolling back transaction - " + rollbackEx.getMessage());
                }
            }
        } finally {
            try {
                if (itemStatement != null) itemStatement.close();
                if (orderStatement != null) orderStatement.close();
                if (connection != null) {
                    connection.setAutoCommit(true);
                    connection.close();
                }
            } catch (SQLException e) {
                System.err.println("OrderDAO: Error closing resources - " + e.getMessage());
            }
        }
        
        return 0;
    }
    
    /**
     * Get order by ID
     */
    public Order getOrderById(int orderId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_BY_ID)) {
            
            statement.setInt(1, orderId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                Order order = extractOrderFromResultSet(resultSet);
                order.setOrderItems(getOrderItems(orderId));
                return order;
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error getting order by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get orders by user ID
     */
    public List<Order> getOrdersByUser(int userId) {
        List<Order> orders = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDERS_BY_USER)) {
            
            statement.setInt(1, userId);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                Order order = extractOrderFromResultSet(resultSet);
                order.setOrderItems(getOrderItems(order.getId()));
                orders.add(order);
            }
            
            System.out.println("OrderDAO: Retrieved " + orders.size() + " orders for user " + userId);
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error getting orders by user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return orders;
    }
    
    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        List<Order> orders = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_ORDERS)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                Order order = extractOrderFromResultSet(resultSet);
                order.setOrderItems(getOrderItems(order.getId()));
                orders.add(order);
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error getting all orders - " + e.getMessage());
            e.printStackTrace();
        }
        
        return orders;
    }
    
    /**
     * Get order items by order ID
     */
    private List<OrderItem> getOrderItems(int orderId) {
        List<OrderItem> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_ITEMS)) {
            
            statement.setInt(1, orderId);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                OrderItem item = new OrderItem();
                item.setId(resultSet.getInt("id"));
                item.setOrderId(resultSet.getInt("order_id"));
                item.setItemId(resultSet.getInt("item_id"));
                item.setQuantity(resultSet.getInt("quantity"));
                item.setPrice(resultSet.getBigDecimal("price"));
                item.setItemTitle(resultSet.getString("item_title"));
                item.setItemAuthor(resultSet.getString("item_author"));
                item.setItemImagePath(resultSet.getString("item_image_path"));
                
                items.add(item);
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error getting order items - " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    /**
     * Update order status
     */
    public boolean updateOrderStatus(int orderId, String status) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_ORDER_STATUS)) {
            
            statement.setString(1, status);
            statement.setInt(2, orderId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("OrderDAO: Order status updated - ID: " + orderId + ", Status: " + status);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error updating order status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Update payment status with transaction ID
     */
    public boolean updatePaymentStatus(int orderId, String paymentStatus, String transactionId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_PAYMENT_STATUS)) {
            
            statement.setString(1, paymentStatus);
            
            if (transactionId != null && !transactionId.trim().isEmpty()) {
                statement.setString(2, transactionId);
            } else {
                statement.setNull(2, java.sql.Types.VARCHAR);
            }
            
            statement.setInt(3, orderId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("OrderDAO: Payment status updated - ID: " + orderId + 
                                 ", Status: " + paymentStatus + 
                                 (transactionId != null ? ", Transaction: " + transactionId : ""));
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error updating payment status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if order belongs to user
     */
    public boolean isOrderOwnedByUser(int orderId, int userId) {
        String query = "SELECT COUNT(*) FROM orders WHERE id = ? AND user_id = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setInt(1, orderId);
            statement.setInt(2, userId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error checking order ownership - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Count orders by status
     */
    public int countOrdersByStatus(String status) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_ORDERS_BY_STATUS)) {
            
            statement.setString(1, status);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error counting orders by status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Count user orders
     */
    public int countUserOrders(int userId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_USER_ORDERS)) {
            
            statement.setInt(1, userId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("OrderDAO: Error counting user orders - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Extract Order object from ResultSet - Enhanced with new fields
     */
    private Order extractOrderFromResultSet(ResultSet resultSet) throws SQLException {
        Order order = new Order();
        order.setId(resultSet.getInt("id"));
        order.setUserId(resultSet.getInt("user_id"));
        order.setTotalAmount(resultSet.getBigDecimal("total_amount"));
        
        // Extract new fields safely
        try {
            order.setSubtotal(resultSet.getBigDecimal("subtotal"));
            order.setShippingAmount(resultSet.getBigDecimal("shipping_amount"));
            order.setDiscountAmount(resultSet.getBigDecimal("discount_amount"));
            order.setPromoCode(resultSet.getString("promo_code"));
            order.setTransactionId(resultSet.getString("transaction_id"));
            order.setOrderNotes(resultSet.getString("order_notes"));
        } catch (SQLException e) {
            // If columns don't exist (older orders), continue without them
            System.out.println("OrderDAO: Some new columns not found, using defaults");
        }
        
        order.setStatus(resultSet.getString("status"));
        order.setShippingAddress(resultSet.getString("shipping_address"));
        order.setContactNumber(resultSet.getString("contact_number"));
        order.setPaymentMethod(resultSet.getString("payment_method"));
        order.setCreatedAt(resultSet.getTimestamp("created_at"));
        order.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        order.setCustomerName(resultSet.getString("customer_name"));
        order.setCustomerEmail(resultSet.getString("customer_email"));
        
        return order;
    }
}
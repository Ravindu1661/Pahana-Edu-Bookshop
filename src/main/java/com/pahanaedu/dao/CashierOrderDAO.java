package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.CashierOrder;
import com.pahanaedu.models.CashierOrderItem;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for Cashier Order operations
 */
public class CashierOrderDAO {
    
    // SQL Queries
    private static final String INSERT_ORDER = 
        "INSERT INTO cashier_orders (cashier_id, customer_name, customer_phone, customer_email, " +
        "total_amount, subtotal, discount_amount, promo_code, payment_method, order_type, notes) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    private static final String INSERT_ORDER_ITEM = 
        "INSERT INTO cashier_order_items (cashier_order_id, item_id, quantity, unit_price, total_price) " +
        "VALUES (?, ?, ?, ?, ?)";
    
    private static final String SELECT_ORDERS_BY_CASHIER = 
        "SELECT * FROM cashier_orders WHERE cashier_id = ? ORDER BY created_at DESC";
    
    private static final String SELECT_ORDER_BY_ID = 
        "SELECT * FROM cashier_orders WHERE id = ?";
    
    private static final String SELECT_ORDER_ITEMS = 
        "SELECT oi.*, i.title as item_title, i.author as item_author, i.image_path as item_image_path " +
        "FROM cashier_order_items oi " +
        "LEFT JOIN items i ON oi.item_id = i.id " +
        "WHERE oi.cashier_order_id = ?";
    
    private static final String UPDATE_ORDER_STATUS = 
        "UPDATE cashier_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String MARK_AS_PRINTED = 
        "UPDATE cashier_orders SET printed_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    private static final String COUNT_TODAY_ORDERS = 
        "SELECT COUNT(*) FROM cashier_orders WHERE cashier_id = ? AND DATE(created_at) = CURDATE()";
    
    private static final String GET_TODAY_REVENUE = 
        "SELECT SUM(total_amount) FROM cashier_orders WHERE cashier_id = ? AND DATE(created_at) = CURDATE() AND status != 'cancelled'";
    
    private static final String COUNT_TOTAL_ORDERS = 
        "SELECT COUNT(*) FROM cashier_orders WHERE cashier_id = ?";
    
    /**
     * Create new cashier order with items
     */
    public boolean createOrder(CashierOrder order) {
        Connection connection = null;
        PreparedStatement orderStatement = null;
        PreparedStatement itemStatement = null;
        
        try {
            connection = DatabaseConnection.getConnection();
            connection.setAutoCommit(false); // Start transaction
            
            // Insert order
            orderStatement = connection.prepareStatement(INSERT_ORDER, Statement.RETURN_GENERATED_KEYS);
            orderStatement.setInt(1, order.getCashierId());
            orderStatement.setString(2, order.getCustomerName());
            orderStatement.setString(3, order.getCustomerPhone());
            orderStatement.setString(4, order.getCustomerEmail());
            orderStatement.setBigDecimal(5, order.getTotalAmount());
            orderStatement.setBigDecimal(6, order.getSubtotal());
            orderStatement.setBigDecimal(7, order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);
            orderStatement.setString(8, order.getPromoCode());
            orderStatement.setString(9, order.getPaymentMethod() != null ? order.getPaymentMethod() : "cash");
            orderStatement.setString(10, order.getOrderType() != null ? order.getOrderType() : "walk_in");
            orderStatement.setString(11, order.getNotes());
            
            int rowsAffected = orderStatement.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet generatedKeys = orderStatement.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int orderId = generatedKeys.getInt(1);
                    order.setId(orderId);
                    
                    // Insert order items
                    if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                        itemStatement = connection.prepareStatement(INSERT_ORDER_ITEM);
                        
                        for (CashierOrderItem item : order.getOrderItems()) {
                            itemStatement.setInt(1, orderId);
                            itemStatement.setInt(2, item.getItemId());
                            itemStatement.setInt(3, item.getQuantity());
                            itemStatement.setBigDecimal(4, item.getUnitPrice());
                            itemStatement.setBigDecimal(5, item.getTotalPrice());
                            itemStatement.addBatch();
                        }
                        
                        itemStatement.executeBatch();
                    }
                    
                    connection.commit(); // Commit transaction
                    System.out.println("CashierOrderDAO: Order created successfully - ID: " + orderId);
                    return true;
                }
            }
            
            connection.rollback(); // Rollback on failure
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error creating order - " + e.getMessage());
            e.printStackTrace();
            
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    System.err.println("CashierOrderDAO: Error rolling back transaction - " + rollbackEx.getMessage());
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
                System.err.println("CashierOrderDAO: Error closing resources - " + e.getMessage());
            }
        }
        
        return false;
    }
    
    /**
     * Get orders by cashier ID
     */
    public List<CashierOrder> getOrdersByCashier(int cashierId) {
        List<CashierOrder> orders = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDERS_BY_CASHIER)) {
            
            statement.setInt(1, cashierId);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                CashierOrder order = extractOrderFromResultSet(resultSet);
                order.setOrderItems(getOrderItems(order.getId()));
                orders.add(order);
            }
            
            System.out.println("CashierOrderDAO: Retrieved " + orders.size() + " orders for cashier " + cashierId);
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error getting orders by cashier - " + e.getMessage());
            e.printStackTrace();
        }
        
        return orders;
    }
    
    /**
     * Get order by ID
     */
    public CashierOrder getOrderById(int orderId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_BY_ID)) {
            
            statement.setInt(1, orderId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                CashierOrder order = extractOrderFromResultSet(resultSet);
                order.setOrderItems(getOrderItems(orderId));
                return order;
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error getting order by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get order items by order ID
     */
    private List<CashierOrderItem> getOrderItems(int orderId) {
        List<CashierOrderItem> items = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ORDER_ITEMS)) {
            
            statement.setInt(1, orderId);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                CashierOrderItem item = new CashierOrderItem();
                item.setId(resultSet.getInt("id"));
                item.setCashierOrderId(resultSet.getInt("cashier_order_id"));
                item.setItemId(resultSet.getInt("item_id"));
                item.setQuantity(resultSet.getInt("quantity"));
                item.setUnitPrice(resultSet.getBigDecimal("unit_price"));
                item.setTotalPrice(resultSet.getBigDecimal("total_price"));
                item.setItemTitle(resultSet.getString("item_title"));
                item.setItemAuthor(resultSet.getString("item_author"));
                item.setItemImagePath(resultSet.getString("item_image_path"));
                
                items.add(item);
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error getting order items - " + e.getMessage());
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
                System.out.println("CashierOrderDAO: Order status updated - ID: " + orderId + ", Status: " + status);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error updating order status - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Mark order as printed
     */
    public boolean markAsPrinted(int orderId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(MARK_AS_PRINTED)) {
            
            statement.setInt(1, orderId);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("CashierOrderDAO: Order marked as printed - ID: " + orderId);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error marking order as printed - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get today's orders count for cashier
     */
    public int getTodayOrdersCount(int cashierId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_TODAY_ORDERS)) {
            
            statement.setInt(1, cashierId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error getting today's orders count - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Get today's revenue for cashier
     */
    public BigDecimal getTodayRevenue(int cashierId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(GET_TODAY_REVENUE)) {
            
            statement.setInt(1, cashierId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getBigDecimal(1);
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error getting today's revenue - " + e.getMessage());
            e.printStackTrace();
        }
        
        return BigDecimal.ZERO;
    }
    
    /**
     * Get total orders count for cashier
     */
    public int getTotalOrdersCount(int cashierId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_TOTAL_ORDERS)) {
            
            statement.setInt(1, cashierId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("CashierOrderDAO: Error getting total orders count - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Extract CashierOrder object from ResultSet
     */
    private CashierOrder extractOrderFromResultSet(ResultSet resultSet) throws SQLException {
        CashierOrder order = new CashierOrder();
        order.setId(resultSet.getInt("id"));
        order.setCashierId(resultSet.getInt("cashier_id"));
        order.setCustomerName(resultSet.getString("customer_name"));
        order.setCustomerPhone(resultSet.getString("customer_phone"));
        order.setCustomerEmail(resultSet.getString("customer_email"));
        order.setTotalAmount(resultSet.getBigDecimal("total_amount"));
        order.setSubtotal(resultSet.getBigDecimal("subtotal"));
        order.setDiscountAmount(resultSet.getBigDecimal("discount_amount"));
        order.setPromoCode(resultSet.getString("promo_code"));
        order.setStatus(resultSet.getString("status"));
        order.setPaymentMethod(resultSet.getString("payment_method"));
        order.setPaymentStatus(resultSet.getString("payment_status"));
        order.setOrderType(resultSet.getString("order_type"));
        order.setNotes(resultSet.getString("notes"));
        order.setPrintedAt(resultSet.getTimestamp("printed_at"));
        order.setCreatedAt(resultSet.getTimestamp("created_at"));
        order.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        
        return order;
    }
}
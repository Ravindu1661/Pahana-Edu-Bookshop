package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.PromoCode;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * PromoCode Data Access Object
 * Handles all database operations for promotional codes
 */
public class PromoCodeDAO {
    
    /**
     * Create a new promo code
     */
    public boolean createPromoCode(PromoCode promoCode) {
        String sql = "INSERT INTO promo_codes (code, description, discount_type, discount_value, " +
                    "minimum_order_amount, usage_limit, start_date, end_date, status, created_by) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, promoCode.getCode());
            stmt.setString(2, promoCode.getDescription());
            stmt.setString(3, promoCode.getDiscountType());
            stmt.setBigDecimal(4, promoCode.getDiscountValue());
            
            if (promoCode.getMinimumOrderAmount() != null) {
                stmt.setBigDecimal(5, promoCode.getMinimumOrderAmount());
            } else {
                stmt.setNull(5, java.sql.Types.DECIMAL);
            }
            
            if (promoCode.getUsageLimit() != null) {
                stmt.setInt(6, promoCode.getUsageLimit());
            } else {
                stmt.setNull(6, java.sql.Types.INTEGER);
            }
            
            stmt.setDate(7, promoCode.getStartDate());
            stmt.setDate(8, promoCode.getEndDate());
            stmt.setString(9, promoCode.getStatus());
            stmt.setInt(10, promoCode.getCreatedBy());
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                ResultSet keys = stmt.getGeneratedKeys();
                if (keys.next()) {
                    promoCode.setId(keys.getInt(1));
                }
                System.out.println("PromoCodeDAO: Created promo code - " + promoCode.getCode());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error creating promo code - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get all promo codes with creator names
     */
    public List<PromoCode> getAllPromoCodes() {
        List<PromoCode> promoCodes = new ArrayList<>();
        String sql = "SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name " +
                    "FROM promo_codes p " +
                    "LEFT JOIN users u ON p.created_by = u.id " +
                    "ORDER BY p.created_at DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                PromoCode promoCode = mapResultSetToPromoCode(rs);
                promoCode.setCreatedByName(rs.getString("created_by_name"));
                promoCodes.add(promoCode);
            }
            
            System.out.println("PromoCodeDAO: Retrieved " + promoCodes.size() + " promo codes");
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error retrieving promo codes - " + e.getMessage());
            e.printStackTrace();
        }
        
        return promoCodes;
    }
    
    /**
     * Get promo code by ID
     */
    public PromoCode getPromoCodeById(int id) {
        String sql = "SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name " +
                    "FROM promo_codes p " +
                    "LEFT JOIN users u ON p.created_by = u.id " +
                    "WHERE p.id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                PromoCode promoCode = mapResultSetToPromoCode(rs);
                promoCode.setCreatedByName(rs.getString("created_by_name"));
                return promoCode;
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error retrieving promo code by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get promo code by code string
     */
    public PromoCode getPromoCodeByCode(String code) {
        String sql = "SELECT * FROM promo_codes WHERE code = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, code.toUpperCase().trim());
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToPromoCode(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error retrieving promo code by code - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Update promo code
     */
    public boolean updatePromoCode(PromoCode promoCode) {
        String sql = "UPDATE promo_codes SET code = ?, description = ?, discount_type = ?, " +
                    "discount_value = ?, minimum_order_amount = ?, usage_limit = ?, " +
                    "start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP " +
                    "WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, promoCode.getCode());
            stmt.setString(2, promoCode.getDescription());
            stmt.setString(3, promoCode.getDiscountType());
            stmt.setBigDecimal(4, promoCode.getDiscountValue());
            
            if (promoCode.getMinimumOrderAmount() != null) {
                stmt.setBigDecimal(5, promoCode.getMinimumOrderAmount());
            } else {
                stmt.setNull(5, java.sql.Types.DECIMAL);
            }
            
            if (promoCode.getUsageLimit() != null) {
                stmt.setInt(6, promoCode.getUsageLimit());
            } else {
                stmt.setNull(6, java.sql.Types.INTEGER);
            }
            
            stmt.setDate(7, promoCode.getStartDate());
            stmt.setDate(8, promoCode.getEndDate());
            stmt.setString(9, promoCode.getStatus());
            stmt.setInt(10, promoCode.getId());
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("PromoCodeDAO: Updated promo code - " + promoCode.getCode());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error updating promo code - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Delete promo code
     */
    public boolean deletePromoCode(int id) {
        String sql = "DELETE FROM promo_codes WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("PromoCodeDAO: Deleted promo code with ID - " + id);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error deleting promo code - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if promo code exists (excluding specific ID for updates)
     */
    public boolean promoCodeExists(String code, int excludeId) {
        String sql = "SELECT COUNT(*) FROM promo_codes WHERE code = ? AND id != ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, code.toUpperCase().trim());
            stmt.setInt(2, excludeId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error checking promo code existence - " + e.getMessage());
        }
        
        return false;
    }
    
    /**
     * Check if promo code exists
     */
    public boolean promoCodeExists(String code) {
        return promoCodeExists(code, -1);
    }
    
    /**
     * Increment usage count
     */
    public boolean incrementUsageCount(int promoCodeId) {
        String sql = "UPDATE promo_codes SET usage_count = usage_count + 1, " +
                    "updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, promoCodeId);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("PromoCodeDAO: Incremented usage count for promo code ID - " + promoCodeId);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error incrementing usage count - " + e.getMessage());
        }
        
        return false;
    }
    
    /**
     * Get active promo codes
     */
    public List<PromoCode> getActivePromoCodes() {
        List<PromoCode> promoCodes = new ArrayList<>();
        String sql = "SELECT * FROM promo_codes WHERE status = ? AND start_date <= CURDATE() " +
                    "AND end_date >= CURDATE() ORDER BY created_at DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, PromoCode.STATUS_ACTIVE);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                promoCodes.add(mapResultSetToPromoCode(rs));
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error retrieving active promo codes - " + e.getMessage());
        }
        
        return promoCodes;
    }
    
    /**
     * Get promo code statistics
     */
    public PromoCodeStats getPromoCodeStats() {
        PromoCodeStats stats = new PromoCodeStats();
        
        String sql = "SELECT " +
                    "COUNT(*) as total_codes, " +
                    "SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_codes, " +
                    "SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_codes, " +
                    "SUM(CASE WHEN end_date < CURDATE() OR status = 'expired' THEN 1 ELSE 0 END) as expired_codes, " +
                    "SUM(usage_count) as total_usage " +
                    "FROM promo_codes";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                stats.totalCodes = rs.getInt("total_codes");
                stats.activeCodes = rs.getInt("active_codes");
                stats.inactiveCodes = rs.getInt("inactive_codes");
                stats.expiredCodes = rs.getInt("expired_codes");
                stats.totalUsage = rs.getInt("total_usage");
            }
            
        } catch (SQLException e) {
            System.err.println("PromoCodeDAO: Error retrieving promo code stats - " + e.getMessage());
        }
        
        return stats;
    }
    
    /**
     * Map ResultSet to PromoCode object
     */
    private PromoCode mapResultSetToPromoCode(ResultSet rs) throws SQLException {
        PromoCode promoCode = new PromoCode();
        
        promoCode.setId(rs.getInt("id"));
        promoCode.setCode(rs.getString("code"));
        promoCode.setDescription(rs.getString("description"));
        promoCode.setDiscountType(rs.getString("discount_type"));
        promoCode.setDiscountValue(rs.getBigDecimal("discount_value"));
        promoCode.setMinimumOrderAmount(rs.getBigDecimal("minimum_order_amount"));
        
        Integer usageLimit = rs.getObject("usage_limit", Integer.class);
        promoCode.setUsageLimit(usageLimit);
        
        promoCode.setUsageCount(rs.getInt("usage_count"));
        promoCode.setStartDate(rs.getDate("start_date"));
        promoCode.setEndDate(rs.getDate("end_date"));
        promoCode.setStatus(rs.getString("status"));
        promoCode.setCreatedBy(rs.getInt("created_by"));
        promoCode.setCreatedAt(rs.getTimestamp("created_at"));
        promoCode.setUpdatedAt(rs.getTimestamp("updated_at"));
        
        return promoCode;
    }
    
    /**
     * Inner class for statistics
     */
    public static class PromoCodeStats {
        public int totalCodes;
        public int activeCodes;
        public int inactiveCodes;
        public int expiredCodes;
        public int totalUsage;
    }
}
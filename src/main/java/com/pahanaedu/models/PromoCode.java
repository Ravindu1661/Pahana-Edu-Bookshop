package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

/**
 * PromoCode Model Class
 * Represents promotional codes in the system
 */
public class PromoCode {
    
    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_EXPIRED = "expired";
    
    // Discount type constants
    public static final String TYPE_PERCENTAGE = "percentage";
    public static final String TYPE_FIXED = "fixed";
    
    private int id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumOrderAmount;
    private Integer usageLimit;
    private int usageCount;
    private Date startDate;
    private Date endDate;
    private String status;
    private int createdBy;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // For display purposes
    private String createdByName;
    
    // Constructors
    public PromoCode() {}
    
    public PromoCode(String code, String description, String discountType, 
                    BigDecimal discountValue, Date startDate, Date endDate) {
        this.code = code;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = STATUS_ACTIVE;
        this.usageCount = 0;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase().trim() : null;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDiscountType() {
        return discountType;
    }
    
    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }
    
    public BigDecimal getDiscountValue() {
        return discountValue;
    }
    
    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }
    
    public BigDecimal getMinimumOrderAmount() {
        return minimumOrderAmount;
    }
    
    public void setMinimumOrderAmount(BigDecimal minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }
    
    public Integer getUsageLimit() {
        return usageLimit;
    }
    
    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }
    
    public int getUsageCount() {
        return usageCount;
    }
    
    public void setUsageCount(int usageCount) {
        this.usageCount = usageCount;
    }
    
    public Date getStartDate() {
        return startDate;
    }
    
    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }
    
    public Date getEndDate() {
        return endDate;
    }
    
    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public int getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(int createdBy) {
        this.createdBy = createdBy;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getCreatedByName() {
        return createdByName;
    }
    
    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
    
    // Utility methods
    public boolean isActive() {
        return STATUS_ACTIVE.equals(this.status);
    }
    
    public boolean isExpired() {
        Date today = new Date(System.currentTimeMillis());
        return endDate.before(today) || STATUS_EXPIRED.equals(this.status);
    }
    
    public boolean isValidForUse() {
        if (!isActive() || isExpired()) {
            return false;
        }
        
        Date today = new Date(System.currentTimeMillis());
        if (startDate.after(today)) {
            return false;
        }
        
        if (usageLimit != null && usageCount >= usageLimit) {
            return false;
        }
        
        return true;
    }
    
    public boolean isValidForOrder(BigDecimal orderAmount) {
        if (!isValidForUse()) {
            return false;
        }
        
        if (minimumOrderAmount != null && orderAmount.compareTo(minimumOrderAmount) < 0) {
            return false;
        }
        
        return true;
    }
    
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValidForOrder(orderAmount)) {
            return BigDecimal.ZERO;
        }
        
        if (TYPE_PERCENTAGE.equals(discountType)) {
            return orderAmount.multiply(discountValue).divide(new BigDecimal(100));
        } else if (TYPE_FIXED.equals(discountType)) {
            return discountValue.min(orderAmount); // Don't discount more than order amount
        }
        
        return BigDecimal.ZERO;
    }
    
    public int getRemainingUsage() {
        if (usageLimit == null) {
            return -1; // Unlimited
        }
        return Math.max(0, usageLimit - usageCount);
    }
    
    @Override
    public String toString() {
        return "PromoCode{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", discountType='" + discountType + '\'' +
                ", discountValue=" + discountValue +
                ", status='" + status + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                '}';
    }
}
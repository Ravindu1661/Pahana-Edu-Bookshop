package com.pahanaedu.models;

import java.math.BigDecimal;

/**
 * CashierOrderItem Model - Represents items in cashier orders
 * This class represents individual items within cashier orders
 */
public class CashierOrderItem {
    private int id;
    private int cashierOrderId;
    private int itemId;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    
    // Item details (joined from items table for display purposes)
    private String itemTitle;
    private String itemAuthor;
    private String itemImagePath;
    private String itemReferenceNo;
    private String itemCategoryName;
    
    // Constructors
    public CashierOrderItem() {
        this.quantity = 1;
        this.unitPrice = BigDecimal.ZERO;
        this.totalPrice = BigDecimal.ZERO;
    }
    
    public CashierOrderItem(int itemId, int quantity, BigDecimal unitPrice) {
        this.itemId = itemId;
        this.quantity = Math.max(1, quantity); // Ensure quantity is at least 1
        this.unitPrice = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));
    }
    
    public CashierOrderItem(int cashierOrderId, int itemId, int quantity, BigDecimal unitPrice) {
        this(itemId, quantity, unitPrice);
        this.cashierOrderId = cashierOrderId;
    }
    
    // Getters and Setters
    public int getId() { 
        return id; 
    }
    
    public void setId(int id) { 
        this.id = id; 
    }
    
    public int getCashierOrderId() { 
        return cashierOrderId; 
    }
    
    public void setCashierOrderId(int cashierOrderId) { 
        this.cashierOrderId = cashierOrderId; 
    }
    
    public int getItemId() { 
        return itemId; 
    }
    
    public void setItemId(int itemId) { 
        this.itemId = itemId; 
    }
    
    public int getQuantity() { 
        return quantity; 
    }
    
    public void setQuantity(int quantity) { 
        this.quantity = Math.max(1, quantity); // Ensure quantity is at least 1
        // Recalculate total price if unit price is set
        if (this.unitPrice != null) {
            this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));
        }
    }
    
    public BigDecimal getUnitPrice() { 
        return unitPrice; 
    }
    
    public void setUnitPrice(BigDecimal unitPrice) { 
        this.unitPrice = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        // Recalculate total price if quantity is set
        if (this.quantity > 0) {
            this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));
        }
    }
    
    public BigDecimal getTotalPrice() { 
        return totalPrice; 
    }
    
    public void setTotalPrice(BigDecimal totalPrice) { 
        this.totalPrice = totalPrice != null ? totalPrice : BigDecimal.ZERO;
    }
    
    // Item details getters and setters
    public String getItemTitle() { 
        return itemTitle; 
    }
    
    public void setItemTitle(String itemTitle) { 
        this.itemTitle = itemTitle; 
    }
    
    public String getItemAuthor() { 
        return itemAuthor; 
    }
    
    public void setItemAuthor(String itemAuthor) { 
        this.itemAuthor = itemAuthor; 
    }
    
    public String getItemImagePath() { 
        return itemImagePath; 
    }
    
    public void setItemImagePath(String itemImagePath) { 
        this.itemImagePath = itemImagePath; 
    }
    
    public String getItemReferenceNo() { 
        return itemReferenceNo; 
    }
    
    public void setItemReferenceNo(String itemReferenceNo) { 
        this.itemReferenceNo = itemReferenceNo; 
    }
    
    public String getItemCategoryName() { 
        return itemCategoryName; 
    }
    
    public void setItemCategoryName(String itemCategoryName) { 
        this.itemCategoryName = itemCategoryName; 
    }
    
    // Utility methods
    
    /**
     * Calculate and update total price based on current quantity and unit price
     */
    public void calculateTotalPrice() {
        if (this.unitPrice != null && this.quantity > 0) {
            this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));
        } else {
            this.totalPrice = BigDecimal.ZERO;
        }
    }
    
    /**
     * Get formatted unit price as string
     */
    public String getFormattedUnitPrice() {
        return unitPrice != null ? 
            String.format("Rs. %.2f", unitPrice.doubleValue()) : 
            "Rs. 0.00";
    }
    
    /**
     * Get formatted total price as string
     */
    public String getFormattedTotalPrice() {
        return totalPrice != null ? 
            String.format("Rs. %.2f", totalPrice.doubleValue()) : 
            "Rs. 0.00";
    }
    
    /**
     * Get item display name (title by author)
     */
    public String getItemDisplayName() {
        if (itemTitle != null && itemAuthor != null) {
            return itemTitle + " by " + itemAuthor;
        } else if (itemTitle != null) {
            return itemTitle;
        } else {
            return "Unknown Item";
        }
    }
    
    /**
     * Check if this order item is valid
     */
    public boolean isValid() {
        return itemId > 0 && 
               quantity > 0 && 
               unitPrice != null && 
               unitPrice.compareTo(BigDecimal.ZERO) >= 0;
    }
    
    /**
     * Create a copy of this order item
     */
    public CashierOrderItem copy() {
        CashierOrderItem copy = new CashierOrderItem();
        copy.setId(this.id);
        copy.setCashierOrderId(this.cashierOrderId);
        copy.setItemId(this.itemId);
        copy.setQuantity(this.quantity);
        copy.setUnitPrice(this.unitPrice);
        copy.setTotalPrice(this.totalPrice);
        copy.setItemTitle(this.itemTitle);
        copy.setItemAuthor(this.itemAuthor);
        copy.setItemImagePath(this.itemImagePath);
        copy.setItemReferenceNo(this.itemReferenceNo);
        copy.setItemCategoryName(this.itemCategoryName);
        return copy;
    }
    
    /**
     * Compare with another CashierOrderItem for equality based on itemId
     */
    public boolean isSameItem(CashierOrderItem other) {
        return other != null && this.itemId == other.itemId;
    }
    
    // Override equals and hashCode for proper comparison
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        CashierOrderItem that = (CashierOrderItem) obj;
        return id == that.id && 
               cashierOrderId == that.cashierOrderId && 
               itemId == that.itemId;
    }
    
    @Override
    public int hashCode() {
        int result = id;
        result = 31 * result + cashierOrderId;
        result = 31 * result + itemId;
        return result;
    }
    
    @Override
    public String toString() {
        return "CashierOrderItem{" +
                "id=" + id +
                ", cashierOrderId=" + cashierOrderId +
                ", itemId=" + itemId +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + totalPrice +
                ", itemTitle='" + itemTitle + '\'' +
                ", itemAuthor='" + itemAuthor + '\'' +
                '}';
    }
    
    /**
     * Get detailed string representation for logging
     */
    public String toDetailedString() {
        return "CashierOrderItem{" +
                "id=" + id +
                ", cashierOrderId=" + cashierOrderId +
                ", itemId=" + itemId +
                ", itemTitle='" + itemTitle + '\'' +
                ", itemAuthor='" + itemAuthor + '\'' +
                ", itemReferenceNo='" + itemReferenceNo + '\'' +
                ", itemCategoryName='" + itemCategoryName + '\'' +
                ", quantity=" + quantity +
                ", unitPrice=" + unitPrice +
                ", totalPrice=" + totalPrice +
                ", itemImagePath='" + itemImagePath + '\'' +
                '}';
    }
}
package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Cart model class representing a shopping cart item
 */
public class Cart {
    private int id;
    private Integer userId;
    private int itemId;
    private int quantity;
    private Timestamp addedAt;
    private Timestamp updatedAt;
    
    // Item details (joined from items table)
    private String itemTitle;
    private String itemAuthor;
    private BigDecimal itemPrice;
    private BigDecimal itemOfferPrice;
    private String itemImagePath;
    private int itemStock;
    
    // Default constructor
    public Cart() {}
    
    // Constructor for new cart item
    public Cart(Integer userId, int itemId, int quantity) {
        this.userId = userId;
        this.itemId = itemId;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
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
        this.quantity = quantity;
    }
    
    public Timestamp getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(Timestamp addedAt) {
        this.addedAt = addedAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
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
    
    public BigDecimal getItemPrice() {
        return itemPrice;
    }
    
    public void setItemPrice(BigDecimal itemPrice) {
        this.itemPrice = itemPrice;
    }
    
    public BigDecimal getItemOfferPrice() {
        return itemOfferPrice;
    }
    
    public void setItemOfferPrice(BigDecimal itemOfferPrice) {
        this.itemOfferPrice = itemOfferPrice;
    }
    
    public String getItemImagePath() {
        return itemImagePath;
    }
    
    public void setItemImagePath(String itemImagePath) {
        this.itemImagePath = itemImagePath;
    }
    
    public int getItemStock() {
        return itemStock;
    }
    
    public void setItemStock(int itemStock) {
        this.itemStock = itemStock;
    }
    
    // Utility methods
    
    /**
     * Get effective price (offer price if available, otherwise regular price)
     */
    public BigDecimal getEffectivePrice() {
        return itemOfferPrice != null && itemOfferPrice.compareTo(BigDecimal.ZERO) > 0 
               ? itemOfferPrice : itemPrice;
    }
    
    /**
     * Get original price (only if there's an offer)
     */
    public BigDecimal getOriginalPrice() {
        return itemOfferPrice != null && itemOfferPrice.compareTo(BigDecimal.ZERO) > 0 
               ? itemPrice : null;
    }
    
    /**
     * Calculate total price for this cart item
     */
    public BigDecimal getTotalPrice() {
        BigDecimal effectivePrice = getEffectivePrice();
        return effectivePrice != null ? effectivePrice.multiply(new BigDecimal(quantity)) : BigDecimal.ZERO;
    }
    
    /**
     * Check if item has an offer
     */
    public boolean hasOffer() {
        return itemOfferPrice != null && itemOfferPrice.compareTo(BigDecimal.ZERO) > 0 
               && itemOfferPrice.compareTo(itemPrice) < 0;
    }
    
    /**
     * Check if requested quantity is available in stock
     */
    public boolean isQuantityAvailable() {
        return quantity <= itemStock;
    }
    
    /**
     * Get savings amount if there's an offer
     */
    public BigDecimal getSavingsAmount() {
        if (hasOffer()) {
            BigDecimal savings = itemPrice.subtract(itemOfferPrice);
            return savings.multiply(new BigDecimal(quantity));
        }
        return BigDecimal.ZERO;
    }
    
    @Override
    public String toString() {
        return "Cart{" +
                "id=" + id +
                ", userId=" + userId +
                ", itemId=" + itemId +
                ", quantity=" + quantity +
                ", itemTitle='" + itemTitle + '\'' +
                ", effectivePrice=" + getEffectivePrice() +
                '}';
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Cart cart = (Cart) obj;
        return id == cart.id;
    }
    
    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}
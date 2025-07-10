package com.pahanaedu.models;

import java.math.BigDecimal;

/**
 * OrderItem model class representing items in an order
 */
public class OrderItem {
    private int id;
    private int orderId;
    private int itemId;
    private int quantity;
    private BigDecimal price;
    
    // Item details (for display)
    private String itemTitle;
    private String itemAuthor;
    private String itemImagePath;
    
    // Default constructor
    public OrderItem() {}
    
    // Constructor for new order item
    public OrderItem(int itemId, int quantity, BigDecimal price) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.price = price;
    }
    
    // Constructor with all fields
    public OrderItem(int orderId, int itemId, int quantity, BigDecimal price) {
        this.orderId = orderId;
        this.itemId = itemId;
        this.quantity = quantity;
        this.price = price;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getOrderId() {
        return orderId;
    }
    
    public void setOrderId(int orderId) {
        this.orderId = orderId;
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
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
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
    
    // Utility methods
    public BigDecimal getTotalPrice() {
        return price.multiply(new BigDecimal(quantity));
    }
    
    public boolean isValidQuantity() {
        return quantity > 0;
    }
    
    public boolean isValidPrice() {
        return price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }
    
    @Override
    public String toString() {
        return "OrderItem{" +
                "id=" + id +
                ", orderId=" + orderId +
                ", itemId=" + itemId +
                ", quantity=" + quantity +
                ", price=" + price +
                ", itemTitle='" + itemTitle + '\'' +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        OrderItem orderItem = (OrderItem) o;
        
        if (id != orderItem.id) return false;
        if (orderId != orderItem.orderId) return false;
        if (itemId != orderItem.itemId) return false;
        return quantity == orderItem.quantity;
    }
    
    @Override
    public int hashCode() {
        int result = id;
        result = 31 * result + orderId;
        result = 31 * result + itemId;
        result = 31 * result + quantity;
        return result;
    }
}
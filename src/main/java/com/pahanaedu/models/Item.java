package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Item model class representing a product/book in the system
 */
public class Item {
    private int id;
    private String title;
    private String author;
    private int categoryId;
    private String categoryName; // For displaying category name
    private BigDecimal price;
    private BigDecimal offerPrice;
    private int stock;
    private String description;
    private String imagePath;
    private String referenceNo;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_OUT_OF_STOCK = "out_of_stock";
    
    // Default constructor
    public Item() {
        this.status = STATUS_ACTIVE;
        this.stock = 0;
    }
    
    // Constructor for new item
    public Item(String title, String author, int categoryId, BigDecimal price, 
                BigDecimal offerPrice, int stock, String description) {
        this.title = title;
        this.author = author;
        this.categoryId = categoryId;
        this.price = price;
        this.offerPrice = offerPrice;
        this.stock = stock;
        this.description = description;
        this.status = STATUS_ACTIVE;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public int getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getOfferPrice() {
        return offerPrice;
    }
    
    public void setOfferPrice(BigDecimal offerPrice) {
        this.offerPrice = offerPrice;
    }
    
    public int getStock() {
        return stock;
    }
    
    public void setStock(int stock) {
        this.stock = stock;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getImagePath() {
        return imagePath;
    }
    
    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
    
    public String getReferenceNo() {
        return referenceNo;
    }
    
    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
    
    // Utility methods
    public boolean isActive() {
        return STATUS_ACTIVE.equals(this.status);
    }
    
    public boolean isInactive() {
        return STATUS_INACTIVE.equals(this.status);
    }
    
    public boolean isOutOfStock() {
        return STATUS_OUT_OF_STOCK.equals(this.status);
    }
    
    public boolean hasOffer() {
        return offerPrice != null && offerPrice.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public BigDecimal getEffectivePrice() {
        return hasOffer() ? offerPrice : price;
    }
    
    public boolean hasImage() {
        return imagePath != null && !imagePath.trim().isEmpty();
    }
    
    @Override
    public String toString() {
        return "Item{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", categoryId=" + categoryId +
                ", price=" + price +
                ", stock=" + stock +
                ", referenceNo='" + referenceNo + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Item item = (Item) obj;
        return id == item.id;
    }
    
    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}
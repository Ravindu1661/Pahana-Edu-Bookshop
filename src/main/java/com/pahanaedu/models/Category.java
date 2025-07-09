package com.pahanaedu.models;

import java.sql.Timestamp;

/**
 * Category model class representing a category in the system
 */
public class Category {
    private int id;
    private String name;
    private String description;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    // Default constructor
    public Category() {
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor for new category
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
        this.status = STATUS_ACTIVE;
    }
    
    // Full constructor
    public Category(int id, String name, String description, String status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Category category = (Category) obj;
        return id == category.id;
    }
    
    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}
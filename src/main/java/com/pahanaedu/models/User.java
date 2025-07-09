package com.pahanaedu.models;

import java.sql.Timestamp;

/**
 * User model class representing a user in the Pahana Edu system
 * Supports ADMIN, MANAGER, and CUSTOMER roles
 */
public class User {
    // User properties
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Role constants
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_MANAGER = "MANAGER";
    public static final String ROLE_CASHIER = "CASHIER";
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    
    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    // Default constructor
    public User() {
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor for user registration (basic)
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor for user registration (with phone)
    public User(String firstName, String lastName, String email, String password, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }
    
    // Constructor for admin/manager creation
    public User(String firstName, String lastName, String email, String password, String phone, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.status = STATUS_ACTIVE;
    }
    
    // Full constructor
    public User(int id, String firstName, String lastName, String email, String password, 
                String phone, String role, String status) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.status = status;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
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
    
    // Utility methods for role checking
    public boolean isAdmin() {
        return ROLE_ADMIN.equals(this.role);
    }
    
    public boolean isManager() {
        return ROLE_MANAGER.equals(this.role);
    }
    
    public boolean isCashier() {
        return ROLE_CASHIER.equals(this.role);
    }
    
    public boolean isCustomer() {
        return ROLE_CUSTOMER.equals(this.role);
    }
    
    // Utility methods for status checking
    public boolean isActive() {
        return STATUS_ACTIVE.equals(this.status);
    }
    
    public boolean isInactive() {
        return STATUS_INACTIVE.equals(this.status);
    }
    
    // Get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    // Check if user has valid phone number
    public boolean hasValidPhone() {
        return phone != null && !phone.trim().isEmpty() && phone.length() >= 10;
    }
    
    // Check if user can login (active status)
    public boolean canLogin() {
        return isActive();
    }
    
    // Get user display name with role
    public String getDisplayName() {
        return getFullName() + " (" + role + ")";
    }
    
    // Validate email format (basic)
    public boolean hasValidEmail() {
        return email != null && email.contains("@") && email.contains(".");
    }
    
    // Override toString for debugging
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
    
    // Override equals for comparison
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        User user = (User) obj;
        return id == user.id && 
               (email != null ? email.equals(user.email) : user.email == null);
    }
    
    // Override hashCode
    @Override
    public int hashCode() {
        int result = id;
        result = 31 * result + (email != null ? email.hashCode() : 0);
        return result;
    }
}
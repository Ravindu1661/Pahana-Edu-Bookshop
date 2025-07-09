package com.pahanaedu.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.mindrot.jbcrypt.BCrypt;

import com.pahanaedu.models.User;
import com.pahanaedu.utils.DatabaseConnection;

/**
 * Data Access Object for User operations
 * Handles all database operations related to users
 */
public class UserDAO {
    
    // SQL Queries
    private static final String INSERT_USER = 
        "INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    private static final String SELECT_USER_BY_EMAIL = 
        "SELECT * FROM users WHERE email = ?";
    
    private static final String SELECT_USER_BY_ID = 
        "SELECT * FROM users WHERE id = ?";
    
    private static final String SELECT_ALL_USERS = 
        "SELECT * FROM users ORDER BY created_at DESC";
    
    private static final String SELECT_USERS_BY_ROLE = 
        "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC";
    
    private static final String UPDATE_USER = 
        "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, status = ? WHERE id = ?";
    
    private static final String UPDATE_PASSWORD = 
        "UPDATE users SET password = ? WHERE email = ?";
    
    private static final String DELETE_USER = 
        "DELETE FROM users WHERE id = ?";
    
    private static final String COUNT_USERS_BY_ROLE = 
        "SELECT COUNT(*) FROM users WHERE role = ?";
    
    private static final String CHECK_EMAIL_EXISTS = 
        "SELECT COUNT(*) FROM users WHERE email = ?";
    
    private static final String CHECK_EMAIL_EXISTS_EXCLUDING_ID = 
        "SELECT COUNT(*) FROM users WHERE email = ? AND id != ?";
    
    /**
     * Create new user (for customer registration)
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createUser(User user) {
        // Only customers can register through normal signup
        user.setRole(User.ROLE_CUSTOMER);
        user.setStatus(User.STATUS_ACTIVE);
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_USER)) {
            
            // Hash password before storing
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getRole());
            statement.setString(7, user.getStatus());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: Customer created successfully - " + user.getEmail());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error creating user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Create user by admin (can be CUSTOMER, MANAGER, or ADMIN)
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createUserByAdmin(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_USER)) {
            
            // Hash password before storing
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getPhone());
            statement.setString(6, user.getRole());
            statement.setString(7, user.getStatus() != null ? user.getStatus() : User.STATUS_ACTIVE);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User created by admin - " + user.getEmail() + 
                                 " (Role: " + user.getRole() + ")");
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error creating user by admin - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Validate user login credentials
     * @param email User email
     * @param password Plain text password
     * @return User object if valid, null otherwise
     */
    public User validateLogin(String email, String password) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USER_BY_EMAIL)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                String storedPassword = resultSet.getString("password");
                
                // Verify password
                if (verifyPassword(password, storedPassword)) {
                    User user = extractUserFromResultSet(resultSet);
                    
                    System.out.println("UserDAO: Login successful - " + email + 
                                     " (Role: " + user.getRole() + 
                                     ", Status: " + user.getStatus() + ")");
                    return user;
                } else {
                    System.out.println("UserDAO: Password verification failed - " + email);
                }
            } else {
                System.out.println("UserDAO: User not found - " + email);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error validating login - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get user by ID
     * @param id User ID
     * @return User object if found, null otherwise
     */
    public User getUserById(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USER_BY_ID)) {
            
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractUserFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting user by ID - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get user by email
     * @param email User email
     * @return User object if found, null otherwise
     */
    public User getUserByEmail(String email) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USER_BY_EMAIL)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractUserFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting user by email - " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    /**
     * Get all users
     * @return List of all users
     */
    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_USERS)) {
            
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                users.add(extractUserFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting all users - " + e.getMessage());
            e.printStackTrace();
        }
        
        return users;
    }
    
    /**
     * Get users by role
     * @param role User role
     * @return List of users with specified role
     */
    public List<User> getUsersByRole(String role) {
        List<User> users = new ArrayList<>();
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_USERS_BY_ROLE)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                users.add(extractUserFromResultSet(resultSet));
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting users by role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return users;
    }
    
    /**
     * Update user information
     * @param user User object with updated information
     * @return true if update successful, false otherwise
     */
    public boolean updateUser(User user) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_USER)) {
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, user.getPhone());
            statement.setString(5, user.getStatus());
            statement.setInt(6, user.getId());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User updated successfully - " + user.getEmail());
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error updating user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Update user password
     * @param email User email
     * @param newPassword New password (plain text)
     * @return true if update successful, false otherwise
     */
    public boolean updatePassword(String email, String newPassword) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_PASSWORD)) {
            
            String hashedPassword = hashPassword(newPassword);
            statement.setString(1, hashedPassword);
            statement.setString(2, email);
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: Password updated successfully - " + email);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error updating password - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Delete user by ID
     * @param id User ID
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteUser(int id) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_USER)) {
            
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: User deleted successfully - ID: " + id);
                return true;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error deleting user - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if email already exists
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    public boolean emailExists(String email) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_EMAIL_EXISTS)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error checking email existence - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Check if email exists excluding current user ID
     * @param email Email to check
     * @param excludeId User ID to exclude
     * @return true if email exists, false otherwise
     */
    public boolean emailExistsExcluding(String email, int excludeId) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(CHECK_EMAIL_EXISTS_EXCLUDING_ID)) {
            
            statement.setString(1, email);
            statement.setInt(2, excludeId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error checking email existence (excluding ID) - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Get count of users by role
     * @param role User role
     * @return Count of users
     */
    public int getUserCountByRole(String role) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(COUNT_USERS_BY_ROLE)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error getting user count by role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    /**
     * Check if user has specific role
     * @param email User email
     * @param role User role to check
     * @return true if user has specified role, false otherwise
     */
    public boolean isUserRole(String email, String role) {
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                 "SELECT COUNT(*) FROM users WHERE email = ? AND role = ?")) {
            
            statement.setString(1, email);
            statement.setString(2, role);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error checking user role - " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Extract User object from ResultSet
     * @param resultSet SQL ResultSet
     * @return User object
     * @throws SQLException
     */
    private User extractUserFromResultSet(ResultSet resultSet) throws SQLException {
        User user = new User();
        user.setId(resultSet.getInt("id"));
        user.setFirstName(resultSet.getString("first_name"));
        user.setLastName(resultSet.getString("last_name"));
        user.setEmail(resultSet.getString("email"));
        user.setPassword(resultSet.getString("password"));
        user.setPhone(resultSet.getString("phone"));
        user.setRole(resultSet.getString("role"));
        user.setStatus(resultSet.getString("status"));
        user.setCreatedAt(resultSet.getTimestamp("created_at"));
        user.setUpdatedAt(resultSet.getTimestamp("updated_at"));
        return user;
    }
    
    /**
     * Hash password using BCrypt
     * @param plainTextPassword Plain text password
     * @return Hashed password
     */
    private String hashPassword(String plainTextPassword) {
        // Generate salt and hash password with cost factor 12
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(12));
    }
    
    /**
     * Verify password against stored hash
     * @param plainTextPassword Plain text password
     * @param hashedPassword Stored hashed password
     * @return true if password matches, false otherwise
     */
    private boolean verifyPassword(String plainTextPassword, String hashedPassword) {
        try {
            return BCrypt.checkpw(plainTextPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("UserDAO: Error verifying password - " + e.getMessage());
            return false;
        }
    }
}
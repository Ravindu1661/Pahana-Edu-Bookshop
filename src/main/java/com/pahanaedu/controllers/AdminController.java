package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Admin Controller - Handles admin operations
 * Only accessible by users with ADMIN role
 */
@WebServlet("/admin/*")
public class AdminController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("AdminController: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("AdminController: Failed to initialize UserDAO - " + e.getMessage());
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin authentication
        if (!isAdminAuthenticated(request)) {
            response.sendRedirect("login.jsp");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            // Redirect to admin dashboard
            response.sendRedirect("admin-dashboard.jsp");
            return;
        }
        
        switch (pathInfo) {
            case "/users":
                handleGetUsers(request, response);
                break;
            case "/user-stats":
                handleGetUserStats(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin authentication
        if (!isAdminAuthenticated(request)) {
            sendErrorResponse(response, "Access denied. Admin authentication required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/create-user":
                handleCreateUser(request, response);
                break;
            case "/update-user":
                handleUpdateUser(request, response);
                break;
            case "/delete-user":
                handleDeleteUser(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authenticated as admin
     */
    private boolean isAdminAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && User.ROLE_ADMIN.equals(userRole);
    }
    
    /**
     * Handle get all users request
     */
    private void handleGetUsers(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String roleFilter = request.getParameter("role");
            List<User> users;
            
            if (roleFilter != null && !roleFilter.trim().isEmpty()) {
                users = userDAO.getUsersByRole(roleFilter);
            } else {
                users = userDAO.getAllUsers();
            }
            
            // Convert to JSON (simple approach)
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"users\": [");
            
            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(user.getId()).append(",")
                    .append("\"firstName\": \"").append(escapeJsonString(user.getFirstName())).append("\",")
                    .append("\"lastName\": \"").append(escapeJsonString(user.getLastName())).append("\",")
                    .append("\"email\": \"").append(escapeJsonString(user.getEmail())).append("\",")
                    .append("\"phone\": \"").append(escapeJsonString(user.getPhone())).append("\",")
                    .append("\"role\": \"").append(escapeJsonString(user.getRole())).append("\",")
                    .append("\"status\": \"").append(escapeJsonString(user.getStatus())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("AdminController: Error getting users - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving users\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get user statistics request
     */
    private void handleGetUserStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int adminCount = userDAO.getUserCountByRole(User.ROLE_ADMIN);
            int managerCount = userDAO.getUserCountByRole(User.ROLE_MANAGER);
            int customerCount = userDAO.getUserCountByRole(User.ROLE_CUSTOMER);
            int totalUsers = adminCount + managerCount + customerCount;
            
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"totalUsers\": %d, " +
                "\"adminCount\": %d, " +
                "\"managerCount\": %d, " +
                "\"customerCount\": %d" +
                "}}",
                totalUsers, adminCount, managerCount, customerCount
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("AdminController: Error getting user stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle create user request
     */
    private void handleCreateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get form parameters
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String password = request.getParameter("password");
            String role = request.getParameter("role");
            String status = request.getParameter("status");
            
            // Validate inputs
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                role == null || role.trim().isEmpty()) {
                
                sendErrorResponse(response, "All fields are required");
                return;
            }
            
            // Check if email already exists
            if (userDAO.emailExists(email.trim())) {
                sendErrorResponse(response, "Email address already exists");
                return;
            }
            
            // Create user object
            User newUser = new User(firstName.trim(), lastName.trim(), email.trim(), 
                                   password, phone, role.trim());
            
            if (status != null && !status.trim().isEmpty()) {
                newUser.setStatus(status.trim());
            }
            
            // Create user
            if (userDAO.createUserByAdmin(newUser)) {
                sendSuccessResponse(response, "User created successfully");
            } else {
                sendErrorResponse(response, "Failed to create user");
            }
            
        } catch (Exception e) {
            System.err.println("AdminController: Error creating user - " + e.getMessage());
            sendErrorResponse(response, "Error creating user");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update user request
     */
    private void handleUpdateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get parameters
            String userIdStr = request.getParameter("userId");
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            String status = request.getParameter("status");
            
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "User ID is required");
                return;
            }
            
            int userId = Integer.parseInt(userIdStr);
            
            // Get existing user
            User existingUser = userDAO.getUserById(userId);
            if (existingUser == null) {
                sendErrorResponse(response, "User not found");
                return;
            }
            
            // Check if email is being changed and if it already exists
            if (email != null && !email.equals(existingUser.getEmail())) {
                if (userDAO.emailExistsExcluding(email, userId)) {
                    sendErrorResponse(response, "Email address already exists");
                    return;
                }
            }
            
            // Update user object
            if (firstName != null) existingUser.setFirstName(firstName.trim());
            if (lastName != null) existingUser.setLastName(lastName.trim());
            if (email != null) existingUser.setEmail(email.trim());
            if (phone != null) existingUser.setPhone(phone.trim());
            if (status != null) existingUser.setStatus(status.trim());
            
            // Update user
            if (userDAO.updateUser(existingUser)) {
                sendSuccessResponse(response, "User updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        } catch (Exception e) {
            System.err.println("AdminController: Error updating user - " + e.getMessage());
            sendErrorResponse(response, "Error updating user");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle delete user request
     */
    private void handleDeleteUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String userIdStr = request.getParameter("userId");
            
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "User ID is required");
                return;
            }
            
            int userId = Integer.parseInt(userIdStr);
            
            // Check if user exists
            User existingUser = userDAO.getUserById(userId);
            if (existingUser == null) {
                sendErrorResponse(response, "User not found");
                return;
            }
            
            // Prevent deletion of admin users
            if (User.ROLE_ADMIN.equals(existingUser.getRole())) {
                sendErrorResponse(response, "Cannot delete admin users");
                return;
            }
            
            // Delete user
            if (userDAO.deleteUser(userId)) {
                sendSuccessResponse(response, "User deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        } catch (Exception e) {
            System.err.println("AdminController: Error deleting user - " + e.getMessage());
            sendErrorResponse(response, "Error deleting user");
        } finally {
            out.close();
        }
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        PrintWriter out = response.getWriter();
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
    }
    
    /**
     * Escape JSON string
     */
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }
    
    @Override
    public void destroy() {
        System.out.println("AdminController: Controller being destroyed");
        userDAO = null;
        super.destroy();
    }
}
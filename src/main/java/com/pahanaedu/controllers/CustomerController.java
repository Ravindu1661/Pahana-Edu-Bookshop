package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

/**
 * Customer Controller - Handles customer operations
 * Only accessible by users with CUSTOMER role
 */
@WebServlet("/customer/*")
public class CustomerController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("CustomerController: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("CustomerController: Failed to initialize UserDAO - " + e.getMessage());
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check customer authentication
        if (!isCustomerAuthenticated(request)) {
            response.sendRedirect("login.jsp");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            // Redirect to customer dashboard (main page)
            response.sendRedirect("index.jsp");
            return;
        }
        
        switch (pathInfo) {
            case "/profile":
                handleGetProfile(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check customer authentication
        if (!isCustomerAuthenticated(request)) {
            sendErrorResponse(response, "Access denied. Customer authentication required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/update-profile":
                handleUpdateProfile(request, response);
                break;
            case "/change-password":
                handleChangePassword(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authenticated as customer
     */
    private boolean isCustomerAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && User.ROLE_CUSTOMER.equals(userRole);
    }
    
    /**
     * Handle get profile request
     */
    private void handleGetProfile(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            HttpSession session = request.getSession();
            String userEmail = (String) session.getAttribute("userEmail");
            
            if (userEmail == null) {
                out.print("{\"success\": false, \"message\": \"Session expired\"}");
                return;
            }
            
            // Get user profile from database
            User user = userDAO.getUserByEmail(userEmail);
            
            if (user == null) {
                out.print("{\"success\": false, \"message\": \"User not found\"}");
                return;
            }
            
            // Return profile data
            String jsonResponse = String.format(
                "{\"success\": true, \"profile\": {" +
                "\"id\": %d, " +
                "\"firstName\": \"%s\", " +
                "\"lastName\": \"%s\", " +
                "\"email\": \"%s\", " +
                "\"phone\": \"%s\", " +
                "\"status\": \"%s\", " +
                "\"fullName\": \"%s\"" +
                "}}",
                user.getId(),
                escapeJsonString(user.getFirstName()),
                escapeJsonString(user.getLastName()),
                escapeJsonString(user.getEmail()),
                escapeJsonString(user.getPhone()),
                escapeJsonString(user.getStatus()),
                escapeJsonString(user.getFullName())
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error getting profile - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving profile\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update profile request
     */
    private void handleUpdateProfile(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            HttpSession session = request.getSession();
            String userEmail = (String) session.getAttribute("userEmail");
            Integer userId = (Integer) session.getAttribute("userId");
            
            if (userEmail == null || userId == null) {
                sendErrorResponse(response, "Session expired");
                return;
            }
            
            // Get form parameters
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");
            
            // Validate inputs
            if (firstName == null || firstName.trim().isEmpty()) {
                sendErrorResponse(response, "First name is required");
                return;
            }
            
            if (lastName == null || lastName.trim().isEmpty()) {
                sendErrorResponse(response, "Last name is required");
                return;
            }
            
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, "Email is required");
                return;
            }
            
            if (phone == null || phone.trim().isEmpty()) {
                sendErrorResponse(response, "Phone number is required");
                return;
            }
            
            // Validate phone number
            String cleanPhone = phone.replaceAll("\\D", "");
            if (cleanPhone.length() != 10) {
                sendErrorResponse(response, "Please enter a valid 10-digit phone number");
                return;
            }
            
            // Get existing user
            User existingUser = userDAO.getUserById(userId);
            if (existingUser == null) {
                sendErrorResponse(response, "User not found");
                return;
            }
            
            // Check if email is being changed and if it already exists
            if (!email.equals(existingUser.getEmail())) {
                if (userDAO.emailExistsExcluding(email, userId)) {
                    sendErrorResponse(response, "Email address already exists");
                    return;
                }
            }
            
            // Update user object
            existingUser.setFirstName(firstName.trim());
            existingUser.setLastName(lastName.trim());
            existingUser.setEmail(email.trim());
            existingUser.setPhone(cleanPhone);
            
            // Update user in database
            if (userDAO.updateUser(existingUser)) {
                // Update session attributes
                session.setAttribute("userEmail", existingUser.getEmail());
                session.setAttribute("userName", existingUser.getFullName());
                session.setAttribute("userFirstName", existingUser.getFirstName());
                session.setAttribute("userLastName", existingUser.getLastName());
                session.setAttribute("userPhone", existingUser.getPhone());
                
                sendSuccessResponse(response, "Profile updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update profile");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error updating profile - " + e.getMessage());
            sendErrorResponse(response, "Error updating profile");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle change password request
     */
    private void handleChangePassword(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            HttpSession session = request.getSession();
            String userEmail = (String) session.getAttribute("userEmail");
            
            if (userEmail == null) {
                sendErrorResponse(response, "Session expired");
                return;
            }
            
            // Get form parameters
            String currentPassword = request.getParameter("currentPassword");
            String newPassword = request.getParameter("newPassword");
            String confirmPassword = request.getParameter("confirmPassword");
            
            // Validate inputs
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                sendErrorResponse(response, "Current password is required");
                return;
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                sendErrorResponse(response, "New password is required");
                return;
            }
            
            if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
                sendErrorResponse(response, "Password confirmation is required");
                return;
            }
            
            // Check if new passwords match
            if (!newPassword.equals(confirmPassword)) {
                sendErrorResponse(response, "New passwords do not match");
                return;
            }
            
            // Validate new password strength
            if (newPassword.length() < 6) {
                sendErrorResponse(response, "New password must be at least 6 characters long");
                return;
            }
            
            // Verify current password
            User user = userDAO.validateLogin(userEmail, currentPassword);
            if (user == null) {
                sendErrorResponse(response, "Current password is incorrect");
                return;
            }
            
            // Update password
            if (userDAO.updatePassword(userEmail, newPassword)) {
                sendSuccessResponse(response, "Password changed successfully");
            } else {
                sendErrorResponse(response, "Failed to change password");
            }
            
        } catch (Exception e) {
            System.err.println("CustomerController: Error changing password - " + e.getMessage());
            sendErrorResponse(response, "Error changing password");
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
        System.out.println("CustomerController: Controller being destroyed");
        userDAO = null;
        super.destroy();
    }
}
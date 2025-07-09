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
 * Signup Controller - Handles customer registration
 * Only customers can register through this controller
 */
@WebServlet("/signup")
public class SignupController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("SignupController: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("SignupController: Failed to initialize UserDAO - " + e.getMessage());
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Set response headers
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        PrintWriter out = null;
        
        try {
            out = response.getWriter();
            
            // Get form parameters
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String phone = request.getParameter("phone");
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String confirmPassword = request.getParameter("confirmPassword");
            
            System.out.println("SignupController: Processing signup request for: " + email);
            
            // Input validation
            if (firstName == null || firstName.trim().isEmpty()) {
                sendErrorResponse(response, out, "First name is required");
                return;
            }
            
            if (lastName == null || lastName.trim().isEmpty()) {
                sendErrorResponse(response, out, "Last name is required");
                return;
            }
            
            if (phone == null || phone.trim().isEmpty()) {
                sendErrorResponse(response, out, "Phone number is required");
                return;
            }
            
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, "Email address is required");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                sendErrorResponse(response, out, "Password is required");
                return;
            }
            
            if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
                sendErrorResponse(response, out, "Password confirmation is required");
                return;
            }
            
            // Validate phone number format
            String cleanPhone = phone.replaceAll("\\D", ""); // Remove non-digits
            if (cleanPhone.length() != 10) {
                sendErrorResponse(response, out, "Please enter a valid 10-digit phone number");
                return;
            }
            
            // Validate email format (basic)
            if (!isValidEmail(email)) {
                sendErrorResponse(response, out, "Please enter a valid email address");
                return;
            }
            
            // Check if passwords match
            if (!password.equals(confirmPassword)) {
                sendErrorResponse(response, out, "Passwords do not match");
                return;
            }
            
            // Check password strength
            if (!isValidPassword(password)) {
                sendErrorResponse(response, out, "Password must be at least 6 characters long");
                return;
            }
            
            // Check if email already exists
            if (userDAO.emailExists(email.trim().toLowerCase())) {
                sendErrorResponse(response, out, "Email address already exists");
                return;
            }
            
            // Create new customer user
            User newUser = new User(
                firstName.trim(),
                lastName.trim(),
                email.trim().toLowerCase(),
                password,
                cleanPhone
            );
            
            // Set customer role and active status
            newUser.setRole(User.ROLE_CUSTOMER);
            newUser.setStatus(User.STATUS_ACTIVE);
            
            // Create user in database
            if (userDAO.createUser(newUser)) {
                System.out.println("SignupController: Customer registration successful - " + email);
                
                // Create session for immediate login
                createUserSession(request, newUser);
                
                // Send success response
                sendSuccessResponse(response, out, 
                    "Account created successfully! Welcome to Pahana Edu!", 
                    User.ROLE_CUSTOMER, "customer-dashboard.jsp");
                
            } else {
                System.err.println("SignupController: Database error during registration - " + email);
                sendErrorResponse(response, out, "Failed to create account. Please try again.");
            }
            
        } catch (Exception e) {
            System.err.println("SignupController: Unexpected error during signup - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, "Registration error occurred. Please try again.");
            }
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }
    
    /**
     * Create user session after successful registration
     */
    private void createUserSession(HttpServletRequest request, User user) {
        System.out.println("SignupController: Creating session for new user: " + user.getEmail());
        
        // Invalidate existing session
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        
        // Create new session
        HttpSession session = request.getSession(true);
        
        // Set user attributes
        session.setAttribute("user", user);
        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("userName", user.getFullName());
        session.setAttribute("userRole", user.getRole());
        session.setAttribute("userFirstName", user.getFirstName());
        session.setAttribute("userLastName", user.getLastName());
        session.setAttribute("userPhone", user.getPhone());
        session.setAttribute("userStatus", user.getStatus());
        session.setAttribute("isLoggedIn", true);
        session.setAttribute("loginTime", System.currentTimeMillis());
        
        // Set role-specific attributes
        session.setAttribute("isAdmin", false);
        session.setAttribute("isManager", false);
        session.setAttribute("isCashier", false);
        session.setAttribute("isCustomer", true);
        
        // Set standard session timeout (30 minutes)
        session.setMaxInactiveInterval(30 * 60);
        session.setAttribute("rememberMe", false);
        
        System.out.println("SignupController: Session created successfully");
    }
    
    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        // Basic email validation
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
    
    /**
     * Validate password strength
     */
    private boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        
        // Minimum 6 characters
        return password.length() >= 6;
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, PrintWriter out, 
                                   String message, String role, String redirectUrl) {
        response.setStatus(HttpServletResponse.SC_OK);
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\", \"role\": \"%s\", \"redirectUrl\": \"%s\"}",
            escapeJsonString(message),
            escapeJsonString(role),
            escapeJsonString(redirectUrl)
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("SignupController: Success response sent");
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\"}",
            escapeJsonString(message)
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("SignupController: Error response sent - " + message);
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
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check if user is already logged in
        HttpSession session = request.getSession(false);
        if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            String userRole = (String) session.getAttribute("userRole");
            
            // Redirect based on role
            if (User.ROLE_ADMIN.equals(userRole)) {
                response.sendRedirect("admin-dashboard.jsp");
            } else if (User.ROLE_MANAGER.equals(userRole)) {
                response.sendRedirect("manager-dashboard.jsp");
            } else if (User.ROLE_CASHIER.equals(userRole)) {
                response.sendRedirect("cashier-dashboard.jsp");
            } else {
                response.sendRedirect("customer-dashboard.jsp");
            }
            return;
        }
        
        // Redirect to login page
        response.sendRedirect("login.jsp");
    }
    
    @Override
    public void destroy() {
        System.out.println("SignupController: Controller being destroyed");
        userDAO = null;
        super.destroy();
    }
}
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
 * Login Controller - Handles user authentication
 * Supports ADMIN, MANAGER, and CUSTOMER roles
 */
@WebServlet("/login")
public class LoginController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    // Default admin credentials
    private static final String ADMIN_EMAIL = "admin@pahanaedu.lk";
    private static final String ADMIN_PASSWORD = "admin123";
    
    // Default manager credentials
    private static final String MANAGER_EMAIL = "manager@pahanaedu.lk";
    private static final String MANAGER_PASSWORD = "manager123";
    
    // Default cashier credentials
    private static final String CASHIER_EMAIL = "cashier@pahanaedu.lk";
    private static final String CASHIER_PASSWORD = "admin123";
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("LoginController: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("LoginController: Failed to initialize UserDAO - " + e.getMessage());
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
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String rememberMe = request.getParameter("rememberMe");
            
            System.out.println("LoginController: Processing login request for: " + email);
            
            // Input validation
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, "Email address is required");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                sendErrorResponse(response, out, "Password is required");
                return;
            }
            
            email = email.trim().toLowerCase();
            
            // Check for hardcoded admin login
            if (ADMIN_EMAIL.equalsIgnoreCase(email) && ADMIN_PASSWORD.equals(password)) {
                handleAdminLogin(request, response, out, rememberMe);
                return;
            }
            
            // Check for hardcoded manager login
            if (MANAGER_EMAIL.equalsIgnoreCase(email) && MANAGER_PASSWORD.equals(password)) {
                handleManagerLogin(request, response, out, rememberMe);
                return;
            }
            
            // Check for hardcoded cashier login
            if (CASHIER_EMAIL.equalsIgnoreCase(email) && CASHIER_PASSWORD.equals(password)) {
                handleCashierLogin(request, response, out, rememberMe);
                return;
            }
            
            // Regular user authentication
            authenticateUser(email, password, request, response, out, rememberMe);
            
        } catch (Exception e) {
            System.err.println("LoginController: Unexpected error during login - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, "An unexpected error occurred. Please try again.");
            }
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }
    
    /**
     * Handle cashier login
     */
    private void handleCashierLogin(HttpServletRequest request, HttpServletResponse response, 
                                   PrintWriter out, String rememberMe) throws IOException {
        
        System.out.println("LoginController: Processing cashier login");
        
        // Create cashier user object
        User cashierUser = new User();
        cashierUser.setId(-3);
        cashierUser.setFirstName("Shop");
        cashierUser.setLastName("Cashier");
        cashierUser.setEmail(CASHIER_EMAIL);
        cashierUser.setPhone("0112345680");
        cashierUser.setRole(User.ROLE_CASHIER);
        cashierUser.setStatus(User.STATUS_ACTIVE);
        
        // Configure session
        configureSession(request, cashierUser, rememberMe);
        
        System.out.println("LoginController: Cashier login successful");
        
        // Send success response
        sendSuccessResponse(response, out, "Cashier login successful!", 
                           User.ROLE_CASHIER, "cashier-dashboard.jsp");
    }
    
    /**
     * Handle admin login
     */
    private void handleAdminLogin(HttpServletRequest request, HttpServletResponse response, 
                                  PrintWriter out, String rememberMe) throws IOException {
        
        System.out.println("LoginController: Processing admin login");
        
        // Create admin user object
        User adminUser = new User();
        adminUser.setId(-1);
        adminUser.setFirstName("System");
        adminUser.setLastName("Administrator");
        adminUser.setEmail(ADMIN_EMAIL);
        adminUser.setPhone("0112345678");
        adminUser.setRole(User.ROLE_ADMIN);
        adminUser.setStatus(User.STATUS_ACTIVE);
        
        // Configure session
        configureSession(request, adminUser, rememberMe);
        
        System.out.println("LoginController: Admin login successful");
        
        // Send success response
        sendSuccessResponse(response, out, "Admin login successful!", 
                           User.ROLE_ADMIN, "admin-dashboard.jsp");
    }
    
    /**
     * Handle manager login
     */
    private void handleManagerLogin(HttpServletRequest request, HttpServletResponse response, 
                                   PrintWriter out, String rememberMe) throws IOException {
        
        System.out.println("LoginController: Processing manager login");
        
        // Create manager user object
        User managerUser = new User();
        managerUser.setId(-2);
        managerUser.setFirstName("Book");
        managerUser.setLastName("Manager");
        managerUser.setEmail(MANAGER_EMAIL);
        managerUser.setPhone("0112345679");
        managerUser.setRole(User.ROLE_MANAGER);
        managerUser.setStatus(User.STATUS_ACTIVE);
        
        // Configure session
        configureSession(request, managerUser, rememberMe);
        
        System.out.println("LoginController: Manager login successful");
        
        // Send success response
        sendSuccessResponse(response, out, "Manager login successful!", 
                           User.ROLE_MANAGER, "manager-dashboard.jsp");
    }
    
    /**
     * Authenticate regular user from database
     */
    private void authenticateUser(String email, String password, HttpServletRequest request, 
                                 HttpServletResponse response, PrintWriter out, String rememberMe) 
                                 throws IOException {
        
        System.out.println("LoginController: Authenticating user: " + email);
        
        try {
            // Validate credentials using UserDAO
            User user = userDAO.validateLogin(email, password);
            
            if (user == null) {
                System.out.println("LoginController: Authentication failed for: " + email);
                sendErrorResponse(response, out, "Invalid email or password");
                return;
            }
            
            // Check if user account is active
            if (!user.isActive()) {
                System.out.println("LoginController: Account inactive for: " + email);
                
                String message = getUserInactiveMessage(user);
                sendErrorResponse(response, out, message);
                return;
            }
            
            // Configure session
            configureSession(request, user, rememberMe);
            
            // Determine redirect URL
            String redirectUrl = determineRedirectUrl(user.getRole());
            
            System.out.println("LoginController: User authentication successful - " + email + 
                             " (Role: " + user.getRole() + ")");
            
            // Send success response
            String successMessage = getSuccessMessage(user.getRole());
            sendSuccessResponse(response, out, successMessage, user.getRole(), redirectUrl);
            
        } catch (Exception e) {
            System.err.println("LoginController: Error during authentication - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, out, "Authentication error. Please try again.");
        }
    }
    
    /**
     * Configure user session
     */
    private void configureSession(HttpServletRequest request, User user, String rememberMe) {
        System.out.println("LoginController: Configuring session for: " + user.getEmail());
        
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
        session.setAttribute("isAdmin", user.isAdmin());
        session.setAttribute("isManager", user.isManager());
        session.setAttribute("isCashier", user.isCashier());
        session.setAttribute("isCustomer", user.isCustomer());
        
        // Handle remember me
        boolean rememberMeEnabled = "on".equals(rememberMe) || "true".equals(rememberMe);
        
        if (rememberMeEnabled) {
            session.setMaxInactiveInterval(7 * 24 * 60 * 60); // 7 days
            session.setAttribute("rememberMe", true);
        } else {
            session.setMaxInactiveInterval(30 * 60); // 30 minutes
            session.setAttribute("rememberMe", false);
        }
        
        System.out.println("LoginController: Session configured successfully");
    }
    
    /**
     * Determine redirect URL based on user role
     */
    private String determineRedirectUrl(String role) {
        if (role == null) {
            return "index.jsp";
        }
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "admin-dashboard.jsp";
            case "MANAGER":
                return "manager-dashboard.jsp";
            case "CASHIER":
                return "cashier-dashboard.jsp";
            case "CUSTOMER":
            default:
                return "customer-dashboard.jsp";
        }
    }
    
    /**
     * Get success message based on user role
     */
    private String getSuccessMessage(String role) {
        if (role == null) {
            return "Login successful!";
        }
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "Admin login successful! Redirecting to dashboard...";
            case "MANAGER":
                return "Manager login successful! Redirecting to dashboard...";
            case "CASHIER":
                return "Cashier login successful! Redirecting to dashboard...";
            case "CUSTOMER":
            default:
                return "Login successful! Welcome back!";
        }
    }
    
    /**
     * Get user inactive message based on role
     */
    private String getUserInactiveMessage(User user) {
        String baseMessage = "Your account has been deactivated. Please contact support.";
        
        if (user.isManager()) {
            return "🔒 Your Manager Account is Deactivated!\n\n" +
                   "Please contact the administrator to reactivate your account.\n\n" +
                   "📞 Support: admin@pahanaedu.lk";
        } else if (user.isCashier()) {
            return "🔒 Your Cashier Account is Deactivated!\n\n" +
                   "Please contact the administrator to reactivate your account.\n\n" +
                   "📞 Support: admin@pahanaedu.lk";
        } else if (user.isCustomer()) {
            return "🔒 Your Customer Account is Deactivated!\n\n" +
                   "Please contact our support team to reactivate your account.\n\n" +
                   "📞 Support: 0112345678 | admin@pahanaedu.lk";
        }
        
        return baseMessage;
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
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
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
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check if user is already logged in
        HttpSession session = request.getSession(false);
        if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            String userRole = (String) session.getAttribute("userRole");
            String redirectUrl = determineRedirectUrl(userRole);
            response.sendRedirect(redirectUrl);
            return;
        }
        
        // Redirect to login page
        response.sendRedirect("login.jsp");
    }
    
    @Override
    public void destroy() {
        System.out.println("LoginController: Controller being destroyed");
        userDAO = null;
        super.destroy();
    }
}
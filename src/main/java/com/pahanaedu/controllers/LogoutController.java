package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Logout Controller - Handles user logout
 * Destroys session and redirects to login page
 */
@WebServlet("/logout")
public class LogoutController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        handleLogout(request, response);
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        handleLogout(request, response);
    }
    
    /**
     * Handle logout request
     */
    private void handleLogout(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        HttpSession session = request.getSession(false);
        
        if (session != null) {
            String userEmail = (String) session.getAttribute("userEmail");
            String userRole = (String) session.getAttribute("userRole");
            
            System.out.println("LogoutController: User logging out - " + userEmail + " (Role: " + userRole + ")");
            
            // Invalidate session
            session.invalidate();
            
            System.out.println("LogoutController: Session invalidated successfully");
        }
        
        // Clear any cookies if needed
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        // Check if this is an AJAX request
        String requestedWith = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equals(requestedWith)) {
            // Return JSON response for AJAX requests
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            
            PrintWriter out = response.getWriter();
            out.print("{\"success\": true, \"message\": \"Logged out successfully\", \"redirectUrl\": \"login-signup.jsp\"}");
            out.flush();
            out.close();
        } else {
            // Regular redirect for non-AJAX requests
            response.sendRedirect("index.jsp");
        }
    }
}
package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.pahanaedu.dao.PromoCodeDAO;
import com.pahanaedu.dao.PromoCodeDAO.PromoCodeStats;
import com.pahanaedu.models.PromoCode;

/**
 * Admin Promo Code Management Controller
 * Handles all promo code related admin operations
 */
@WebServlet({"/admin/promo-codes/*", "/admin/promo-stats"})
public class AdminPromoCodeController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private PromoCodeDAO promoCodeDAO;
    private Gson gson;
    private SimpleDateFormat dateFormat;
    
    @Override
    public void init() throws ServletException {
        try {
            promoCodeDAO = new PromoCodeDAO();
            gson = new Gson();
            dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            System.out.println("AdminPromoCodeController: Initialized successfully");
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Failed to initialize - " + e.getMessage());
            throw new ServletException("Failed to initialize", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        if (!isAdminAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Admin privileges required.");
            return;
        }
        
        String servletPath = request.getServletPath();
        String pathInfo = request.getPathInfo();
        
        System.out.println("DEBUG: ServletPath = " + servletPath + ", PathInfo = " + pathInfo);
        
        // Handle statistics endpoint
        if ("/admin/promo-stats".equals(servletPath)) {
            handleGetPromoStats(request, response);
            return;
        }
        
        // Handle promo codes endpoints
        if ("/admin/promo-codes".equals(servletPath)) {
            if (pathInfo == null || pathInfo.equals("/")) {
                handleGetPromoCodes(request, response);
            } else if (pathInfo.equals("/stats")) {
                handleGetPromoStats(request, response);
            } else if (pathInfo.startsWith("/")) {
                // Handle individual promo code by ID
                try {
                    int promoCodeId = Integer.parseInt(pathInfo.substring(1));
                    handleGetPromoCodeById(request, response, promoCodeId);
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid promo code ID");
                }
            }
        } else {
            sendErrorResponse(response, "Invalid endpoint: " + servletPath);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        if (!isAdminAuthorized(request)) {
            sendErrorResponse(response, "Access denied. Admin privileges required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/create":
                handleCreatePromoCode(request, response);
                break;
            case "/update":
                handleUpdatePromoCode(request, response);
                break;
            case "/delete":
                handleDeletePromoCode(request, response);
                break;
            case "/validate":
                handleValidatePromoCode(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation: " + pathInfo);
        }
    }
    
    /**
     * Check admin authorization
     */
    private boolean isAdminAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && "ADMIN".equals(userRole);
    }
    
    /**
     * Get current admin user ID - FIXED VERSION
     */
    private int getCurrentAdminId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            // Try different session attribute names
            Integer userId = (Integer) session.getAttribute("userId");
            if (userId == null) {
                userId = (Integer) session.getAttribute("user_id");
            }
            if (userId == null) {
                userId = (Integer) session.getAttribute("id");
            }
            if (userId == null) {
                // Try user object
                Object userObj = session.getAttribute("user");
                if (userObj != null) {
                    try {
                        // Assuming user object has getId() method
                        java.lang.reflect.Method getIdMethod = userObj.getClass().getMethod("getId");
                        userId = (Integer) getIdMethod.invoke(userObj);
                    } catch (Exception e) {
                        System.err.println("Error getting user ID from user object: " + e.getMessage());
                    }
                }
            }
            
            if (userId != null && userId > 0) {
                System.out.println("DEBUG: Found admin user ID: " + userId);
                return userId;
            }
        }
        
        System.err.println("WARNING: Could not find valid admin user ID in session, using default admin ID: 1");
        // Return a default admin user ID (assuming there's an admin user with ID 1)
        // You should replace this with a valid admin user ID from your database
        return 1;
    }
    
    /**
     * Handle get all promo codes
     */
    private void handleGetPromoCodes(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            String statusFilter = request.getParameter("status");
            
            List<PromoCode> promoCodes = promoCodeDAO.getAllPromoCodes();
            
            // Apply status filter if provided
            if (statusFilter != null && !statusFilter.trim().isEmpty()) {
                promoCodes = promoCodes.stream()
                    .filter(pc -> statusFilter.equals(pc.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Promo codes retrieved successfully");
            responseObj.addProperty("totalCount", promoCodes.size());
            responseObj.add("promoCodes", gson.toJsonTree(promoCodes));
            
            out.print(responseObj.toString());
            System.out.println("DEBUG: Retrieved " + promoCodes.size() + " promo codes");
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error retrieving promo codes - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving promo codes: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get promo code by ID
     */
    private void handleGetPromoCodeById(HttpServletRequest request, HttpServletResponse response, int promoCodeId) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            PromoCode promoCode = promoCodeDAO.getPromoCodeById(promoCodeId);
            
            if (promoCode != null) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Promo code retrieved successfully");
                responseObj.add("promoCode", gson.toJsonTree(promoCode));
                
                out.print(responseObj.toString());
            } else {
                sendErrorResponse(response, "Promo code not found");
            }
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error retrieving promo code - " + e.getMessage());
            sendErrorResponse(response, "Error retrieving promo code: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get promo code statistics
     */
    private void handleGetPromoStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            PromoCodeStats stats = promoCodeDAO.getPromoCodeStats();
            
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Statistics retrieved successfully");
            
            JsonObject statsObj = new JsonObject();
            statsObj.addProperty("totalCodes", stats.totalCodes);
            statsObj.addProperty("activeCodes", stats.activeCodes);
            statsObj.addProperty("inactiveCodes", stats.inactiveCodes);
            statsObj.addProperty("expiredCodes", stats.expiredCodes);
            statsObj.addProperty("totalUsage", stats.totalUsage);
            
            responseObj.add("stats", statsObj);
            out.print(responseObj.toString());
            
            System.out.println("DEBUG: Promo stats - Total: " + stats.totalCodes + 
                             ", Active: " + stats.activeCodes + ", Usage: " + stats.totalUsage);
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error getting statistics - " + e.getMessage());
            sendErrorResponse(response, "Error retrieving statistics: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle create promo code - FIXED VERSION
     */
    private void handleCreatePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            // Get current admin ID first and validate
            int currentAdminId = getCurrentAdminId(request);
            System.out.println("DEBUG: Creating promo code with admin ID: " + currentAdminId);
            
            // Get form parameters
            String code = request.getParameter("code");
            String description = request.getParameter("description");
            String discountType = request.getParameter("discountType");
            String discountValueStr = request.getParameter("discountValue");
            String minimumOrderAmountStr = request.getParameter("minimumOrderAmount");
            String usageLimitStr = request.getParameter("usageLimit");
            String startDateStr = request.getParameter("startDate");
            String endDateStr = request.getParameter("endDate");
            String status = request.getParameter("status");
            
            // Debug log parameters
            System.out.println("DEBUG: Promo code parameters:");
            System.out.println("  Code: " + code);
            System.out.println("  Description: " + description);
            System.out.println("  Discount Type: " + discountType);
            System.out.println("  Discount Value: " + discountValueStr);
            System.out.println("  Status: " + status);
            
            // Validation
            if (code == null || code.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code is required");
                return;
            }
            
            if (discountType == null || discountValueStr == null || 
                startDateStr == null || endDateStr == null) {
                sendErrorResponse(response, "All required fields must be filled");
                return;
            }
            
            // Check if code already exists
            if (promoCodeDAO.promoCodeExists(code.trim())) {
                sendErrorResponse(response, "Promo code already exists");
                return;
            }
            
            // Parse and validate data
            BigDecimal discountValue;
            try {
                discountValue = new BigDecimal(discountValueStr);
                if (discountValue.compareTo(BigDecimal.ZERO) <= 0) {
                    sendErrorResponse(response, "Discount value must be greater than 0");
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid discount value");
                return;
            }
            
            // Validate percentage discount
            if ("percentage".equals(discountType) && 
                discountValue.compareTo(new BigDecimal(100)) > 0) {
                sendErrorResponse(response, "Percentage discount cannot exceed 100%");
                return;
            }
            
            BigDecimal minimumOrderAmount = null;
            if (minimumOrderAmountStr != null && !minimumOrderAmountStr.trim().isEmpty()) {
                try {
                    minimumOrderAmount = new BigDecimal(minimumOrderAmountStr);
                    if (minimumOrderAmount.compareTo(BigDecimal.ZERO) < 0) {
                        sendErrorResponse(response, "Minimum order amount cannot be negative");
                        return;
                    }
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid minimum order amount");
                    return;
                }
            }
            
            Integer usageLimit = null;
            if (usageLimitStr != null && !usageLimitStr.trim().isEmpty()) {
                try {
                    usageLimit = Integer.parseInt(usageLimitStr);
                    if (usageLimit <= 0) {
                        sendErrorResponse(response, "Usage limit must be greater than 0");
                        return;
                    }
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid usage limit");
                    return;
                }
            }
            
            Date startDate, endDate;
            try {
                startDate = new Date(dateFormat.parse(startDateStr).getTime());
                endDate = new Date(dateFormat.parse(endDateStr).getTime());
                
                if (endDate.before(startDate)) {
                    sendErrorResponse(response, "End date must be after start date");
                    return;
                }
            } catch (ParseException e) {
                sendErrorResponse(response, "Invalid date format");
                return;
            }
            
            // Fix discount type mapping
            String mappedDiscountType = discountType;
            if ("percentage".equals(discountType)) {
                mappedDiscountType = "percentage";
            } else if ("amount".equals(discountType)) {
                mappedDiscountType = "fixed";
            }
            
            // Create promo code object
            PromoCode promoCode = new PromoCode(code.trim().toUpperCase(), description, mappedDiscountType, 
                                              discountValue, startDate, endDate);
            promoCode.setMinimumOrderAmount(minimumOrderAmount);
            promoCode.setUsageLimit(usageLimit);
            promoCode.setStatus(status != null ? status : "active");
            promoCode.setCreatedBy(currentAdminId);
            
            System.out.println("DEBUG: PromoCode object created:");
            System.out.println("  ID: " + promoCode.getId());
            System.out.println("  Code: " + promoCode.getCode());
            System.out.println("  Created By: " + promoCode.getCreatedBy());
            System.out.println("  Discount Type: " + promoCode.getDiscountType());
            
            // Save to database
            if (promoCodeDAO.createPromoCode(promoCode)) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Promo code created successfully");
                responseObj.addProperty("promoCodeId", promoCode.getId());
                
                out.print(responseObj.toString());
                
                System.out.println("DEBUG: Created promo code successfully - " + promoCode.getCode());
            } else {
                sendErrorResponse(response, "Failed to create promo code");
            }
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error creating promo code - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error creating promo code: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update promo code
     */
    private void handleUpdatePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            // Get promo code ID
            String promoCodeIdStr = request.getParameter("promoCodeId");
            if (promoCodeIdStr == null || promoCodeIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code ID is required");
                return;
            }
            
            int promoCodeId;
            try {
                promoCodeId = Integer.parseInt(promoCodeIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid promo code ID");
                return;
            }
            
            // Get existing promo code
            PromoCode existingPromoCode = promoCodeDAO.getPromoCodeById(promoCodeId);
            if (existingPromoCode == null) {
                sendErrorResponse(response, "Promo code not found");
                return;
            }
            
            // Get form parameters
            String code = request.getParameter("code");
            String description = request.getParameter("description");
            String discountType = request.getParameter("discountType");
            String discountValueStr = request.getParameter("discountValue");
            String minimumOrderAmountStr = request.getParameter("minimumOrderAmount");
            String usageLimitStr = request.getParameter("usageLimit");
            String startDateStr = request.getParameter("startDate");
            String endDateStr = request.getParameter("endDate");
            String status = request.getParameter("status");
            
            // Validation
            if (code == null || code.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code is required");
                return;
            }
            
            // Check if code already exists (excluding current promo code)
            if (promoCodeDAO.promoCodeExists(code.trim(), promoCodeId)) {
                sendErrorResponse(response, "Promo code already exists");
                return;
            }
            
            // Parse and validate data (similar to create method)
            BigDecimal discountValue;
            try {
                discountValue = new BigDecimal(discountValueStr);
                if (discountValue.compareTo(BigDecimal.ZERO) <= 0) {
                    sendErrorResponse(response, "Discount value must be greater than 0");
                    return;
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid discount value");
                return;
            }
            
            // Fix discount type mapping
            String mappedDiscountType = discountType;
            if ("percentage".equals(discountType)) {
                mappedDiscountType = "percentage";
            } else if ("amount".equals(discountType)) {
                mappedDiscountType = "fixed";
            }
            
            if ("percentage".equals(mappedDiscountType) && 
                discountValue.compareTo(new BigDecimal(100)) > 0) {
                sendErrorResponse(response, "Percentage discount cannot exceed 100%");
                return;
            }
            
            BigDecimal minimumOrderAmount = null;
            if (minimumOrderAmountStr != null && !minimumOrderAmountStr.trim().isEmpty()) {
                try {
                    minimumOrderAmount = new BigDecimal(minimumOrderAmountStr);
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid minimum order amount");
                    return;
                }
            }
            
            Integer usageLimit = null;
            if (usageLimitStr != null && !usageLimitStr.trim().isEmpty()) {
                try {
                    usageLimit = Integer.parseInt(usageLimitStr);
                    if (usageLimit <= 0) {
                        sendErrorResponse(response, "Usage limit must be greater than 0");
                        return;
                    }
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid usage limit");
                    return;
                }
            }
            
            Date startDate, endDate;
            try {
                startDate = new Date(dateFormat.parse(startDateStr).getTime());
                endDate = new Date(dateFormat.parse(endDateStr).getTime());
                
                if (endDate.before(startDate)) {
                    sendErrorResponse(response, "End date must be after start date");
                    return;
                }
            } catch (ParseException e) {
                sendErrorResponse(response, "Invalid date format");
                return;
            }
            
            // Update promo code object
            existingPromoCode.setCode(code.trim().toUpperCase());
            existingPromoCode.setDescription(description);
            existingPromoCode.setDiscountType(mappedDiscountType);
            existingPromoCode.setDiscountValue(discountValue);
            existingPromoCode.setMinimumOrderAmount(minimumOrderAmount);
            existingPromoCode.setUsageLimit(usageLimit);
            existingPromoCode.setStartDate(startDate);
            existingPromoCode.setEndDate(endDate);
            existingPromoCode.setStatus(status != null ? status : "active");
            
            // Update in database
            if (promoCodeDAO.updatePromoCode(existingPromoCode)) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Promo code updated successfully");
                
                out.print(responseObj.toString());
                
                System.out.println("DEBUG: Updated promo code - " + existingPromoCode.getCode());
            } else {
                sendErrorResponse(response, "Failed to update promo code");
            }
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error updating promo code - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error updating promo code: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle delete promo code
     */
    private void handleDeletePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            String promoCodeIdStr = request.getParameter("promoCodeId");
            
            if (promoCodeIdStr == null || promoCodeIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code ID is required");
                return;
            }
            
            int promoCodeId;
            try {
                promoCodeId = Integer.parseInt(promoCodeIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid promo code ID");
                return;
            }
            
            // Check if promo code exists
            PromoCode existingPromoCode = promoCodeDAO.getPromoCodeById(promoCodeId);
            if (existingPromoCode == null) {
                sendErrorResponse(response, "Promo code not found");
                return;
            }
            
            // Delete promo code
            if (promoCodeDAO.deletePromoCode(promoCodeId)) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Promo code deleted successfully");
                
                out.print(responseObj.toString());
                
                System.out.println("DEBUG: Deleted promo code - " + existingPromoCode.getCode());
            } else {
                sendErrorResponse(response, "Failed to delete promo code");
            }
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error deleting promo code - " + e.getMessage());
            sendErrorResponse(response, "Error deleting promo code: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle validate promo code (for customer use)
     */
    private void handleValidatePromoCode(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            String code = request.getParameter("code");
            String orderAmountStr = request.getParameter("orderAmount");
            
            if (code == null || code.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code is required");
                return;
            }
            
            BigDecimal orderAmount = BigDecimal.ZERO;
            if (orderAmountStr != null && !orderAmountStr.trim().isEmpty()) {
                try {
                    orderAmount = new BigDecimal(orderAmountStr);
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid order amount");
                    return;
                }
            }
            
            PromoCode promoCode = promoCodeDAO.getPromoCodeByCode(code.trim().toUpperCase());
            
            if (promoCode == null) {
                sendErrorResponse(response, "Promo code not found");
                return;
            }
            
            if (!promoCode.isValidForOrder(orderAmount)) {
                String reason = getValidationFailureReason(promoCode, orderAmount);
                sendErrorResponse(response, reason);
                return;
            }
            
            BigDecimal discountAmount = promoCode.calculateDiscount(orderAmount);
            
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Promo code is valid");
            responseObj.addProperty("discountAmount", discountAmount);
            responseObj.addProperty("discountType", promoCode.getDiscountType());
            responseObj.addProperty("discountValue", promoCode.getDiscountValue());
            responseObj.addProperty("description", promoCode.getDescription());
            
            out.print(responseObj.toString());
            
        } catch (Exception e) {
            System.err.println("AdminPromoCodeController: Error validating promo code - " + e.getMessage());
            sendErrorResponse(response, "Error validating promo code: " + e.getMessage());
        } finally {
            out.close();
        }
    }
    
    /**
     * Get validation failure reason
     */
    private String getValidationFailureReason(PromoCode promoCode, BigDecimal orderAmount) {
        if (!"active".equals(promoCode.getStatus())) {
            return "Promo code is not active";
        }
        
        Date today = new Date(System.currentTimeMillis());
        if (promoCode.getEndDate().before(today)) {
            return "Promo code has expired";
        }
        
        if (promoCode.getStartDate().after(today)) {
            return "Promo code is not yet valid";
        }
        
        if (promoCode.getUsageLimit() != null && 
            promoCode.getUsageCount() >= promoCode.getUsageLimit()) {
            return "Promo code usage limit reached";
        }
        
        if (promoCode.getMinimumOrderAmount() != null && 
            orderAmount.compareTo(promoCode.getMinimumOrderAmount()) < 0) {
            return "Order amount does not meet minimum requirement of Rs. " + 
                   promoCode.getMinimumOrderAmount();
        }
        
        return "Promo code is not valid";
    }
    
    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        JsonObject responseObj = new JsonObject();
        responseObj.addProperty("success", false);
        responseObj.addProperty("message", message);
        
        out.print(responseObj.toString());
        out.flush();
        
        System.err.println("DEBUG: Error response sent - " + message);
    }
    
    @Override
    public void destroy() {
        System.out.println("AdminPromoCodeController: Being destroyed");
        promoCodeDAO = null;
        gson = null;
        dateFormat = null;
        super.destroy();
    }
}
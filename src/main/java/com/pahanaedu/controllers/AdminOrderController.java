package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.models.Order;

/**
 * Enhanced Admin Order Management Controller with Comprehensive Promo Code Support
 * Handles all order-related admin operations: viewing, statistics, status updates, and promo code tracking
 */
@WebServlet({"/admin/orders/*", "/admin/order-stats"})
public class AdminOrderController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private OrderDAO orderDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            gson = new Gson();
            System.out.println("AdminOrderController: Initialized successfully with promo code support");
        } catch (Exception e) {
            System.err.println("AdminOrderController: Failed to initialize - " + e.getMessage());
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
        
        System.out.println("AdminOrderController: ServletPath = " + servletPath + ", PathInfo = " + pathInfo);
        
        // Handle statistics endpoint
        if ("/admin/order-stats".equals(servletPath)) {
            handleGetOrderStats(request, response);
            return;
        }
        
        // Handle orders endpoints
        if ("/admin/orders".equals(servletPath)) {
            if (pathInfo == null || pathInfo.equals("/")) {
                handleGetOrders(request, response);
            } else if (pathInfo.equals("/stats")) {
                handleGetOrderStats(request, response);
            } else {
                sendErrorResponse(response, "Invalid operation: " + pathInfo);
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

        if (pathInfo.equals("/update-status")) {
            handleUpdateOrderStatus(request, response);
        } else {
            sendErrorResponse(response, "Invalid operation: " + pathInfo);
        }
    }

    /**
     * Check admin authorization
     */
    private boolean isAdminAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            System.out.println("AdminOrderController: No session found");
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        System.out.println("AdminOrderController: isLoggedIn=" + isLoggedIn + ", userRole=" + userRole);
        return Boolean.TRUE.equals(isLoggedIn) && "ADMIN".equals(userRole);
    }

    /**
     * Handle get orders with filtering and promo code support
     */
    private void handleGetOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String statusFilter = request.getParameter("status");
            String paymentFilter = request.getParameter("payment");
            String dateFilter = request.getParameter("date");

            System.out.println("AdminOrderController: Filters - Status: " + statusFilter + 
                             ", Payment: " + paymentFilter + ", Date: " + dateFilter);

            List<Order> allOrders = orderDAO.getAllOrders();
            System.out.println("AdminOrderController: Total orders from DAO: " + allOrders.size());
            
            // Apply filters
            List<Order> filteredOrders = allOrders.stream()
                .filter(order -> {
                    if (statusFilter != null && !statusFilter.isEmpty() && 
                        !statusFilter.equals(order.getStatus())) return false;
                    if (paymentFilter != null && !paymentFilter.isEmpty() && 
                        !paymentFilter.equals(order.getPaymentMethod())) return false;
                    if (dateFilter != null && !dateFilter.isEmpty() && 
                        !matchesDateFilter(order, dateFilter)) return false;
                    return true;
                })
                .collect(Collectors.toList());

            System.out.println("AdminOrderController: Filtered orders: " + filteredOrders.size());

            // Count orders with promo codes for logging
            long ordersWithPromo = filteredOrders.stream()
                .filter(order -> order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty())
                .count();
            System.out.println("AdminOrderController: Orders with promo codes: " + ordersWithPromo);

            // Build response
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Orders retrieved successfully");
            responseObj.addProperty("totalCount", allOrders.size());
            responseObj.addProperty("filteredCount", filteredOrders.size());
            responseObj.addProperty("ordersWithPromo", ordersWithPromo);

            JsonArray ordersArray = new JsonArray();
            for (Order order : filteredOrders) {
                JsonObject orderObj = createOrderJsonObject(order);
                ordersArray.add(orderObj);
            }

            responseObj.add("orders", ordersArray);
            out.print(responseObj.toString());

            System.out.println("AdminOrderController: Response sent successfully");

        } catch (Exception e) {
            System.err.println("AdminOrderController: Error retrieving orders - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving orders: " + e.getMessage());
        } finally {
            out.close();
        }
    }

    /**
     * Handle get order statistics with promo code analytics
     */
    private void handleGetOrderStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            System.out.println("AdminOrderController: Getting order statistics with promo analytics...");
            
            List<Order> allOrders = orderDAO.getAllOrders();
            System.out.println("AdminOrderController: Total orders for stats: " + allOrders.size());
            
            // Calculate basic statistics
            int totalOrders = allOrders.size();
            int pendingOrders = 0;
            int confirmedOrders = 0;
            int shippedOrders = 0;
            int deliveredOrders = 0;
            int cancelledOrders = 0;
            BigDecimal totalRevenue = BigDecimal.ZERO;
            
            // Enhanced statistics for promo codes
            int ordersWithPromo = 0;
            BigDecimal totalDiscount = BigDecimal.ZERO;
            BigDecimal revenueWithoutDiscount = BigDecimal.ZERO;

            for (Order order : allOrders) {
                String status = order.getStatus();
                switch (status != null ? status : "unknown") {
                    case Order.STATUS_PENDING: 
                        pendingOrders++; 
                        break;
                    case Order.STATUS_CONFIRMED: 
                        confirmedOrders++; 
                        break;
                    case Order.STATUS_SHIPPED: 
                        shippedOrders++; 
                        break;
                    case Order.STATUS_DELIVERED: 
                        deliveredOrders++; 
                        break;
                    case Order.STATUS_CANCELLED: 
                        cancelledOrders++; 
                        break;
                    default:
                        System.out.println("AdminOrderController: Unknown status: " + status);
                        break;
                }
                
                // Calculate revenue (exclude cancelled orders)
                if (!Order.STATUS_CANCELLED.equals(order.getStatus())) {
                    BigDecimal amount = order.getTotalAmount();
                    if (amount != null) {
                        totalRevenue = totalRevenue.add(amount);
                        
                        // Calculate promo code statistics
                        if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                            ordersWithPromo++;
                            
                            // Calculate discount amount
                            BigDecimal discount = calculateOrderDiscount(order);
                            if (discount.compareTo(BigDecimal.ZERO) > 0) {
                                totalDiscount = totalDiscount.add(discount);
                                revenueWithoutDiscount = revenueWithoutDiscount.add(amount.add(discount));
                            } else {
                                revenueWithoutDiscount = revenueWithoutDiscount.add(amount);
                            }
                        } else {
                            revenueWithoutDiscount = revenueWithoutDiscount.add(amount);
                        }
                    }
                }
            }

            System.out.println("AdminOrderController: Stats calculated - Pending: " + pendingOrders + 
                             ", Confirmed: " + confirmedOrders + ", Revenue: " + totalRevenue +
                             ", Orders with promo: " + ordersWithPromo + ", Total discount: " + totalDiscount);

            // Build response
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Statistics retrieved successfully");

            JsonObject statsObj = new JsonObject();
            statsObj.addProperty("totalOrders", totalOrders);
            statsObj.addProperty("pendingOrders", pendingOrders);
            statsObj.addProperty("confirmedOrders", confirmedOrders);
            statsObj.addProperty("shippedOrders", shippedOrders);
            statsObj.addProperty("deliveredOrders", deliveredOrders);
            statsObj.addProperty("cancelledOrders", cancelledOrders);
            statsObj.addProperty("totalRevenue", totalRevenue);
            
            // Enhanced promo code statistics
            statsObj.addProperty("ordersWithPromo", ordersWithPromo);
            statsObj.addProperty("totalDiscount", totalDiscount);
            statsObj.addProperty("revenueWithoutDiscount", revenueWithoutDiscount);
            
            // Calculate promo usage percentage
            double promoUsageRate = totalOrders > 0 ? (double) ordersWithPromo / totalOrders * 100 : 0;
            statsObj.addProperty("promoUsageRate", Math.round(promoUsageRate * 100.0) / 100.0);

            responseObj.add("stats", statsObj);
            out.print(responseObj.toString());

            System.out.println("AdminOrderController: Enhanced stats response sent successfully");

        } catch (Exception e) {
            System.err.println("AdminOrderController: Error getting statistics - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error retrieving statistics: " + e.getMessage());
        } finally {
            out.close();
        }
    }

    /**
     * Handle update order status
     */
    private void handleUpdateOrderStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String orderIdStr = request.getParameter("orderId");
            String newStatus = request.getParameter("status");

            System.out.println("AdminOrderController: Update status request - OrderID: " + orderIdStr + 
                             ", Status: " + newStatus);

            // Validation
            if (orderIdStr == null || orderIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Order ID is required");
                return;
            }

            if (newStatus == null || newStatus.trim().isEmpty()) {
                sendErrorResponse(response, "Status is required");
                return;
            }

            int orderId;
            try {
                orderId = Integer.parseInt(orderIdStr);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid order ID format");
                return;
            }

            if (!isValidStatus(newStatus)) {
                sendErrorResponse(response, "Invalid status value: " + newStatus);
                return;
            }

            Order currentOrder = orderDAO.getOrderById(orderId);
            if (currentOrder == null) {
                sendErrorResponse(response, "Order not found with ID: " + orderId);
                return;
            }

            if (!isValidStatusTransition(currentOrder.getStatus(), newStatus)) {
                sendErrorResponse(response, "Invalid status transition from " + 
                                getStatusDisplay(currentOrder.getStatus()) + " to " + 
                                getStatusDisplay(newStatus));
                return;
            }

            boolean success = orderDAO.updateOrderStatus(orderId, newStatus);

            if (success) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order status updated to " + getStatusDisplay(newStatus));
                responseObj.addProperty("orderId", orderId);
                responseObj.addProperty("newStatus", newStatus);
                responseObj.addProperty("previousStatus", currentOrder.getStatus());
                
                // Log promo code information if available
                if (currentOrder.getPromoCode() != null && !currentOrder.getPromoCode().trim().isEmpty()) {
                    System.out.println("AdminOrderController: Updated order " + orderId + 
                                     " with promo code " + currentOrder.getPromoCode());
                }
                
                out.print(responseObj.toString());
                
                System.out.println("AdminOrderController: Order " + orderId + " status updated from " + 
                                 currentOrder.getStatus() + " to " + newStatus);
            } else {
                sendErrorResponse(response, "Failed to update order status in database");
            }

        } catch (Exception e) {
            System.err.println("AdminOrderController: Error updating order status - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error updating order status: " + e.getMessage());
        } finally {
            out.close();
        }
    }

    /**
     * Create comprehensive JSON object for order with full promo code support
     */
    private JsonObject createOrderJsonObject(Order order) {
        JsonObject orderObj = new JsonObject();
        
        // Basic order information
        orderObj.addProperty("id", order.getId());
        orderObj.addProperty("userId", order.getUserId());
        orderObj.addProperty("customerName", order.getCustomerName());
        orderObj.addProperty("customerEmail", order.getCustomerEmail());
        orderObj.addProperty("totalAmount", order.getTotalAmount());
        orderObj.addProperty("status", order.getStatus());
        orderObj.addProperty("paymentMethod", order.getPaymentMethod());
        orderObj.addProperty("contactNumber", order.getContactNumber());
        orderObj.addProperty("shippingAddress", order.getShippingAddress());
        orderObj.addProperty("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        orderObj.addProperty("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null);
        orderObj.addProperty("orderNotes", order.getOrderNotes());
        
        // Enhanced pricing information with promo code support
        if (order.getSubtotal() != null) {
            orderObj.addProperty("subtotal", order.getSubtotal());
        }
        
        if (order.getShippingAmount() != null) {
            orderObj.addProperty("shippingAmount", order.getShippingAmount());
        }
        
        if (order.getDiscountAmount() != null) {
            orderObj.addProperty("discountAmount", order.getDiscountAmount());
        }
        
        // Promo code information
        if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
            orderObj.addProperty("promoCode", order.getPromoCode());
            System.out.println("AdminOrderController: Order " + order.getId() + " has promo code: " + order.getPromoCode());
        }
        
        // Transaction ID for online payments
        if (order.getTransactionId() != null && !order.getTransactionId().trim().isEmpty()) {
            orderObj.addProperty("transactionId", order.getTransactionId());
        }
        
        // Calculate breakdown for admin dashboard compatibility
        BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal shipping = order.getShippingAmount() != null ? order.getShippingAmount() : BigDecimal.ZERO;
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        
        // If we don't have breakdown data, calculate from order items
        if (subtotal.equals(BigDecimal.ZERO) && order.getOrderItems() != null) {
            subtotal = order.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Apply free shipping rule
            shipping = subtotal.compareTo(new BigDecimal("3000")) >= 0 ? BigDecimal.ZERO : new BigDecimal("250");
            
            // Calculate discount if total amount is available
            if (order.getTotalAmount() != null) {
                BigDecimal expectedTotal = subtotal.add(shipping);
                discount = expectedTotal.subtract(order.getTotalAmount());
                if (discount.compareTo(BigDecimal.ZERO) < 0) {
                    discount = BigDecimal.ZERO;
                }
            }
        }
        
        // Add calculated values for admin dashboard
        orderObj.addProperty("calculatedSubtotal", subtotal);
        orderObj.addProperty("calculatedShipping", shipping);
        orderObj.addProperty("calculatedDiscount", discount);
        
        // Add promo code savings information for admin dashboard
        if (discount.compareTo(BigDecimal.ZERO) > 0 && order.getPromoCode() != null) {
            orderObj.addProperty("promoSavings", discount);
            orderObj.addProperty("hasPromoDiscount", true);
        } else {
            orderObj.addProperty("hasPromoDiscount", false);
        }
        
        // Add payment status information
        if ("online".equals(order.getPaymentMethod())) {
            orderObj.addProperty("isOnlinePayment", true);
            orderObj.addProperty("paymentStatus", order.getTransactionId() != null ? "completed" : "pending");
        } else {
            orderObj.addProperty("isOnlinePayment", false);
            orderObj.addProperty("paymentStatus", "cod");
        }

        // Enhanced order items with totals
        JsonArray itemsArray = new JsonArray();
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> {
                JsonObject itemObj = new JsonObject();
                itemObj.addProperty("id", item.getId());
                itemObj.addProperty("itemId", item.getItemId());
                itemObj.addProperty("itemTitle", item.getItemTitle());
                itemObj.addProperty("itemAuthor", item.getItemAuthor());
                itemObj.addProperty("itemImagePath", item.getItemImagePath());
                itemObj.addProperty("quantity", item.getQuantity());
                itemObj.addProperty("price", item.getPrice());
                
                // Calculate item total for admin dashboard
                BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
                itemObj.addProperty("itemTotal", itemTotal);
                
                itemsArray.add(itemObj);
            });
        }
        orderObj.add("orderItems", itemsArray);
        
        // Add summary information for admin dashboard
        orderObj.addProperty("itemCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
        int totalQuantity = order.getOrderItems() != null ? 
            order.getOrderItems().stream().mapToInt(item -> item.getQuantity()).sum() : 0;
        orderObj.addProperty("totalQuantity", totalQuantity);

        return orderObj;
    }

    /**
     * Calculate discount amount for an order
     */
    private BigDecimal calculateOrderDiscount(Order order) {
        if (order.getDiscountAmount() != null) {
            return order.getDiscountAmount();
        }
        
        // Calculate discount if not stored directly
        if (order.getOrderItems() != null && order.getTotalAmount() != null) {
            BigDecimal subtotal = order.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal shipping = subtotal.compareTo(new BigDecimal("3000")) >= 0 ? 
                                 BigDecimal.ZERO : new BigDecimal("250");
            
            BigDecimal expectedTotal = subtotal.add(shipping);
            BigDecimal discount = expectedTotal.subtract(order.getTotalAmount());
            
            return discount.compareTo(BigDecimal.ZERO) > 0 ? discount : BigDecimal.ZERO;
        }
        
        return BigDecimal.ZERO;
    }

    /**
     * Check if date matches filter
     */
    private boolean matchesDateFilter(Order order, String dateFilter) {
        if (order.getCreatedAt() == null) return false;
        
        LocalDate orderDate = order.getCreatedAt().toLocalDateTime().toLocalDate();
        LocalDate today = LocalDate.now();
        
        switch (dateFilter) {
            case "today": 
                return orderDate.equals(today);
            case "week": 
                return orderDate.isAfter(today.minusDays(7));
            case "month": 
                return orderDate.isAfter(today.minusDays(30));
            default: 
                return true;
        }
    }

    /**
     * Validate status value
     */
    private boolean isValidStatus(String status) {
        return status.equals(Order.STATUS_PENDING) ||
               status.equals(Order.STATUS_CONFIRMED) ||
               status.equals(Order.STATUS_SHIPPED) ||
               status.equals(Order.STATUS_DELIVERED) ||
               status.equals(Order.STATUS_CANCELLED);
    }

    /**
     * Check if status transition is valid
     */
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Cannot change from delivered or cancelled
        if (Order.STATUS_DELIVERED.equals(currentStatus) && !Order.STATUS_DELIVERED.equals(newStatus)) 
            return false;
        if (Order.STATUS_CANCELLED.equals(currentStatus) && !Order.STATUS_CANCELLED.equals(newStatus)) 
            return false;
            
        // Cannot go back to pending
        if (!Order.STATUS_PENDING.equals(currentStatus) && Order.STATUS_PENDING.equals(newStatus)) 
            return false;
            
        // Cannot skip steps (with some flexibility for admin)
        if (Order.STATUS_PENDING.equals(currentStatus) && Order.STATUS_SHIPPED.equals(newStatus)) 
            return false;
        if ((Order.STATUS_PENDING.equals(currentStatus) || Order.STATUS_CONFIRMED.equals(currentStatus)) 
            && Order.STATUS_DELIVERED.equals(newStatus)) 
            return false;
            
        return true;
    }

    /**
     * Get status display text
     */
    private String getStatusDisplay(String status) {
        if (status == null) return "Unknown";
        
        switch (status) {
            case Order.STATUS_PENDING: return "Pending";
            case Order.STATUS_CONFIRMED: return "Confirmed";
            case Order.STATUS_SHIPPED: return "Shipped";
            case Order.STATUS_DELIVERED: return "Delivered";
            case Order.STATUS_CANCELLED: return "Cancelled";
            default: return "Unknown";
        }
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
        
        System.err.println("AdminOrderController: Error response sent - " + message);
    }

    @Override
    public void destroy() {
        System.out.println("AdminOrderController: Being destroyed");
        orderDAO = null;
        gson = null;
        super.destroy();
    }
}
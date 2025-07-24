package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.pahanaedu.dao.CashierOrderDAO;
import com.pahanaedu.dao.ItemDAO;
import com.pahanaedu.dao.OrderDAO;
import com.pahanaedu.dao.PromoCodeDAO;
import com.pahanaedu.models.CashierOrder;
import com.pahanaedu.models.CashierOrderItem;
import com.pahanaedu.models.Item;
import com.pahanaedu.models.Order;
import com.pahanaedu.models.PromoCode;
import com.pahanaedu.models.User;

/**
 * Cashier Controller - Handles cashier operations
 * Only accessible by users with CASHIER role
 */
@WebServlet("/cashier/*")
public class CashierController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private CashierOrderDAO cashierOrderDAO;
    private ItemDAO itemDAO;
    private OrderDAO orderDAO;
    private PromoCodeDAO promoCodeDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            cashierOrderDAO = new CashierOrderDAO();
            itemDAO = new ItemDAO();
            orderDAO = new OrderDAO();
            promoCodeDAO = new PromoCodeDAO();
            System.out.println("CashierController: All DAOs initialized successfully");
        } catch (Exception e) {
            System.err.println("CashierController: Failed to initialize DAOs - " + e.getMessage());
            throw new ServletException("Failed to initialize DAOs", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check cashier authentication
        if (!isCashierAuthenticated(request)) {
            response.sendRedirect("login.jsp");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            response.sendRedirect("cashier-dashboard.jsp");
            return;
        }
        
        switch (pathInfo) {
            case "/items":
                handleGetItems(request, response);
                break;
            case "/search-items":
                handleSearchItems(request, response);
                break;
            case "/customer-orders":
                handleGetCustomerOrders(request, response);
                break;
            case "/cashier-orders":
                handleGetCashierOrders(request, response);
                break;
            case "/stats":
                handleGetStats(request, response);
                break;
            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check cashier authentication
        if (!isCashierAuthenticated(request)) {
            sendErrorResponse(response, "Access denied. Cashier authentication required.");
            return;
        }
        
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null) {
            sendErrorResponse(response, "Invalid request");
            return;
        }
        
        switch (pathInfo) {
            case "/create-order":
                handleCreateOrder(request, response);
                break;
            case "/validate-promo":
                handleValidatePromo(request, response);
                break;
            case "/print-order":
                handlePrintOrder(request, response);
                break;
            case "/update-order-status":
                handleUpdateOrderStatus(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }
    
    /**
     * Check if user is authenticated as cashier
     */
    private boolean isCashierAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            return false;
        }
        
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        
        return Boolean.TRUE.equals(isLoggedIn) && User.ROLE_CASHIER.equals(userRole);
    }
    
    /**
     * Get current cashier ID
     */
    private int getCurrentCashierId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object userObj = session.getAttribute("user");
            if (userObj != null) {
                try {
                    java.lang.reflect.Method getIdMethod = userObj.getClass().getMethod("getId");
                    Integer userId = (Integer) getIdMethod.invoke(userObj);
                    return userId != null ? userId : 1;
                } catch (Exception e) {
                    System.err.println("Error getting cashier ID: " + e.getMessage());
                }
            }
        }
        return 1; // Default fallback
    }
    
    /**
     * Handle get items request
     */
    private void handleGetItems(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<Item> items = itemDAO.getActiveItems();
            
            // Convert to JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"items\": [");
            
            for (int i = 0; i < items.size(); i++) {
                Item item = items.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(item.getId()).append(",")
                    .append("\"title\": \"").append(escapeJsonString(item.getTitle())).append("\",")
                    .append("\"author\": \"").append(escapeJsonString(item.getAuthor())).append("\",")
                    .append("\"categoryName\": \"").append(escapeJsonString(item.getCategoryName())).append("\",")
                    .append("\"price\": ").append(item.getPrice()).append(",")
                    .append("\"offerPrice\": ").append(item.getOfferPrice() != null ? item.getOfferPrice() : "null").append(",")
                    .append("\"stock\": ").append(item.getStock()).append(",")
                    .append("\"imagePath\": \"").append(escapeJsonString(item.getImagePath())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting items - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving items\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle search items request
     */
    private void handleSearchItems(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String searchQuery = request.getParameter("query");
            if (searchQuery == null || searchQuery.trim().isEmpty()) {
                out.print("{\"success\": false, \"message\": \"Search query is required\"}");
                return;
            }
            
            List<Item> items = itemDAO.searchItems(searchQuery.trim());
            
            // Convert to JSON (same format as get items)
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"items\": [");
            
            for (int i = 0; i < items.size(); i++) {
                Item item = items.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(item.getId()).append(",")
                    .append("\"title\": \"").append(escapeJsonString(item.getTitle())).append("\",")
                    .append("\"author\": \"").append(escapeJsonString(item.getAuthor())).append("\",")
                    .append("\"categoryName\": \"").append(escapeJsonString(item.getCategoryName())).append("\",")
                    .append("\"price\": ").append(item.getPrice()).append(",")
                    .append("\"offerPrice\": ").append(item.getOfferPrice() != null ? item.getOfferPrice() : "null").append(",")
                    .append("\"stock\": ").append(item.getStock()).append(",")
                    .append("\"imagePath\": \"").append(escapeJsonString(item.getImagePath())).append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CashierController: Error searching items - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error searching items\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get customer orders request
     */
    private void handleGetCustomerOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            List<Order> orders = orderDAO.getAllOrders();
            
            // Convert to JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"orders\": [");
            
            for (int i = 0; i < orders.size(); i++) {
                Order order = orders.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(order.getId()).append(",")
                    .append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",")
                    .append("\"customerEmail\": \"").append(escapeJsonString(order.getCustomerEmail())).append("\",")
                    .append("\"contactNumber\": \"").append(escapeJsonString(order.getContactNumber())).append("\",")
                    .append("\"totalAmount\": ").append(order.getTotalAmount()).append(",")
                    .append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",")
                    .append("\"paymentMethod\": \"").append(escapeJsonString(order.getPaymentMethod())).append("\",")
                    .append("\"createdAt\": \"").append(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting customer orders - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving customer orders\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get cashier orders request
     */
    private void handleGetCashierOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int cashierId = getCurrentCashierId(request);
            List<CashierOrder> orders = cashierOrderDAO.getOrdersByCashier(cashierId);
            
            // Convert to JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"orders\": [");
            
            for (int i = 0; i < orders.size(); i++) {
                CashierOrder order = orders.get(i);
                if (i > 0) jsonBuilder.append(",");
                
                jsonBuilder.append("{")
                    .append("\"id\": ").append(order.getId()).append(",")
                    .append("\"customerName\": \"").append(escapeJsonString(order.getCustomerName())).append("\",")
                    .append("\"customerPhone\": \"").append(escapeJsonString(order.getCustomerPhone())).append("\",")
                    .append("\"customerEmail\": \"").append(escapeJsonString(order.getCustomerEmail())).append("\",")
                    .append("\"totalAmount\": ").append(order.getTotalAmount()).append(",")
                    .append("\"discountAmount\": ").append(order.getDiscountAmount() != null ? order.getDiscountAmount() : 0).append(",")
                    .append("\"promoCode\": \"").append(escapeJsonString(order.getPromoCode())).append("\",")
                    .append("\"status\": \"").append(escapeJsonString(order.getStatus())).append("\",")
                    .append("\"paymentMethod\": \"").append(escapeJsonString(order.getPaymentMethod())).append("\",")
                    .append("\"orderType\": \"").append(escapeJsonString(order.getOrderType())).append("\",")
                    .append("\"createdAt\": \"").append(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "").append("\"")
                    .append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting cashier orders - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving cashier orders\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle get statistics request
     */
    private void handleGetStats(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int cashierId = getCurrentCashierId(request);
            
            // Get cashier-specific stats
            int todayOrders = cashierOrderDAO.getTodayOrdersCount(cashierId);
            BigDecimal todayRevenue = cashierOrderDAO.getTodayRevenue(cashierId);
            int totalOrders = cashierOrderDAO.getTotalOrdersCount(cashierId);
            
            // Get general stats
            int totalItems = itemDAO.countItemsByStatus("active");
            
            String jsonResponse = String.format(
                "{\"success\": true, \"stats\": {" +
                "\"todayOrders\": %d, " +
                "\"todayRevenue\": %s, " +
                "\"totalOrders\": %d, " +
                "\"totalItems\": %d" +
                "}}",
                todayOrders, todayRevenue != null ? todayRevenue : BigDecimal.ZERO, 
                totalOrders, totalItems
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("CashierController: Error getting stats - " + e.getMessage());
            out.print("{\"success\": false, \"message\": \"Error retrieving statistics\"}");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle create order request
     */
    private void handleCreateOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            int cashierId = getCurrentCashierId(request);
            
            // Get order details
            String customerName = request.getParameter("customerName");
            String customerPhone = request.getParameter("customerPhone");
            String customerEmail = request.getParameter("customerEmail");
            String orderType = request.getParameter("orderType");
            String paymentMethod = request.getParameter("paymentMethod");
            String promoCode = request.getParameter("promoCode");
            String notes = request.getParameter("notes");
            String itemsJson = request.getParameter("items");
            
            // Validation
            if (customerName == null || customerName.trim().isEmpty()) {
                sendErrorResponse(response, "Customer name is required");
                return;
            }
            
            if (itemsJson == null || itemsJson.trim().isEmpty()) {
                sendErrorResponse(response, "Order items are required");
                return;
            }
            
            // Parse items (simple JSON parsing)
            List<CashierOrderItem> orderItems = parseOrderItems(itemsJson);
            if (orderItems.isEmpty()) {
                sendErrorResponse(response, "Invalid order items");
                return;
            }
            
            // Calculate totals
            BigDecimal subtotal = BigDecimal.ZERO;
            for (CashierOrderItem item : orderItems) {
                subtotal = subtotal.add(item.getTotalPrice());
            }
            
            BigDecimal discountAmount = BigDecimal.ZERO;
            
            // Apply promo code if provided
            if (promoCode != null && !promoCode.trim().isEmpty()) {
                PromoCode promo = promoCodeDAO.getPromoCodeByCode(promoCode.trim());
                if (promo != null && promo.isValidForOrder(subtotal)) {
                    discountAmount = promo.calculateDiscount(subtotal);
                    promoCodeDAO.incrementUsageCount(promo.getId());
                }
            }
            
            BigDecimal totalAmount = subtotal.subtract(discountAmount);
            
            // Create order
            CashierOrder order = new CashierOrder();
            order.setCashierId(cashierId);
            order.setCustomerName(customerName.trim());
            order.setCustomerPhone(customerPhone != null ? customerPhone.trim() : null);
            order.setCustomerEmail(customerEmail != null ? customerEmail.trim() : null);
            order.setSubtotal(subtotal);
            order.setDiscountAmount(discountAmount);
            order.setTotalAmount(totalAmount);
            order.setPromoCode(promoCode != null ? promoCode.trim() : null);
            order.setOrderType(orderType != null ? orderType : "walk_in");
            order.setPaymentMethod(paymentMethod != null ? paymentMethod : "cash");
            order.setNotes(notes);
            order.setOrderItems(orderItems);
            
            if (cashierOrderDAO.createOrder(order)) {
                sendSuccessResponse(response, "Order created successfully", order.getId());
            } else {
                sendErrorResponse(response, "Failed to create order");
            }
            
        } catch (Exception e) {
            System.err.println("CashierController: Error creating order - " + e.getMessage());
            sendErrorResponse(response, "Error creating order");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle validate promo code request
     */
    private void handleValidatePromo(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String promoCode = request.getParameter("promoCode");
            String subtotalStr = request.getParameter("subtotal");
            
            if (promoCode == null || promoCode.trim().isEmpty()) {
                sendErrorResponse(response, "Promo code is required");
                return;
            }
            
            BigDecimal subtotal = BigDecimal.ZERO;
            if (subtotalStr != null) {
                try {
                    subtotal = new BigDecimal(subtotalStr);
                } catch (NumberFormatException e) {
                    sendErrorResponse(response, "Invalid subtotal amount");
                    return;
                }
            }
            
            PromoCode promo = promoCodeDAO.getPromoCodeByCode(promoCode.trim());
            
            if (promo == null) {
                sendErrorResponse(response, "Promo code not found");
                return;
            }
            
            if (!promo.isValidForOrder(subtotal)) {
                sendErrorResponse(response, "Promo code is not valid for this order");
                return;
            }
            
            BigDecimal discountAmount = promo.calculateDiscount(subtotal);
            
            String jsonResponse = String.format(
                "{\"success\": true, \"message\": \"Promo code is valid\", " +
                "\"discountAmount\": %s, \"description\": \"%s\"}",
                discountAmount, escapeJsonString(promo.getDescription())
            );
            
            out.print(jsonResponse);
            
        } catch (Exception e) {
            System.err.println("CashierController: Error validating promo - " + e.getMessage());
            sendErrorResponse(response, "Error validating promo code");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle print order request
     */
    private void handlePrintOrder(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String orderIdStr = request.getParameter("orderId");
            
            if (orderIdStr == null || orderIdStr.trim().isEmpty()) {
                sendErrorResponse(response, "Order ID is required");
                return;
            }
            
            int orderId = Integer.parseInt(orderIdStr);
            
            if (cashierOrderDAO.markAsPrinted(orderId)) {
                sendSuccessResponse(response, "Order marked as printed");
            } else {
                sendErrorResponse(response, "Failed to mark order as printed");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        } catch (Exception e) {
            System.err.println("CashierController: Error printing order - " + e.getMessage());
            sendErrorResponse(response, "Error printing order");
        } finally {
            out.close();
        }
    }
    
    /**
     * Handle update order status request
     */
    private void handleUpdateOrderStatus(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            String orderIdStr = request.getParameter("orderId");
            String status = request.getParameter("status");
            
            if (orderIdStr == null || status == null) {
                sendErrorResponse(response, "Order ID and status are required");
                return;
            }
            
            int orderId = Integer.parseInt(orderIdStr);
            
            if (cashierOrderDAO.updateOrderStatus(orderId, status)) {
                sendSuccessResponse(response, "Order status updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update order status");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid order ID");
        } catch (Exception e) {
            System.err.println("CashierController: Error updating order status - " + e.getMessage());
            sendErrorResponse(response, "Error updating order status");
        } finally {
            out.close();
        }
    }
    
    /**
     * Parse order items from JSON string (simple parsing)
     */
    private List<CashierOrderItem> parseOrderItems(String itemsJson) {
        List<CashierOrderItem> items = new ArrayList<>();
        
        try {
            // Simple JSON parsing - expecting format: [{"itemId":1,"quantity":2,"price":100.00}]
            itemsJson = itemsJson.trim();
            if (itemsJson.startsWith("[") && itemsJson.endsWith("]")) {
                itemsJson = itemsJson.substring(1, itemsJson.length() - 1);
                
                String[] itemStrings = itemsJson.split("\\},\\{");
                
                for (String itemStr : itemStrings) {
                    itemStr = itemStr.replace("{", "").replace("}", "");
                    String[] pairs = itemStr.split(",");
                    
                    CashierOrderItem item = new CashierOrderItem();
                    
                    for (String pair : pairs) {
                        String[] keyValue = pair.split(":");
                        if (keyValue.length == 2) {
                            String key = keyValue[0].replace("\"", "").trim();
                            String value = keyValue[1].replace("\"", "").trim();
                            
                            switch (key) {
                                case "itemId":
                                    item.setItemId(Integer.parseInt(value));
                                    break;
                                case "quantity":
                                    item.setQuantity(Integer.parseInt(value));
                                    break;
                                case "price":
                                    BigDecimal unitPrice = new BigDecimal(value);
                                    item.setUnitPrice(unitPrice);
                                    item.setTotalPrice(unitPrice.multiply(new BigDecimal(item.getQuantity())));
                                    break;
                            }
                        }
                    }
                    
                    if (item.getItemId() > 0 && item.getQuantity() > 0) {
                        items.add(item);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("CashierController: Error parsing order items - " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Send success response
     */
    private void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        sendSuccessResponse(response, message, null);
    }
    
    private void sendSuccessResponse(HttpServletResponse response, String message, Integer orderId) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        PrintWriter out = response.getWriter();
        
        StringBuilder jsonResponse = new StringBuilder();
        jsonResponse.append("{\"success\": true, \"message\": \"")
                   .append(escapeJsonString(message))
                   .append("\"");
        
        if (orderId != null) {
            jsonResponse.append(", \"orderId\": ").append(orderId);
        }
        
        jsonResponse.append("}");
        
        out.print(jsonResponse.toString());
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
        System.out.println("CashierController: Controller being destroyed");
        cashierOrderDAO = null;
        itemDAO = null;
        orderDAO = null;
        promoCodeDAO = null;
        super.destroy();
    }
}
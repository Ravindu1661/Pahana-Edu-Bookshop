package com.pahanaedu.controllers;

import java.io.IOException;
import java.io.PrintWriter;
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

@WebServlet("/admin/orders/*")
public class AdminOrderController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private OrderDAO orderDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        try {
            orderDAO = new OrderDAO();
            gson = new Gson();
        } catch (Exception e) {
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

        String pathInfo = request.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            handleGetOrders(request, response);
        } else {
            sendErrorResponse(response, "Invalid operation");
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
            case "/update-status":
                handleUpdateOrderStatus(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid operation");
        }
    }

    private boolean isAdminAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String userRole = (String) session.getAttribute("userRole");
        return Boolean.TRUE.equals(isLoggedIn) && "ADMIN".equals(userRole);
    }

    private void handleGetOrders(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String statusFilter = request.getParameter("status");
            String paymentFilter = request.getParameter("payment");
            String dateFilter = request.getParameter("date");

            List<Order> allOrders = orderDAO.getAllOrders();

            List<Order> filteredOrders = allOrders.stream()
                .filter(order -> {
                    if (statusFilter != null && !statusFilter.isEmpty() && !statusFilter.equals(order.getStatus())) return false;
                    if (paymentFilter != null && !paymentFilter.isEmpty() && !paymentFilter.equals(order.getPaymentMethod())) return false;
                    if (dateFilter != null && !dateFilter.isEmpty() && !matchesDateFilter(order, dateFilter)) return false;
                    return true;
                })
                .collect(Collectors.toList());

            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            responseObj.addProperty("message", "Orders retrieved successfully");
            responseObj.addProperty("totalCount", allOrders.size());
            responseObj.addProperty("filteredCount", filteredOrders.size());

            JsonArray ordersArray = new JsonArray();
            for (Order order : filteredOrders) {
                JsonObject orderObj = new JsonObject();
                orderObj.addProperty("id", order.getId());
                orderObj.addProperty("userId", order.getUserId());
                orderObj.addProperty("customerName", order.getCustomerName());
                orderObj.addProperty("customerEmail", order.getCustomerEmail());
                orderObj.addProperty("totalAmount", order.getTotalAmount());
                orderObj.addProperty("status", order.getStatus());
                orderObj.addProperty("paymentMethod", order.getPaymentMethod());
                orderObj.addProperty("contactNumber", order.getContactNumber());
                orderObj.addProperty("shippingAddress", order.getShippingAddress());
                orderObj.addProperty("createdAt", order.getCreatedAt().toString());
                orderObj.addProperty("updatedAt", order.getUpdatedAt().toString());

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
                        itemsArray.add(itemObj);
                    });
                }
                orderObj.add("orderItems", itemsArray);

                ordersArray.add(orderObj);
            }

            responseObj.add("orders", ordersArray);
            out.print(responseObj.toString());

        } catch (Exception e) {
            sendErrorResponse(response, "Error retrieving orders: " + e.getMessage());
        } finally {
            out.close();
        }
    }

    private void handleUpdateOrderStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String orderIdStr = request.getParameter("orderId");
            String newStatus = request.getParameter("status");

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
                sendErrorResponse(response, "Invalid status value");
                return;
            }

            Order currentOrder = orderDAO.getOrderById(orderId);
            if (currentOrder == null) {
                sendErrorResponse(response, "Order not found");
                return;
            }

            if (!isValidStatusTransition(currentOrder.getStatus(), newStatus)) {
                sendErrorResponse(response, "Invalid status transition from " + getStatusDisplay(currentOrder.getStatus()) + " to " + getStatusDisplay(newStatus));
                return;
            }

            boolean success = orderDAO.updateOrderStatus(orderId, newStatus);

            if (success) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Order status updated to " + getStatusDisplay(newStatus));
                responseObj.addProperty("orderId", orderId);
                responseObj.addProperty("newStatus", newStatus);
                out.print(responseObj.toString());
            } else {
                sendErrorResponse(response, "Failed to update order status");
            }

        } catch (Exception e) {
            sendErrorResponse(response, "Error updating order status: " + e.getMessage());
        } finally {
            out.close();
        }
    }

    private boolean matchesDateFilter(Order order, String dateFilter) {
        if (order.getCreatedAt() == null) return false;
        LocalDate orderDate = order.getCreatedAt().toLocalDateTime().toLocalDate();
        LocalDate today = LocalDate.now();
        switch (dateFilter) {
            case "today": return orderDate.equals(today);
            case "week": return orderDate.isAfter(today.minusDays(7));
            case "month": return orderDate.isAfter(today.minusDays(30));
            default: return true;
        }
    }

    private boolean isValidStatus(String status) {
        return status.equals(Order.STATUS_PENDING) ||
               status.equals(Order.STATUS_CONFIRMED) ||
               status.equals(Order.STATUS_SHIPPED) ||
               status.equals(Order.STATUS_DELIVERED) ||
               status.equals(Order.STATUS_CANCELLED);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        if (Order.STATUS_DELIVERED.equals(currentStatus) && !Order.STATUS_DELIVERED.equals(newStatus)) return false;
        if (Order.STATUS_CANCELLED.equals(currentStatus) && !Order.STATUS_CANCELLED.equals(newStatus)) return false;
        return true;
    }

    private String getStatusDisplay(String status) {
        switch (status) {
            case Order.STATUS_PENDING: return "Pending";
            case Order.STATUS_CONFIRMED: return "Confirmed";
            case Order.STATUS_SHIPPED: return "Shipped";
            case Order.STATUS_DELIVERED: return "Delivered";
            case Order.STATUS_CANCELLED: return "Cancelled";
            default: return "Unknown";
        }
    }

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
    }

    @Override
    public void destroy() {
        orderDAO = null;
        gson = null;
        super.destroy();
    }
}
package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Order model class representing a customer order - Enhanced with promo code support
 */
public class Order {
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_CONFIRMED = "confirmed";
    public static final String STATUS_SHIPPED = "shipped";
    public static final String STATUS_DELIVERED = "delivered";
    public static final String STATUS_CANCELLED = "cancelled";
    
    private int id;
    private int userId;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private String contactNumber;
    private String paymentMethod;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // New fields for promo code support
    private BigDecimal subtotal;
    private BigDecimal shippingAmount;
    private BigDecimal discountAmount;
    private String promoCode;
    private String transactionId;
    private String orderNotes;
    
    // Order items
    private List<OrderItem> orderItems;
    
    // User details (for display)
    private String customerName;
    private String customerEmail;
    
    // Default constructor
    public Order() {
        this.orderItems = new ArrayList<>();
        this.status = STATUS_PENDING;
    }
    
    // Constructor for new order
    public Order(int userId, BigDecimal totalAmount, String shippingAddress, String contactNumber) {
        this();
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.contactNumber = contactNumber;
    }
    
    // Constructor with payment method
    public Order(int userId, BigDecimal totalAmount, String shippingAddress, String contactNumber, String paymentMethod) {
        this(userId, totalAmount, shippingAddress, contactNumber);
        this.paymentMethod = paymentMethod;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public String getContactNumber() {
        return contactNumber;
    }
    
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // New getters and setters for promo code support
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public BigDecimal getShippingAmount() {
        return shippingAmount;
    }
    
    public void setShippingAmount(BigDecimal shippingAmount) {
        this.shippingAmount = shippingAmount;
    }
    
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public String getPromoCode() {
        return promoCode;
    }
    
    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getOrderNotes() {
        return orderNotes;
    }
    
    public void setOrderNotes(String orderNotes) {
        this.orderNotes = orderNotes;
    }
    
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    // Utility methods
    public void addOrderItem(OrderItem item) {
        if (this.orderItems == null) {
            this.orderItems = new ArrayList<>();
        }
        this.orderItems.add(item);
    }
    
    public int getTotalItems() {
        if (orderItems == null) return 0;
        return orderItems.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }
    
    public BigDecimal calculateTotal() {
        if (orderItems == null || orderItems.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // Enhanced calculation method with promo support
    public BigDecimal calculateFinalTotal() {
        BigDecimal calculatedSubtotal = calculateTotal();
        BigDecimal shipping = shippingAmount != null ? shippingAmount : BigDecimal.ZERO;
        BigDecimal discount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        
        return calculatedSubtotal.add(shipping).subtract(discount);
    }
    
    public boolean hasPromoCode() {
        return promoCode != null && !promoCode.trim().isEmpty();
    }
    
    public boolean hasDiscount() {
        return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isPending() {
        return STATUS_PENDING.equals(status);
    }
    
    public boolean isConfirmed() {
        return STATUS_CONFIRMED.equals(status);
    }
    
    public boolean isShipped() {
        return STATUS_SHIPPED.equals(status);
    }
    
    public boolean isDelivered() {
        return STATUS_DELIVERED.equals(status);
    }
    
    public boolean isCancelled() {
        return STATUS_CANCELLED.equals(status);
    }
    
    public boolean canBeCancelled() {
        return isPending() || isConfirmed();
    }
    
    public String getStatusDisplay() {
        switch (status) {
            case STATUS_PENDING:
                return "Pending";
            case STATUS_CONFIRMED:
                return "Confirmed";
            case STATUS_SHIPPED:
                return "Shipped";
            case STATUS_DELIVERED:
                return "Delivered";
            case STATUS_CANCELLED:
                return "Cancelled";
            default:
                return "Unknown";
        }
    }
    
    public String getStatusColor() {
        switch (status) {
            case STATUS_PENDING:
                return "#f39c12"; // Orange
            case STATUS_CONFIRMED:
                return "#3498db"; // Blue
            case STATUS_SHIPPED:
                return "#9b59b6"; // Purple
            case STATUS_DELIVERED:
                return "#27ae60"; // Green
            case STATUS_CANCELLED:
                return "#e74c3c"; // Red
            default:
                return "#95a5a6"; // Gray
        }
    }
    
    public boolean hasValidItems() {
        return orderItems != null && !orderItems.isEmpty();
    }
    
    public boolean isValidForPlacement() {
        return userId > 0 && 
               totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0 &&
               shippingAddress != null && !shippingAddress.trim().isEmpty() &&
               contactNumber != null && !contactNumber.trim().isEmpty() &&
               hasValidItems();
    }
    
    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", userId=" + userId +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", promoCode='" + promoCode + '\'' +
                ", discount=" + discountAmount +
                ", createdAt=" + createdAt +
                ", itemCount=" + (orderItems != null ? orderItems.size() : 0) +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        Order order = (Order) o;
        return id == order.id;
    }
    
    @Override
    public int hashCode() {
        return id;
    }
}
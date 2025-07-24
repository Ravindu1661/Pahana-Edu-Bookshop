package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

/**
 * CashierOrder Model - Represents orders created by cashiers
 */
public class CashierOrder {
    private int id;
    private int cashierId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String promoCode;
    private String status; // pending, completed, cancelled
    private String paymentMethod; // cash, card, online
    private String paymentStatus; // pending, paid, partial
    private String orderType; // walk_in, phone, whatsapp
    private String notes;
    private Timestamp printedAt;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private List<CashierOrderItem> orderItems;
    
    // Status constants
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_CANCELLED = "cancelled";
    
    // Payment method constants
    public static final String PAYMENT_CASH = "cash";
    public static final String PAYMENT_CARD = "card";
    public static final String PAYMENT_ONLINE = "online";
    
    // Order type constants
    public static final String TYPE_WALK_IN = "walk_in";
    public static final String TYPE_PHONE = "phone";
    public static final String TYPE_WHATSAPP = "whatsapp";
    
    // Constructors
    public CashierOrder() {}
    
    public CashierOrder(int cashierId, String customerName, BigDecimal totalAmount) {
        this.cashierId = cashierId;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = STATUS_PENDING;
        this.paymentMethod = PAYMENT_CASH;
        this.orderType = TYPE_WALK_IN;
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public int getCashierId() { return cashierId; }
    public void setCashierId(int cashierId) { this.cashierId = cashierId; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    
    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public Timestamp getPrintedAt() { return printedAt; }
    public void setPrintedAt(Timestamp printedAt) { this.printedAt = printedAt; }
    
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
    
    public List<CashierOrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<CashierOrderItem> orderItems) { this.orderItems = orderItems; }
    
    // Utility methods
    public boolean isPrinted() {
        return printedAt != null;
    }
    
    public String getOrderTypeDisplay() {
        switch (orderType != null ? orderType : TYPE_WALK_IN) {
            case TYPE_WALK_IN: return "Walk-in";
            case TYPE_PHONE: return "Phone Order";
            case TYPE_WHATSAPP: return "WhatsApp Order";
            default: return "Unknown";
        }
    }
    
    public String getPaymentMethodDisplay() {
        switch (paymentMethod != null ? paymentMethod : PAYMENT_CASH) {
            case PAYMENT_CASH: return "Cash";
            case PAYMENT_CARD: return "Card";
            case PAYMENT_ONLINE: return "Online";
            default: return "Unknown";
        }
    }
    
    @Override
    public String toString() {
        return "CashierOrder{" +
                "id=" + id +
                ", cashierId=" + cashierId +
                ", customerName='" + customerName + '\'' +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                ", orderType='" + orderType + '\'' +
                '}';
    }
}
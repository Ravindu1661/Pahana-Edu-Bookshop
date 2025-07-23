// Enhanced Orders JavaScript with Promo Code Support
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Orders page loaded with promo code support');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Global variables
    let allOrders = [];
    let filteredOrders = [];
    let currentFilter = 'all';
    let searchQuery = '';
    
    // Initialize
    initOrdersPage();
    
    function initOrdersPage() {
        setupEventListeners();
        loadUserOrders();
    }
    
    // Load user orders from API
    function loadUserOrders() {
        console.log('📋 Loading user orders...');
        const apiUrl = `${baseUrl}/customer/orders`;
        
        showLoading();
        
        fetch(apiUrl)
        .then(response => response.text())
        .then(text => {
            console.log('📊 Raw Response:', text);
            
            try {
                const data = JSON.parse(text);
                console.log('📊 Parsed JSON:', data);
                
                hideLoading();
                
                if (data.success && data.orders) {
                    allOrders = data.orders;
                    console.log(`✅ ${allOrders.length} orders loaded`);
                    applyFilters();
                } else {
                    console.log('📭 No orders found');
                    showEmptyState();
                }
            } catch (e) {
                console.error('❌ JSON Parse Error:', e);
                hideLoading();
                showEmptyState();
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Fetch Error:', error);
            showEmptyState();
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.status;
                applyFilters();
            });
        });
        
        // Search input
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                applyFilters();
            });
        }
        
        // Modal close event
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Global functions
        window.viewOrderDetails = viewOrderDetails;
        window.cancelOrder = cancelOrder;
        window.reorderItems = reorderItems;
        window.printOrder = printOrder;
        window.trackOrder = trackOrder;
        window.closeModal = closeModal;
        window.closeTrackingModal = closeTrackingModal;
        window.printOrderDetails = printOrderDetails;
        window.hideToast = hideToast;
    }
    
    // Apply filters and search
    function applyFilters() {
        filteredOrders = allOrders.filter(order => {
            const matchesFilter = currentFilter === 'all' || order.status === currentFilter;
            const matchesSearch = searchQuery === '' || 
                                 order.id.toString().includes(searchQuery) ||
                                 (order.orderItems && order.orderItems.some(item => 
                                     (item.itemTitle && item.itemTitle.toLowerCase().includes(searchQuery)) ||
                                     (item.itemAuthor && item.itemAuthor.toLowerCase().includes(searchQuery))
                                 ));
            
            return matchesFilter && matchesSearch;
        });
        
        displayOrders();
    }
    
    // Display orders
    function displayOrders() {
        const ordersList = document.getElementById('ordersList');
        const emptyState = document.getElementById('emptyState');
        
        if (!ordersList) return;
        
        if (filteredOrders.length === 0) {
            ordersList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        ordersList.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // Sort orders by creation date (newest first)
        const sortedOrders = filteredOrders.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        ordersList.innerHTML = sortedOrders.map(order => createOrderCard(order)).join('');
    }
    
    // Create order card HTML with promo code support
    function createOrderCard(order) {
        const orderDate = formatDate(order.createdAt);
        const statusClass = `status-${order.status}`;
        const statusDisplay = getStatusDisplay(order.status);
        
        // Calculate subtotal for promo display
        const subtotal = (order.orderItems || []).reduce((sum, item) => 
            sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        const shipping = subtotal >= 3000 ? 0 : 250;
        const originalTotal = subtotal + shipping;
        const finalTotal = parseFloat(order.totalAmount || 0);
        const discount = originalTotal - finalTotal;
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-id">#${order.id}</div>
                        <div class="order-date">${orderDate}</div>
                        ${order.promoCode ? `<div class="order-promo"><i class="fas fa-tag"></i> ${order.promoCode}</div>` : ''}
                    </div>
                    <div class="order-status ${statusClass}">${statusDisplay}</div>
                </div>
                
                <div class="order-body">
                    <div class="order-items">
                        ${(order.orderItems || []).map(item => `
                            <div class="order-item">
                                <img src="${getProductImage(item.itemImagePath)}" alt="${item.itemTitle || 'Product'}" class="item-image">
                                <div class="item-info">
                                    <div class="item-title">${item.itemTitle || 'Unknown Item'}</div>
                                    <div class="item-author">by ${item.itemAuthor || 'Unknown Author'}</div>
                                    <div class="item-price">Rs. ${parseFloat(item.price || 0).toFixed(2)}</div>
                                </div>
                                <div class="item-quantity">Qty: ${item.quantity || 1}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-summary">
                        <div class="order-pricing">
                            ${discount > 0 && order.promoCode ? `
                                <div class="order-discount">
                                    <span class="discount-label">Discount (${order.promoCode}):</span>
                                    <span class="discount-amount">-Rs. ${discount.toFixed(2)}</span>
                                </div>
                            ` : ''}
                            <div class="order-total">Total: Rs. ${finalTotal.toFixed(2)}</div>
                        </div>
                        <div class="order-actions">
                            <button class="btn btn-primary" onclick="viewOrderDetails(${order.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            ${canCancelOrder(order.status) ? `
                                <button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            ` : ''}
                            <button class="btn btn-outline" onclick="printOrder(${order.id})">
                                <i class="fas fa-print"></i> Print
                            </button>
                            <button class="btn btn-info" onclick="trackOrder(${order.id})">
                                <i class="fas fa-route"></i> Track
                            </button>
                            ${order.status === 'delivered' ? `
                                <button class="btn btn-success" onclick="reorderItems(${order.id})">
                                    <i class="fas fa-redo"></i> Reorder
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // View order details with promo code support
    function viewOrderDetails(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }
        
        const orderDate = formatDate(order.createdAt);
        const statusDisplay = getStatusDisplay(order.status);
        const paymentMethodDisplay = (order.paymentMethod === 'cod' || !order.paymentMethod) ? 'Cash on Delivery' : 'Online Payment';
        
        const modalBody = document.getElementById('orderDetailsBody');
        if (!modalBody) return;
        
        modalBody.innerHTML = `
            <div class="order-details print-content">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Order Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value">#${order.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Order Date:</span>
                        <span class="detail-value">${orderDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">
                            <span class="order-status status-${order.status}">${statusDisplay}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${paymentMethodDisplay}</span>
                    </div>
                    ${order.promoCode ? `
                    <div class="detail-row">
                        <span class="detail-label">Promo Code:</span>
                        <span class="detail-value promo-code-display">
                            <i class="fas fa-tag"></i> ${order.promoCode}
                        </span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Customer Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${order.customerName || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${order.contactNumber || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-shipping-fast"></i> Shipping Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${order.shippingAddress || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-box"></i> Order Items</h4>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.orderItems || []).map(item => `
                                <tr>
                                    <td>
                                        <img src="${getProductImage(item.itemImagePath)}" alt="${item.itemTitle || 'Product'}">
                                    </td>
                                    <td>${item.itemTitle || 'Unknown Item'}</td>
                                    <td>${item.itemAuthor || 'Unknown Author'}</td>
                                    <td>Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
                                    <td>${item.quantity || 1}</td>
                                    <td>Rs. ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-calculator"></i> Order Summary</h4>
                    ${calculateOrderSummary(order)}
                </div>
            </div>
        `;
        
        // Show modal
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    // Cancel order
    function cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        
        showLoading();
        
        fetch(`${baseUrl}/customer/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showToast('Order cancelled successfully', 'success');
                // Update order status in local data
                const order = allOrders.find(o => o.id === orderId);
                if (order) {
                    order.status = 'cancelled';
                    applyFilters();
                }
            } else {
                showToast(data.message || 'Failed to cancel order', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Cancel order error:', error);
            showToast('Failed to cancel order. Please try again.', 'error');
        });
    }
    
    // Reorder items
    function reorderItems(orderId) {
        showToast('Reorder feature coming soon...', 'info');
    }
    
    // Print specific order
    function printOrder(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }
        
        generateOrderPrint(order);
        showToast('Print dialog opened', 'success');
    }
    
    // Track order status
    function trackOrder(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            showToast('Order not found', 'error');
            return;
        }
        
        showOrderTracking(order);
    }
    
    // Generate order print with promo code support
    function generateOrderPrint(order) {
        const orderDate = formatDate(order.createdAt);
        const statusDisplay = getStatusDisplay(order.status);
        const paymentMethodDisplay = (order.paymentMethod === 'cod' || !order.paymentMethod) ? 'Cash on Delivery' : 'Online Payment';
        const subtotal = (order.orderItems || []).reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        const shipping = subtotal >= 3000 ? 0 : 250;
        const originalTotal = subtotal + shipping;
        const finalTotal = parseFloat(order.totalAmount || 0);
        const discount = originalTotal - finalTotal;
        
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-section { margin-bottom: 20px; }
                    .print-section h3 { color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .print-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 2px 0; }
                    .print-label { font-weight: bold; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .items-table th, .items-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    .items-table th { background: #f8f9fa; }
                    .order-status { padding: 3px 8px; border-radius: 10px; font-size: 0.8em; }
                    .status-pending { background: #fff3cd; color: #856404; }
                    .status-confirmed { background: #cce5ff; color: #0056b3; }
                    .status-shipped { background: #e7e3ff; color: #6f42c1; }
                    .status-delivered { background: #d4edda; color: #155724; }
                    .status-cancelled { background: #f8d7da; color: #721c24; }
                    .promo-highlight { color: #27ae60; font-weight: bold; }
                    .discount-highlight { color: #e74c3c; font-weight: bold; }
                    .savings-highlight { color: #27ae60; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>📚 Pahana Edu</h1>
                    <h2>Order Details</h2>
                    <p>Phone: +94 11 234 5678 | Email: info@pahanaedu.lk</p>
                </div>
                
                <div class="print-section">
                    <h3>Order Information</h3>
                    <div class="print-row">
                        <span class="print-label">Order ID:</span>
                        <span>#${order.id}</span>
                    </div>
                    <div class="print-row">
                        <span class="print-label">Order Date:</span>
                        <span>${orderDate}</span>
                    </div>
                    <div class="print-row">
                        <span class="print-label">Status:</span>
                        <span class="order-status status-${order.status}">${statusDisplay}</span>
                    </div>
                    <div class="print-row">
                        <span class="print-label">Payment Method:</span>
                        <span>${paymentMethodDisplay}</span>
                    </div>
                    ${order.promoCode ? `
                    <div class="print-row">
                        <span class="print-label">Promo Code:</span>
                        <span class="promo-highlight">🏷️ ${order.promoCode}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="print-section">
                    <h3>Customer Information</h3>
                    <div class="print-row">
                        <span class="print-label">Name:</span>
                        <span>${order.customerName || 'N/A'}</span>
                    </div>
                    <div class="print-row">
                        <span class="print-label">Contact:</span>
                        <span>${order.contactNumber || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="print-section">
                    <h3>Shipping Information</h3>
                    <div class="print-row">
                        <span class="print-label">Address:</span>
                        <span>${order.shippingAddress || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="print-section">
                    <h3>Order Items</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.orderItems || []).map(item => `
                                <tr>
                                    <td>${item.itemTitle || 'Unknown Item'}</td>
                                    <td>${item.itemAuthor || 'Unknown Author'}</td>
                                    <td>Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
                                    <td>${item.quantity || 1}</td>
                                    <td>Rs. ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="print-section">
                    <h3>Order Summary</h3>
                    <div class="print-row">
                        <span class="print-label">Subtotal:</span>
                        <span>Rs. ${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="print-row">
                        <span class="print-label">Shipping:</span>
                        <span>${shipping === 0 ? 'Free' : 'Rs. ' + shipping.toFixed(2)}</span>
                    </div>
                    ${discount > 0 && order.promoCode ? `
                    <div class="print-row">
                        <span class="print-label">Discount (${order.promoCode}):</span>
                        <span class="discount-highlight">-Rs. ${discount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="print-row" style="border-top: 2px solid #333; padding-top: 10px; margin-top: 10px;">
                        <span class="print-label"><strong>Total:</strong></span>
                        <span><strong>Rs. ${finalTotal.toFixed(2)}</strong></span>
                    </div>
                    ${discount > 0 && order.promoCode ? `
                    <div class="print-row" style="margin-top: 10px;">
                        <span class="print-label"></span>
                        <span class="savings-highlight">🎉 You saved Rs. ${discount.toFixed(2)}!</span>
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p>Thank you for your business!</p>
                    <p>Visit us at www.pahanaedu.lk</p>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } else {
            showToast('Please allow pop-ups to print', 'error');
        }
    }
    
    // Show order tracking modal
    function showOrderTracking(order) {
        const trackingHTML = generateTrackingHTML(order);
        
        // Create tracking modal
        const existingModal = document.getElementById('orderTrackingModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const trackingModal = document.createElement('div');
        trackingModal.id = 'orderTrackingModal';
        trackingModal.className = 'modal';
        trackingModal.innerHTML = trackingHTML;
        
        document.body.appendChild(trackingModal);
        trackingModal.style.display = 'block';
        
        // Add event listeners
        trackingModal.addEventListener('click', (e) => {
            if (e.target === trackingModal) {
                closeTrackingModal();
            }
        });
    }
    
    // Generate tracking HTML
    function generateTrackingHTML(order) {
        const orderDate = formatDate(order.createdAt);
        const currentStatus = order.status;
        
        // Define tracking steps
        const trackingSteps = [
            { 
                status: 'pending', 
                title: 'Order Placed', 
                description: 'Your order has been received and is being processed',
                icon: 'fas fa-shopping-cart',
                date: orderDate
            },
            { 
                status: 'confirmed', 
                title: 'Order Confirmed', 
                description: 'Your order has been confirmed and payment verified',
                icon: 'fas fa-check-circle',
                date: currentStatus === 'confirmed' || isStatusAfter(currentStatus, 'confirmed') ? getEstimatedDate(1) : null
            },
            { 
                status: 'shipped', 
                title: 'Order Shipped', 
                description: 'Your order is on its way to you',
                icon: 'fas fa-truck',
                date: currentStatus === 'shipped' || isStatusAfter(currentStatus, 'shipped') ? getEstimatedDate(2) : null
            },
            { 
                status: 'delivered', 
                title: 'Order Delivered', 
                description: 'Your order has been successfully delivered',
                icon: 'fas fa-box-open',
                date: currentStatus === 'delivered' ? getEstimatedDate(3) : null
            }
        ];
        
        // Handle cancelled orders
        if (currentStatus === 'cancelled') {
            trackingSteps.push({
                status: 'cancelled',
                title: 'Order Cancelled',
                description: 'Your order has been cancelled',
                icon: 'fas fa-times-circle',
                date: getEstimatedDate(1)
            });
        }
        
        return `
            <div class="modal-content tracking-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-route"></i> Track Order #${order.id}</h3>
                    <button class="modal-close" onclick="closeTrackingModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tracking-info">
                        <div class="tracking-overview">
                            <div class="tracking-status">
                                <span class="current-status status-${currentStatus}">${getStatusDisplay(currentStatus)}</span>
                                ${order.promoCode ? `<span class="tracking-promo"><i class="fas fa-tag"></i> ${order.promoCode}</span>` : ''}
                            </div>
                            <div class="tracking-details">
                                <div class="detail-item">
                                    <span class="detail-icon"><i class="fas fa-calendar"></i></span>
                                    <span>Order Date: ${orderDate}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon"><i class="fas fa-credit-card"></i></span>
                                    <span>Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon"><i class="fas fa-money-bill"></i></span>
                                    <span>Total: Rs. ${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tracking-timeline">
                            ${trackingSteps.map((step, index) => {
                                const isActive = step.status === currentStatus;
                                const isCompleted = isStatusBefore(step.status, currentStatus) || step.status === currentStatus;
                                const isCancelled = currentStatus === 'cancelled' && step.status !== 'pending' && step.status !== 'cancelled';
                                
                                if (currentStatus === 'cancelled' && step.status !== 'pending' && step.status !== 'cancelled') {
                                    return '';
                                }
                                
                                return `
                                    <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isCancelled ? 'cancelled' : ''}">
                                        <div class="step-icon">
                                            <i class="${step.icon}"></i>
                                        </div>
                                        <div class="step-content">
                                            <div class="step-title">${step.title}</div>
                                            <div class="step-description">${step.description}</div>
                                            ${step.date ? `<div class="step-date">${step.date}</div>` : ''}
                                        </div>
                                        ${index < trackingSteps.length - 1 && (currentStatus !== 'cancelled' || step.status === 'pending') ? '<div class="step-connector"></div>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        ${currentStatus !== 'delivered' && currentStatus !== 'cancelled' ? `
                            <div class="estimated-delivery">
                                <div class="delivery-info">
                                    <i class="fas fa-clock"></i>
                                    <span>Estimated Delivery: ${getEstimatedDeliveryDate(currentStatus)}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeTrackingModal()">Close</button>
                    <button class="btn btn-primary" onclick="printOrder(${order.id})">Print Order</button>
                </div>
            </div>
        `;
    }
    
    // Helper functions for tracking
    function isStatusBefore(status1, status2) {
        const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
        return statusOrder.indexOf(status1) < statusOrder.indexOf(status2);
    }
    
    function isStatusAfter(status1, status2) {
        const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
        return statusOrder.indexOf(status1) > statusOrder.indexOf(status2);
    }
    
    function getEstimatedDate(daysFromOrder) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromOrder);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function getEstimatedDeliveryDate(currentStatus) {
        const statusDays = {
            'pending': 5,
            'confirmed': 3,
            'shipped': 1
        };
        
        const days = statusDays[currentStatus] || 3;
        return getEstimatedDate(days);
    }
    
    // Close tracking modal
    function closeTrackingModal() {
        const modal = document.getElementById('orderTrackingModal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }
    
    // Print order details with promo code support
    function printOrderDetails() {
        const printContent = document.querySelector('.print-content');
        if (!printContent) {
            showToast('No content to print', 'error');
            return;
        }
        
        const order = getCurrentOrderFromModal();
        const subtotal = (order.orderItems || []).reduce((sum, item) => 
            sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        const shipping = subtotal >= 3000 ? 0 : 250;
        const originalTotal = subtotal + shipping;
        const finalTotal = parseFloat(order.totalAmount || 0);
        const discount = originalTotal - finalTotal;
        
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Details #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .detail-section { margin-bottom: 20px; }
                    .detail-section h4 { color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 2px 0; }
                    .detail-label { font-weight: bold; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .items-table th, .items-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    .items-table th { background: #f8f9fa; }
                    .items-table img { width: 30px; height: 38px; }
                    .order-status { padding: 3px 8px; border-radius: 10px; font-size: 0.8em; }
                    .status-pending { background: #fff3cd; color: #856404; }
                    .status-confirmed { background: #cce5ff; color: #0056b3; }
                    .status-shipped { background: #e7e3ff; color: #6f42c1; }
                    .status-delivered { background: #d4edda; color: #155724; }
                    .status-cancelled { background: #f8d7da; color: #721c24; }
                    .promo-code-display { color: #27ae60; font-weight: bold; }
                    .discount-highlight { color: #e74c3c; font-weight: bold; }
                    .savings-highlight { color: #27ae60; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>📚 Pahana Edu</h1>
                    <h2>Order Details</h2>
                    <p>Phone: +94 11 234 5678 | Email: info@pahanaedu.lk</p>
                </div>
                ${printContent.outerHTML}
                ${discount > 0 && order.promoCode ? `
                    <div style="text-align: center; margin-top: 20px; padding: 10px; background: #d4edda; border-radius: 5px;">
                        <p class="savings-highlight">🎉 You saved Rs. ${discount.toFixed(2)} with promo code ${order.promoCode}!</p>
                    </div>
                ` : ''}
                <div style="text-align: center; margin-top: 30px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p>Thank you for your business!</p>
                    <p>Visit us at www.pahanaedu.lk</p>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } else {
            showToast('Please allow pop-ups to print', 'error');
        }
    }
    
    // Get current order from modal
    function getCurrentOrderFromModal() {
        const modalBody = document.getElementById('orderDetailsBody');
        if (!modalBody) return null;
        
        const orderIdElement = modalBody.querySelector('.detail-value');
        if (!orderIdElement) return null;
        
        const orderId = orderIdElement.textContent.replace('#', '');
        return allOrders.find(o => o.id.toString() === orderId);
    }
    
    // Utility functions
    function canCancelOrder(status) {
        return status === 'pending' || status === 'confirmed';
    }
    
    function getProductImage(imagePath) {
        const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        
        if (!imagePath || imagePath.trim() === '') {
            return defaultImage;
        }
        
        if (imagePath.startsWith('data:image/') || imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return baseUrl + '/' + imagePath;
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getStatusDisplay(status) {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || 'Unknown';
    }
    
    // Calculate order summary with promo code support
    function calculateOrderSummary(order) {
        const subtotal = (order.orderItems || []).reduce((sum, item) => 
            sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        const shipping = subtotal >= 3000 ? 0 : 250;
        const originalTotal = subtotal + shipping;
        const finalTotal = parseFloat(order.totalAmount || 0);
        const discount = originalTotal - finalTotal;
        
        return `
            <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">Rs. ${subtotal.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Shipping:</span>
                <span class="detail-value">${shipping === 0 ? 'Free' : 'Rs. ' + shipping.toFixed(2)}</span>
            </div>
            ${discount > 0 && order.promoCode ? `
            <div class="detail-row">
                <span class="detail-label">Discount (${order.promoCode}):</span>
                <span class="detail-value discount-highlight">-Rs. ${discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="detail-row" style="border-top: 2px solid #dee2e6; padding-top: 10px; margin-top: 10px;">
                <span class="detail-label"><strong>Total:</strong></span>
                <span class="detail-value"><strong>Rs. ${finalTotal.toFixed(2)}</strong></span>
            </div>
            ${discount > 0 && order.promoCode ? `
            <div class="detail-row" style="margin-top: 10px;">
                <span class="detail-label"></span>
                <span class="detail-value savings-highlight">🎉 You saved Rs. ${discount.toFixed(2)}!</span>
            </div>
            ` : ''}
        `;
    }
    
    function closeModal() {
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function showEmptyState() {
        const ordersList = document.getElementById('ordersList');
        const emptyState = document.getElementById('emptyState');
        
        if (ordersList) ordersList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    }
    
    function showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }
    
    function hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }
    
    // Toast notification function
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) {
            console.log('Toast:', message);
            return;
        }
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            hideToast();
        }, 3000);
    }
    
    function hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.className = 'toast';
            toast.style.display = 'none';
        }
    }
    
    console.log('✅ Orders page initialized with complete promo code support');
});
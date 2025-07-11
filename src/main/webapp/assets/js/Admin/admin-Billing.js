// Dashboard Content-Area Compatible Admin Billing Management JavaScript
let currentOrders = [];
let currentOrderDetails = null;
let billingInitialized = false;

// Get context path and base URL
const contextPath = window.location.pathname.split('/')[1];
const baseUrl = '/' + contextPath;

console.log('💳 Admin Billing Management script loaded');

/**
 * Reset initialization flag when navigating away
 */
function resetBillingInitialization() {
    billingInitialized = false;
    currentOrders = [];
    currentOrderDetails = null;
    console.log('🔄 Billing initialization reset');
}

/**
 * Initialize billing management functionality
 */
function initializeBillingManagement() {
    console.log('🔧 Initializing billing management...');
    
    // Force reset first
    billingInitialized = false;
    currentOrders = [];
    currentOrderDetails = null;
    
    // Check if required elements exist
    const ordersTable = document.getElementById('ordersTableBody');
    const statsContainer = document.querySelector('.stats-container');
    
    if (!ordersTable || !statsContainer) {
        console.log('❌ Required elements not found, retrying in 500ms...');
        setTimeout(() => {
            initializeBillingManagement();
        }, 500);
        return;
    }
    
    console.log('✅ All required elements found, proceeding with initialization');
    
    // Mark as initialized
    billingInitialized = true;
    
    // Load initial data
    loadOrderStats();
    loadOrders();
    setupEventListeners();
    
    // Make functions globally available
    window.loadOrders = loadOrders;
    window.viewOrderDetails = viewOrderDetails;
    window.updateOrderStatus = updateOrderStatus;
    window.closeOrderModal = closeOrderModal;
    window.hideToast = hideToast;
    
    console.log('✅ Billing management initialized successfully');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshOrdersBtn');
    if (refreshBtn) {
        // Remove any existing listeners
        refreshBtn.replaceWith(refreshBtn.cloneNode(true));
        const newRefreshBtn = document.getElementById('refreshOrdersBtn');
        newRefreshBtn.addEventListener('click', () => {
            console.log('🔄 Refresh button clicked');
            loadOrderStats();
            loadOrders();
        });
        console.log('✅ Refresh button listener added');
    }
    
    // Filter dropdowns
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter) {
        statusFilter.replaceWith(statusFilter.cloneNode(true));
        const newStatusFilter = document.getElementById('statusFilter');
        newStatusFilter.addEventListener('change', () => {
            console.log('🔍 Status filter changed:', newStatusFilter.value);
            loadOrders();
        });
        console.log('✅ Status filter listener added');
    }
    
    if (paymentFilter) {
        paymentFilter.replaceWith(paymentFilter.cloneNode(true));
        const newPaymentFilter = document.getElementById('paymentFilter');
        newPaymentFilter.addEventListener('change', () => {
            console.log('🔍 Payment filter changed:', newPaymentFilter.value);
            loadOrders();
        });
        console.log('✅ Payment filter listener added');
    }
    
    if (dateFilter) {
        dateFilter.replaceWith(dateFilter.cloneNode(true));
        const newDateFilter = document.getElementById('dateFilter');
        newDateFilter.addEventListener('change', () => {
            console.log('🔍 Date filter changed:', newDateFilter.value);
            loadOrders();
        });
        console.log('✅ Date filter listener added');
    }
    
    console.log('✅ Event listeners setup complete');
}

/**
 * Load order statistics
 */
function loadOrderStats() {
    console.log('📊 Loading order statistics...');
    const statsUrl = `${baseUrl}/admin/order-stats`;
    
    fetch(statsUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('📡 Stats response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Stats data received:', data);
            if (data.success) {
                updateStatsUI(data.stats);
            } else {
                console.error('❌ Stats API error:', data.message);
                showStatsError(data.message);
            }
        })
        .catch(error => {
            console.error('❌ Stats fetch error:', error);
            showStatsError(error.message);
        });
}

/**
 * Update stats UI
 */
function updateStatsUI(stats) {
    console.log('📊 Updating stats UI:', stats);
    
    const elements = {
        totalOrders: document.getElementById('totalOrders'),
        pendingOrders: document.getElementById('pendingOrders'),
        confirmedOrders: document.getElementById('confirmedOrders'),
        shippedOrders: document.getElementById('shippedOrders'),
        deliveredOrders: document.getElementById('deliveredOrders'),
        totalRevenue: document.getElementById('totalRevenue')
    };
    
    if (elements.totalOrders) elements.totalOrders.textContent = stats.totalOrders || 0;
    if (elements.pendingOrders) elements.pendingOrders.textContent = stats.pendingOrders || 0;
    if (elements.confirmedOrders) elements.confirmedOrders.textContent = stats.confirmedOrders || 0;
    if (elements.shippedOrders) elements.shippedOrders.textContent = stats.shippedOrders || 0;
    if (elements.deliveredOrders) elements.deliveredOrders.textContent = stats.deliveredOrders || 0;
    if (elements.totalRevenue) {
        const revenue = stats.totalRevenue || 0;
        elements.totalRevenue.textContent = `Rs. ${parseFloat(revenue).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    }
    
    console.log('✅ Stats UI updated successfully');
}

/**
 * Show stats error
 */
function showStatsError(message) {
    console.error('📊 Stats error:', message);
    const elements = ['totalOrders', 'pendingOrders', 'confirmedOrders', 'shippedOrders', 'deliveredOrders', 'totalRevenue'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = 'Error';
    });
    showToast('Statistics error: ' + message, 'error');
}

/**
 * Load orders
 */
function loadOrders() {
    console.log('📦 Loading orders...');
    const ordersTableBody = document.getElementById('ordersTableBody');
    
    if (!ordersTableBody) {
        console.error('❌ Orders table body not found');
        return;
    }
    
    // Show loading state
    ordersTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <div class="loading-spinner"></div>
                Loading orders...
            </td>
        </tr>
    `;
    
    // Get filter values (with null checks)
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    const statusValue = statusFilter ? statusFilter.value : '';
    const paymentValue = paymentFilter ? paymentFilter.value : '';
    const dateValue = dateFilter ? dateFilter.value : '';
    
    let ordersUrl = `${baseUrl}/admin/orders/`;
    const params = new URLSearchParams();
    if (statusValue) params.append('status', statusValue);
    if (paymentValue) params.append('payment', paymentValue);
    if (dateValue) params.append('date', dateValue);
    if (params.toString()) ordersUrl += '?' + params.toString();
    
    console.log('📡 Orders URL:', ordersUrl);
    
    fetch(ordersUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('📡 Orders response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Orders data received:', data);
            if (data.success) {
                currentOrders = data.orders || [];
                console.log(`📦 Loaded ${currentOrders.length} orders`);
                displayOrdersInTable(currentOrders);
            } else {
                console.error('❌ Orders API error:', data.message);
                showOrdersError('Failed to load orders: ' + data.message);
            }
        })
        .catch(error => {
            console.error('❌ Orders fetch error:', error);
            showOrdersError('Error loading orders: ' + error.message);
        });
}

/**
 * Display orders in table
 */
function displayOrdersInTable(orders) {
    console.log(`📋 Displaying ${orders.length} orders`);
    const ordersTableBody = document.getElementById('ordersTableBody');
    
    if (!ordersTableBody) {
        console.error('❌ Orders table body not found');
        return;
    }
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Orders Found</h3>
                    <p>No orders match your current filters.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    try {
        ordersTableBody.innerHTML = orders.map(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const itemCount = order.orderItems ? order.orderItems.length : 0;
            const totalItems = order.orderItems ? 
                order.orderItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
            
            return `
                <tr>
                    <td>
                        <span class="order-id">#${order.id}</span>
                    </td>
                    <td>
                        <div class="customer-info">
                            <div class="customer-name">${order.customerName || 'N/A'}</div>
                            <div class="customer-email">${order.customerEmail || 'N/A'}</div>
                        </div>
                    </td>
                    <td>
                        <div class="items-preview">
                            ${order.orderItems && order.orderItems.length > 0 ? 
                                `<img src="${order.orderItems[0].itemImagePath || 'https://via.placeholder.com/30x35'}" 
                                     alt="Item" class="item-thumb" 
                                     onerror="this.src='https://via.placeholder.com/30x35'">` : 
                                '<span style="color: #666;">No image</span>'
                            }
                            <span class="items-count">${itemCount} items (${totalItems} qty)</span>
                        </div>
                    </td>
                    <td>
                        <span class="amount">Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </td>
                    <td>
                        <span class="payment-method payment-${(order.paymentMethod || '').toLowerCase()}">
                            ${getPaymentMethodDisplay(order.paymentMethod)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${(order.status || '').toLowerCase()}">
                            ${getStatusDisplay(order.status)}
                        </span>
                    </td>
                    <td>${orderDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-view" onclick="viewOrderDetails(${order.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Orders table updated successfully');
    } catch (error) {
        console.error('❌ Error displaying orders:', error);
        showOrdersError('Error displaying orders: ' + error.message);
    }
}

/**
 * Get payment method display text
 */
function getPaymentMethodDisplay(paymentMethod) {
    switch (paymentMethod) {
        case 'cod': return 'COD';
        case 'online': return 'Online';
        default: return paymentMethod || 'N/A';
    }
}

/**
 * Get status display text
 */
function getStatusDisplay(status) {
    switch (status) {
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case 'shipped': return 'Shipped';
        case 'delivered': return 'Delivered';
        case 'cancelled': return 'Cancelled';
        default: return status || 'Unknown';
    }
}

/**
 * Show orders error
 */
function showOrdersError(message) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (ordersTableBody) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state" style="color: #dc3545;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Orders</h3>
                    <p>${message}</p>
                    <button class="btn btn-view" onclick="loadOrders()" style="margin-top: 15px;">
                        <i class="fas fa-retry"></i> Try Again
                    </button>
                </td>
            </tr>
        `;
    }
    showToast(message, 'error');
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
    console.log('👁️ Viewing order details:', orderId);
    
    const order = currentOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('Order not found', 'error');
        return;
    }
    
    currentOrderDetails = order;
    
    // Populate order details modal
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = `Order #${order.id} Details`;
    
    const detailElements = {
        detailOrderId: order.id || 'N/A',
        detailCustomerName: order.customerName || 'N/A',
        detailCustomerEmail: order.customerEmail || 'N/A',
        detailContactNumber: order.contactNumber || 'N/A',
        detailPaymentMethod: getPaymentMethodDisplay(order.paymentMethod),
        detailShippingAddress: order.shippingAddress || 'N/A',
        detailTotalAmount: `Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`
    };
    
    // Update detail elements
    Object.keys(detailElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = detailElements[id];
        }
    });
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const detailOrderDate = document.getElementById('detailOrderDate');
    if (detailOrderDate) detailOrderDate.textContent = orderDate;
    
    // Set current status in dropdown
    const statusSelect = document.getElementById('newOrderStatus');
    if (statusSelect) {
        statusSelect.value = order.status || 'pending';
    }
    
    // Display order items
    displayOrderItemsInModal(order.orderItems || []);
    
    // Show modal
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Display order items in modal
 */
function displayOrderItemsInModal(orderItems) {
    const orderItemsTableBody = document.getElementById('orderItemsTableBody');
    
    if (!orderItemsTableBody) {
        console.error('❌ Order items table body not found');
        return;
    }
    
    if (orderItems.length === 0) {
        orderItemsTableBody.innerHTML = '<tr><td colspan="4" class="loading">No items found</td></tr>';
        return;
    }
    
    try {
        const defaultImage = 'https://via.placeholder.com/40x50';
        orderItemsTableBody.innerHTML = orderItems.map(item => {
            const itemTotal = parseFloat(item.price || 0) * parseInt(item.quantity || 0);
            
            return `
                <tr>
                    <td>
                        <div class="item-details">
                            <img src="${item.itemImagePath || defaultImage}" 
                                 alt="${item.itemTitle}" 
                                 class="item-image" 
                                 onerror="this.src='${defaultImage}'">
                            <div class="item-info">
                                <h6>${item.itemTitle || 'N/A'}</h6>
                                <small>by ${item.itemAuthor || 'Unknown'}</small>
                            </div>
                        </div>
                    </td>
                    <td><strong>Rs. ${parseFloat(item.price || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                    <td><span class="items-count">${item.quantity || 0}</span></td>
                    <td><strong>Rs. ${itemTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Order items displayed successfully');
    } catch (error) {
        console.error('❌ Error displaying order items:', error);
        orderItemsTableBody.innerHTML = '<tr><td colspan="4" class="loading" style="color: #dc3545;">Error loading items</td></tr>';
    }
}

/**
 * Update order status
 */
function updateOrderStatus() {
    console.log('📝 Updating order status...');
    
    if (!currentOrderDetails) {
        showToast('No order selected', 'error');
        return;
    }
    
    const statusSelect = document.getElementById('newOrderStatus');
    if (!statusSelect) {
        showToast('Status selector not found', 'error');
        return;
    }
    
    const newStatus = statusSelect.value;
    if (!newStatus) {
        showToast('Please select a status', 'error');
        return;
    }
    
    if (newStatus === currentOrderDetails.status) {
        showToast('Status is already set to ' + getStatusDisplay(newStatus), 'info');
        return;
    }
    
    const url = `${baseUrl}/admin/orders/update-status`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            orderId: currentOrderDetails.id,
            status: newStatus
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message || 'Order status updated successfully', 'success');
                
                // Update current order details
                currentOrderDetails.status = newStatus;
                
                // Update the order in current orders array
                const orderIndex = currentOrders.findIndex(o => o.id === currentOrderDetails.id);
                if (orderIndex !== -1) {
                    currentOrders[orderIndex].status = newStatus;
                }
                
                // Refresh displays
                displayOrdersInTable(currentOrders);
                loadOrderStats();
                
                // Close modal after successful update
                setTimeout(() => {
                    closeOrderModal();
                }, 1500);
            } else {
                showToast(data.message || 'Failed to update order status', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Status update error:', error);
            showToast('Error updating order status: ' + error.message, 'error');
        });
}

/**
 * Close order details modal
 */
function closeOrderModal() {
    console.log('❌ Closing order details modal');
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentOrderDetails = null;
    }
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            hideToast();
        }, 4000);
    }
}

/**
 * Hide toast
 */
function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Export functions for global access
window.billingManager = {
    initializeBillingManagement,
    resetBillingInitialization,
    loadOrders,
    viewOrderDetails,
    updateOrderStatus,
    closeOrderModal,
    hideToast
};

// Also make direct functions available
window.initializeBillingManagement = initializeBillingManagement;
window.resetBillingInitialization = resetBillingInitialization;
// Global variables for order management
let currentOrders = [];
let currentOrderDetails = null;
let currentPage = null;

// Get context path and base URL
const contextPath = window.location.pathname.split('/')[1];
const baseUrl = '/' + contextPath;

console.log('💳 Admin Billing Management initialized');

// Initialize billing management on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Billing Dashboard loaded');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');
    
    // Navigation handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // If it's logout link, redirect immediately
            if (link.classList.contains('logout')) {
                window.location.href = link.getAttribute('href');
                return;
            }
            
            // Update active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Load new page via AJAX
            const page = link.getAttribute('data-page');
            if (page) {
                loadPage(page);
            }
        });
    });
    
    // Load default tab
    setTimeout(() => {
        const defaultLink = document.querySelector('.nav-link[data-page*="admin-Manage-Billing.jsp"]');
        if (defaultLink) {
            console.log('🏠 Loading default page...');
            defaultLink.click();
        }
    }, 100);
});

/**
 * Enhanced page loading function
 */
function loadPage(page) {
    console.log('📄 Loading page:', page);
    currentPage = page;
    
    // Show loading indicator
    showLoadingIndicator();
    
    fetch(page)
        .then(response => {
            console.log('📡 Page response status:', response.status);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            console.log('✅ Page loaded successfully');
            const contentArea = document.getElementById('content-area');
            contentArea.innerHTML = data;
            
            // Initialize billing management
            initializeBillingManagement();
        })
        .catch(error => {
            console.error('❌ Page loading error:', error);
            contentArea.innerHTML = `
                <div class="error-container">
                    <h3>❌ Error Loading Content</h3>
                    <p>Failed to load: ${page}</p>
                    <p>Error: ${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">🔄 Retry</button>
                </div>
            `;
        });
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading content...</p>
        </div>
    `;
}

/**
 * Initialize billing management functionality
 */
function initializeBillingManagement() {
    console.log('🔧 Initializing billing management...');
    
    const statsElements = {
        totalOrders: document.getElementById('totalOrders'),
        pendingOrders: document.getElementById('pendingOrders'),
        confirmedOrders: document.getElementById('confirmedOrders'),
        shippedOrders: document.getElementById('shippedOrders'),
        totalRevenue: document.getElementById('totalRevenue')
    };
    
    const billingElements = {
        ordersTableBody: document.getElementById('ordersTableBody'),
        refreshBtn: document.getElementById('refreshOrdersBtn'),
        statusFilter: document.getElementById('statusFilter'),
        paymentFilter: document.getElementById('paymentFilter'),
        dateFilter: document.getElementById('dateFilter')
    };
    
    console.log('🔍 Billing Management elements found:', {
        stats: Object.keys(statsElements).filter(key => statsElements[key]).length,
        billingElements: Object.keys(billingElements).filter(key => billingElements[key]).length
    });
    
    if (billingElements.ordersTableBody) {
        loadOrderStats();
        loadOrders();
        setupEventListeners();
        
        // Make functions globally available
        window.loadOrders = loadOrders;
        window.filterOrders = filterOrders;
        window.viewOrderDetails = viewOrderDetails;
        window.updateOrderStatus = updateOrderStatus;
        window.closeOrderModal = closeOrderModal;
        window.hideToast = hideToast;
        
        console.log('✅ Billing management initialized successfully');
    } else {
        console.log('⏳ Retrying initialization...');
        setTimeout(initializeBillingManagement, 500);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    const refreshBtn = document.getElementById('refreshOrdersBtn');
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadOrderStats();
            loadOrders();
        });
        console.log('✅ Refresh button listener added');
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
        console.log('✅ Status filter listener added');
    }
    
    if (paymentFilter) {
        paymentFilter.addEventListener('change', filterOrders);
        console.log('✅ Payment filter listener added');
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', filterOrders);
        console.log('✅ Date filter listener added');
    }
    
    // Modal outside click handling
    window.addEventListener('click', (e) => {
        const orderModal = document.getElementById('orderDetailsModal');
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });
    
    // Keyboard handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeOrderModal();
            hideToast();
        }
    });
    
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
        totalRevenue: document.getElementById('totalRevenue')
    };
    
    if (elements.totalOrders) elements.totalOrders.textContent = stats.totalOrders || 0;
    if (elements.pendingOrders) elements.pendingOrders.textContent = stats.pendingOrders || 0;
    if (elements.confirmedOrders) elements.confirmedOrders.textContent = stats.confirmedOrders || 0;
    if (elements.shippedOrders) elements.shippedOrders.textContent = stats.shippedOrders || 0;
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
    const elements = ['totalOrders', 'pendingOrders', 'confirmedOrders', 'shippedOrders', 'totalRevenue'];
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
        showToast('Orders table not found', 'error');
        return;
    }
    
    // Show loading state
    ordersTableBody.innerHTML = '<tr><td colspan="9" class="loading">🔄 Loading orders...</td></tr>';
    
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    const statusValue = statusFilter ? statusFilter.value : '';
    const paymentValue = paymentFilter ? paymentFilter.value : '';
    const dateValue = dateFilter ? dateFilter.value : '';
    
    let ordersUrl = `${baseUrl}/admin/orders`;
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
                displayOrders(currentOrders);
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
function displayOrders(orders) {
    console.log(`📋 Displaying ${orders.length} orders`);
    const ordersTableBody = document.getElementById('ordersTableBody');
    
    if (!ordersTableBody) {
        console.error('❌ Orders table body not found');
        showToast('Orders table not found', 'error');
        return;
    }
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="9" class="loading">📭 No orders found</td></tr>';
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
                <tr class="fade-in">
                    <td><strong>#${order.id}</strong></td>
                    <td>
                        <div>
                            <strong>${order.customerName || 'N/A'}</strong><br>
                            <small>${order.customerEmail || 'N/A'}</small>
                        </div>
                    </td>
                    <td>${order.contactNumber || 'N/A'}</td>
                    <td>
                        <span class="badge">${itemCount} items (${totalItems} qty)</span>
                    </td>
                    <td><strong>Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                    <td><span class="badge payment-${(order.paymentMethod || '').toLowerCase()}">${getPaymentMethodDisplay(order.paymentMethod)}</span></td>
                    <td><span class="badge status-${(order.status || '').toLowerCase()}">${getStatusDisplay(order.status)}</span></td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="action-btn view-btn" onclick="viewOrderDetails(${order.id})">
                            <i class="icon-eye"></i> View
                        </button>
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
        case 'cod':
            return 'Cash on Delivery';
        case 'online':
            return 'Online Payment';
        default:
            return paymentMethod || 'N/A';
    }
}

/**
 * Get status display text
 */
function getStatusDisplay(status) {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'confirmed':
            return 'Confirmed';
        case 'shipped':
            return 'Shipped';
        case 'delivered':
            return 'Delivered';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status || 'Unknown';
    }
}

/**
 * Show orders error
 */
function showOrdersError(message) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (ordersTableBody) {
        ordersTableBody.innerHTML = `
            <tr><td colspan="9" class="loading" style="color: #dc3545;">
                ❌ ${message}
            </td></tr>
        `;
    }
    showToast(message, 'error');
}

/**
 * Filter orders
 */
function filterOrders() {
    console.log('🔍 Filtering orders...');
    loadOrders();
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
    document.getElementById('orderModalTitle').textContent = `Order #${order.id} Details`;
    document.getElementById('detailOrderId').textContent = order.id || 'N/A';
    document.getElementById('detailCustomerName').textContent = order.customerName || 'N/A';
    document.getElementById('detailCustomerEmail').textContent = order.customerEmail || 'N/A';
    document.getElementById('detailContactNumber').textContent = order.contactNumber || 'N/A';
    document.getElementById('detailPaymentMethod').textContent = getPaymentMethodDisplay(order.paymentMethod);
    document.getElementById('detailShippingAddress').textContent = order.shippingAddress || 'N/A';
    document.getElementById('detailTotalAmount').textContent = `Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('detailOrderDate').textContent = orderDate;
    
    // Set current status in dropdown
    const statusSelect = document.getElementById('newOrderStatus');
    if (statusSelect) {
        statusSelect.value = order.status || 'pending';
    }
    
    // Display order items
    displayOrderItems(order.orderItems || []);
    
    // Show modal
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'block';
        statusSelect?.focus();
    }
}

/**
 * Display order items in modal
 */
function displayOrderItems(orderItems) {
    const orderItemsTableBody = document.getElementById('orderItemsTableBody');
    
    if (!orderItemsTableBody) {
        console.error('❌ Order items table body not found');
        showToast('Order items table not found', 'error');
        return;
    }
    
    if (orderItems.length === 0) {
        orderItemsTableBody.innerHTML = '<tr><td colspan="4" class="loading">📭 No items found</td></tr>';
        return;
    }
    
    try {
        const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIT0JYsgYabTZ5gykfiSeOUxN6NDDXuuHVuA&s';
        orderItemsTableBody.innerHTML = orderItems.map(item => {
            const itemTotal = parseFloat(item.price || 0) * parseInt(item.quantity || 0);
            
            return `
                <tr>
                    <td>
                        <div class="item-info">
                            ${item.itemImagePath ? 
                                `<img src="${item.itemImagePath}" alt="${item.itemTitle}" class="item-image" onerror="this.src='${defaultImage}'">` : 
                                '<div class="item-image" style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6c757d;">No Image</div>'
                            }
                            <div class="item-details">
                                <h5>${item.itemTitle || 'N/A'}</h5>
                                <p>by ${item.itemAuthor || 'Unknown'}</p>
                            </div>
                        </div>
                    </td>
                    <td><strong>Rs. ${parseFloat(item.price || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                    <td><span class="badge">${item.quantity || 0}</span></td>
                    <td><strong>Rs. ${itemTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Order items displayed successfully');
    } catch (error) {
        console.error('❌ Error displaying order items:', error);
        orderItemsTableBody.innerHTML = '<tr><td colspan="4" class="loading" style="color: #dc3545;">❌ Error loading items</td></tr>';
        showToast('Error displaying order items', 'error');
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
    
    const url = `${baseUrl}/admin/update-order-status`;
    
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
                displayOrders(currentOrders);
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
        currentOrderDetails = null;
    }
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const toast = document.getElementById('messageToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
}

/**
 * Hide toast
 */
function hideToast() {
    const toast = document.getElementById('messageToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Add CSS
const style = document.createElement('style');
style.textContent = `
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 50px;
        text-align: center;
    }
    .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .error-container {
        padding: 20px;
        text-align: center;
        color: #dc3545;
    }
    .item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        margin-right: 10px;
    }
    .item-info {
        display: flex;
        align-items: center;
    }
    .item-details {
        flex: 1;
    }
    .badge {
        padding: 5px 10px;
        border-radius: 12px;
        font-size: 12px;
    }
    .action-btn {
        padding: 5px 10px;
        margin: 0 2px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .view-btn {
        background-color: #007bff;
        color: white;
    }
    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);
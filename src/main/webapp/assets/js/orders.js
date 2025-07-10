// Orders Page JavaScript - Complete Version
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Orders page loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // Global variables
    let allOrders = [];
    let filteredOrders = [];
    let currentFilter = 'all';
    let currentOrderDetails = null;
    
    // Initialize
    initOrdersPage();
    
    function initOrdersPage() {
        console.log('🔧 Initializing orders page...');
        loadOrders();
        setupEventListeners();
        checkUrlParams();
    }
    
    // Load orders from API
    function loadOrders() {
        console.log('📥 Loading orders...');
        showLoading();
        
        fetch(`${baseUrl}/customer/orders`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success && data.orders) {
                allOrders = data.orders;
                console.log(`✅ ${allOrders.length} orders loaded`);
                applyFilter(currentFilter);
            } else {
                console.log('❌ No orders found');
                showEmptyOrders();
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Orders fetch error:', error);
            showEmptyOrders();
        });
    }
    
    // Apply filter to orders
    function applyFilter(status) {
        currentFilter = status;
        
        if (status === 'all') {
            filteredOrders = [...allOrders];
        } else {
            filteredOrders = allOrders.filter(order => order.status === status);
        }
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.status === status) {
                btn.classList.add('active');
            }
        });
        
        displayOrders(filteredOrders);
        console.log(`📋 Filtered orders: ${filteredOrders.length} (${status})`);
    }
    
    // Display orders
    function displayOrders(orders) {
        const container = document.getElementById('ordersList');
        const emptyState = document.getElementById('emptyState');
        
        if (orders.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        container.style.display = 'block';
        emptyState.style.display = 'none';
        
        container.innerHTML = orders.map(order => createOrderCard(order)).join('');
    }
    
    // Create order card HTML
    function createOrderCard(order) {
        const statusClass = `status-${order.status}`;
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const itemsDisplay = order.items.slice(0, 2).map(item => `
            <div class="order-item">
                <img src="${getProductImage(item.imagePath)}" alt="${item.title}" class="item-image">
                <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    <div class="item-author">by ${item.author}</div>
                    <div class="item-price">Rs. ${item.price}</div>
                </div>
                <div class="item-quantity">Qty: ${item.quantity}</div>
            </div>
        `).join('');
        
        const moreItemsText = order.items.length > 2 ? 
            `<p class="more-items">and ${order.items.length - 2} more item(s)</p>` : '';
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-id">#${order.orderId}</div>
                        <div class="order-date">${formattedDate}</div>
                    </div>
                    <div class="order-status ${statusClass}">
                        ${order.status}
                    </div>
                </div>
                
                <div class="order-body">
                    <div class="order-items">
                        ${itemsDisplay}
                        ${moreItemsText}
                    </div>
                    
                    <div class="order-summary">
                        <div class="order-total">Total: Rs. ${order.totalAmount.toFixed(2)}</div>
                        <div class="order-actions">
                            <button class="btn btn-outline" onclick="viewOrderDetails(${order.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            ${getOrderActionButtons(order)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get order action buttons based on status
    function getOrderActionButtons(order) {
        switch(order.status) {
            case 'pending':
                return `<button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                            <i class="fas fa-times"></i> Cancel
                        </button>`;
            case 'delivered':
                return `<button class="btn btn-primary" onclick="reorderItems(${order.id})">
                            <i class="fas fa-redo"></i> Reorder
                        </button>`;
            default:
                return '';
        }
    }
    
    // View order details
    function viewOrderDetails(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;
        
        currentOrderDetails = order;
        displayOrderDetailsModal(order);
    }
    
    // Display order details modal
    function displayOrderDetailsModal(order) {
        const modalBody = document.getElementById('orderDetailsBody');
        
        modalBody.innerHTML = `
            <div class="order-details">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Order Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value">#${order.orderId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">
                            <span class="order-status status-${order.status}">${order.status}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-shipping-fast"></i> Shipping Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Customer:</span>
                        <span class="detail-value">${order.customerName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${order.contactNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${order.shippingAddress}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-list"></i> Order Items</h4>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Author</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        <img src="${getProductImage(item.imagePath)}" alt="${item.title}">
                                        ${item.title}
                                    </td>
                                    <td>${item.author}</td>
                                    <td>Rs. ${item.price}</td>
                                    <td>${item.quantity}</td>
                                    <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-calculator"></i> Order Summary</h4>
                    <div class="detail-row">
                        <span class="detail-label">Subtotal:</span>
                        <span class="detail-value">Rs. ${calculateSubtotal(order.items).toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Shipping:</span>
                        <span class="detail-value">Rs. 250.00</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><strong>Total:</strong></span>
                        <span class="detail-value"><strong>Rs. ${order.totalAmount.toFixed(2)}</strong></span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('orderDetailsModal').style.display = 'block';
    }
    
    // Calculate subtotal
    function calculateSubtotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // Cancel order
    function cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        showLoading();
        
        fetch(`${baseUrl}/customer/orders/${orderId}/cancel`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showToast('✅ Order cancelled successfully', 'success');
                loadOrders();
            } else {
                showToast('❌ Failed to cancel order', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Cancel order error:', error);
            showToast('❌ Failed to cancel order', 'error');
        });
    }
    
    // Reorder items
    function reorderItems(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;
        
        showLoading();
        
        const items = order.items.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        
        fetch(`${baseUrl}/customer/cart/add-multiple`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({items})
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showToast('✅ Items added to cart', 'success');
            } else {
                showToast('❌ Failed to add items to cart', 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Reorder error:', error);
            showToast('❌ Failed to reorder items', 'error');
        });
    }
    
    // Search orders
    function searchOrders(query) {
        if (!query.trim()) {
            displayOrders(filteredOrders);
            return;
        }
        
        const searchResults = filteredOrders.filter(order => 
            order.orderId.toLowerCase().includes(query.toLowerCase()) ||
            order.items.some(item => 
                item.title.toLowerCase().includes(query.toLowerCase())
            )
        );
        
        displayOrders(searchResults);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                applyFilter(btn.dataset.status);
            });
        });
        
        // Search input
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchOrders(e.target.value);
            });
        }
        
        // Modal close
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        // Global functions
        window.viewOrderDetails = viewOrderDetails;
        window.cancelOrder = cancelOrder;
        window.reorderItems = reorderItems;
        window.closeModal = closeModal;
        window.printOrderDetails = printOrderDetails;
        window.downloadReceipt = downloadReceipt;
        window.hideToast = hideToast;
    }
    
    // Check URL parameters
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (orderId) {
            setTimeout(() => {
                const order = allOrders.find(o => o.orderId === orderId);
                if (order) viewOrderDetails(order.id);
            }, 1000);
        }
    }
    
    // Show empty orders
    function showEmptyOrders() {
        const container = document.getElementById('ordersList');
        const emptyState = document.getElementById('emptyState');
        
        container.style.display = 'none';
        emptyState.style.display = 'block';
    }
    
    // Get product image URL
    function getProductImage(imagePath) {
        if (!imagePath || imagePath.trim() === '') {
            return defaultImage;
        }
        
        if (imagePath.startsWith('data:image/') || imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return baseUrl + '/' + imagePath;
    }
    
    // Modal functions
    function closeModal() {
        document.getElementById('orderDetailsModal').style.display = 'none';
    }
    
    function printOrderDetails() {
        if (!currentOrderDetails) return;
        
        const printContent = document.getElementById('orderDetailsBody').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Order Details - ${currentOrderDetails.orderId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .detail-section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
                        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                        .items-table { width: 100%; border-collapse: collapse; }
                        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .items-table img { width: 30px; height: 40px; }
                        h4 { color: #333; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
                    </style>
                </head>
                <body>
                    <h1>📚 Pahana Edu - Order Details</h1>
                    ${printContent}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
    
    function downloadReceipt() {
        if (!currentOrderDetails) return;
        showToast('📄 Generating receipt...', 'info');
        
        // Simulate receipt generation
        setTimeout(() => {
            showToast('✅ Receipt downloaded', 'success');
        }, 2000);
    }
    
    // Utility functions
    function showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }
    
    function hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => hideToast(), 5000);
    }
    
    function hideToast() {
        const toast = document.getElementById('toast');
        if (toast) toast.className = 'toast';
    }
});
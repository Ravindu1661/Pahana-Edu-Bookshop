// Simple Debug Version - orders.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Orders page loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    console.log('🔍 Base URL:', baseUrl);
    console.log('🔍 Full URL:', window.location.href);
    
    // Global variables
    let allOrders = [];
    let filteredOrders = [];
    let currentFilter = 'all';
    let searchQuery = '';
    
    // Initialize
    initOrdersPage();
    
    function initOrdersPage() {
        console.log('🔧 Initializing orders page...');
        setupEventListeners();
        loadUserOrders();
    }
    
    // Load user orders from API
    function loadUserOrders() {
        console.log('📋 Loading user orders...');
        const apiUrl = `${baseUrl}/customer/orders`;
        console.log('📡 API URL:', apiUrl);
        
        showLoading();
        
        fetch(apiUrl)
        .then(response => {
            console.log('📡 Response Status:', response.status);
            console.log('📡 Response OK:', response.ok);
            
            return response.text(); // Get text first to see raw response
        })
        .then(text => {
            console.log('📊 Raw Response:', text);
            
            // Try to parse as JSON
            try {
                const data = JSON.parse(text);
                console.log('📊 Parsed JSON:', data);
                
                hideLoading();
                
                if (data.success && data.orders) {
                    allOrders = data.orders;
                    console.log(`✅ ${allOrders.length} orders loaded from database`);
                    if (allOrders.length > 0) {
                        console.log('📋 First order:', allOrders[0]);
                    }
                    applyFilters();
                } else {
                    console.log('📭 No orders found or API failed');
                    showEmptyState();
                }
            } catch (e) {
                console.error('❌ JSON Parse Error:', e);
                console.log('Raw text was:', text);
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
                console.log('🔽 Filter changed to:', currentFilter);
                applyFilters();
            });
        });
        
        // Search input
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                console.log('🔍 Search query:', searchQuery);
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
        window.downloadInvoice = downloadInvoice;
        window.closeModal = closeModal;
        window.printOrderDetails = printOrderDetails;
        window.downloadReceipt = downloadReceipt;
        window.hideToast = hideToast;
    }
    
    // Apply filters and search
    function applyFilters() {
        console.log('🔄 Applying filters...');
        console.log('Current Filter:', currentFilter);
        console.log('Search Query:', searchQuery);
        console.log('All Orders:', allOrders.length);
        
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
        
        console.log('Filtered Orders:', filteredOrders.length);
        displayOrders();
    }
    
    // Display orders
    function displayOrders() {
        console.log('🖥️ Displaying orders...');
        const ordersList = document.getElementById('ordersList');
        const emptyState = document.getElementById('emptyState');
        
        if (!ordersList) {
            console.error('❌ ordersList element not found');
            return;
        }
        
        if (filteredOrders.length === 0) {
            console.log('📭 No orders to display');
            ordersList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        console.log(`📋 Displaying ${filteredOrders.length} orders`);
        ordersList.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // Sort orders by creation date (newest first)
        const sortedOrders = filteredOrders.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        ordersList.innerHTML = sortedOrders.map(order => createOrderCard(order)).join('');
    }
    
    // Create order card HTML
    function createOrderCard(order) {
        const orderDate = formatDate(order.createdAt);
        const statusClass = `status-${order.status}`;
        const statusDisplay = getStatusDisplay(order.status);
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-id">#${order.id}</div>
                        <div class="order-date">${orderDate}</div>
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
                        <div class="order-total">Total: Rs. ${parseFloat(order.totalAmount || 0).toFixed(2)}</div>
                        <div class="order-actions">
                            <button class="btn btn-primary" onclick="viewOrderDetails(${order.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            ${canCancelOrder(order.status) ? `
                                <button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            ` : ''}
                            ${order.status === 'delivered' ? `
                                <button class="btn btn-success" onclick="reorderItems(${order.id})">
                                    <i class="fas fa-redo"></i> Reorder
                                </button>
                            ` : ''}
                            <button class="btn btn-outline" onclick="downloadInvoice(${order.id})">
                                <i class="fas fa-download"></i> Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // View order details
    function viewOrderDetails(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            showToast('❌ Order not found', 'error');
            return;
        }
        
        const orderDate = formatDate(order.createdAt);
        const statusDisplay = getStatusDisplay(order.status);
        const paymentMethodDisplay = (order.paymentMethod === 'cod' || !order.paymentMethod) ? 'Cash on Delivery' : 'Online Payment';
        
        const modalBody = document.getElementById('orderDetailsBody');
        if (!modalBody) return;
        
        modalBody.innerHTML = `
            <div class="order-details">
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
                showToast('✅ Order cancelled successfully', 'success');
                // Update order status in local data
                const order = allOrders.find(o => o.id === orderId);
                if (order) {
                    order.status = 'cancelled';
                    applyFilters();
                }
            } else {
                showToast('❌ ' + (data.message || 'Failed to cancel order'), 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Cancel order error:', error);
            showToast('❌ Failed to cancel order. Please try again.', 'error');
        });
    }
    
    // Reorder items
    function reorderItems(orderId) {
        showToast('🛒 Reorder feature coming soon...', 'info');
    }
    
    // Download invoice
    function downloadInvoice(orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            showToast('❌ Order not found', 'error');
            return;
        }
        
        generateInvoice(order);
        showToast('✅ Invoice downloaded successfully', 'success');
    }
    
    // Generate invoice
    function generateInvoice(order) {
        const orderDate = formatDate(order.createdAt);
        const statusDisplay = getStatusDisplay(order.status);
        const paymentMethodDisplay = (order.paymentMethod === 'cod' || !order.paymentMethod) ? 'Cash on Delivery' : 'Online Payment';
        const subtotal = (order.orderItems || []).reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        const shipping = subtotal >= 3000 ? 0 : 250;
        
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 30px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .invoice-table th, .invoice-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    .invoice-table th { background: #f8f9fa; }
                    .total-section { text-align: right; }
                    .footer { text-align: center; margin-top: 30px; color: #666; }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <h1>📚 Pahana Edu</h1>
                    <p>Your trusted online bookstore</p>
                    <p>Phone: +94 11 234 5678 | Email: info@pahanaedu.lk</p>
                    <h2>INVOICE</h2>
                </div>
                
                <div class="invoice-details">
                    <div>
                        <h3>Invoice To:</h3>
                        <p><strong>${order.customerName || 'Customer'}</strong></p>
                        <p>${order.shippingAddress || 'N/A'}</p>
                        <p>Phone: ${order.contactNumber || 'N/A'}</p>
                        <br>
                        <p><strong>Invoice #:</strong> ${order.id}</p>
                        <p><strong>Date:</strong> ${orderDate}</p>
                        <p><strong>Status:</strong> ${statusDisplay}</p>
                        <p><strong>Payment:</strong> ${paymentMethodDisplay}</p>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Item</th>
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
                
                <div class="total-section">
                    <p>Subtotal: Rs. ${subtotal.toFixed(2)}</p>
                    <p>Shipping: ${shipping === 0 ? 'Free' : 'Rs. ' + shipping.toFixed(2)}</p>
                    <h3>Total: Rs. ${parseFloat(order.totalAmount || 0).toFixed(2)}</h3>
                </div>
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Visit us at www.pahanaedu.lk</p>
                </div>
            </body>
            </html>
        `;
        
        // Create and download the invoice
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${order.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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
    
    function calculateOrderSummary(order) {
        const subtotal = (order.orderItems || []).reduce((sum, item) => 
            sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
        const shipping = subtotal >= 3000 ? 0 : 250;
        const total = parseFloat(order.totalAmount || 0);
        
        return `
            <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">Rs. ${subtotal.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Shipping:</span>
                <span class="detail-value">${shipping === 0 ? 'Free' : 'Rs. ' + shipping.toFixed(2)}</span>
            </div>
            <div class="detail-row" style="border-top: 2px solid #dee2e6; padding-top: 10px; margin-top: 10px;">
                <span class="detail-label"><strong>Total:</strong></span>
                <span class="detail-value"><strong>Rs. ${total.toFixed(2)}</strong></span>
            </div>
        `;
    }
    
    function printOrderDetails() {
        window.print();
    }
    
    function downloadReceipt() {
        showToast('✅ Receipt download feature coming soon...', 'info');
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
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) {
            console.log('Toast:', message);
            return;
        }
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
    
    function hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.className = 'toast';
        }
    }
});
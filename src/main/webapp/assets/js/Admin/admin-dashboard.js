document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Simple Admin Dashboard loaded');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');
    
    // Get context path
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    console.log('📍 Context Path:', contextPath);
    console.log('🔗 Base URL:', baseUrl);
    
    // Track current page
    let currentPage = null;
    let isLoading = false;
    
    // Navigation handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Prevent multiple clicks during loading
            if (isLoading) {
                console.log('⚠️ Page loading in progress, ignoring click');
                return;
            }
            
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
                loadPageSimple(page);
            }
        });
    });
    
    /**
     * Simple page loading
     */
    function loadPageSimple(page) {
        console.log('📄 Loading page:', page);
        
        // Set loading state
        isLoading = true;
        currentPage = page;
        
        // Show loading indicator
        contentArea.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px; text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 15px;">Loading content...</p>
            </div>
        `;
        
        // Force cleanup before loading
        forceCleanup();
        
        fetch(page)
            .then(response => {
                console.log('📡 Page response status:', response.status);
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(data => {
                console.log('✅ Page loaded successfully');
                contentArea.innerHTML = data;
                
                // Initialize page after DOM is ready
                setTimeout(() => {
                    initializePage(page);
                    isLoading = false;
                }, 300);
            })
            .catch(error => {
                console.error('❌ Page loading error:', error);
                isLoading = false;
                contentArea.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #dc3545;">
                        <h3>❌ Error Loading Content</h3>
                        <p>Failed to load: ${page}</p>
                        <p>Error: ${error.message}</p>
                        <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">🔄 Retry</button>
                    </div>
                `;
            });
    }
    
    /**
     * Force cleanup all modules
     */
    function forceCleanup() {
        console.log('🧹 Force cleanup all modules...');
        
        // Reset all global variables
        window.currentUsers = [];
        window.currentEditUser = null;
        window.currentDeleteUser = null;
        window.currentOrders = [];
        window.currentOrderDetails = null;
        window.currentItems = [];
        window.currentCategories = [];
        window.editItem = null;
        window.deleteItem = null;
        window.editCategory = null;
        window.deleteCategory = null;
        window.currentImageData = null;
        
        console.log('✅ Force cleanup completed');
    }
    
    /**
     * Initialize page based on type
     */
    function initializePage(page) {
        console.log('🔧 Initializing page:', page);
        
        if (page.includes('admin-Manage-Users.jsp')) {
            console.log('👥 Initializing User Management...');
            initializeUsers();
        } else if (page.includes('admin-Manage-Items.jsp')) {
            console.log('📦 Initializing Item Management...');
            initializeItems();
        } else if (page.includes('admin-Billing.jsp')) {
            console.log('💳 Initializing Billing Management...');
            initializeBilling();
        } else if (page.includes('admin-System-Settings.jsp')) {
            console.log('⚙️ Initializing System Settings...');
            initializeSettings();
        }
    }
    
    /**
     * Initialize User Management
     */
    function initializeUsers() {
        // Check required elements
        const requiredElements = ['totalUsers', 'adminCount', 'usersTableBody'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing user elements:', missingElements);
            setTimeout(() => {
                initializeUsers();
            }, 500);
            return;
        }
        
        console.log('✅ User elements found, loading data...');
        loadUserStats();
        loadUsers();
        setupUserEvents();
        makeUserFunctionsGlobal();
    }
    
    /**
     * Initialize Item Management - FIXED VERSION
     */
    function initializeItems() {
        // Check required elements first
        const requiredElements = ['totalItems', 'activeItems', 'itemsTableBody', 'addItemBtn'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing item elements:', missingElements);
            setTimeout(() => {
                initializeItems();
            }, 500);
            return;
        }
        
        console.log('✅ Item elements found, initializing...');
        
        // Initialize directly with built-in functions
        loadItemStats();
        loadItems();
        loadCategories();
        setupItemEvents();
        setupItemFormHandlers(); // NEW: Setup form handlers
        makeItemFunctionsGlobal();
    }
    
    /**
     * Initialize Billing Management - FIXED VERSION
     */
    function initializeBilling() {
        // Check required elements first
        const requiredElements = ['totalOrders', 'pendingOrders', 'ordersTableBody'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing billing elements:', missingElements);
            setTimeout(() => {
                initializeBilling();
            }, 500);
            return;
        }
        
        console.log('✅ Billing elements found, initializing...');
        
        // Initialize directly with built-in functions
        loadOrderStats();
        loadOrders();
        setupBillingEvents();
        makeBillingFunctionsGlobal();
    }
    
    /**
     * Initialize System Settings
     */
    function initializeSettings() {
        console.log('⚙️ Settings initialized');
    }
    
    // Item Management Variables
    let currentItems = [];
    let currentCategories = [];
    let editItem = null;
    let deleteItem = null;
    let editCategory = null;
    let deleteCategory = null;
    let currentImageData = null;
    
    // Billing Management Variables
    let currentOrders = [];
    let currentOrderDetails = null;
    
    // BILLING MANAGEMENT FUNCTIONS - ADDED
    
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
    
    function showStatsError(message) {
        console.error('📊 Stats error:', message);
        const elements = ['totalOrders', 'pendingOrders', 'confirmedOrders', 'shippedOrders', 'deliveredOrders', 'totalRevenue'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Error';
        });
        showToast('Statistics error: ' + message, 'error');
    }
    
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
                <td colspan="8" style="text-align: center; padding: 20px;">
                    🔄 Loading orders...
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
                    <td colspan="8" style="text-align: center; padding: 20px;">
                        📭 No orders found
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
                                         style="width: 30px; height: 35px; object-fit: cover; margin-right: 5px;"
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
                                    👁️ View
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
    
    function getPaymentMethodDisplay(paymentMethod) {
        switch (paymentMethod) {
            case 'cod': return 'COD';
            case 'online': return 'Online';
            default: return paymentMethod || 'N/A';
        }
    }
    
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
    
    function showOrdersError(message) {
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (ordersTableBody) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #dc3545;">
                        ❌ ${message}
                        <br><br>
                        <button class="btn btn-view" onclick="loadOrders()" style="margin-top: 15px;">
                            🔄 Try Again
                        </button>
                    </td>
                </tr>
            `;
        }
        showToast(message, 'error');
    }
    
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
    
    function displayOrderItemsInModal(orderItems) {
        const orderItemsTableBody = document.getElementById('orderItemsTableBody');
        
        if (!orderItemsTableBody) {
            console.error('❌ Order items table body not found');
            return;
        }
        
        if (orderItems.length === 0) {
            orderItemsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No items found</td></tr>';
            return;
        }
        
        try {
            const defaultImage = 'https://via.placeholder.com/40x50';
            orderItemsTableBody.innerHTML = orderItems.map(item => {
                const itemTotal = parseFloat(item.price || 0) * parseInt(item.quantity || 0);
                
                return `
                    <tr>
                        <td>
                            <div class="item-details" style="display: flex; align-items: center;">
                                <img src="${item.itemImagePath || defaultImage}" 
                                     alt="${item.itemTitle}" 
                                     class="item-image" 
                                     style="width: 40px; height: 50px; object-fit: cover; margin-right: 10px;"
                                     onerror="this.src='${defaultImage}'">
                                <div class="item-info">
                                    <h6 style="margin: 0; font-size: 14px;">${item.itemTitle || 'N/A'}</h6>
                                    <small style="color: #666;">by ${item.itemAuthor || 'Unknown'}</small>
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
            orderItemsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #dc3545;">Error loading items</td></tr>';
        }
    }
    
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
    
    function closeOrderModal() {
        console.log('❌ Closing order details modal');
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentOrderDetails = null;
        }
    }
    
    function setupBillingEvents() {
        console.log('🎯 Setting up billing events...');
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshOrdersBtn');
        if (refreshBtn) {
            refreshBtn.onclick = function(e) {
                e.preventDefault();
                console.log('🔄 Refresh button clicked');
                loadOrderStats();
                loadOrders();
            };
            console.log('✅ Refresh button listener added');
        }
        
        // Filter dropdowns
        const statusFilter = document.getElementById('statusFilter');
        const paymentFilter = document.getElementById('paymentFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (statusFilter) {
            statusFilter.onchange = function() {
                console.log('🔍 Status filter changed:', this.value);
                loadOrders();
            };
            console.log('✅ Status filter listener added');
        }
        
        if (paymentFilter) {
            paymentFilter.onchange = function() {
                console.log('🔍 Payment filter changed:', this.value);
                loadOrders();
            };
            console.log('✅ Payment filter listener added');
        }
        
        if (dateFilter) {
            dateFilter.onchange = function() {
                console.log('🔍 Date filter changed:', this.value);
                loadOrders();
            };
            console.log('✅ Date filter listener added');
        }
        
        console.log('✅ Billing events setup complete');
    }
    
    function makeBillingFunctionsGlobal() {
        window.loadOrders = loadOrders;
        window.viewOrderDetails = viewOrderDetails;
        window.updateOrderStatus = updateOrderStatus;
        window.closeOrderModal = closeOrderModal;
        window.loadOrderStats = loadOrderStats;
        
        console.log('✅ Billing functions made global');
    }
    
    function loadUserStats() {
        console.log('📊 Loading user stats...');
        fetch(`${baseUrl}/admin/user-stats`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateUserStatsUI(data.stats);
            } else {
                showUserStatsError(data.message);
            }
        })
        .catch(error => {
            console.error('❌ User stats error:', error);
            showUserStatsError(error.message);
        });
    }
    
    function updateUserStatsUI(stats) {
        const elements = {
            totalUsers: document.getElementById('totalUsers'),
            adminCount: document.getElementById('adminCount'),
            managerCount: document.getElementById('managerCount'),
            cashierCount: document.getElementById('cashierCount'),
            customerCount: document.getElementById('customerCount')
        };
        
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key] || 0;
            }
        });
    }
    
    function showUserStatsError(message) {
        const elements = ['totalUsers', 'adminCount', 'managerCount', 'cashierCount', 'customerCount'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Error';
        });
        showToast('User statistics error: ' + message, 'error');
    }
    
    function loadUsers() {
        console.log('👥 Loading users...');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">🔄 Loading users...</td></tr>';
        
        fetch(`${baseUrl}/admin/users`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUsers = data.users || [];
                displayUsers(currentUsers);
            } else {
                showUsersError('Failed to load users: ' + data.message);
            }
        })
        .catch(error => {
            console.error('❌ Users fetch error:', error);
            showUsersError('Error loading users: ' + error.message);
        });
    }
    
    function displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => {
            const fullName = (user.firstName || '') + ' ' + (user.lastName || '');
            return `
                <tr>
                    <td>${user.id || 'N/A'}</td>
                    <td>${fullName.trim() || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td><span class="badge role-${(user.role || '').toLowerCase()}">${user.role || 'N/A'}</span></td>
                    <td><span class="badge status-${(user.status || '').toLowerCase()}">${user.status || 'N/A'}</span></td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editUser(${user.id})">Edit</button>
                        <button class="action-btn delete-btn" onclick="confirmDeleteUser(${user.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    function showUsersError(message) {
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #dc3545;">❌ ${message}</td></tr>`;
        }
        showToast(message, 'error');
    }
    
    function setupUserEvents() {
        console.log('🎯 Setting up user events...');
    }
    
    function makeUserFunctionsGlobal() {
        window.editUser = function(id) { console.log('Edit user:', id); };
        window.confirmDeleteUser = function(id) { console.log('Delete user:', id); };
        window.loadUsers = loadUsers;
    }
    
    // ITEM MANAGEMENT FUNCTIONS - SIMPLIFIED AND FIXED
    
    function loadItemStats() {
        console.log('📊 Loading item statistics...');
        fetch(`${baseUrl}/admin/items/stats`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    updateItemStatsUI(data.stats);
                    console.log('✅ Item statistics loaded successfully');
                } else {
                    console.error('❌ Item statistics API error:', data.message);
                    showToast('Item statistics error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Item statistics fetch error:', error);
                showToast('Error loading item statistics', 'error');
            });
    }
    
    function updateItemStatsUI(stats) {
        const elements = {
            totalItems: document.getElementById('totalItems'),
            activeItems: document.getElementById('activeItems'),
            inactiveItems: document.getElementById('inactiveItems'),
            outOfStockItems: document.getElementById('outOfStockItems'),
            totalCategories: document.getElementById('totalCategories')
        };
        
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key] || 0;
            }
        });
        console.log('✅ Item stats UI updated successfully');
    }
    
    function loadItems() {
        console.log('📦 Loading items...');
        const tbody = document.getElementById('itemsTableBody');
        
        if (!tbody) {
            console.error('❌ Items table body not found');
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">🔄 Loading items...</td></tr>';
        
        let url = `${baseUrl}/admin/items/list`;
        
        // Apply filters
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const params = new URLSearchParams();
        
        if (categoryFilter?.value) params.append('category', categoryFilter.value);
        if (statusFilter?.value) params.append('status', statusFilter.value);
        if (params.toString()) url += '?' + params.toString();
        
        console.log('📡 Items URL:', url);
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    currentItems = data.items || [];
                    displayItems(currentItems);
                    console.log(`✅ ${currentItems.length} items loaded successfully`);
                } else {
                    showItemsError('Failed to load items: ' + data.message);
                }
            })
            .catch(error => {
                console.error('❌ Items fetch error:', error);
                showItemsError('Network error loading items');
            });
    }
    
    function displayItems(items) {
        const tbody = document.getElementById('itemsTableBody');
        
        if (!tbody) {
            console.error('❌ Items table body not found');
            return;
        }
        
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">📭 No items found</td></tr>';
            return;
        }
        
        const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIT0JYsgYabTZ5gykfiSeOUxN6NDDXuuHVuA&s';
        
        try {
            tbody.innerHTML = items.map(item => {
                let imageUrl = defaultImage;
                if (item.imagePath && item.imagePath.trim() !== '') {
                    imageUrl = item.imagePath;
                }
                
                const priceDisplay = item.offerPrice ? 
                    `<div class="price-display">
                        <span class="original-price">Rs. ${item.price}</span>
                        <span class="offer-price">Rs. ${item.offerPrice}</span>
                     </div>` : 
                    `Rs. ${item.price}`;
                
                return `
                    <tr>
                        <td>${item.id}</td>
                        <td>
                            <div class="item-info">
                                <img src="${imageUrl}" alt="${item.title}" class="item-image" onerror="this.src='${defaultImage}'" style="width: 40px; height: 50px; object-fit: cover; margin-right: 10px;">
                                <span class="item-title" title="${item.title}">${item.title}</span>
                            </div>
                        </td>
                        <td>${item.author}</td>
                        <td>${item.categoryName}</td>
                        <td>${priceDisplay}</td>
                        <td><span class="stock">${item.stock}</span></td>
                        <td>${item.referenceNo || 'N/A'}</td>
                        <td><span class="badge">${item.status}</span></td>
                        <td>
                            <button onclick="editItemFunc(${item.id})" class="action-btn edit-btn">Edit</button>
                            <button onclick="deleteItemFunc(${item.id})" class="action-btn delete-btn">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            console.log('✅ Items table updated successfully');
        } catch (error) {
            console.error('❌ Error displaying items:', error);
            showItemsError('Error displaying items: ' + error.message);
        }
    }
    
    function showItemsError(message) {
        const tbody = document.getElementById('itemsTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #dc3545;">❌ ${message}</td></tr>`;
        }
        showToast(message, 'error');
    }
    
    function loadCategories() {
        console.log('🏷️ Loading categories...');
        fetch(`${baseUrl}/admin/items/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    currentCategories = data.categories || [];
                    updateCategoryDropdowns();
                    console.log(`✅ ${currentCategories.length} categories loaded successfully`);
                } else {
                    console.error('❌ Categories API error:', data.message);
                    showToast('Categories error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Categories fetch error:', error);
                showToast('Error loading categories', 'error');
            });
    }
    
    function updateCategoryDropdowns() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categorySelect = document.getElementById('categoryId');
        
        const options = currentCategories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>' + options;
        }
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' + options;
        }
    }
    
    function setupItemEvents() {
        console.log('🎯 Setting up item events...');
        
        const addItemBtn = document.getElementById('addItemBtn');
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (addItemBtn) {
            addItemBtn.onclick = function(e) {
                e.preventDefault();
                console.log('Add item clicked - opening modal');
                openAddItemModal();
            };
            console.log('✅ Add item button listener added');
        }
        
        if (manageCategoriesBtn) {
            manageCategoriesBtn.onclick = function(e) {
                e.preventDefault();
                console.log('Manage categories clicked - opening modal');
                openCategoriesListModal();
            };
            console.log('✅ Manage categories button listener added');
        }
        
        if (categoryFilter) {
            categoryFilter.onchange = loadItems;
        }
        
        if (statusFilter) {
            statusFilter.onchange = loadItems;
        }
        
        console.log('✅ Item events setup complete');
    }
    
    // NEW: Setup form handlers specifically
    function setupItemFormHandlers() {
        console.log('📝 Setting up form handlers...');
        
        // Wait a bit for modal to be in DOM
        setTimeout(() => {
            const itemForm = document.getElementById('itemForm');
            const categoryForm = document.getElementById('categoryForm');
            const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
            
            if (itemForm) {
                itemForm.onsubmit = handleItemFormSubmit;
                console.log('✅ Item form handler set');
            }
            
            if (categoryForm) {
                categoryForm.onsubmit = handleCategoryFormSubmit;
                console.log('✅ Category form handler set');
            }
            
            if (confirmDeleteBtn) {
                confirmDeleteBtn.onclick = performDelete;
                console.log('✅ Delete button handler set');
            }
        }, 100);
    }
    
    // Item Modal Functions
    function openAddItemModal() {
        console.log('➕ Opening add item modal');
        editItem = null;
        currentImageData = null;
        
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        const modalTitle = document.getElementById('itemModalTitle');
        
        if (!modal) {
            console.error('❌ Item modal not found');
            showToast('Item modal not found', 'error');
            return;
        }
        
        if (form) {
            form.reset();
            const isEditField = document.getElementById('isEdit');
            if (isEditField) isEditField.value = 'false';
            
            // Clear image preview
            const preview = document.getElementById('imagePreview');
            if (preview) preview.style.display = 'none';
            
            // Hide reference number field
            const refGroup = document.querySelector('label[for="referenceNo"]')?.parentElement;
            if (refGroup) refGroup.style.display = 'none';
            
            // Set form handler
            form.onsubmit = handleItemFormSubmit;
        }
        
        if (modalTitle) modalTitle.textContent = 'Add New Item';
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const titleField = document.getElementById('title');
        if (titleField) {
            setTimeout(() => titleField.focus(), 100);
        }
        
        console.log('✅ Add item modal opened successfully');
    }
    
    function closeItemModal() {
        console.log('❌ Closing item modal');
        const modal = document.getElementById('itemModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            editItem = null;
            currentImageData = null;
        }
    }
    
    function openCategoriesListModal() {
        console.log('🏷️ Opening categories management modal');
        const modal = document.getElementById('categoriesListModal');
        
        if (!modal) {
            console.error('❌ Categories list modal not found');
            showToast('Categories modal not found', 'error');
            return;
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        loadCategoriesTable();
        
        console.log('✅ Categories management modal opened successfully');
    }
    
    function closeCategoriesListModal() {
        console.log('❌ Closing categories list modal');
        const modal = document.getElementById('categoriesListModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    function openAddCategoryModal() {
        console.log('➕ Opening add category modal');
        editCategory = null;
        
        closeCategoriesListModal();
        
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        const modalTitle = document.getElementById('categoryModalTitle');
        const statusGroup = document.getElementById('categoryStatusGroup');
        
        if (!modal) {
            console.error('❌ Category modal not found');
            showToast('Category modal not found', 'error');
            return;
        }
        
        if (form) {
            form.reset();
            const isEditField = document.getElementById('isCategoryEdit');
            if (isEditField) isEditField.value = 'false';
            
            // Set form handler
            form.onsubmit = handleCategoryFormSubmit;
        }
        
        if (modalTitle) modalTitle.textContent = 'Add New Category';
        if (statusGroup) statusGroup.style.display = 'none';
        
        setTimeout(() => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const nameField = document.getElementById('categoryName');
            if (nameField) nameField.focus();
        }, 100);
        
        console.log('✅ Add category modal opened successfully');
    }
    
    function closeCategoryModal() {
        console.log('❌ Closing category modal');
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            editCategory = null;
        }
        
        setTimeout(() => {
            openCategoriesListModal();
        }, 100);
    }
    
    function loadCategoriesTable() {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;
        
        if (currentCategories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No categories found</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentCategories.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.name}</td>
                <td>${cat.description || 'No description'}</td>
                <td><span class="badge status-active">Active</span></td>
                <td>
                    <button onclick="editCategory(${cat.id})" class="action-btn edit-btn" title="Edit Category">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteCategory(${cat.id})" class="action-btn delete-btn" title="Delete Category">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
        console.log('✅ Categories table loaded');
    }
    
    function editItemFunc(id) {
        console.log('✏️ Editing item:', id);
        editItem = currentItems.find(item => item.id === id);
        
        if (!editItem) {
            showToast('Item not found', 'error');
            return;
        }
        
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('itemModalTitle');
        const form = document.getElementById('itemForm');
        
        if (modal) {
            // Fill form with item data
            const fields = {
                itemId: editItem.id,
                title: editItem.title,
                author: editItem.author,
                categoryId: editItem.categoryId,
                price: editItem.price,
                offerPrice: editItem.offerPrice || '',
                stock: editItem.stock,
                description: editItem.description,
                status: editItem.status,
                isEdit: 'true'
            };
            
            Object.keys(fields).forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = fields[fieldId];
            });
            
            if (modalTitle) modalTitle.textContent = 'Edit Item';
            
            // Set current image data
            currentImageData = editItem.imagePath;
            
            // Show existing image if available
            if (editItem.imagePath && editItem.imagePath.trim() !== '') {
                const preview = document.getElementById('imagePreview');
                const img = document.getElementById('previewImg');
                if (preview && img) {
                    img.src = editItem.imagePath;
                    preview.style.display = 'block';
                }
            }
            
            // Set form handler
            if (form) {
                form.onsubmit = handleItemFormSubmit;
            }
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const titleField = document.getElementById('title');
            if (titleField) titleField.focus();
        }
    }
    
    function deleteItemFunc(id) {
        console.log('🗑️ Confirming delete item:', id);
        deleteItem = currentItems.find(item => item.id === id);
        deleteCategory = null;
        
        if (!deleteItem) {
            showToast('Item not found', 'error');
            return;
        }
        
        const modal = document.getElementById('deleteModal');
        const deleteType = document.getElementById('deleteType');
        const deleteName = document.getElementById('deleteName');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        
        if (deleteType) deleteType.textContent = 'item';
        if (deleteName) deleteName.textContent = deleteItem.title;
        
        // Set delete handler
        if (confirmBtn) {
            confirmBtn.onclick = performDelete;
        }
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function editCategoryFunc(id) {
        console.log('✏️ Editing category:', id);
        editCategory = currentCategories.find(cat => cat.id === id);
        
        if (!editCategory) {
            showToast('Category not found', 'error');
            return;
        }
        
        closeCategoriesListModal();
        
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('categoryModalTitle');
        const statusGroup = document.getElementById('categoryStatusGroup');
        const form = document.getElementById('categoryForm');
        
        if (modal) {
            const editIdField = document.getElementById('categoryIdEdit');
            const nameField = document.getElementById('categoryName');
            const descField = document.getElementById('categoryDescription');
            const isEditField = document.getElementById('isCategoryEdit');
            
            if (editIdField) editIdField.value = editCategory.id;
            if (nameField) nameField.value = editCategory.name;
            if (descField) descField.value = editCategory.description || '';
            if (isEditField) isEditField.value = 'true';
            if (modalTitle) modalTitle.textContent = 'Edit Category';
            if (statusGroup) statusGroup.style.display = 'block';
            
            // Set form handler
            if (form) {
                form.onsubmit = handleCategoryFormSubmit;
            }
            
            setTimeout(() => {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                if (nameField) nameField.focus();
            }, 100);
        }
    }
    
    function deleteCategoryFunc(id) {
        console.log('🗑️ Confirming delete category:', id);
        deleteCategory = currentCategories.find(cat => cat.id === id);
        deleteItem = null;
        
        if (!deleteCategory) {
            showToast('Category not found', 'error');
            return;
        }
        
        const modal = document.getElementById('deleteModal');
        const deleteType = document.getElementById('deleteType');
        const deleteName = document.getElementById('deleteName');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        
        if (deleteType) deleteType.textContent = 'category';
        if (deleteName) deleteName.textContent = deleteCategory.name;
        
        // Set delete handler
        if (confirmBtn) {
            confirmBtn.onclick = performDelete;
        }
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeDeleteModal() {
        console.log('❌ Closing delete modal');
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            deleteItem = null;
            deleteCategory = null;
        }
    }
    
    // Form submission handlers
    function handleItemFormSubmit(e) {
        e.preventDefault();
        console.log('📝 Submitting item form');
        
        const formData = new FormData(e.target);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key !== 'imageUpload') {
                data[key] = value.trim();
            }
        }
        
        // Add image data
        data.imagePath = currentImageData || '';
        
        // Enhanced validation
        const requiredFields = {
            title: 'Title',
            author: 'Author', 
            categoryId: 'Category',
            price: 'Price',
            stock: 'Stock Quantity'
        };
        
        const missingFields = [];
        Object.keys(requiredFields).forEach(field => {
            if (!data[field] || data[field] === '') {
                missingFields.push(requiredFields[field]);
            }
        });
        
        if (missingFields.length > 0) {
            showToast(`Please fill in required fields: ${missingFields.join(', ')}`, 'error');
            return;
        }
        
        // Validate numeric fields
        if (isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
            showToast('Please enter a valid price', 'error');
            return;
        }
        
        if (isNaN(parseInt(data.stock)) || parseInt(data.stock) < 0) {
            showToast('Please enter a valid stock quantity', 'error');
            return;
        }
        
        if (data.offerPrice && (isNaN(parseFloat(data.offerPrice)) || parseFloat(data.offerPrice) <= 0)) {
            showToast('Please enter a valid offer price', 'error');
            return;
        }
        
        // Convert to proper format
        data.price = parseFloat(data.price).toFixed(2);
        data.stock = parseInt(data.stock);
        if (data.offerPrice) {
            data.offerPrice = parseFloat(data.offerPrice).toFixed(2);
        }
        
        // Set default status if not provided
        if (!data.status) {
            data.status = 'active';
        }
        
        const isEdit = data.isEdit === 'true';
        const url = isEdit ? `${baseUrl}/admin/items/update` : `${baseUrl}/admin/items/create`;
        
        console.log('📤 Sending data:', data);
        console.log('📡 URL:', url);
        
        // Show loading state
        const submitBtn = document.getElementById('submitItemBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '🔄 Saving...';
        }
        
        fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(data)
        })
            .then(response => {
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', response.headers);
                
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('❌ Server response:', text);
                        throw new Error(`HTTP ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('✅ Response data:', data);
                if (data.success) {
                    showToast(data.message || 'Item saved successfully', 'success');
                    closeItemModal();
                    loadItems();
                    loadItemStats();
                } else {
                    showToast(data.message || 'Failed to save item', 'error');
                }
            })
            .catch(error => {
                console.error('❌ Form submission error:', error);
                showToast('Error saving item: ' + error.message, 'error');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="icon-save"></i> Save Item';
                }
            });
    }
    
    function handleCategoryFormSubmit(e) {
        e.preventDefault();
        console.log('📝 Submitting category form');
        
        const formData = new FormData(e.target);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        if (!data.name) {
            showToast('Category name is required', 'error');
            return;
        }
        
        const isEdit = data.isCategoryEdit === 'true';
        const url = isEdit ? `${baseUrl}/admin/items/update-category` : `${baseUrl}/admin/items/create-category`;
        
        // Show loading state
        const submitBtn = document.getElementById('submitCategoryBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '🔄 Saving...';
        }
        
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    
                    const modal = document.getElementById('categoryModal');
                    if (modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                    editCategory = null;
                    
                    loadCategories();
                    loadItemStats();
                    
                    setTimeout(() => {
                        openCategoriesListModal();
                    }, 200);
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Category form submission error:', error);
                showToast('Error saving category', 'error');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="icon-save"></i> Save Category';
                }
            });
    }
    
    function performDelete() {
        console.log('🗑️ Performing delete operation');
        if (deleteItem) {
            deleteItemConfirmed();
        } else if (deleteCategory) {
            deleteCategoryConfirmed();
        } else {
            console.error('❌ No item or category selected for deletion');
            showToast('No item selected for deletion', 'error');
        }
    }
    
    function deleteItemConfirmed() {
        console.log('🗑️ Deleting item:', deleteItem.id);
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '🔄 Deleting...';
        }
        
        fetch(`${baseUrl}/admin/items/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ itemId: deleteItem.id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    closeDeleteModal();
                    loadItems();
                    loadItemStats();
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Delete item error:', error);
                showToast('Error deleting item', 'error');
            })
            .finally(() => {
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = '<i class="icon-trash"></i> Delete';
                }
            });
    }
    
    function deleteCategoryConfirmed() {
        console.log('🗑️ Deleting category:', deleteCategory.id);
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '🔄 Deleting...';
        }
        
        fetch(`${baseUrl}/admin/items/delete-category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ categoryId: deleteCategory.id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    closeDeleteModal();
                    loadCategories();
                    loadItemStats();
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Delete category error:', error);
                showToast('Error deleting category', 'error');
            })
            .finally(() => {
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = '<i class="icon-trash"></i> Delete';
                }
            });
    }
    
    // Image handling functions
    function previewImage(input) {
        console.log('🖼️ Previewing image...');
        
        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // Validate file size (max 5MB for base64)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size should be less than 5MB', 'error');
                input.value = '';
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                input.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                const img = document.getElementById('previewImg');
                
                if (img && preview) {
                    currentImageData = e.target.result;
                    img.src = e.target.result;
                    preview.style.display = 'block';
                    
                    console.log('✅ Image converted to base64 successfully');
                }
            };
            
            reader.onerror = function() {
                showToast('Error reading image file', 'error');
                input.value = '';
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    function removeImage() {
        console.log('🗑️ Removing image...');
        
        const upload = document.getElementById('imageUpload');
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        
        if (upload) upload.value = '';
        if (preview) preview.style.display = 'none';
        if (img) img.src = '';
        
        currentImageData = null;
        
        console.log('✅ Image removed successfully');
    }
    
    function makeItemFunctionsGlobal() {
        window.editItemFunc = editItemFunc;
        window.deleteItemFunc = deleteItemFunc;
        window.editCategory = editCategoryFunc;
        window.deleteCategory = deleteCategoryFunc;
        window.loadItems = loadItems;
        window.loadCategories = loadCategories;
        window.filterItems = loadItems;
        window.openAddItemModal = openAddItemModal;
        window.closeItemModal = closeItemModal;
        window.openCategoriesListModal = openCategoriesListModal;
        window.closeCategoriesListModal = closeCategoriesListModal;
        window.openAddCategoryModal = openAddCategoryModal;
        window.closeCategoryModal = closeCategoryModal;
        window.closeDeleteModal = closeDeleteModal;
        window.previewImage = previewImage;
        window.removeImage = removeImage;
        window.performDelete = performDelete;
        window.handleItemFormSubmit = handleItemFormSubmit;
        window.handleCategoryFormSubmit = handleCategoryFormSubmit;
        window.hideToast = hideToast;
        
        console.log('✅ Item functions made global');
    }
    
    // Global modal and keyboard event handling
    document.addEventListener('click', (e) => {
        // Modal outside click handling
        const modals = ['userModal', 'deleteModal', 'itemModal', 'categoryModal', 'categoriesListModal', 'orderDetailsModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close all modals on escape
            const modals = ['userModal', 'deleteModal', 'itemModal', 'categoryModal', 'categoriesListModal', 'orderDetailsModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
            
            const toast = document.getElementById('messageToast') || document.getElementById('toast');
            if (toast) {
                toast.classList.remove('show');
            }
        }
    });
    
    // Toast notification function
    function showToast(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        const toast = document.getElementById('messageToast') || document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                hideToast();
            }, 4000);
        }
    }
    
    function hideToast() {
        const toast = document.getElementById('messageToast') || document.getElementById('toast');
        if (toast) {
            toast.classList.remove('show');
        }
    }
    
    // Make toast function global
    window.showToast = showToast;
    
    // Load default page after initialization
    setTimeout(() => {
        const defaultLink = document.querySelector('.nav-link[data-page*="admin-Manage-Users.jsp"]');
        if (defaultLink) {
            console.log('🏠 Loading default page...');
            defaultLink.click();
        }
    }, 100);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .toast.show { 
            opacity: 1; 
            transform: translateY(0); 
            visibility: visible;
        }
        .toast { 
            opacity: 0; 
            transform: translateY(-20px); 
            transition: all 0.3s ease;
            visibility: hidden;
        }
    `;
    document.head.appendChild(style);
    
    console.log('🎉 Simple Admin Dashboard setup complete!');
});
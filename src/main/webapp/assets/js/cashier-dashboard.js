// 🚀 Pahana Edu Cashier Dashboard - Main JavaScript File
// This file contains all functionality for cashier operations

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Pahana Edu Cashier Dashboard loaded');
    
    // Global variables
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Get context path and base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    console.log('📍 Context Path:', contextPath);
    console.log('🔗 Base URL:', baseUrl);
    
    // Current page tracking
    let currentSection = 'dashboard';
    let isLoading = false;
    
    // Global data storage
    let currentItems = [];
    let currentOrderItems = [];
    let currentPromoCode = null;
    let orderSubtotal = 0;
    let orderDiscount = 0;
    let orderTotal = 0;
    
    // Initialize dashboard
    initializeDashboard();
    
    /**
     * Initialize the main dashboard
     */
    function initializeDashboard() {
        console.log('🔧 Initializing cashier dashboard...');
        
        // Setup navigation
        setupNavigation();
        
        // Load initial statistics
        loadDashboardStats();
        
        // Setup global event listeners
        setupGlobalEvents();
        
        console.log('✅ Cashier dashboard initialization complete');
    }
    
    /**
     * Setup navigation handling
     */
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Prevent multiple clicks during loading
                if (isLoading) {
                    console.log('⚠️ Section loading in progress, ignoring click');
                    return;
                }
                
                // Handle logout separately
                if (link.getAttribute('href') === 'logout') {
                    window.location.href = 'logout';
                    return;
                }
                
                // Get section from onclick attribute
                const onclickAttr = link.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/showSection\('(.+?)'\)/);
                    if (match) {
                        const section = match[1];
                        showSection(section);
                    }
                }
            });
        });
    }
    
    /**
     * Show specific section
     */
    function showSection(section) {
        console.log('📄 Showing section:', section);
        
        if (isLoading) return;
        
        // Update active navigation
        updateActiveNav(section);
        
        // Show content section
        showContentSection(section);
        
        // Load section data
        loadSectionData(section);
        
        currentSection = section;
    }
    
    /**
     * Update active navigation state
     */
    function updateActiveNav(section) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            const onclickAttr = link.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${section}'`)) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Show content section
     */
    function showContentSection(section) {
        contentSections.forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === section) {
                sec.classList.add('active');
            }
        });
    }
    
    /**
     * Load section data
     */
    function loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'new-order':
                loadItems();
                resetOrderForm();
                break;
            case 'my-orders':
                loadMyOrders();
                break;
            case 'customer-orders':
                loadCustomerOrders();
                break;
            case 'items':
                loadItems();
                break;
        }
    }
    
    // ==========================================
    // DASHBOARD STATISTICS FUNCTIONS
    // ==========================================
    
    /**
     * Load dashboard statistics
     */
    function loadDashboardStats() {
        console.log('📊 Loading dashboard statistics...');
        
        fetch(`${baseUrl}/cashier/stats`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('todayOrders').textContent = data.stats.todayOrders || 0;
                document.getElementById('todayRevenue').textContent = `Rs. ${parseFloat(data.stats.todayRevenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                document.getElementById('totalOrders').textContent = data.stats.totalOrders || 0;
                document.getElementById('totalItems').textContent = data.stats.totalItems || 0;
            } else {
                console.error('Error loading stats:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Stats error:', error);
        });
    }
    
    // ==========================================
    // ITEM MANAGEMENT FUNCTIONS
    // ==========================================
    
    /**
     * Load items
     */
    function loadItems() {
        console.log('📦 Loading items...');
        
        fetch(`${baseUrl}/cashier/items`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentItems = data.items || [];
                displayItemsInBrowse(currentItems);
            } else {
                console.error('Error loading items:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Items error:', error);
        });
    }
    
    /**
     * Search items
     */
    function searchItems() {
        const query = document.getElementById('itemSearchInput').value.trim();
        
        if (query.length < 2) {
            document.getElementById('itemSearchResults').innerHTML = '';
            return;
        }
        
        fetch(`${baseUrl}/cashier/search-items?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySearchResults(data.items || []);
            } else {
                console.error('Error searching items:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Search error:', error);
        });
    }
    
    /**
     * Display search results
     */
    function displaySearchResults(items) {
        const resultsContainer = document.getElementById('itemSearchResults');
        
        if (items.length === 0) {
            resultsContainer.innerHTML = '<p class="text-muted text-center">No items found</p>';
            return;
        }
        
        resultsContainer.innerHTML = items.map(item => {
            const price = item.offerPrice ? item.offerPrice : item.price;
            return `
                <div class="search-result-item" onclick="addItemToOrder(${item.id}, '${escapeHtml(item.title)}', ${price})">
                    <div class="d-flex align-items-center">
                        ${item.imagePath ? 
                            `<img src="${item.imagePath}" alt="${item.title}" class="item-thumb me-2">` : 
                            '<div class="item-thumb-placeholder me-2"></div>'
                        }
                        <div class="flex-grow-1">
                            <div class="fw-bold">${item.title}</div>
                            <small class="text-muted">by ${item.author}</small>
                            <div class="text-success fw-bold">Rs. ${parseFloat(price).toFixed(2)}</div>
                            <small class="text-muted">Stock: ${item.stock}</small>
                        </div>
                        <button class="btn btn-sm btn-primary">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Display items in browse table
     */
    function displayItemsInBrowse(items) {
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;
        
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No items found</td></tr>';
            return;
        }
        
        tbody.innerHTML = items.map(item => {
            const price = item.offerPrice ? item.offerPrice : item.price;
            return `
                <tr>
                    <td>
                        ${item.imagePath ? 
                            `<img src="${item.imagePath}" alt="${item.title}" class="item-thumb">` : 
                            '<div class="item-thumb-placeholder"></div>'
                        }
                    </td>
                    <td>
                        <div class="fw-bold">${item.title}</div>
                        ${item.offerPrice ? `<small class="text-decoration-line-through text-muted">Rs. ${item.price}</small>` : ''}
                    </td>
                    <td>${item.author}</td>
                    <td>${item.categoryName || 'N/A'}</td>
                    <td class="fw-bold text-success">Rs. ${parseFloat(price).toFixed(2)}</td>
                    <td>
                        <span class="badge ${item.stock > 0 ? 'bg-success' : 'bg-danger'}">
                            ${item.stock}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="addItemToOrder(${item.id}, '${escapeHtml(item.title)}', ${price})" 
                                ${item.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // ==========================================
    // ORDER MANAGEMENT FUNCTIONS
    // ==========================================
    
    /**
     * Reset order form
     */
    function resetOrderForm() {
        document.getElementById('customerForm').reset();
        currentOrderItems = [];
        currentPromoCode = null;
        updateOrderDisplay();
        document.getElementById('itemSearchInput').value = '';
        document.getElementById('itemSearchResults').innerHTML = '';
    }
    
    /**
     * Add item to order
     */
    function addItemToOrder(itemId, itemTitle, price) {
        console.log('Adding item to order:', itemId, itemTitle, price);
        
        // Ensure we're on the new-order section
        if (currentSection !== 'new-order') {
            showSection('new-order');
            // Wait a bit for section to load then add item
            setTimeout(() => {
                addItemAfterSectionLoad(itemId, itemTitle, price);
            }, 100);
            return;
        }
        
        addItemAfterSectionLoad(itemId, itemTitle, price);
    }
    
    /**
     * Add item after section is loaded
     */
    function addItemAfterSectionLoad(itemId, itemTitle, price) {
        // Check if item already exists in order
        const existingItem = currentOrderItems.find(item => item.itemId === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.totalPrice = existingItem.quantity * existingItem.price;
        } else {
            currentOrderItems.push({
                itemId: itemId,
                title: itemTitle,
                price: parseFloat(price),
                quantity: 1,
                totalPrice: parseFloat(price)
            });
        }
        
        updateOrderDisplay();
        showAlert(`${itemTitle} added to order`, 'success');
    }
    
    /**
     * Remove item from order
     */
    function removeItemFromOrder(itemId) {
        currentOrderItems = currentOrderItems.filter(item => item.itemId !== itemId);
        updateOrderDisplay();
    }
    
    /**
     * Update item quantity
     */
    function updateItemQuantity(itemId, quantity) {
        const item = currentOrderItems.find(item => item.itemId === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            item.totalPrice = item.quantity * item.price;
            updateOrderDisplay();
        }
    }
    
    /**
     * Update order display
     */
    function updateOrderDisplay() {
        const orderItemsContainer = document.getElementById('orderItems');
        
        if (currentOrderItems.length === 0) {
            orderItemsContainer.innerHTML = '<p class="text-muted text-center">No items added yet</p>';
            orderSubtotal = 0;
        } else {
            orderItemsContainer.innerHTML = currentOrderItems.map(item => `
                <div class="order-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <div class="fw-bold">${item.title}</div>
                            <small class="text-muted">Rs. ${item.price.toFixed(2)} each</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateItemQuantity(${item.itemId}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateItemQuantity(${item.itemId}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-sm btn-danger ms-2" onclick="removeItemFromOrder(${item.itemId})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-end">
                        <strong>Rs. ${item.totalPrice.toFixed(2)}</strong>
                    </div>
                </div>
            `).join('');
            
            orderSubtotal = currentOrderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        }
        
        // Calculate totals
        orderDiscount = currentPromoCode ? (currentPromoCode.discountAmount || 0) : 0;
        orderTotal = Math.max(0, orderSubtotal - orderDiscount);
        
        // Update display
        document.getElementById('orderSubtotal').textContent = `Rs. ${orderSubtotal.toFixed(2)}`;
        document.getElementById('orderDiscount').textContent = `Rs. ${orderDiscount.toFixed(2)}`;
        document.getElementById('orderTotal').textContent = `Rs. ${orderTotal.toFixed(2)}`;
    }
    
    /**
     * Validate promo code
     */
    function validatePromoCode() {
        const promoCodeInput = document.getElementById('promoCodeInput');
        const promoCode = promoCodeInput.value.trim();
        
        if (!promoCode) {
            showAlert('Please enter a promo code', 'warning');
            return;
        }
        
        fetch(`${baseUrl}/cashier/validate-promo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                promoCode: promoCode,
                subtotal: orderSubtotal
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentPromoCode = {
                    code: promoCode,
                    discountAmount: data.discountAmount,
                    description: data.description
                };
                updateOrderDisplay();
                showAlert(`Promo code applied! ${data.description}`, 'success');
                promoCodeInput.disabled = true;
            } else {
                showAlert(data.message || 'Invalid promo code', 'danger');
                currentPromoCode = null;
                updateOrderDisplay();
            }
        })
        .catch(error => {
            console.error('❌ Promo validation error:', error);
            showAlert('Error validating promo code', 'danger');
        });
    }
    
    /**
     * Create order
     */
    function createOrder() {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        const orderType = document.getElementById('orderType').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('orderNotes').value.trim();
        
        // Validation
        if (!customerName) {
            showAlert('Customer name is required', 'danger');
            return;
        }
        
        if (currentOrderItems.length === 0) {
            showAlert('Please add items to the order', 'danger');
            return;
        }
        
        // Prepare order data
        const orderData = {
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            orderType: orderType,
            paymentMethod: paymentMethod,
            promoCode: currentPromoCode ? currentPromoCode.code : '',
            notes: notes,
            items: JSON.stringify(currentOrderItems.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price
            })))
        };
        
        fetch(`${baseUrl}/cashier/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Order created successfully!', 'success');
                resetOrderForm();
                loadDashboardStats();
                
                // Show print option
                if (confirm('Order created successfully! Would you like to print the receipt?')) {
                    showPrintModal(data.orderId);
                }
            } else {
                showAlert(data.message || 'Failed to create order', 'danger');
            }
        })
        .catch(error => {
            console.error('❌ Create order error:', error);
            showAlert('Error creating order', 'danger');
        });
    }
    
    // ==========================================
    // ORDER LISTING FUNCTIONS
    // ==========================================
    
    /**
     * Load my orders
     */
    function loadMyOrders() {
        console.log('📋 Loading my orders...');
        const tbody = document.getElementById('myOrdersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">🔄 Loading orders...</td></tr>';
        
        fetch(`${baseUrl}/cashier/cashier-orders`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayMyOrders(data.orders || []);
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">❌ Error loading orders</td></tr>';
            }
        })
        .catch(error => {
            console.error('❌ My orders error:', error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">❌ Error loading orders</td></tr>';
        });
    }
    
    /**
     * Display my orders
     */
    function displayMyOrders(orders) {
        const tbody = document.getElementById('myOrdersTableBody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusClass = getOrderStatusClass(order.status);
            
            return `
                <tr>
                    <td><span class="fw-bold text-primary">#${order.id}</span></td>
                    <td>${order.customerName}</td>
                    <td>${order.customerPhone || 'N/A'}</td>
                    <td><span class="fw-bold">Rs. ${parseFloat(order.totalAmount).toFixed(2)}</span></td>
                    <td><span class="badge bg-info">${getOrderTypeDisplay(order.orderType)}</span></td>
                    <td><span class="status-badge ${statusClass}">${getStatusDisplay(order.status)}</span></td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="showPrintModal(${order.id})">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="markOrderCompleted(${order.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Load customer orders
     */
    function loadCustomerOrders() {
        console.log('📋 Loading customer orders...');
        const tbody = document.getElementById('customerOrdersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">🔄 Loading customer orders...</td></tr>';
        
        fetch(`${baseUrl}/cashier/customer-orders`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayCustomerOrders(data.orders || []);
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">❌ Error loading customer orders</td></tr>';
            }
        })
        .catch(error => {
            console.error('❌ Customer orders error:', error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">❌ Error loading customer orders</td></tr>';
        });
    }
    
    /**
     * Display customer orders
     */
    function displayCustomerOrders(orders) {
        const tbody = document.getElementById('customerOrdersTableBody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No customer orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusClass = getOrderStatusClass(order.status);
            const paymentClass = getPaymentStatusClass(order.paymentMethod);
            
            return `
                <tr>
                    <td><span class="fw-bold text-primary">#${order.id}</span></td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td>${order.customerEmail || 'N/A'}</td>
                    <td><span class="fw-bold">Rs. ${parseFloat(order.totalAmount).toFixed(2)}</span></td>
                    <td><span class="status-badge ${statusClass}">${getStatusDisplay(order.status)}</span></td>
                    <td><span class="status-badge ${paymentClass}">${getPaymentMethodDisplay(order.paymentMethod)}</span></td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewOrderDetails(${order.id}, 'customer')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    /**
     * Show print modal with enhanced receipt
     */
    function showPrintModal(orderId) {
        console.log('Showing print modal for order:', orderId);
        
        // Fetch order details for printing
        fetch(`${baseUrl}/cashier/cashier-orders`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const order = data.orders.find(o => o.id == orderId);
                if (order) {
                    showEnhancedPrintModal(order);
                } else {
                    showBasicPrintModal(orderId);
                }
            } else {
                showBasicPrintModal(orderId);
            }
        })
        .catch(error => {
            console.error('Error fetching order for print:', error);
            showBasicPrintModal(orderId);
        });
    }
    
    /**
     * Show enhanced print modal with full receipt
     */
    function showEnhancedPrintModal(order) {
        const printContent = document.getElementById('printOrderContent');
        const orderDate = new Date(order.createdAt);
        
        printContent.innerHTML = `
            <div class="receipt-content">
                <!-- Header -->
                <div class="text-center mb-4">
                    <h3 class="mb-1">📚 PahanaEdu</h3>
                    <p class="mb-1">Educational Books & Resources</p>
                    <p class="small text-muted mb-1">📍 Colombo, Sri Lanka</p>
                    <p class="small text-muted mb-0">📞 +94 11 234 5678</p>
                    <hr class="my-3">
                    <h5 class="mb-0">🧾 RECEIPT</h5>
                </div>
                
                <!-- Order Info -->
                <div class="row mb-3">
                    <div class="col-6">
                        <strong>Order #:</strong> ${order.id}<br>
                        <strong>Date:</strong> ${orderDate.toLocaleDateString()}<br>
                        <strong>Time:</strong> ${orderDate.toLocaleTimeString()}
                    </div>
                    <div class="col-6">
                        <strong>Type:</strong> ${getOrderTypeDisplay(order.orderType)}<br>
                        <strong>Payment:</strong> ${getPaymentMethodDisplay(order.paymentMethod)}<br>
                        <strong>Status:</strong> ${getStatusDisplay(order.status)}
                    </div>
                </div>
                
                <!-- Customer Info -->
                <div class="customer-info mb-3">
                    <strong>Customer:</strong> ${order.customerName}<br>
                    ${order.customerPhone ? `<strong>Phone:</strong> ${order.customerPhone}<br>` : ''}
                    ${order.customerEmail ? `<strong>Email:</strong> ${order.customerEmail}<br>` : ''}
                </div>
                
                <hr>
                
                <!-- Items (Note: We need to fetch items separately) -->
                <div class="items-section mb-3">
                    <h6><strong>📦 Items Ordered:</strong></h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-end">Price</th>
                                    <th class="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody id="receiptItems">
                                <tr>
                                    <td colspan="4" class="text-center">Loading items...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <hr>
                
                <!-- Totals -->
                <div class="totals-section">
                    <div class="row">
                        <div class="col-6">
                            <strong>Subtotal:</strong>
                        </div>
                        <div class="col-6 text-end">
                            <strong>Rs. ${parseFloat(order.subtotal || order.totalAmount).toFixed(2)}</strong>
                        </div>
                    </div>
                    ${order.discountAmount && parseFloat(order.discountAmount) > 0 ? `
                    <div class="row">
                        <div class="col-6">
                            Discount ${order.promoCode ? `(${order.promoCode})` : ''}:
                        </div>
                        <div class="col-6 text-end">
                            -Rs. ${parseFloat(order.discountAmount).toFixed(2)}
                        </div>
                    </div>
                    ` : ''}
                    <hr class="my-2">
                    <div class="row">
                        <div class="col-6">
                            <h5><strong>TOTAL:</strong></h5>
                        </div>
                        <div class="col-6 text-end">
                            <h5><strong>Rs. ${parseFloat(order.totalAmount).toFixed(2)}</strong></h5>
                        </div>
                    </div>
                </div>
                
                <hr class="my-3">
                
                <!-- Footer -->
                <div class="text-center">
                    <p class="small mb-1">🙏 Thank you for your purchase!</p>
                    <p class="small mb-1">📧 support@pahanaedu.com</p>
                    <p class="small mb-0">🌐 www.pahanaedu.com</p>
                    <div class="mt-3">
                        <p class="small text-muted">Receipt generated on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('printOrderModal'));
        modal.show();
        
        // Load items asynchronously (this would need to be implemented in backend)
        loadReceiptItems(order.id);
    }
    
    /**
     * Show basic print modal (fallback)
     */
    function showBasicPrintModal(orderId) {
        const printContent = document.getElementById('printOrderContent');
        printContent.innerHTML = `
            <div class="text-center">
                <h3 class="mb-3">📚 PahanaEdu</h3>
                <h5>🧾 Order Receipt</h5>
                <hr>
                <div class="row mb-3">
                    <div class="col-6">
                        <strong>Order #:</strong> ${orderId}
                    </div>
                    <div class="col-6">
                        <strong>Date:</strong> ${new Date().toLocaleDateString()}
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <strong>Time:</strong> ${new Date().toLocaleTimeString()}
                    </div>
                    <div class="col-6">
                        <strong>Cashier:</strong> ${document.querySelector('.welcome-text').textContent.replace('Welcome, ', '').replace('!', '')}
                    </div>
                </div>
                <hr>
                <p><strong>Order Details:</strong></p>
                <p>Complete order information would be displayed here including customer details, items, and totals.</p>
                <hr>
                <p class="text-center mb-0">🙏 Thank you for your purchase!</p>
                <p class="small text-muted">Receipt generated on ${new Date().toLocaleString()}</p>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('printOrderModal'));
        modal.show();
    }
    
    /**
     * Load receipt items (would need backend implementation)
     */
    function loadReceiptItems(orderId) {
        // This is a placeholder - you would implement this to fetch actual order items
        const receiptItemsContainer = document.getElementById('receiptItems');
        if (receiptItemsContainer) {
            receiptItemsContainer.innerHTML = `
                <tr>
                    <td>Sample Book Title</td>
                    <td class="text-center">1</td>
                    <td class="text-end">Rs. 500.00</td>
                    <td class="text-end">Rs. 500.00</td>
                </tr>
                <tr>
                    <td colspan="4" class="text-center small text-muted">
                        Complete item details would be loaded from server
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * Print order with enhanced formatting
     */
    function printOrder() {
        const printContent = document.getElementById('printOrderContent').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>PahanaEdu - Order Receipt</title>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: 'Segoe UI', Arial, sans-serif; 
                            padding: 20px; 
                            line-height: 1.4;
                            color: #333;
                        }
                        .text-center { text-align: center; }
                        .text-end { text-align: right; }
                        .mb-0 { margin-bottom: 0; }
                        .mb-1 { margin-bottom: 0.25rem; }
                        .mb-3 { margin-bottom: 1rem; }
                        .mb-4 { margin-bottom: 1.5rem; }
                        .mt-3 { margin-top: 1rem; }
                        .my-2 { margin: 0.5rem 0; }
                        .my-3 { margin: 1rem 0; }
                        hr { 
                            border: none; 
                            border-top: 1px solid #ddd; 
                            margin: 1rem 0; 
                        }
                        .row { 
                            display: flex; 
                            margin-bottom: 0.5rem;
                        }
                        .col-6 { 
                            flex: 0 0 50%; 
                            max-width: 50%; 
                        }
                        .table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 1rem;
                        }
                        .table th, .table td { 
                            padding: 8px; 
                            border-bottom: 1px solid #ddd; 
                        }
                        .table th { 
                            background-color: #f8f9fa; 
                            font-weight: bold;
                        }
                        .small { font-size: 0.875em; }
                        .text-muted { color: #6c757d; }
                        h3 { margin-bottom: 0.5rem; }
                        h5 { margin-bottom: 0.5rem; }
                        h6 { margin-bottom: 0.5rem; }
                        strong { font-weight: 600; }
                        
                        /* Print specific styles */
                        @media print {
                            body { margin: 0; padding: 15px; }
                            .no-print { display: none; }
                        }
                        
                        /* Receipt styling */
                        .receipt-content {
                            max-width: 400px;
                            margin: 0 auto;
                            border: 1px solid #ddd;
                            padding: 20px;
                            background: white;
                        }
                        
                        .customer-info {
                            background-color: #f8f9fa;
                            padding: 10px;
                            border-radius: 4px;
                        }
                        
                        .totals-section {
                            background-color: #f8f9fa;
                            padding: 15px;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        };
                    </script>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Mark as printed in the system
        markAsPrinted();
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('printOrderModal'));
        if (modal) {
            setTimeout(() => modal.hide(), 1000);
        }
    }
    
    /**
     * Mark order as printed
     */
    function markAsPrinted() {
        // This would typically update the order status in the backend
        console.log('Order marked as printed');
    }
    
    /**
     * Print order details from view modal
     */
    function printOrderDetails(orderId) {
        const modalContent = document.querySelector('#orderDetailsModal .modal-body').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Order Details #${orderId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .table { width: 100%; border-collapse: collapse; }
                        .table th, .table td { padding: 8px; border: 1px solid #ddd; }
                        .table th { background-color: #f5f5f5; }
                        .badge { padding: 4px 8px; background-color: #007bff; color: white; border-radius: 4px; }
                        .bg-light { background-color: #f8f9fa; }
                        .p-3 { padding: 1rem; }
                        .rounded { border-radius: 4px; }
                        h6 { margin-top: 1rem; margin-bottom: 0.5rem; }
                        .row { display: flex; margin-bottom: 1rem; }
                        .col-md-6 { flex: 0 0 50%; }
                        .ms-auto { margin-left: auto; }
                    </style>
                </head>
                <body>
                    <h2>Order Details #${orderId}</h2>
                    ${modalContent}
                    <script>window.print(); window.close();</script>
                </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    /**
     * Mark order as completed
     */
    function markOrderCompleted(orderId) {
        if (!confirm('Mark this order as completed?')) return;
        
        fetch(`${baseUrl}/cashier/update-order-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                orderId: orderId,
                status: 'completed'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Order marked as completed', 'success');
                loadMyOrders();
                loadDashboardStats();
            } else {
                showAlert(data.message || 'Failed to update order status', 'danger');
            }
        })
        .catch(error => {
            console.error('❌ Update status error:', error);
            showAlert('Error updating order status', 'danger');
        });
    }
    
    /**
     * View order details (Enhanced Implementation)
     */
    function viewOrderDetails(orderId, orderType) {
        console.log('Viewing order details:', orderId, orderType);
        
        // Fetch order details from server
        fetch(`${baseUrl}/admin/order-details/${orderId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showOrderDetailsModal(data.order, orderType);
            } else {
                // Fallback to basic implementation if API not available
                showBasicOrderDetails(orderId, orderType);
            }
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            // Fallback to basic implementation
            showBasicOrderDetails(orderId, orderType);
        });
    }
    
    /**
     * Show order details modal with full information
     */
    function showOrderDetailsModal(order, orderType) {
        const modalHtml = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-receipt"></i> Order Details #${order.id}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Customer Information -->
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6><i class="fas fa-user"></i> Customer Information</h6>
                                    <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
                                    <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                                    <p><strong>Phone:</strong> ${order.contactNumber || 'N/A'}</p>
                                    <p><strong>Address:</strong> ${order.shippingAddress || 'N/A'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="fas fa-info-circle"></i> Order Information</h6>
                                    <p><strong>Order ID:</strong> #${order.id}</p>
                                    <p><strong>Status:</strong> <span class="badge bg-primary">${order.status}</span></p>
                                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                                    ${order.promoCode ? `<p><strong>Promo Code:</strong> ${order.promoCode}</p>` : ''}
                                </div>
                            </div>
                            
                            <!-- Order Items -->
                            <h6><i class="fas fa-shopping-cart"></i> Order Items</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items ? order.items.map(item => `
                                            <tr>
                                                <td>${item.title || 'Item'}</td>
                                                <td>${item.quantity}</td>
                                                <td>Rs. ${parseFloat(item.price).toFixed(2)}</td>
                                                <td>Rs. ${(item.quantity * item.price).toFixed(2)}</td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="4">No items found</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Order Summary -->
                            <div class="row mt-3">
                                <div class="col-md-6 ms-auto">
                                    <table class="table table-sm">
                                        <tr>
                                            <td><strong>Subtotal:</strong></td>
                                            <td class="text-end">Rs. ${parseFloat(order.subtotal || order.totalAmount).toFixed(2)}</td>
                                        </tr>
                                        ${order.discountAmount ? `
                                        <tr>
                                            <td><strong>Discount:</strong></td>
                                            <td class="text-end">Rs. ${parseFloat(order.discountAmount).toFixed(2)}</td>
                                        </tr>
                                        ` : ''}
                                        ${order.shippingAmount ? `
                                        <tr>
                                            <td><strong>Shipping:</strong></td>
                                            <td class="text-end">Rs. ${parseFloat(order.shippingAmount).toFixed(2)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr class="fw-bold">
                                            <td><strong>Total:</strong></td>
                                            <td class="text-end">Rs. ${parseFloat(order.totalAmount).toFixed(2)}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            
                            ${order.orderNotes ? `
                            <div class="mt-3">
                                <h6><i class="fas fa-sticky-note"></i> Order Notes</h6>
                                <p class="bg-light p-3 rounded">${order.orderNotes}</p>
                            </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="printOrderDetails(${order.id})">
                                <i class="fas fa-print"></i> Print Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById('orderDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }
    
    /**
     * Show basic order details (fallback)
     */
    function showBasicOrderDetails(orderId, orderType) {
        const alertMsg = `Order Details #${orderId}\n\nType: ${orderType} order\nFeature: View detailed order information\n\nThis would show:\n- Customer information\n- Order items\n- Payment details\n- Order timeline`;
        showAlert(alertMsg, 'info');
    }
    
    /**
     * Get order status class
     */
    function getOrderStatusClass(status) {
        switch (status && status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'completed': return 'status-active';
            case 'cancelled': return 'status-inactive';
            default: return 'status-pending';
        }
    }
    
    /**
     * Get payment status class
     */
    function getPaymentStatusClass(paymentMethod) {
        switch (paymentMethod && paymentMethod.toLowerCase()) {
            case 'cod': return 'status-pending';
            case 'online': return 'status-active';
            case 'cash': return 'status-active';
            case 'card': return 'status-active';
            default: return 'status-pending';
        }
    }
    
    /**
     * Get status display
     */
    function getStatusDisplay(status) {
        switch (status && status.toLowerCase()) {
            case 'pending': return 'Pending';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            case 'confirmed': return 'Confirmed';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered';
            default: return status || 'Unknown';
        }
    }
    
    /**
     * Get order type display
     */
    function getOrderTypeDisplay(orderType) {
        switch (orderType && orderType.toLowerCase()) {
            case 'walk_in': return 'Walk-in';
            case 'phone': return 'Phone';
            case 'whatsapp': return 'WhatsApp';
            default: return orderType || 'Walk-in';
        }
    }
    
    /**
     * Get payment method display
     */
    function getPaymentMethodDisplay(paymentMethod) {
        switch (paymentMethod && paymentMethod.toLowerCase()) {
            case 'cod': return 'COD';
            case 'online': return 'Online';
            case 'cash': return 'Cash';
            case 'card': return 'Card';
            default: return paymentMethod || 'N/A';
        }
    }
    
    /**
     * Setup global event listeners
     */
    function setupGlobalEvents() {
        // Item browse search
        const browseSearchInput = document.getElementById('itemBrowseSearch');
        if (browseSearchInput) {
            browseSearchInput.addEventListener('keyup', function() {
                const query = this.value.toLowerCase();
                const filteredItems = currentItems.filter(item => 
                    item.title.toLowerCase().includes(query) || 
                    item.author.toLowerCase().includes(query)
                );
                displayItemsInBrowse(filteredItems);
            });
        }
        
        // Promo code input enter key
        const promoInput = document.getElementById('promoCodeInput');
        if (promoInput) {
            promoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    validatePromoCode();
                }
            });
        }
    }
    
    /**
     * Show alert message
     */
    function showAlert(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create alert element
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show custom-alert" 
                 role="alert" 
                 style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHtml);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.custom-alert');
            if (alert) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                bsAlert.close();
            }
        }, 5000);
    }
    
    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // ==========================================
    // MAKE FUNCTIONS GLOBAL
    // ==========================================
    
    // Make functions globally accessible
    window.showSection = showSection;
    window.loadDashboardStats = loadDashboardStats;
    window.loadItems = loadItems;
    window.loadMyOrders = loadMyOrders;
    window.loadCustomerOrders = loadCustomerOrders;
    window.searchItems = searchItems;
    window.addItemToOrder = addItemToOrder;
    window.removeItemFromOrder = removeItemFromOrder;
    window.updateItemQuantity = updateItemQuantity;
    window.validatePromoCode = validatePromoCode;
    window.createOrder = createOrder;
    window.showPrintModal = showPrintModal;
    window.printOrder = printOrder;
    window.printOrderDetails = printOrderDetails;
    window.markOrderCompleted = markOrderCompleted;
    window.viewOrderDetails = viewOrderDetails;
    
    console.log('🎉 Pahana Edu Cashier Dashboard setup complete!');
});
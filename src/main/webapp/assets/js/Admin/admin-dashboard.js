// 🚀 Pahana Edu Admin Dashboard - Main JavaScript File
// This file contains all functionality for User Management, Item Management, and Billing

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Pahana Edu Admin Dashboard loaded');
    
    // Global variables
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');
    
    // Get context path and base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    console.log('📍 Context Path:', contextPath);
    console.log('🔗 Base URL:', baseUrl);
    
    // Current page tracking
    let currentPage = null;
    let isLoading = false;
    
    // Global data storage
    let currentUsers = [];
    let currentItems = [];
    let currentCategories = [];
    let currentOrders = [];
    
    // Current edit/delete items
    let currentEditUser = null;
    let currentDeleteUser = null;
    let editItem = null;
    let deleteItem = null;
    let editCategory = null;
    let deleteCategory = null;
    let currentOrderDetails = null;
    let currentImageData = null;
    
    // Initialize dashboard
    initializeDashboard();
    
    /**
     * Initialize the main dashboard
     */
    function initializeDashboard() {
        console.log('🔧 Initializing dashboard...');
        
        // Setup navigation
        setupNavigation();
        
        // Setup global event listeners
        setupGlobalEvents();
        
        // Load default page
        loadDefaultPage();
        
        console.log('✅ Dashboard initialization complete');
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
                    console.log('⚠️ Page loading in progress, ignoring click');
                    return;
                }
                
                // Handle logout separately
                if (link.classList.contains('logout')) {
                    window.location.href = link.getAttribute('href');
                    return;
                }
                
                // Update active navigation
                updateActiveNav(link);
                
                // Load page content
                const page = link.getAttribute('data-page');
                if (page) {
                    loadPage(page);
                }
            });
        });
    }
    
    /**
     * Update active navigation state
     */
    function updateActiveNav(activeLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        activeLink.classList.add('active');
    }
    
    /**
     * Load page content via AJAX
     */
    function loadPage(page) {
        console.log('📄 Loading page:', page);
        
        if (isLoading) return;
        
        isLoading = true;
        currentPage = page;
        
        // Show loading indicator
        showLoadingIndicator();
        
        // Force cleanup before loading new page
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
                
                // Initialize page-specific functionality
                setTimeout(() => {
                    initializePage(page);
                    isLoading = false;
                }, 300);
            })
            .catch(error => {
                console.error('❌ Page loading error:', error);
                isLoading = false;
                showErrorState(page, error);
            });
    }
    
    /**
     * Show loading indicator
     */
    function showLoadingIndicator() {
        contentArea.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading content...</p>
            </div>
        `;
    }
    
    /**
     * Show error state
     */
    function showErrorState(page, error) {
        contentArea.innerHTML = `
            <div class="error-container">
                <h3>❌ Error Loading Content</h3>
                <p>Failed to load: ${page}</p>
                <p>Error: ${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">🔄 Retry</button>
            </div>
        `;
    }
    
    /**
     * Force cleanup all global variables
     */
    function forceCleanup() {
        console.log('🧹 Force cleanup all data...');
        
        // Reset all global variables
        currentUsers = [];
        currentItems = [];
        currentCategories = [];
        currentOrders = [];
        currentEditUser = null;
        currentDeleteUser = null;
        editItem = null;
        deleteItem = null;
        editCategory = null;
        deleteCategory = null;
        currentOrderDetails = null;
        currentImageData = null;
        
        console.log('✅ Force cleanup completed');
    }
    
    /**
     * Initialize page-specific functionality
     */
    function initializePage(page) {
        console.log('🔧 Initializing page:', page);
        
        if (page.includes('admin-Manage-Users.jsp')) {
            console.log('👥 Initializing User Management...');
            initializeUserManagement();
        } else if (page.includes('admin-Manage-Items.jsp')) {
            console.log('📦 Initializing Item Management...');
            initializeItemManagement();
        } else if (page.includes('admin-Billing.jsp')) {
            console.log('💳 Initializing Billing Management...');
            initializeBillingManagement();
        } else if (page.includes('admin-System-Settings.jsp')) {
            console.log('⚙️ Initializing System Settings...');
            initializeSystemSettings();
        }
    }
    
    // ==========================================
    // USER MANAGEMENT FUNCTIONS
    // ==========================================
    
    /**
     * Initialize User Management
     */
    function initializeUserManagement() {
        // Check required elements
        const requiredElements = ['totalUsers', 'adminCount', 'usersTableBody'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing user elements:', missingElements);
            setTimeout(() => initializeUserManagement(), 500);
            return;
        }
        
        console.log('✅ User elements found, loading data...');
        loadUserStats();
        loadUsers();
        setupUserEvents();
        makeUserFunctionsGlobal();
    }
    
    /**
     * Load user statistics
     */
    function loadUserStats() {
        console.log('📊 Loading user statistics...');
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
    
    /**
     * Update user stats UI
     */
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
    
    /**
     * Show user stats error
     */
    function showUserStatsError(message) {
        const elements = ['totalUsers', 'adminCount', 'managerCount', 'cashierCount', 'customerCount'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Error';
        });
        showToast('User statistics error: ' + message, 'error');
    }
    
    /**
     * Load users
     */
    function loadUsers() {
        console.log('👥 Loading users...');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="7" class="loading">🔄 Loading users...</td></tr>';
        
        // Get filter values
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        const roleValue = roleFilter ? roleFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';
        
        let usersUrl = `${baseUrl}/admin/users`;
        const params = new URLSearchParams();
        if (roleValue) params.append('role', roleValue);
        if (statusValue) params.append('status', statusValue);
        if (params.toString()) usersUrl += '?' + params.toString();
        
        fetch(usersUrl, {
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
    
    /**
     * Display users in table
     */
    function displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
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
    
    /**
     * Show users error
     */
    function showUsersError(message) {
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="loading" style="color: #dc3545;">❌ ${message}</td></tr>`;
        }
        showToast(message, 'error');
    }
    
    /**
     * Setup user management events
     */
    function setupUserEvents() {
        console.log('🎯 Setting up user events...');
        
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.onclick = openAddUserModal;
        }
        
        // User form
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.onsubmit = handleUserFormSubmit;
        }
        
        // Filter events
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        if (roleFilter) roleFilter.onchange = loadUsers;
        if (statusFilter) statusFilter.onchange = loadUsers;
        
        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.onclick = deleteUser;
        }
    }
    
    /**
     * Make user functions global
     */
    function makeUserFunctionsGlobal() {
        window.editUser = editUser;
        window.confirmDeleteUser = confirmDeleteUser;
        window.deleteUser = deleteUser;
        window.openAddUserModal = openAddUserModal;
        window.closeUserModal = closeUserModal;
        window.closeDeleteModal = closeDeleteModal;
        window.loadUsers = loadUsers;
    }
    
    // ==========================================
    // ITEM MANAGEMENT FUNCTIONS
    // ==========================================
    
    /**
     * Initialize Item Management
     */
    function initializeItemManagement() {
        const requiredElements = ['totalItems', 'activeItems', 'itemsTableBody', 'addItemBtn'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing item elements:', missingElements);
            setTimeout(() => initializeItemManagement(), 500);
            return;
        }
        
        console.log('✅ Item elements found, initializing...');
        loadItemStats();
        loadItems();
        loadCategories();
        setupItemEvents();
        makeItemFunctionsGlobal();
    }
    
    /**
     * Load item statistics
     */
    function loadItemStats() {
        console.log('📊 Loading item statistics...');
        fetch(`${baseUrl}/admin/items/stats`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateItemStatsUI(data.stats);
                } else {
                    showToast('Item statistics error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Item statistics error:', error);
                showToast('Error loading item statistics', 'error');
            });
    }
    
    /**
     * Update item stats UI
     */
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
    }
    
    /**
     * Load items
     */
    function loadItems() {
        console.log('📦 Loading items...');
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="9" class="loading">🔄 Loading items...</td></tr>';
        
        let url = `${baseUrl}/admin/items/list`;
        
        // Apply filters
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const params = new URLSearchParams();
        
        if (categoryFilter?.value) params.append('category', categoryFilter.value);
        if (statusFilter?.value) params.append('status', statusFilter.value);
        if (params.toString()) url += '?' + params.toString();
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentItems = data.items || [];
                    displayItems(currentItems);
                } else {
                    showItemsError('Failed to load items: ' + data.message);
                }
            })
            .catch(error => {
                console.error('❌ Items fetch error:', error);
                showItemsError('Network error loading items');
            });
    }
    
    /**
     * Display items in table
     */
    function displayItems(items) {
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;
        
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">📭 No items found</td></tr>';
            return;
        }
        
        const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIT0JYsgYabTZ5gykfiSeOUxN6NDDXuuHVuA&s';
        
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
    }
    
    /**
     * Show items error
     */
    function showItemsError(message) {
        const tbody = document.getElementById('itemsTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="9" class="loading" style="color: #dc3545;">❌ ${message}</td></tr>`;
        }
        showToast(message, 'error');
    }
    
    /**
     * Load categories
     */
    function loadCategories() {
        console.log('🏷️ Loading categories...');
        fetch(`${baseUrl}/admin/items/categories`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentCategories = data.categories || [];
                    updateCategoryDropdowns();
                } else {
                    showToast('Categories error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Categories fetch error:', error);
                showToast('Error loading categories', 'error');
            });
    }
    
    /**
     * Update category dropdowns
     */
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
    
    /**
     * Setup item management events
     */
    function setupItemEvents() {
        console.log('🎯 Setting up item events...');
        
        const addItemBtn = document.getElementById('addItemBtn');
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const itemForm = document.getElementById('itemForm');
        const categoryForm = document.getElementById('categoryForm');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        
        if (addItemBtn) addItemBtn.onclick = openAddItemModal;
        if (manageCategoriesBtn) manageCategoriesBtn.onclick = openCategoriesListModal;
        if (categoryFilter) categoryFilter.onchange = loadItems;
        if (statusFilter) statusFilter.onchange = loadItems;
        if (itemForm) itemForm.onsubmit = handleItemFormSubmit;
        if (categoryForm) categoryForm.onsubmit = handleCategoryFormSubmit;
        if (confirmDeleteBtn) confirmDeleteBtn.onclick = performDelete;
    }
    
    /**
     * Make item functions global
     */
    function makeItemFunctionsGlobal() {
        window.editItemFunc = editItemFunc;
        window.deleteItemFunc = deleteItemFunc;
        window.editCategory = editCategoryFunc;
        window.deleteCategory = deleteCategoryFunc;
        window.loadItems = loadItems;
        window.loadCategories = loadCategories;
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
    }
    
    // ==========================================
    // BILLING MANAGEMENT FUNCTIONS
    // ==========================================
    
    /**
     * Initialize Billing Management
     */
    function initializeBillingManagement() {
        const requiredElements = ['totalOrders', 'pendingOrders', 'ordersTableBody'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing billing elements:', missingElements);
            setTimeout(() => initializeBillingManagement(), 500);
            return;
        }
        
        console.log('✅ Billing elements found, initializing...');
        loadOrderStats();
        loadOrders();
        setupBillingEvents();
        makeBillingFunctionsGlobal();
    }
    
    /**
     * Load order statistics
     */
    function loadOrderStats() {
        console.log('📊 Loading order statistics...');
        fetch(`${baseUrl}/admin/order-stats`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateOrderStatsUI(data.stats);
            } else {
                showOrderStatsError(data.message);
            }
        })
        .catch(error => {
            console.error('❌ Order stats error:', error);
            showOrderStatsError(error.message);
        });
    }
    
    /**
     * Update order stats UI
     */
    function updateOrderStatsUI(stats) {
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
    }
    
    /**
     * Show order stats error
     */
    function showOrderStatsError(message) {
        const elements = ['totalOrders', 'pendingOrders', 'confirmedOrders', 'shippedOrders', 'deliveredOrders', 'totalRevenue'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Error';
        });
        showToast('Order statistics error: ' + message, 'error');
    }
    
    /**
     * Load orders
     */
    function loadOrders() {
        console.log('📦 Loading orders...');
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (!ordersTableBody) return;
        
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="loading">🔄 Loading orders...</td></tr>';
        
        // Get filter values
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
        
        fetch(ordersUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentOrders = data.orders || [];
                displayOrders(currentOrders);
            } else {
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
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (!ordersTableBody) return;
        
        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="8" class="loading">📭 No orders found</td></tr>';
            return;
        }
        
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
                    <td><span class="order-id">#${order.id}</span></td>
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
                    <td><span class="amount">Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></td>
                    <td><span class="payment-method payment-${(order.paymentMethod || '').toLowerCase()}">${getPaymentMethodDisplay(order.paymentMethod)}</span></td>
                    <td><span class="status-badge status-${(order.status || '').toLowerCase()}">${getStatusDisplay(order.status)}</span></td>
                    <td>${orderDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-view" onclick="viewOrderDetails(${order.id})">👁️ View</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Show orders error
     */
    function showOrdersError(message) {
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (ordersTableBody) {
            ordersTableBody.innerHTML = `<tr><td colspan="8" class="loading" style="color: #dc3545;">❌ ${message}</td></tr>`;
        }
        showToast(message, 'error');
    }
    
    /**
     * Get payment method display
     */
    function getPaymentMethodDisplay(paymentMethod) {
        switch (paymentMethod) {
            case 'cod': return 'COD';
            case 'online': return 'Online';
            default: return paymentMethod || 'N/A';
        }
    }
    
    /**
     * Get status display
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
     * Setup billing events
     */
    function setupBillingEvents() {
        console.log('🎯 Setting up billing events...');
        
        const refreshBtn = document.getElementById('refreshOrdersBtn');
        const statusFilter = document.getElementById('statusFilter');
        const paymentFilter = document.getElementById('paymentFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (refreshBtn) {
            refreshBtn.onclick = function(e) {
                e.preventDefault();
                loadOrderStats();
                loadOrders();
            };
        }
        
        if (statusFilter) statusFilter.onchange = loadOrders;
        if (paymentFilter) paymentFilter.onchange = loadOrders;
        if (dateFilter) dateFilter.onchange = loadOrders;
    }
    
    /**
     * Make billing functions global
     */
    function makeBillingFunctionsGlobal() {
        window.loadOrders = loadOrders;
        window.viewOrderDetails = viewOrderDetails;
        window.updateOrderStatus = updateOrderStatus;
        window.closeOrderModal = closeOrderModal;
        window.loadOrderStats = loadOrderStats;
    }
    
    // ==========================================
    // MODAL AND FORM FUNCTIONS
    // ==========================================
    
    /**
     * Open add user modal
     */
    function openAddUserModal() {
        console.log('➕ Opening add user modal');
        currentEditUser = null;
        
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const modalTitle = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        const isEditField = document.getElementById('isEdit');
        const passwordField = document.getElementById('password');
        
        if (modal && form) {
            form.reset();
            if (modalTitle) modalTitle.textContent = 'Add New User';
            if (submitBtn) submitBtn.innerHTML = '<i class="icon-save"></i> Add User';
            if (isEditField) isEditField.value = 'false';
            if (passwordField) {
                passwordField.required = true;
                passwordField.placeholder = 'Enter password';
            }
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const firstNameField = document.getElementById('firstName');
            if (firstNameField) setTimeout(() => firstNameField.focus(), 100);
        }
    }
    
    /**
     * Close user modal
     */
    function closeUserModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentEditUser = null;
        }
    }
    
    /**
     * Edit user
     */
    function editUser(userId) {
        console.log('✏️ Editing user:', userId);
        const user = currentUsers.find(u => u.id === userId);
        if (!user) {
            showToast('User not found', 'error');
            return;
        }
        
        currentEditUser = user;
        
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const modalTitle = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        const isEditField = document.getElementById('isEdit');
        const passwordField = document.getElementById('password');
        
        if (modal && form) {
            // Populate form
            document.getElementById('userId').value = user.id || '';
            document.getElementById('firstName').value = user.firstName || '';
            document.getElementById('lastName').value = user.lastName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('role').value = user.role || '';
            document.getElementById('status').value = user.status || 'ACTIVE';
            
            if (modalTitle) modalTitle.textContent = 'Edit User';
            if (submitBtn) submitBtn.innerHTML = '<i class="icon-save"></i> Update User';
            if (isEditField) isEditField.value = 'true';
            if (passwordField) {
                passwordField.required = false;
                passwordField.placeholder = 'Leave blank to keep current password';
                passwordField.value = '';
            }
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Confirm delete user
     */
    function confirmDeleteUser(userId) {
        console.log('🗑️ Confirming delete user:', userId);
        const user = currentUsers.find(u => u.id === userId);
        if (!user) {
            showToast('User not found', 'error');
            return;
        }
        
        currentDeleteUser = user;
        
        const modal = document.getElementById('deleteModal');
        const userNameSpan = document.getElementById('deleteUserName');
        
        if (modal) {
            if (userNameSpan) {
                userNameSpan.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Delete user
     */
    function deleteUser() {
        console.log('🗑️ Deleting user:', currentDeleteUser);
        if (!currentDeleteUser) {
            showToast('No user selected for deletion', 'error');
            return;
        }
        
        fetch(`${baseUrl}/admin/delete-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ userId: currentDeleteUser.id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                closeDeleteModal();
                loadUsers();
                loadUserStats();
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Delete error:', error);
            showToast('Error deleting user: ' + error.message, 'error');
        });
    }
    
    /**
     * Handle user form submit
     */
    function handleUserFormSubmit(e) {
        e.preventDefault();
        console.log('📝 User form submitted');
        
        const formData = new FormData(e.target);
        const userData = {};
        
        for (let [key, value] of formData.entries()) {
            userData[key] = value.trim();
        }
        
        const isEdit = userData.isEdit === 'true';
        
        // Basic validation
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.role) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (!isEdit && !userData.password) {
            showToast('Password is required for new users', 'error');
            return;
        }
        
        const url = isEdit ? `${baseUrl}/admin/update-user` : `${baseUrl}/admin/create-user`;
        
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                closeUserModal();
                loadUsers();
                loadUserStats();
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Form submission error:', error);
            showToast('Error saving user: ' + error.message, 'error');
        });
    }
    
    /**
     * Open add item modal
     */
    function openAddItemModal() {
        console.log('➕ Opening add item modal');
        editItem = null;
        currentImageData = null;
        
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        const modalTitle = document.getElementById('itemModalTitle');
        
        if (modal && form) {
            form.reset();
            const isEditField = document.getElementById('isEdit');
            if (isEditField) isEditField.value = 'false';
            
            if (modalTitle) modalTitle.textContent = 'Add New Item';
            
            const preview = document.getElementById('imagePreview');
            if (preview) preview.style.display = 'none';
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const titleField = document.getElementById('title');
            if (titleField) setTimeout(() => titleField.focus(), 100);
        }
    }
    
    /**
     * Close item modal
     */
    function closeItemModal() {
        const modal = document.getElementById('itemModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            editItem = null;
            currentImageData = null;
        }
    }
    
    /**
     * Edit item function
     */
    function editItemFunc(id) {
        console.log('✏️ Editing item:', id);
        editItem = currentItems.find(item => item.id === id);
        
        if (!editItem) {
            showToast('Item not found', 'error');
            return;
        }
        
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('itemModalTitle');
        
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
            
            currentImageData = editItem.imagePath;
            
            if (editItem.imagePath && editItem.imagePath.trim() !== '') {
                const preview = document.getElementById('imagePreview');
                const img = document.getElementById('previewImg');
                if (preview && img) {
                    img.src = editItem.imagePath;
                    preview.style.display = 'block';
                }
            }
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Delete item function
     */
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
        
        if (deleteType) deleteType.textContent = 'item';
        if (deleteName) deleteName.textContent = deleteItem.title;
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Handle item form submit
     */
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
        
        data.imagePath = currentImageData || '';
        
        // Validation
        const requiredFields = ['title', 'author', 'categoryId', 'price', 'stock'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field] === '');
        
        if (missingFields.length > 0) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const isEdit = data.isEdit === 'true';
        const url = isEdit ? `${baseUrl}/admin/items/update` : `${baseUrl}/admin/items/create`;
        
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(data => {
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
        });
    }
    
    /**
     * Open categories list modal
     */
    function openCategoriesListModal() {
        console.log('🏷️ Opening categories management modal');
        const modal = document.getElementById('categoriesListModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            loadCategoriesTable();
        }
    }
    
    /**
     * Close categories list modal
     */
    function closeCategoriesListModal() {
        const modal = document.getElementById('categoriesListModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    /**
     * Load categories table
     */
    function loadCategoriesTable() {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;
        
        if (currentCategories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No categories found</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentCategories.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.name}</td>
                <td>${cat.description || 'No description'}</td>
                <td><span class="badge status-active">Active</span></td>
                <td>
                    <button onclick="editCategory(${cat.id})" class="action-btn edit-btn">✏️ Edit</button>
                    <button onclick="deleteCategory(${cat.id})" class="action-btn delete-btn">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * Open add category modal
     */
    function openAddCategoryModal() {
        console.log('➕ Opening add category modal');
        editCategory = null;
        
        closeCategoriesListModal();
        
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        const modalTitle = document.getElementById('categoryModalTitle');
        const statusGroup = document.getElementById('categoryStatusGroup');
        
        if (modal && form) {
            form.reset();
            const isEditField = document.getElementById('isCategoryEdit');
            if (isEditField) isEditField.value = 'false';
            
            if (modalTitle) modalTitle.textContent = 'Add New Category';
            if (statusGroup) statusGroup.style.display = 'none';
            
            setTimeout(() => {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                const nameField = document.getElementById('categoryName');
                if (nameField) nameField.focus();
            }, 100);
        }
    }
    
    /**
     * Close category modal
     */
    function closeCategoryModal() {
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
    
    /**
     * Edit category function
     */
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
            
            setTimeout(() => {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                if (nameField) nameField.focus();
            }, 100);
        }
    }
    
    /**
     * Delete category function
     */
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
        
        if (deleteType) deleteType.textContent = 'category';
        if (deleteName) deleteName.textContent = deleteCategory.name;
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Handle category form submit
     */
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
        });
    }
    
    /**
     * Perform delete operation
     */
    function performDelete() {
        console.log('🗑️ Performing delete operation');
        if (deleteItem) {
            deleteItemConfirmed();
        } else if (deleteCategory) {
            deleteCategoryConfirmed();
        } else if (currentDeleteUser) {
            deleteUser();
        } else {
            console.error('❌ No item selected for deletion');
            showToast('No item selected for deletion', 'error');
        }
    }
    
    /**
     * Delete item confirmed
     */
    function deleteItemConfirmed() {
        console.log('🗑️ Deleting item:', deleteItem.id);
        
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
        });
    }
    
    /**
     * Delete category confirmed
     */
    function deleteCategoryConfirmed() {
        console.log('🗑️ Deleting category:', deleteCategory.id);
        
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
        });
    }
    
    /**
     * Close delete modal
     */
    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            deleteItem = null;
            deleteCategory = null;
            currentDeleteUser = null;
        }
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
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
     * Close order modal
     */
    function closeOrderModal() {
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentOrderDetails = null;
        }
    }
    
    // ==========================================
    // IMAGE HANDLING FUNCTIONS
    // ==========================================
    
    /**
     * Preview image
     */
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
    
    /**
     * Remove image
     */
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
    
    // ==========================================
    // UTILITY AND SYSTEM FUNCTIONS
    // ==========================================
    
    /**
     * Initialize System Settings
     */
    function initializeSystemSettings() {
        console.log('⚙️ System Settings initialized');
        // Add system settings functionality here
    }
    
    /**
     * Setup global event listeners
     */
    function setupGlobalEvents() {
        // Modal outside click handling
        document.addEventListener('click', (e) => {
            const modals = ['userModal', 'deleteModal', 'itemModal', 'categoryModal', 'categoriesListModal', 'orderDetailsModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        });
        
        // Keyboard handling
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
                
                const toast = document.getElementById('messageToast');
                if (toast) {
                    toast.classList.remove('show');
                }
            }
        });
    }
    
    /**
     * Load default page
     */
    function loadDefaultPage() {
        setTimeout(() => {
            const defaultLink = document.querySelector('.nav-link[data-page*="admin-Manage-Users.jsp"]');
            if (defaultLink) {
                console.log('🏠 Loading default page...');
                defaultLink.click();
            }
        }, 100);
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
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                hideToast();
            }, 4000);
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
    
    // Make toast functions global
    window.showToast = showToast;
    window.hideToast = hideToast;
    
    // Add CSS for animations and loading states
    const style = document.createElement('style');
    style.textContent = `
        /* Loading and Animation Styles */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
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
        
        .error-container {
            padding: 20px;
            text-align: center;
            color: #dc3545;
        }
        
        .welcome-content {
            padding: 40px;
            text-align: center;
        }
        
        .welcome-card {
            background: #fff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
        }
        
        .quick-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 30px;
            gap: 20px;
        }
        
        .quick-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            flex: 1;
        }
        
        .quick-stat-item i {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #007bff;
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
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .toast.success {
            border-left: 4px solid #28a745;
        }
        
        .toast.error {
            border-left: 4px solid #dc3545;
        }
        
        .toast.info {
            border-left: 4px solid #17a2b8;
        }
        
        .toast-content {
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .toast-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #999;
            margin-left: 10px;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Dashboard Header Styles */
        .dashboard-header {
            background: #fff;
            padding: 15px 30px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header-left h1 {
            margin: 0;
            font-size: 1.5rem;
            color: #333;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .user-details {
            display: flex;
            flex-direction: column;
            text-align: right;
        }
        
        .user-name {
            font-weight: 600;
            color: #333;
        }
        
        .user-role {
            font-size: 0.85rem;
            color: #666;
        }
        
        .user-avatar i {
            font-size: 2rem;
            color: #007bff;
        }
        
        /* Sidebar Navigation Styles */
        .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #2c3e50;
        }
        
        .sidebar-header h2 {
            margin: 0;
            color: #fff;
            font-size: 1.3rem;
        }
        
        .sidebar-nav {
            padding: 20px 0;
        }
        
        .nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .nav-list li {
            margin-bottom: 5px;
        }
        
        .nav-divider {
            height: 1px;
            background: #2c3e50;
            margin: 15px 0;
        }
        
        .nav-link {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            color: #bdc3c7;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .nav-link:hover {
            background: #2c3e50;
            color: #fff;
        }
        
        .nav-link.active {
            background: #3498db;
            color: #fff;
        }
        
        .nav-link i {
            margin-right: 10px;
            width: 20px;
        }
    `;
    document.head.appendChild(style);
    
    console.log('🎉 Pahana Edu Admin Dashboard setup complete!');
});/**
 * 
 */
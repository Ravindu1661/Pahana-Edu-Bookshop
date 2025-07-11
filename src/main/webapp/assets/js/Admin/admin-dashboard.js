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
        
        // Reset initialization flags
        if (typeof billingInitialized !== 'undefined') {
            billingInitialized = false;
        }
        if (typeof itemManagementInitialized !== 'undefined') {
            itemManagementInitialized = false;
        }
        
        // Call reset functions if available
        try {
            if (typeof resetBillingInitialization === 'function') {
                resetBillingInitialization();
            }
            if (window.billingManager && typeof window.billingManager.resetBillingInitialization === 'function') {
                window.billingManager.resetBillingInitialization();
            }
            if (typeof resetItemManagementInitialization === 'function') {
                resetItemManagementInitialization();
            }
            if (window.itemManager && typeof window.itemManager.resetItemManagementInitialization === 'function') {
                window.itemManager.resetItemManagementInitialization();
            }
        } catch (error) {
            console.warn('⚠️ Cleanup error (non-critical):', error);
        }
        
        console.log('✅ Force cleanup completed');
    }
    
    /**
     * Initialize page based on type
     */
    function initializePage(page) {
        console.log('🔧 Initializing page:', page);
        console.log('🔍 Available managers:');
        console.log('  - billingManager:', typeof window.billingManager);
        console.log('  - itemManager:', typeof window.itemManager);
        
        // Direct function checks
        console.log('🔍 Available functions:');
        console.log('  - initializeBillingManagement:', typeof window.initializeBillingManagement);
        console.log('  - initializeItemManagement:', typeof window.initializeItemManagement);
        
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
     * Initialize Item Management
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
        
        console.log('✅ Item elements found, loading data...');
        
        // Try external manager first
        if (typeof window.itemManager !== 'undefined') {
            console.log('🔧 Using external item manager...');
            try {
                window.itemManager.resetItemManagementInitialization();
                window.itemManager.initializeItemManagement();
                return;
            } catch (error) {
                console.error('❌ External item manager error:', error);
            }
        }
        
        // Try direct function
        if (typeof window.initializeItemManagement === 'function') {
            console.log('🔧 Using direct item function...');
            try {
                window.initializeItemManagement();
                return;
            } catch (error) {
                console.error('❌ Direct item function error:', error);
            }
        }
        
        // Fallback to built-in functions
        console.log('🔧 Using built-in item functions...');
        loadItemStats();
        loadItems();
        loadCategories();
        setupItemEvents();
        makeItemFunctionsGlobal();
    }
    
    /**
     * Initialize Billing Management
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
        
        console.log('✅ Billing elements found');
        
        // Try external manager first
        if (typeof window.billingManager !== 'undefined') {
            console.log('🔧 Using billing manager...');
            try {
                window.billingManager.resetBillingInitialization();
                window.billingManager.initializeBillingManagement();
                return;
            } catch (error) {
                console.error('❌ Billing manager error:', error);
            }
        }
        
        // Try direct function
        if (typeof window.initializeBillingManagement === 'function') {
            console.log('🔧 Using direct billing function...');
            try {
                window.initializeBillingManagement();
                return;
            } catch (error) {
                console.error('❌ Direct billing function error:', error);
            }
        }
        
        console.warn('⚠️ Billing initialization failed, retrying...');
        setTimeout(() => {
            initializeBilling();
        }, 1000);
    }
    
    /**
     * Initialize System Settings
     */
    function initializeSettings() {
        console.log('⚙️ Settings initialized');
    }
    
    // Billing Management Core Functions (inline for reliability)
    let currentOrders = [];
    let currentOrderDetails = null;
    let billingInitialized = false;
    
    // Item Management Core Functions (inline for reliability)
    let currentItems = [];
    let currentCategories = [];
    let editItem = null;
    let deleteItem = null;
    let editCategory = null;
    let deleteCategory = null;
    let currentImageData = null;
    let itemManagementInitialized = false;
    
    // User Management Core Functions (inline for reliability)
    let currentUsers = [];
    let currentEditUser = null;
    let currentDeleteUser = null;
    
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
        // Setup user management events (simplified)
        console.log('🎯 Setting up user events...');
    }
    
    function makeUserFunctionsGlobal() {
        window.editUser = function(id) { console.log('Edit user:', id); };
        window.confirmDeleteUser = function(id) { console.log('Delete user:', id); };
        window.loadUsers = loadUsers;
    }
    
    // Item Management Core Functions (inline for reliability)
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
            addItemBtn.replaceWith(addItemBtn.cloneNode(true));
            document.getElementById('addItemBtn').addEventListener('click', () => {
                console.log('Add item clicked');
            });
        }
        
        if (manageCategoriesBtn) {
            manageCategoriesBtn.replaceWith(manageCategoriesBtn.cloneNode(true));
            document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
                console.log('Manage categories clicked');
            });
        }
        
        if (categoryFilter) {
            categoryFilter.replaceWith(categoryFilter.cloneNode(true));
            document.getElementById('categoryFilter').addEventListener('change', loadItems);
        }
        
        if (statusFilter) {
            statusFilter.replaceWith(statusFilter.cloneNode(true));
            document.getElementById('statusFilter').addEventListener('change', loadItems);
        }
        
        console.log('✅ Item events setup complete');
    }
    
    function makeItemFunctionsGlobal() {
        window.editItemFunc = function(id) { console.log('Edit item:', id); };
        window.deleteItemFunc = function(id) { console.log('Delete item:', id); };
        window.loadItems = loadItems;
        window.loadCategories = loadCategories;
        window.filterItems = loadItems;
        
        console.log('✅ Item functions made global');
    }
    
    // Toast notification
    function showToast(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        const toast = document.getElementById('messageToast') || document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }
    }
    
    // Load default page
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
        .toast.show { opacity: 1; transform: translateY(0); }
        .toast { opacity: 0; transform: translateY(-20px); transition: all 0.3s ease; }
    `;
    document.head.appendChild(style);
    
    console.log('🎉 Simple Admin Dashboard setup complete!');
});
// 🚀 Pahana Edu Manager Dashboard - Main JavaScript File - FIXED VERSION
// This file contains all functionality for User Management, Item Management, and Order Management

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Pahana Edu Manager Dashboard loaded');
    
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
    let currentUsers = [];
    let currentItems = [];
    let currentCategories = [];
    let currentOrders = [];
    
    // Current edit/delete items
    let currentEditUser = null;
    let currentDeleteUser = null;
    let currentEditItem = null;
    let currentDeleteItem = null;
    let currentImageData = null;
    
    // Initialize dashboard
    initializeDashboard();
    
    /**
     * Initialize the main dashboard
     */
    function initializeDashboard() {
        console.log('🔧 Initializing manager dashboard...');
        
        // Setup navigation
        setupNavigation();
        
        // Load initial statistics
        loadDashboardStats();
        
        // Setup global event listeners
        setupGlobalEvents();
        
        console.log('✅ Manager dashboard initialization complete');
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
            case 'users':
                loadUsers();
                break;
            case 'items':
                loadItems();
                loadCategories();
                break;
            case 'orders':
                loadOrders();
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
        
        // Load user stats
        fetch(`${baseUrl}/manager/user-stats`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalUsers').textContent = data.stats.totalUsers || 0;
            } else {
                document.getElementById('totalUsers').textContent = 'Error';
            }
        })
        .catch(error => {
            console.error('❌ User stats error:', error);
            document.getElementById('totalUsers').textContent = 'Error';
        });
        
        // Load item stats
        fetch(`${baseUrl}/manager/item-stats`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalItems').textContent = data.stats.totalItems || 0;
            } else {
                document.getElementById('totalItems').textContent = 'Error';
            }
        })
        .catch(error => {
            console.error('❌ Items stats error:', error);
            document.getElementById('totalItems').textContent = 'Error';
        });
        
        // Load order stats
        fetch(`${baseUrl}/manager/order-stats`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalOrders').textContent = data.stats.totalOrders || 0;
                const revenue = data.stats.totalRevenue || 0;
                document.getElementById('totalRevenue').textContent = `Rs. ${parseFloat(revenue).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
            } else {
                document.getElementById('totalOrders').textContent = 'Error';
                document.getElementById('totalRevenue').textContent = 'Error';
            }
        })
        .catch(error => {
            console.error('❌ Order stats error:', error);
            document.getElementById('totalOrders').textContent = 'Error';
            document.getElementById('totalRevenue').textContent = 'Error';
        });
    }
    
    // ==========================================
    // USER MANAGEMENT FUNCTIONS
    // ==========================================
    
    /**
     * Load users
     */
    function loadUsers() {
        console.log('👥 Loading users...');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">🔄 Loading users...</td></tr>';
        
        fetch(`${baseUrl}/manager/users`, {
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
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => {
            const fullName = (user.firstName || '') + ' ' + (user.lastName || '');
            const statusClass = user.status && user.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
            
            return `
                <tr>
                    <td>${user.id || 'N/A'}</td>
                    <td>${fullName.trim() || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td><span class="badge bg-primary">${user.role || 'N/A'}</span></td>
                    <td><span class="status-badge ${statusClass}">${user.status || 'N/A'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-warning me-1" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDeleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
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
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">❌ ${message}</td></tr>`;
        }
        showAlert(message, 'danger');
    }
    
    /**
     * Show create user modal
     */
    function showCreateUserModal() {
        console.log('➕ Opening create user modal');
        currentEditUser = null;
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        const form = document.getElementById('userForm');
        const modalTitle = document.getElementById('userModalTitle');
        
        if (form) form.reset();
        if (modalTitle) modalTitle.textContent = 'Add User';
        
        // Clear user ID for new user
        const userIdField = document.getElementById('userId');
        if (userIdField) userIdField.value = '';
        
        // Make password required for new users
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.required = true;
            passwordField.placeholder = 'Enter password';
        }
        
        modal.show();
    }
    
    /**
     * Edit user
     */
    function editUser(userId) {
        console.log('✏️ Editing user:', userId);
        const user = currentUsers.find(u => u.id === userId);
        if (!user) {
            showAlert('User not found', 'danger');
            return;
        }
        
        currentEditUser = user;
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        const modalTitle = document.getElementById('userModalTitle');
        
        if (modalTitle) modalTitle.textContent = 'Edit User';
        
        // Populate form fields
        const fields = {
            userId: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || '',
            status: user.status || 'active'
        };
        
        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = fields[fieldId];
        });
        
        // Make password optional for updates
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.required = false;
            passwordField.placeholder = 'Leave blank to keep current password';
            passwordField.value = '';
        }
        
        modal.show();
    }
    
    /**
     * Save user
     */
    function saveUser() {
        console.log('💾 Saving user...');
        
        const form = document.getElementById('userForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const userData = {};
        
        for (let [key, value] of formData.entries()) {
            userData[key] = value.trim();
        }
        
        const isEdit = userData.userId && userData.userId !== '';
        
        // Basic validation
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.role) {
            showAlert('Please fill in all required fields', 'danger');
            return;
        }
        
        if (!isEdit && !userData.password) {
            showAlert('Password is required for new users', 'danger');
            return;
        }
        
        const url = isEdit ? `${baseUrl}/manager/update-user` : `${baseUrl}/manager/create-user`;
        
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'User saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
                loadUsers();
                loadDashboardStats();
            } else {
                showAlert(data.message || 'Failed to save user', 'danger');
            }
        })
        .catch(error => {
            console.error('❌ Save user error:', error);
            showAlert('Error saving user: ' + error.message, 'danger');
        });
    }
    
    /**
     * Confirm delete user
     */
    function confirmDeleteUser(userId) {
        console.log('🗑️ Confirming delete user:', userId);
        const user = currentUsers.find(u => u.id === userId);
        if (!user) {
            showAlert('User not found', 'danger');
            return;
        }
        
        currentDeleteUser = user;
        
        const fullName = `${user.firstName} ${user.lastName}`;
        if (confirm(`Are you sure you want to delete user "${fullName}" (${user.email})?`)) {
            deleteUser();
        }
    }
    
    /**
     * Delete user - FIXED METHOD
     */
    function deleteUser() {
        console.log('🗑️ Deleting user:', currentDeleteUser);
        if (!currentDeleteUser) {
            showAlert('No user selected for deletion', 'danger');
            return;
        }
        
        fetch(`${baseUrl}/manager/delete-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ userId: currentDeleteUser.id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'User deleted successfully', 'success');
                loadUsers();
                loadDashboardStats();
            } else {
                showAlert(data.message || 'Failed to delete user', 'danger');
            }
        })
        .catch(error => {
            console.error('❌ Delete user error:', error);
            showAlert('Error deleting user: ' + error.message, 'danger');
        })
        .finally(() => {
            currentDeleteUser = null;
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
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">🔄 Loading items...</td></tr>';
        
        fetch(`${baseUrl}/manager/items`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
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
            showItemsError('Error loading items: ' + error.message);
        });
    }
    
    /**
     * Display items in table
     */
    function displayItems(items) {
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;
        
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">📭 No items found</td></tr>';
            return;
        }
        
        tbody.innerHTML = items.map(item => {
            const priceDisplay = item.offerPrice ? 
                `<div>
                    <span class="text-decoration-line-through text-muted">Rs. ${item.price}</span><br>
                    <span class="text-success fw-bold">Rs. ${item.offerPrice}</span>
                 </div>` : 
                `Rs. ${item.price}`;
            
            const statusClass = getItemStatusClass(item.status);
            
            return `
                <tr>
                    <td>${item.id}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            ${item.imagePath ? 
                                `<img src="${item.imagePath}" alt="${item.title}" 
                                     style="width: 40px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : 
                                '<div style="width: 40px; height: 50px; background: #f8f9fa; margin-right: 10px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image text-muted"></i></div>'
                            }
                            <span class="fw-bold" title="${item.title}">${item.title}</span>
                        </div>
                    </td>
                    <td>${item.author}</td>
                    <td>${item.categoryName || 'N/A'}</td>
                    <td>${priceDisplay}</td>
                    <td><span class="badge bg-info">${item.stock}</span></td>
                    <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-warning me-1" onclick="editItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDeleteItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Get item status class
     */
    function getItemStatusClass(status) {
        switch (status && status.toLowerCase()) {
            case 'active': return 'status-active';
            case 'inactive': return 'status-inactive';
            case 'out_of_stock': return 'status-pending';
            default: return 'status-inactive';
        }
    }
    
    /**
     * Show items error
     */
    function showItemsError(message) {
        const tbody = document.getElementById('itemsTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">❌ ${message}</td></tr>`;
        }
        showAlert(message, 'danger');
    }
    
    /**
     * Load categories
     */
    function loadCategories() {
        console.log('🏷️ Loading categories...');
        fetch(`${baseUrl}/manager/categories`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentCategories = data.categories || [];
                    updateCategoryDropdown();
                } else {
                    console.error('Categories error:', data.message);
                }
            })
            .catch(error => {
                console.error('❌ Categories fetch error:', error);
            });
    }
    
    /**
     * Update category dropdown
     */
    function updateCategoryDropdown() {
        const categorySelect = document.getElementById('categoryId');
        if (!categorySelect) return;
        
        const options = currentCategories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
        
        categorySelect.innerHTML = '<option value="">Select Category</option>' + options;
    }
    
    /**
     * Show create item modal
     */
    function showCreateItemModal() {
        console.log('➕ Opening create item modal');
        currentEditItem = null;
        currentImageData = null;
        
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        const form = document.getElementById('itemForm');
        const modalTitle = document.getElementById('itemModalTitle');
        
        if (form) form.reset();
        if (modalTitle) modalTitle.textContent = 'Add Item';
        
        // Clear item ID for new item
        const itemIdField = document.getElementById('itemId');
        if (itemIdField) itemIdField.value = '';
        
        // Clear image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) imagePreview.style.display = 'none';
        
        modal.show();
    }
    
    /**
     * Edit item
     */
    function editItem(itemId) {
        console.log('✏️ Editing item:', itemId);
        const item = currentItems.find(i => i.id === itemId);
        if (!item) {
            showAlert('Item not found', 'danger');
            return;
        }
        
        currentEditItem = item;
        
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        const modalTitle = document.getElementById('itemModalTitle');
        
        if (modalTitle) modalTitle.textContent = 'Edit Item';
        
        // Populate form fields
        const fields = {
            itemId: item.id,
            title: item.title || '',
            author: item.author || '',
            categoryId: item.categoryId || '',
            price: item.price || '',
            offerPrice: item.offerPrice || '',
            stock: item.stock || '',
            description: item.description || '',
            itemStatus: item.status || 'active'
        };
        
        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = fields[fieldId];
        });
        
        // Set image data
        currentImageData = item.imagePath || null;
        
        // Show image preview if exists
        if (item.imagePath) {
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            if (imagePreview && previewImg) {
                previewImg.src = item.imagePath;
                imagePreview.style.display = 'block';
            }
        }
        
        modal.show();
    }
    
    /**
     * Save item
     */
    function saveItem() {
        console.log('💾 Saving item...');
        
        const form = document.getElementById('itemForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const itemData = {};
        
        for (let [key, value] of formData.entries()) {
            if (key !== 'itemImage') {
                itemData[key] = value.trim();
            }
        }
        
        // Add image data
        itemData.imagePath = currentImageData || '';
        
        const isEdit = itemData.itemId && itemData.itemId !== '';
        
        // Basic validation
        if (!itemData.title || !itemData.author || !itemData.categoryId || !itemData.price || !itemData.stock) {
            showAlert('Please fill in all required fields', 'danger');
            return;
        }
        
        const url = isEdit ? `${baseUrl}/manager/update-item` : `${baseUrl}/manager/create-item`;
        
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(itemData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'Item saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
                loadItems();
                loadDashboardStats();
            } else {
                showAlert(data.message || 'Failed to save item', 'danger');
            }
        })
        .catch(error => {
            console.error('❌ Save item error:', error);
            showAlert('Error saving item: ' + error.message, 'danger');
        });
    }
    
    /**
     * Confirm delete item
     */
    function confirmDeleteItem(itemId) {
        console.log('🗑️ Confirming delete item:', itemId);
        const item = currentItems.find(i => i.id === itemId);
        if (!item) {
            showAlert('Item not found', 'danger');
            return;
        }
        
        currentDeleteItem = item;
        
        if (confirm(`Are you sure you want to delete item "${item.title}"?`)) {
            deleteItem();
        }
    }
    
    /**
     * Delete item
     */
    function deleteItem() {
        console.log('🗑️ Deleting item:', currentDeleteItem);
        if (!currentDeleteItem) {
            showAlert('No item selected for deletion', 'danger');
            return;
        }
        
        fetch(`${baseUrl}/manager/delete-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ itemId: currentDeleteItem.id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'Item deleted successfully', 'success');
                loadItems();
                loadDashboardStats();
            } else {
                showAlert(data.message || 'Failed to delete item', 'danger');
            }
        })
        .catch(error => {
            console.error('❌ Delete item error:', error);
            showAlert('Error deleting item: ' + error.message, 'danger');
        })
        .finally(() => {
            currentDeleteItem = null;
        });
    }
    
    // ==========================================
    // ORDER MANAGEMENT FUNCTIONS - FIXED
    // ==========================================
    
    /**
     * Load orders
     */
    function loadOrders() {
        console.log('📦 Loading orders...');
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">🔄 Loading orders...</td></tr>';
        
        fetch(`${baseUrl}/manager/orders`, {
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
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">📭 No orders found</td></tr>';
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
                    <td><span class="fw-bold">Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></td>
                    <td><span class="status-badge ${statusClass}">${getStatusDisplay(order.status)}</span></td>
                    <td><span class="status-badge ${paymentClass}">${getPaymentMethodDisplay(order.paymentMethod)}</span></td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Get order status class
     */
    function getOrderStatusClass(status) {
        switch (status && status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'shipped': return 'status-confirmed';
            case 'delivered': return 'status-active';
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
            default: return 'status-pending';
        }
    }
    
    /**
     * Get status display
     */
    function getStatusDisplay(status) {
        switch (status && status.toLowerCase()) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status || 'Unknown';
        }
    }
    
    /**
     * Get payment method display
     */
    function getPaymentMethodDisplay(paymentMethod) {
        switch (paymentMethod && paymentMethod.toLowerCase()) {
            case 'cod': return 'COD';
            case 'online': return 'Online';
            default: return paymentMethod || 'N/A';
        }
    }
    
    /**
     * Show orders error
     */
    function showOrdersError(message) {
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">❌ ${message}</td></tr>`;
        }
        showAlert(message, 'danger');
    }
    
    /**
     * View order details - FIXED VERSION
     */
    function viewOrderDetails(orderId) {
        console.log('👁️ Viewing order details:', orderId);
        const order = currentOrders.find(o => o.id === orderId);
        if (!order) {
            showAlert('Order not found', 'danger');
            return;
        }
        
        // Create order details modal HTML with proper data display
        const modalHtml = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Order #${order.id} Details</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <h6>Customer Information</h6>
                                    <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
                                    <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                                    <p><strong>Phone:</strong> ${order.contactNumber || 'N/A'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Order Information</h6>
                                    <p><strong>Order ID:</strong> #${order.id}</p>
                                    <p><strong>Status:</strong> <span class="status-badge ${getOrderStatusClass(order.status)}">${getStatusDisplay(order.status)}</span></p>
                                    <p><strong>Payment:</strong> <span class="status-badge ${getPaymentStatusClass(order.paymentMethod)}">${getPaymentMethodDisplay(order.paymentMethod)}</span></p>
                                    <p><strong>Total:</strong> Rs. ${parseFloat(order.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6>Shipping Address</h6>
                                <p>${order.shippingAddress || 'N/A'}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h6>Order Items</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${order.orderItems && order.orderItems.length > 0 ? order.orderItems.map(item => `
                                                <tr>
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            ${item.itemImagePath ? 
                                                                `<img src="${item.itemImagePath}" alt="${item.itemTitle}" 
                                                                     style="width: 30px; height: 40px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : 
                                                                '<div style="width: 30px; height: 40px; background: #f8f9fa; margin-right: 10px; border-radius: 4px;"></div>'
                                                            }
                                                            <div>
                                                                <div class="fw-bold">${item.itemTitle || 'N/A'}</div>
                                                                <small class="text-muted">by ${item.itemAuthor || 'Unknown'}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
                                                    <td>${item.quantity || 0}</td>
                                                    <td>Rs. ${(parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}</td>
                                                </tr>
                                            `).join('') : '<tr><td colspan="4" class="text-center">No items found</td></tr>'}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existingModal = document.getElementById('orderDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
        
        // Cleanup modal after it's hidden
        document.getElementById('orderDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
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
                showAlert('Image size should be less than 5MB', 'danger');
                input.value = '';
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showAlert('Please select a valid image file', 'danger');
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
                showAlert('Error reading image file', 'danger');
                input.value = '';
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    /**
     * Setup global event listeners
     */
    function setupGlobalEvents() {
        // Image upload handling
        const itemImageInput = document.getElementById('itemImage');
        if (itemImageInput) {
            itemImageInput.addEventListener('change', function() {
                previewImage(this);
            });
        }
        
        // Form validation
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
            });
        });
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
    
    // ==========================================
    // MAKE FUNCTIONS GLOBAL
    // ==========================================
    
    // Make functions globally accessible
    window.showSection = showSection;
    window.loadDashboardStats = loadDashboardStats;
    window.loadUsers = loadUsers;
    window.loadItems = loadItems;
    window.loadOrders = loadOrders;
    window.showCreateUserModal = showCreateUserModal;
    window.editUser = editUser;
    window.saveUser = saveUser;
    window.confirmDeleteUser = confirmDeleteUser;
    window.deleteUser = deleteUser;
    window.showCreateItemModal = showCreateItemModal;
    window.editItem = editItem;
    window.saveItem = saveItem;
    window.confirmDeleteItem = confirmDeleteItem;
    window.deleteItem = deleteItem;
    window.viewOrderDetails = viewOrderDetails;
    window.previewImage = previewImage;
    
    // ==========================================
    // INITIALIZATION COMPLETE
    // ==========================================
    
    console.log('🎉 Pahana Edu Manager Dashboard setup complete!');
    
    // Add custom CSS for enhanced styling
    const style = document.createElement('style');
    style.textContent = `
        /* Loading and Animation Styles */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
        }
        
        /* Enhanced Table Styles */
        .table th {
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .table tbody tr:hover {
            background-color: rgba(0,123,255,.075);
        }
        
        /* Status Badge Enhancements */
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-active { background-color: #d4edda; color: #155724; }
        .status-inactive { background-color: #f8d7da; color: #721c24; }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-confirmed { background-color: #cce5ff; color: #004085; }
        
        /* Custom Alert Positioning */
        .custom-alert {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: none;
        }
        
        /* Modal Enhancements */
        .modal-header {
            border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .modal-content {
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
        }
        
        /* Form Enhancements */
        .form-control:focus {
            box-shadow: 0 0 0 0.2rem rgba(13,110,253,.25);
            border-color: #86b7fe;
        }
        
        /* Button Hover Effects */
        .btn {
            transition: all 0.2s ease-in-out;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        /* Image Preview Styles */
        #imagePreview {
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            background-color: #f8f9fa;
        }
        
        #imagePreview img {
            border: 2px solid #dee2e6;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Stats Card Animations */
        .stat-card {
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        /* Navigation Enhancements */
        .nav-link {
            transition: all 0.3s ease;
        }
        
        .nav-link.active {
            box-shadow: inset 3px 0 0 rgba(255,255,255,0.5);
        }
        
        /* Table Action Buttons */
        .table td .btn {
            margin: 1px;
        }
        
        .table td .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }
        
        /* Responsive Enhancements */
        @media (max-width: 768px) {
            .custom-alert {
                left: 10px;
                right: 10px;
                min-width: auto;
            }
            
            .modal-dialog {
                margin: 0.5rem;
            }
            
            .table-responsive {
                font-size: 0.875rem;
            }
            
            .stat-number {
                font-size: 2rem;
            }
        }
        
        /* Scrollbar Styling */
        .table-responsive::-webkit-scrollbar {
            height: 8px;
        }
        
        .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        /* Loading States */
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        
        /* Success/Error States */
        .success-state {
            color: #198754;
        }
        
        .error-state {
            color: #dc3545;
        }
        
        /* Price Display Enhancements */
        .price-display {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .text-decoration-line-through {
            text-decoration: line-through !important;
        }
        
        /* Order Details Modal Enhancements */
        .modal-lg {
            max-width: 900px;
        }
        
        .modal-body h6 {
            color: var(--primary-color);
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        /* Enhanced Data Tables */
        .data-table {
            position: relative;
            overflow: hidden;
        }
        
        .data-table::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--secondary-color), transparent);
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);
});
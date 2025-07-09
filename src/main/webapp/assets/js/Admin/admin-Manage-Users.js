document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Dashboard loaded');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');
    
    // Get context path
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    console.log('📍 Context Path:', contextPath);
    console.log('🔗 Base URL:', baseUrl);
    
    // Track current page and users
    let currentPage = null;
    let currentUsers = [];
    let currentEditUser = null;
    let currentDeleteUser = null;
    
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
    
    // Enhanced page loading function
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
                contentArea.innerHTML = data;
                
                // Initialize page-specific functionality
                initializePageFeatures(page);
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
    
    // Show loading indicator
    function showLoadingIndicator() {
        contentArea.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading content...</p>
            </div>
        `;
    }
    
    // Initialize page-specific features
    function initializePageFeatures(page) {
        console.log('🔧 Initializing features for page:', page);
        
        // Wait for DOM to be ready
        setTimeout(() => {
            if (page.includes('admin-Manage-Users.jsp')) {
                initializeUserManagement();
            } else if (page.includes('admin-Manage-Books.jsp')) {
                initializeBookManagement();
            } else if (page.includes('admin-Manage-Orders.jsp')) {
                initializeOrderManagement();
            }
        }, 100);
    }
    
    // Initialize User Management functionality
    function initializeUserManagement() {
        console.log('👥 Initializing User Management...');
        
        // Check if user management elements exist
        const statsElements = {
            totalUsers: document.getElementById('totalUsers'),
            adminCount: document.getElementById('adminCount'),
            managerCount: document.getElementById('managerCount'),
            cashierCount: document.getElementById('cashierCount'),
            customerCount: document.getElementById('customerCount')
        };
        
        const userElements = {
            addUserBtn: document.getElementById('addUserBtn'),
            userForm: document.getElementById('userForm'),
            usersTableBody: document.getElementById('usersTableBody'),
            userModal: document.getElementById('userModal'),
            deleteModal: document.getElementById('deleteModal'),
            roleFilter: document.getElementById('roleFilter'),
            statusFilter: document.getElementById('statusFilter')
        };
        
        console.log('🔍 User Management elements found:', {
            stats: Object.keys(statsElements).filter(key => statsElements[key]).length,
            userElements: Object.keys(userElements).filter(key => userElements[key]).length
        });
        
        // Load user data if elements exist
        if (statsElements.totalUsers && userElements.usersTableBody) {
            console.log('📊 Loading user data...');
            loadUserStats();
            loadUsers();
            setupUserManagementEvents();
        } else {
            console.warn('⚠️ User Management elements not found, retrying...');
            // Retry after a short delay
            setTimeout(() => {
                initializeUserManagement();
            }, 500);
        }
    }
    
    // Load user statistics
    function loadUserStats() {
        console.log('📊 Loading user statistics...');
        const statsUrl = `${baseUrl}/admin/user-stats`;
        
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
    
    // Update stats UI
    function updateStatsUI(stats) {
        console.log('📊 Updating stats UI:', stats);
        
        const elements = {
            totalUsers: document.getElementById('totalUsers'),
            adminCount: document.getElementById('adminCount'),
            managerCount: document.getElementById('managerCount'),
            cashierCount: document.getElementById('cashierCount'),
            customerCount: document.getElementById('customerCount')
        };
        
        if (elements.totalUsers) elements.totalUsers.textContent = stats.totalUsers || 0;
        if (elements.adminCount) elements.adminCount.textContent = stats.adminCount || 0;
        if (elements.managerCount) elements.managerCount.textContent = stats.managerCount || 0;
        if (elements.cashierCount) elements.cashierCount.textContent = stats.cashierCount || 0;
        if (elements.customerCount) elements.customerCount.textContent = stats.customerCount || 0;
        
        console.log('✅ Stats UI updated successfully');
    }
    
    // Show stats error
    function showStatsError(message) {
        console.error('📊 Stats error:', message);
        const elements = ['totalUsers', 'adminCount', 'managerCount', 'cashierCount', 'customerCount'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Error';
        });
        
        showToast('Statistics error: ' + message, 'error');
    }
    
    // Load users
    function loadUsers() {
        console.log('👥 Loading users...');
        const usersTableBody = document.getElementById('usersTableBody');
        
        if (!usersTableBody) {
            console.error('❌ Users table body not found');
            return;
        }
        
        // Show loading state
        usersTableBody.innerHTML = '<tr><td colspan="7" class="loading">🔄 Loading users...</td></tr>';
        
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        const roleValue = roleFilter ? roleFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';
        
        let usersUrl = `${baseUrl}/admin/users`;
        const params = new URLSearchParams();
        if (roleValue) params.append('role', roleValue);
        if (statusValue) params.append('status', statusValue);
        if (params.toString()) usersUrl += '?' + params.toString();
        
        console.log('📡 Users URL:', usersUrl);
        
        fetch(usersUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('📡 Users response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Users data received:', data);
            
            if (data.success) {
                currentUsers = data.users || [];
                console.log(`👥 Loaded ${currentUsers.length} users`);
                displayUsers(currentUsers);
            } else {
                console.error('❌ Users API error:', data.message);
                showUsersError('Failed to load users: ' + data.message);
            }
        })
        .catch(error => {
            console.error('❌ Users fetch error:', error);
            showUsersError('Error loading users: ' + error.message);
        });
    }
    
    // Display users in table
    function displayUsers(users) {
        console.log(`📋 Displaying ${users.length} users`);
        const usersTableBody = document.getElementById('usersTableBody');
        
        if (!usersTableBody) {
            console.error('❌ Users table body not found');
            return;
        }
        
        if (users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
            return;
        }
        
        try {
            usersTableBody.innerHTML = users.map(user => {
                const fullName = (user.firstName || '') + ' ' + (user.lastName || '');
                return `
                    <tr class="fade-in">
                        <td>${user.id || 'N/A'}</td>
                        <td>${fullName.trim() || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td><span class="badge role-${(user.role || '').toLowerCase()}">${user.role || 'N/A'}</span></td>
                        <td><span class="badge status-${(user.status || '').toLowerCase()}">${user.status || 'N/A'}</span></td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editUser(${user.id})">
                                <i class="icon-edit"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" onclick="confirmDeleteUser(${user.id})">
                                <i class="icon-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            console.log('✅ Users table updated successfully');
        } catch (error) {
            console.error('❌ Error displaying users:', error);
            showUsersError('Error displaying users: ' + error.message);
        }
    }
    
    // Show users error
    function showUsersError(message) {
        const usersTableBody = document.getElementById('usersTableBody');
        if (usersTableBody) {
            usersTableBody.innerHTML = `
                <tr><td colspan="7" class="loading" style="color: #dc3545;">
                    ❌ ${message}
                </td></tr>
            `;
        }
        showToast(message, 'error');
    }
    
    // Setup user management events
    function setupUserManagementEvents() {
        console.log('🎯 Setting up user management events...');
        
        const addUserBtn = document.getElementById('addUserBtn');
        const userForm = document.getElementById('userForm');
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (addUserBtn) {
            addUserBtn.addEventListener('click', openAddUserModal);
            console.log('✅ Add user button listener added');
        }
        
        if (userForm) {
            userForm.addEventListener('submit', handleUserFormSubmit);
            console.log('✅ User form submit listener added');
        }
        
        if (roleFilter) {
            roleFilter.addEventListener('change', filterUsers);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', filterUsers);
        }
        
        // Setup delete confirmation
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', deleteUser);
        }
        
        // Make functions globally available
        window.loadUsers = loadUsers;
        window.filterUsers = filterUsers;
        window.editUser = editUser;
        window.confirmDeleteUser = confirmDeleteUser;
        window.deleteUser = deleteUser;
        window.openAddUserModal = openAddUserModal;
        window.closeUserModal = closeUserModal;
        window.closeDeleteModal = closeDeleteModal;
        window.hideToast = hideToast;
    }
    
    // Open add user modal
    function openAddUserModal() {
        console.log('➕ Opening add user modal');
        currentEditUser = null;
        
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const modalTitle = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        const isEditField = document.getElementById('isEdit');
        const passwordField = document.getElementById('password');
        const roleField = document.getElementById('role');
        
        if (modal && form) {
            // Reset form
            form.reset();
            
            // Set form to add mode
            modalTitle.textContent = 'Add New User';
            submitBtn.innerHTML = '<i class="icon-save"></i> Add User';
            isEditField.value = 'false';
            passwordField.required = true;
            passwordField.placeholder = 'Enter password';
            
            // Enable role field
            roleField.disabled = false;
            roleField.classList.remove('disabled');
            
            // Show modal
            modal.style.display = 'block';
            
            // Focus first field
            const firstNameField = document.getElementById('firstName');
            if (firstNameField) {
                setTimeout(() => firstNameField.focus(), 100);
            }
        }
    }
    
    // Close user modal
    function closeUserModal() {
        console.log('❌ Closing user modal');
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.style.display = 'none';
            currentEditUser = null;
        }
    }
    
  
	// Edit user function
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
	    const roleField = document.getElementById('role');
	    const statusField = document.getElementById('status');
	    
	    if (modal && form) {
	        // Populate form with user data
	        document.getElementById('userId').value = user.id || '';
	        document.getElementById('firstName').value = user.firstName || '';
	        document.getElementById('lastName').value = user.lastName || '';
	        document.getElementById('email').value = user.email || '';
	        document.getElementById('phone').value = user.phone || '';
	        document.getElementById('role').value = user.role || '';
	        document.getElementById('status').value = user.status || 'active';
	        
	        // Set form to edit mode
	        modalTitle.textContent = 'Edit User';
	        submitBtn.innerHTML = '<i class="icon-save"></i> Update User';
	        isEditField.value = 'true';
	        passwordField.required = false;
	        passwordField.placeholder = 'Leave blank to keep current password';
	        passwordField.value = '';
	        
	        // Remove any existing hidden role field
	        const existingHiddenRole = document.getElementById('hiddenRole');
	        if (existingHiddenRole) {
	            existingHiddenRole.remove();
	        }
	        
	        // Handle role field based on user type
	        if (user.role === 'CUSTOMER') {
	            // For customers, disable role field and add hidden field with current role
	            roleField.disabled = true;
	            roleField.classList.add('disabled');
	            roleField.required = false;
	            
	            // Add hidden field to preserve role value
	            const hiddenRoleField = document.createElement('input');
	            hiddenRoleField.type = 'hidden';
	            hiddenRoleField.id = 'hiddenRole';
	            hiddenRoleField.name = 'role';
	            hiddenRoleField.value = user.role;
	            form.appendChild(hiddenRoleField);
	            
	            statusField.disabled = false;
	            statusField.classList.remove('disabled');
	            showToast('Customer role cannot be changed, but other details can be updated', 'info');
	        } else {
	            // For non-customers, enable both role and status fields
	            roleField.disabled = false;
	            roleField.classList.remove('disabled');
	            roleField.required = true;
	            statusField.disabled = false;
	            statusField.classList.remove('disabled');
	        }
	        
	        // Show modal
	        modal.style.display = 'block';
	        
	        // Focus first field
	        const firstNameField = document.getElementById('firstName');
	        if (firstNameField) {
	            setTimeout(() => firstNameField.focus(), 100);
	        }
	    }
	}
    // Confirm delete user
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
        
        if (modal && userNameSpan) {
            userNameSpan.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
            modal.style.display = 'block';
        }
    }
    
    // Close delete modal
    function closeDeleteModal() {
        console.log('❌ Closing delete modal');
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'none';
            currentDeleteUser = null;
        }
    }
    
    // Delete user function
    function deleteUser() {
        console.log('🗑️ Deleting user:', currentDeleteUser);
        
        if (!currentDeleteUser) {
            showToast('No user selected for deletion', 'error');
            return;
        }
        
        const url = `${baseUrl}/admin/delete-user`;
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
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
    
    // Handle user form submission
    function handleUserFormSubmit(e) {
        e.preventDefault();
        console.log('📝 User form submitted');
        
        const formData = new FormData(e.target);
        const userData = {};
        
        for (let [key, value] of formData.entries()) {
            userData[key] = value.trim();
        }
        
        console.log('📝 User form data:', userData);
        
        const isEdit = userData.isEdit === 'true';
        
        // Basic validation
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.role) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Password validation for new users
        if (!isEdit && !userData.password) {
            showToast('Password is required for new users', 'error');
            return;
        }
        
        // Submit to server
        const url = isEdit ? `${baseUrl}/admin/update-user` : `${baseUrl}/admin/create-user`;
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
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
    
    // Filter users
    function filterUsers() {
        console.log('🔍 Filtering users...');
        loadUsers(); // Reload with current filter values
    }
    
    // Toast notification system
    function showToast(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        const toast = document.getElementById('messageToast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            // Set message and type
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            
            // Show toast
            toast.classList.add('show');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                hideToast();
            }, 5000);
        }
    }
    
    // Hide toast
    function hideToast() {
        const toast = document.getElementById('messageToast');
        if (toast) {
            toast.classList.remove('show');
        }
    }
    
    // Initialize other management functions (placeholder)
    function initializeBookManagement() {
        console.log('📚 Initializing Book Management...');
        // Add book management initialization here
    }
    
    function initializeOrderManagement() {
        console.log('📦 Initializing Order Management...');
        // Add order management initialization here
    }
    
    // Modal outside click handling
    window.addEventListener('click', (e) => {
        const userModal = document.getElementById('userModal');
        const deleteModal = document.getElementById('deleteModal');
        
        if (e.target === userModal) {
            closeUserModal();
        }
        
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
    
    // Keyboard handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUserModal();
            closeDeleteModal();
            hideToast();
        }
    });
    
    // Load default tab (User Management) on first load
    setTimeout(() => {
        const defaultLink = document.querySelector('.nav-link[data-page*="admin-Manage-Users.jsp"]');
        if (defaultLink) {
            console.log('🏠 Loading default page...');
            defaultLink.click();
        }
    }, 100);
    
    // Add CSS for loading and error states
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
    `;
    document.head.appendChild(style);
    
    console.log('🎉 Admin Dashboard setup complete!');
});
// Admin Item Management - Professional Version
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Item Management loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIT0JYsgYabTZ5gykfiSeOUxN6NDDXuuHVuA&s';
    
    // Global variables
    let currentItems = [];
    let currentCategories = [];
    let editItem = null;
    let deleteItem = null;
    let editCategory = null;
    let deleteCategory = null;
    
    // Initialize when page loads
    setTimeout(initItemManagement, 100);
    
    function initItemManagement() {
        console.log('🔧 Initializing Item Management...');
        
        const itemsTableBody = document.getElementById('itemsTableBody');
        if (itemsTableBody) {
            loadItemStats();
            loadItems();
            loadCategories();
            setupEvents();
            console.log('✅ Item Management initialized successfully');
        } else {
            console.log('⏳ Retrying initialization...');
            setTimeout(initItemManagement, 500);
        }
    }
    
    // Load item statistics
    function loadItemStats() {
        console.log('📊 Loading item statistics...');
        fetch(`${baseUrl}/admin/items/stats`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateItemStats(data.stats);
                console.log('✅ Statistics loaded successfully');
            } else {
                console.error('❌ Statistics API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Statistics fetch error:', error);
            showToast('Error loading statistics', 'error');
        });
    }
    
    function updateItemStats(stats) {
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
    
    // Load items
    function loadItems() {
        console.log('📦 Loading items...');
        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading">🔄 Loading items...</td></tr>';
        
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
	   
	   if (items.length === 0) {
	       tbody.innerHTML = '<tr><td colspan="9" class="loading">📭 No items found</td></tr>';
	       return;
	   }
	   
	   tbody.innerHTML = items.map(item => {
	       // Use uploaded image if available, otherwise use default image
	       const imageUrl = (item.imagePath && item.imagePath.trim() !== '') ? item.imagePath : defaultImage;
	       const priceDisplay = item.offerPrice ? 
	           `<div class="price-display">
	               <span class="original-price">Rs. ${item.price}</span>
	               <span class="offer-price">Rs. ${item.offerPrice}</span>
	            </div>` : 
	           `Rs. ${item.price}`;
	       
	       return `
	           <tr class="fade-in">
	               <td>${item.id}</td>
	               <td>
	                   <div class="item-info">
	                       <img src="${imageUrl}" 
	                            alt="${item.title}" 
	                            class="item-image" 
	                            onerror="this.src='${defaultImage}'">
	                       <span class="item-title" title="${item.title}">${item.title}</span>
	                   </div>
	               </td>
	               <td>${item.author}</td>
	               <td>${item.categoryName}</td>
	               <td>${priceDisplay}</td>
	               <td>
	                   <span class="stock ${getStockClass(item.stock)}">${item.stock}</span>
	               </td>
	               <td class="reference-no">${item.referenceNo || 'N/A'}</td>
	               <td>
	                   <span class="badge status-${item.status.replace('_', '-')}">${formatStatus(item.status)}</span>
	               </td>
	               <td>
	                   <button onclick="editItemFunc(${item.id})" class="action-btn edit-btn" title="Edit Item">
	                       ✏️ Edit
	                   </button>
	                   <button onclick="deleteItemFunc(${item.id})" class="action-btn delete-btn" title="Delete Item">
	                       🗑️ Delete
	                   </button>
	               </td>
	           </tr>
	       `;
	   }).join('');
	}
    
    function showItemsError(message) {
        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = `<tr><td colspan="8" class="loading" style="color: #dc3545;">❌ ${message}</td></tr>`;
        showToast(message, 'error');
    }
    
    // Helper functions
    function getStockClass(stock) {
        if (stock === 0) return 'stock-low';
        if (stock < 10) return 'stock-medium';
        return 'stock-high';
    }
    
    function formatStatus(status) {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Load categories
    function loadCategories() {
        console.log('🏷️ Loading categories...');
        fetch(`${baseUrl}/admin/items/categories`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentCategories = data.categories || [];
                updateCategoryDropdowns();
                console.log(`✅ ${currentCategories.length} categories loaded successfully`);
            } else {
                console.error('❌ Categories API error:', data.message);
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
    
    // Setup event listeners
    function setupEvents() {
        console.log('🎯 Setting up event listeners...');
        
        // Button events
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) addItemBtn.onclick = openAddItemModal;
        
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        if (manageCategoriesBtn) manageCategoriesBtn.onclick = openCategoriesListModal;
        
        // Form events
        const itemForm = document.getElementById('itemForm');
        if (itemForm) itemForm.onsubmit = handleItemFormSubmit;
        
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) categoryForm.onsubmit = handleCategoryFormSubmit;
        
        // Filter events
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        if (categoryFilter) categoryFilter.onchange = filterItems;
        if (statusFilter) statusFilter.onchange = filterItems;
        
        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) confirmDeleteBtn.onclick = performDelete;
        
        // Global functions
        window.editItemFunc = editItemFunc;
        window.deleteItemFunc = deleteItemFunc;
        window.editCategory = editCategoryFunc;
        window.deleteCategory = deleteCategoryFunc;
        window.loadItems = loadItems;
        window.filterItems = filterItems;
        window.openAddItemModal = openAddItemModal;
        window.closeItemModal = closeItemModal;
        window.openCategoriesListModal = openCategoriesListModal;
        window.closeCategoriesListModal = closeCategoriesListModal;
        window.openAddCategoryModal = openAddCategoryModal;
        window.closeCategoryModal = closeCategoryModal;
        window.closeDeleteModal = closeDeleteModal;
        window.previewImage = previewImage;
        window.removeImage = removeImage;
        window.hideToast = hideToast;
        
        console.log('✅ Event listeners setup complete');
    }
    
    // Item modal functions
    function openAddItemModal() {
        console.log('➕ Opening add item modal');
        editItem = null;
        
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        const modalTitle = document.getElementById('itemModalTitle');
        
        if (modal && form) {
            form.reset();
            document.getElementById('isEdit').value = 'false';
            modalTitle.textContent = 'Add New Item';
            
            // Hide reference number field
            hideReferenceField();
            
            modal.style.display = 'block';
            document.getElementById('title')?.focus();
        }
    }
    
    function closeItemModal() {
        const modal = document.getElementById('itemModal');
        if (modal) modal.style.display = 'none';
        editItem = null;
    }
    
    function hideReferenceField() {
        const refGroup = document.querySelector('label[for="referenceNo"]')?.parentElement;
        if (refGroup) refGroup.style.display = 'none';
    }
    
    // Edit item
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
            document.getElementById('itemId').value = editItem.id;
            document.getElementById('title').value = editItem.title;
            document.getElementById('author').value = editItem.author;
            document.getElementById('categoryId').value = editItem.categoryId;
            document.getElementById('price').value = editItem.price;
            document.getElementById('offerPrice').value = editItem.offerPrice || '';
            document.getElementById('stock').value = editItem.stock;
            document.getElementById('description').value = editItem.description;
            document.getElementById('status').value = editItem.status;
            document.getElementById('isEdit').value = 'true';
            modalTitle.textContent = 'Edit Item';
            
            // Hide reference field
            hideReferenceField();
            
            modal.style.display = 'block';
            document.getElementById('title')?.focus();
        }
    }
    
    // Delete item
    function deleteItemFunc(id) {
        console.log('🗑️ Confirming delete item:', id);
        deleteItem = currentItems.find(item => item.id === id);
        deleteCategory = null;
        
        if (!deleteItem) {
            showToast('Item not found', 'error');
            return;
        }
        
        const modal = document.getElementById('deleteModal');
        document.getElementById('deleteType').textContent = 'item';
        document.getElementById('deleteName').textContent = deleteItem.title;
        
        if (modal) modal.style.display = 'block';
    }
    
    // Handle item form submission
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
        
        // Validation
        if (!data.title || !data.author || !data.categoryId || !data.price || !data.stock) {
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
                showToast(data.message, 'success');
                closeItemModal();
                loadItems();
                loadItemStats();
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Form submission error:', error);
            showToast('Error saving item', 'error');
        });
    }
    
    // Categories management
    function openCategoriesListModal() {
        console.log('🏷️ Opening categories management modal');
        const modal = document.getElementById('categoriesListModal');
        if (modal) {
            modal.style.display = 'block';
            loadCategoriesTable();
        }
    }
    
    function closeCategoriesListModal() {
        const modal = document.getElementById('categoriesListModal');
        if (modal) modal.style.display = 'none';
    }
    
    function loadCategoriesTable() {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;
        
        if (currentCategories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No categories found</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentCategories.map(cat => `
            <tr class="fade-in">
                <td>${cat.id}</td>
                <td>${cat.name}</td>
                <td>${cat.description || 'No description'}</td>
                <td>0</td>
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
    }
    
    function openAddCategoryModal() {
        console.log('➕ Opening add category modal');
        editCategory = null;
        
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        const modalTitle = document.getElementById('categoryModalTitle');
        const statusGroup = document.getElementById('categoryStatusGroup');
        
        if (modal && form) {
            form.reset();
            document.getElementById('isCategoryEdit').value = 'false';
            modalTitle.textContent = 'Add New Category';
            if (statusGroup) statusGroup.style.display = 'none';
            
            modal.style.display = 'block';
            document.getElementById('categoryName')?.focus();
        }
    }
    
    function closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) modal.style.display = 'none';
        editCategory = null;
    }
    
    function editCategoryFunc(id) {
        console.log('✏️ Editing category:', id);
        editCategory = currentCategories.find(cat => cat.id === id);
        
        if (!editCategory) {
            showToast('Category not found', 'error');
            return;
        }
        
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('categoryModalTitle');
        const statusGroup = document.getElementById('categoryStatusGroup');
        
        if (modal) {
            document.getElementById('categoryIdEdit').value = editCategory.id;
            document.getElementById('categoryName').value = editCategory.name;
            document.getElementById('categoryDescription').value = editCategory.description || '';
            document.getElementById('isCategoryEdit').value = 'true';
            modalTitle.textContent = 'Edit Category';
            if (statusGroup) statusGroup.style.display = 'block';
            
            modal.style.display = 'block';
            document.getElementById('categoryName')?.focus();
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
        document.getElementById('deleteType').textContent = 'category';
        document.getElementById('deleteName').textContent = deleteCategory.name;
        
        if (modal) modal.style.display = 'block';
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
        
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                closeCategoryModal();
                loadCategories();
                loadItemStats();
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Category form submission error:', error);
            showToast('Error saving category', 'error');
        });
    }
    
    // Delete confirmation
    function performDelete() {
        if (deleteItem) {
            deleteItemConfirmed();
        } else if (deleteCategory) {
            deleteCategoryConfirmed();
        }
    }
    
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
    
    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) modal.style.display = 'none';
        deleteItem = null;
        deleteCategory = null;
    }
    
    // Filter items
    function filterItems() {
        console.log('🔍 Applying filters...');
        loadItems();
    }
    
    // Utility functions
    function previewImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                const img = document.getElementById('previewImg');
                
                if (img && preview) {
                    img.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    function removeImage() {
        const upload = document.getElementById('imageUpload');
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        
        if (upload) upload.value = '';
        if (preview) preview.style.display = 'none';
        if (img) img.src = '';
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('messageToast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
        
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }
    
    function hideToast() {
        const toast = document.getElementById('messageToast');
        if (toast) toast.classList.remove('show');
    }
    
    // Modal event handling
    window.onclick = function(e) {
        const modals = ['itemModal', 'categoryModal', 'categoriesListModal', 'deleteModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
    
    // Keyboard event handling
    document.onkeydown = function(e) {
        if (e.key === 'Escape') {
            const modals = ['itemModal', 'categoryModal', 'categoriesListModal', 'deleteModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) modal.style.display = 'none';
            });
            hideToast();
        }
    };
    
    console.log('🎉 Item Management initialization complete!');
});
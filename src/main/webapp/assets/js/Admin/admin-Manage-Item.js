// Dashboard Content-Area Compatible Admin Item Management JavaScript
let currentItems = [];
let currentCategories = [];
let editItem = null;
let deleteItem = null;
let editCategory = null;
let deleteCategory = null;
let currentImageData = null;
let itemManagementInitialized = false;

// Get context path and base URL
const contextPath = window.location.pathname.split('/')[1];
const baseUrl = '/' + contextPath;

// Default image URL
const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIT0JYsgYabTZ5gykfiSeOUxN6NDDXuuHVuA&s';

console.log('📦 Admin Item Management script loaded');

/**
 * Reset initialization flag when navigating away
 */
function resetItemManagementInitialization() {
    itemManagementInitialized = false;
    currentItems = [];
    currentCategories = [];
    editItem = null;
    deleteItem = null;
    editCategory = null;
    deleteCategory = null;
    currentImageData = null;
    console.log('🔄 Item management initialization reset');
}

/**
 * Initialize item management functionality
 */
function initializeItemManagement() {
    console.log('🔧 Initializing Item Management...');
    
    // Force reset first
    itemManagementInitialized = false;
    currentItems = [];
    currentCategories = [];
    editItem = null;
    deleteItem = null;
    editCategory = null;
    deleteCategory = null;
    currentImageData = null;
    
    // Check if required elements exist
    const itemsTable = document.getElementById('itemsTableBody');
    const addItemBtn = document.getElementById('addItemBtn');
    
    if (!itemsTable || !addItemBtn) {
        console.log('❌ Required elements not found, retrying in 500ms...');
        setTimeout(() => {
            initializeItemManagement();
        }, 500);
        return;
    }
    
    console.log('✅ All required elements found, proceeding with initialization');
    
    // Mark as initialized
    itemManagementInitialized = true;
    
    // Load initial data
    loadItemStats();
    loadItems();
    loadCategories();
    setupItemEvents();
    
    // Make functions globally available
    makeItemFunctionsGlobal();
    
    console.log('✅ Item management initialized successfully');
}

/**
 * Make functions globally available
 */
function makeItemFunctionsGlobal() {
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
}

/**
 * Setup event listeners
 */
function setupItemEvents() {
    console.log('🎯 Setting up item management event listeners...');
    
    // Button events - Remove existing listeners first
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.replaceWith(addItemBtn.cloneNode(true));
        const newAddItemBtn = document.getElementById('addItemBtn');
        newAddItemBtn.addEventListener('click', openAddItemModal);
        console.log('✅ Add item button listener added');
    }
    
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    if (manageCategoriesBtn) {
        manageCategoriesBtn.replaceWith(manageCategoriesBtn.cloneNode(true));
        const newManageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        newManageCategoriesBtn.addEventListener('click', openCategoriesListModal);
        console.log('✅ Manage categories button listener added');
    }
    
    // Form events
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.replaceWith(itemForm.cloneNode(true));
        const newItemForm = document.getElementById('itemForm');
        newItemForm.addEventListener('submit', handleItemFormSubmit);
        console.log('✅ Item form listener added');
    }
    
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.replaceWith(categoryForm.cloneNode(true));
        const newCategoryForm = document.getElementById('categoryForm');
        newCategoryForm.addEventListener('submit', handleCategoryFormSubmit);
        console.log('✅ Category form listener added');
    }
    
    // Filter events
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (categoryFilter) {
        categoryFilter.replaceWith(categoryFilter.cloneNode(true));
        const newCategoryFilter = document.getElementById('categoryFilter');
        newCategoryFilter.addEventListener('change', filterItems);
        console.log('✅ Category filter listener added');
    }
    
    if (statusFilter) {
        statusFilter.replaceWith(statusFilter.cloneNode(true));
        const newStatusFilter = document.getElementById('statusFilter');
        newStatusFilter.addEventListener('change', filterItems);
        console.log('✅ Status filter listener added');
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.replaceWith(confirmDeleteBtn.cloneNode(true));
        const newConfirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        newConfirmDeleteBtn.addEventListener('click', performDelete);
        console.log('✅ Delete confirmation button listener added');
    }
    
    console.log('✅ Item management event listeners setup complete');
}

/**
 * Load item statistics
 */
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
                updateItemStats(data.stats);
                console.log('✅ Statistics loaded successfully');
            } else {
                console.error('❌ Statistics API error:', data.message);
                showToast('Statistics error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Statistics fetch error:', error);
            showToast('Error loading statistics', 'error');
        });
}

/**
 * Update item statistics UI
 */
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
    
    console.log('✅ Item stats UI updated successfully');
}

/**
 * Load items
 */
function loadItems() {
    console.log('📦 Loading items...');
    const tbody = document.getElementById('itemsTableBody');
    
    if (!tbody) {
        console.error('❌ Items table body not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="9" class="loading">🔄 Loading items...</td></tr>';
    
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

/**
 * Display items in table
 */
function displayItems(items) {
    const tbody = document.getElementById('itemsTableBody');
    
    if (!tbody) {
        console.error('❌ Items table body not found');
        return;
    }
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">📭 No items found</td></tr>';
        return;
    }
    
    try {
        tbody.innerHTML = items.map(item => {
            // Use uploaded image if available, check if it's base64 or URL
            let imageUrl = defaultImage;
            if (item.imagePath && item.imagePath.trim() !== '') {
                // Check if it's base64 data
                if (item.imagePath.startsWith('data:image/')) {
                    imageUrl = item.imagePath;
                } else {
                    imageUrl = item.imagePath;
                }
            }
            
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
        
        console.log('✅ Items table updated successfully');
    } catch (error) {
        console.error('❌ Error displaying items:', error);
        showItemsError('Error displaying items: ' + error.message);
    }
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
 * Helper functions
 */
function getStockClass(stock) {
    if (stock === 0) return 'stock-low';
    if (stock < 10) return 'stock-medium';
    return 'stock-high';
}

function formatStatus(status) {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Load categories
 */
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
 * Item modal functions
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
        
        // Hide reference number field
        hideReferenceField();
        
        // Clear image preview
        const preview = document.getElementById('imagePreview');
        if (preview) preview.style.display = 'none';
        
        modal.style.display = 'block';
        
        const titleField = document.getElementById('title');
        if (titleField) titleField.focus();
    }
}

function closeItemModal() {
    const modal = document.getElementById('itemModal');
    if (modal) modal.style.display = 'none';
    editItem = null;
    currentImageData = null;
}

function hideReferenceField() {
    const refGroup = document.querySelector('label[for="referenceNo"]')?.parentElement;
    if (refGroup) refGroup.style.display = 'none';
}

/**
 * Edit item
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
        
        // Hide reference field
        hideReferenceField();
        
        modal.style.display = 'block';
        
        const titleField = document.getElementById('title');
        if (titleField) titleField.focus();
    }
}

/**
 * Delete item
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
    
    if (modal) modal.style.display = 'block';
}

/**
 * Handle item form submission
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
    
    // Add image data to form data
    data.imagePath = currentImageData || '';
    
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

/**
 * Categories management
 */
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
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No categories found</td></tr>';
        return;
    }
    
    tbody.innerHTML = currentCategories.map(cat => `
        <tr class="fade-in">
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
}

function openAddCategoryModal() {
    console.log('➕ Opening add category modal');
    editCategory = null;
    
    // Close the categories list modal first
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
        
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
            modal.style.display = 'block';
            const nameField = document.getElementById('categoryName');
            if (nameField) nameField.focus();
        }, 100);
    }
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) modal.style.display = 'none';
    editCategory = null;
    
    // Reopen categories list modal after closing add/edit modal
    setTimeout(() => {
        openCategoriesListModal();
    }, 100);
}

function editCategoryFunc(id) {
    console.log('✏️ Editing category:', id);
    editCategory = currentCategories.find(cat => cat.id === id);
    
    if (!editCategory) {
        showToast('Category not found', 'error');
        return;
    }
    
    // Close the categories list modal first
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
        
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
            modal.style.display = 'block';
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
    
    if (deleteType) deleteType.textContent = 'category';
    if (deleteName) deleteName.textContent = deleteCategory.name;
    
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
                
                // Close category modal
                const modal = document.getElementById('categoryModal');
                if (modal) modal.style.display = 'none';
                editCategory = null;
                
                // Reload categories and stats
                loadCategories();
                loadItemStats();
                
                // Reopen categories list modal after successful save
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
 * Delete confirmation
 */
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

/**
 * Filter items
 */
function filterItems() {
    console.log('🔍 Applying filters...');
    loadItems();
}

/**
 * Image handling functions
 */
function previewImage(input) {
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
                // Store base64 data
                currentImageData = e.target.result;
                
                // Show preview
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
    const upload = document.getElementById('imageUpload');
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');
    
    if (upload) upload.value = '';
    if (preview) preview.style.display = 'none';
    if (img) img.src = '';
    
    // Clear image data
    currentImageData = null;
    
    console.log('🗑️ Image removed');
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
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            hideToast();
        }, 4000);
    }
}

function hideToast() {
    const toast = document.getElementById('messageToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Export functions for global access
window.itemManager = {
    initializeItemManagement,
    resetItemManagementInitialization,
    loadItems,
    loadCategories,
    editItemFunc,
    deleteItemFunc,
    editCategoryFunc,
    deleteCategoryFunc,
    openAddItemModal,
    closeItemModal,
    openCategoriesListModal,
    closeCategoriesListModal,
    openAddCategoryModal,
    closeCategoryModal,
    closeDeleteModal,
    previewImage,
    removeImage,
    hideToast,
    filterItems
};

// Also make direct functions available
window.initializeItemManagement = initializeItemManagement;
window.resetItemManagementInitialization = resetItemManagementInitialization;

console.log('🎉 Item Management script initialization complete!');
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<div class="items-container">
    <div class="page-header">
        <h2>📦 Item Management</h2>
        <div class="header-actions">
            <button class="btn btn-secondary" id="manageCategoriesBtn">
                <i class="icon-category"></i> Manage Categories
            </button>
            <button class="btn btn-primary" id="addItemBtn">
                <i class="icon-plus"></i> Add New Item
            </button>
        </div>
    </div>
    
    <!-- Item Statistics -->
    <div class="stats-section">
        <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
                <h3>Total Items</h3>
                <span id="totalItems" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
                <h3>Active Items</h3>
                <span id="activeItems" class="stat-number">0</span>
            </div>
        </div>
        <!--   <div class="stat-card">
            <div class="stat-icon">❌</div>
            <div class="stat-info">
                <h3>Inactive Items</h3>
                <span id="inactiveItems" class="stat-number">0</span>
            </div>
        </div> -->
        <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
                <h3>Out of Stock</h3>
                <span id="outOfStockItems" class="stat-number">0</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🏷️</div>
            <div class="stat-info">
                <h3>Categories</h3>
                <span id="totalCategories" class="stat-number">0</span>
            </div>
        </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
        <div class="filter-group">
            <label for="categoryFilter">Filter by Category:</label>
            <select id="categoryFilter" onchange="filterItems()">
                <option value="">All Categories</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="statusFilter">Filter by Status:</label>
            <select id="statusFilter" onchange="filterItems()">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
            </select>
        </div>
        
        <button class="btn btn-secondary" onclick="loadItems()">
            <i class="icon-refresh"></i> Refresh
        </button>
    </div>

    <!-- Items Table -->
    <div class="table-container">
        <table id="itemsTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="itemsTableBody">
                <tr>
                    <td colspan="9" class="loading">Loading items...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Item Modal -->
<div id="itemModal" class="modal">
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h3 id="itemModalTitle">Add New Item</h3>
            <button class="modal-close" onclick="closeItemModal()">×</button>
        </div>
        
        <div class="modal-body">
            <form id="itemForm" enctype="multipart/form-data">
                <input type="hidden" id="itemId" name="itemId">
                <input type="hidden" id="isEdit" name="isEdit" value="false">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="title">Title <span class="required">*</span></label>
                        <input type="text" id="title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="author">Author <span class="required">*</span></label>
                        <input type="text" id="author" name="author" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="categoryId">Category <span class="required">*</span></label>
                        <div class="category-input-group">
                            <select id="categoryId" name="categoryId" required>
                                <option value="">Select Category</option>
                            </select>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="openAddCategoryModal()">
                                <i class="icon-plus"></i> Add New
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="referenceNo">Reference No</label>
                        <input type="text" id="referenceNo" name="referenceNo" readonly>
                        <small class="form-help">Auto-generated</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price (Rs.) <span class="required">*</span></label>
                        <input type="number" id="price" name="price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="offerPrice">Offer Price (Rs.)</label>
                        <input type="number" id="offerPrice" name="offerPrice" step="0.01" min="0">
                        <small class="form-help">Leave empty if no offer</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="stock">Stock Quantity <span class="required">*</span></label>
                        <input type="number" id="stock" name="stock" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="status">Status</label>
                        <select id="status" name="status">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group full-width">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" rows="3"></textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group full-width">
                        <label for="imageUpload">Product Image</label>
                        <div class="file-upload-container">
                            <input type="file" id="imageUpload" name="imageUpload" accept="image/*" onchange="previewImage(this)">
                            <div class="file-upload-text">
                                <i class="icon-upload"></i>
                                <span>Click to upload image or drag and drop</span>
                            </div>
                        </div>
                        <div id="imagePreview" class="image-preview" style="display: none;">
                            <img id="previewImg" src="" alt="Preview">
                            <button type="button" class="remove-image" onclick="removeImage()">×</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeItemModal()">Cancel</button>
            <button type="submit" form="itemForm" class="btn btn-primary" id="submitItemBtn">
                <i class="icon-save"></i> Save Item
            </button>
        </div>
    </div>
</div>

<!-- Category Modal -->
<div id="categoryModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="categoryModalTitle">Add New Category</h3>
            <button class="modal-close" onclick="closeCategoryModal()">×</button>
        </div>
        
        <div class="modal-body">
            <form id="categoryForm">
                <input type="hidden" id="categoryIdEdit" name="categoryId">
                <input type="hidden" id="isCategoryEdit" name="isCategoryEdit" value="false">
                
                <div class="form-group">
                    <label for="categoryName">Category Name <span class="required">*</span></label>
                    <input type="text" id="categoryName" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="categoryDescription">Description</label>
                    <textarea id="categoryDescription" name="description" rows="3"></textarea>
                </div>
                
                <div class="form-group" id="categoryStatusGroup" style="display: none;">
                    <label for="categoryStatus">Status</label>
                    <select id="categoryStatus" name="status">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeCategoryModal()">Cancel</button>
            <button type="submit" form="categoryForm" class="btn btn-primary" id="submitCategoryBtn">
                <i class="icon-save"></i> Save Category
            </button>
        </div>
    </div>
</div>

<!-- Categories Management Modal -->
<div id="categoriesListModal" class="modal">
    <div class="modal-content modal-lg">
        <div class="modal-header">
            <h3>Manage Categories</h3>
            <button class="modal-close" onclick="closeCategoriesListModal()">×</button>
        </div>
        
        <div class="modal-body">
            <div class="categories-header">
                <button class="btn btn-primary btn-sm" onclick="openAddCategoryModal()">
                    <i class="icon-plus"></i> Add New Category
                </button>
            </div>
            
            <div class="categories-table-container">
                <table id="categoriesTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody">
                        <tr>
                            <td colspan="6" class="loading">Loading categories...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="modal">
    <div class="modal-content modal-sm">
        <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="modal-close" onclick="closeDeleteModal()">×</button>
        </div>
        
        <div class="modal-body">
            <p>Are you sure you want to delete this <span id="deleteType">item</span>?</p>
            <p><strong id="deleteName"></strong></p>
            <p class="text-warning">This action cannot be undone.</p>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                <i class="icon-trash"></i> Delete
            </button>
        </div>
    </div>
</div>

<!-- Message Toast -->
<div id="messageToast" class="toast">
    <div class="toast-content">
        <span id="toastMessage"></span>
        <button class="toast-close" onclick="hideToast()">×</button>
    </div>
</div>

<!-- Include CSS and JS -->
<link rel="stylesheet" href="assets/css/Admin/admin-Manage-Item.css">
<script src="assets/js/Admin/admin-Manage-Item.js"></script>
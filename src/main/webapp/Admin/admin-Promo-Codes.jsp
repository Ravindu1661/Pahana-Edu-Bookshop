<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!-- Promo Code Management Section -->
<div class="content-header">
    <div class="header-left">
        <h2>🎫 Promo Code Management</h2>
        <p>Create and manage promotional discount codes</p>
    </div>
    <div class="header-right">
        <button id="addPromoCodeBtn" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add New Promo Code
        </button>
    </div>
</div>

<!-- Statistics Cards -->
<div class="stats-container">
    <div class="stat-card">
        <div class="stat-icon">
            <i class="fas fa-ticket-alt"></i>
        </div>
        <div class="stat-info">
            <h3 id="totalCodes">0</h3>
            <p>Total Codes</p>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon active">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
            <h3 id="activeCodes">0</h3>
            <p>Active Codes</p>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon inactive">
            <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-info">
            <h3 id="inactiveCodes">0</h3>
            <p>Inactive Codes</p>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon expired">
            <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
            <h3 id="expiredCodes">0</h3>
            <p>Expired Codes</p>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon usage">
            <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-info">
            <h3 id="totalUsage">0</h3>
            <p>Total Usage</p>
        </div>
    </div>
</div>

<!-- Filters -->
<div class="filters-section">
    <div class="filter-group">
        <label for="statusFilter">Filter by Status:</label>
        <select id="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
    </div>
</div>

<!-- Promo Codes Table -->
<div class="table-container">
    <div class="table-header">
        <h3>📋 Promo Codes List</h3>
        <div class="table-actions">
            <button onclick="loadPromoCodes()" class="btn btn-secondary">
                <i class="fas fa-sync-alt"></i> Refresh
            </button>
        </div>
    </div>
    
    <div class="table-wrapper">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Min. Order</th>
                    <th>Usage</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="promoCodesTableBody">
                <tr>
                    <td colspan="9" class="loading">🔄 Loading promo codes...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Add/Edit Promo Code Modal -->
<div id="promoCodeModal" class="modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="promoCodeModalTitle">Add New Promo Code</h3>
            <button type="button" class="close" onclick="closePromoCodeModal()">&times;</button>
        </div>
        <form id="promoCodeForm">
            <div class="modal-body">
                <input type="hidden" id="promoCodeId" name="promoCodeId">
                <input type="hidden" id="isPromoCodeEdit" name="isPromoCodeEdit" value="false">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="code">Promo Code <span style="color: red;">*</span></label>
                        <input type="text" id="code" name="code" required 
                               placeholder="e.g., SAVE20, WELCOME10" 
                               style="text-transform: uppercase;">
                        <small>Code will be automatically converted to uppercase</small>
                    </div>
                    <div class="form-group">
                        <label for="status">Status</label>
                        <select id="status" name="status">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" 
                              placeholder="Brief description of the promo code..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="discountType">Discount Type <span style="color: red;">*</span></label>
                        <select id="discountType" name="discountType" required>
                            <option value="">Select Discount Type</option>
                            <option value="percentage">Percentage (%)</option>
                            <option value="amount">Fixed Amount (Rs.)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="discountValue" id="discountValueLabel">Discount Value <span style="color: red;">*</span></label>
                        <input type="number" id="discountValue" name="discountValue" required 
                               min="0" step="0.01" placeholder="Enter discount value">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="minimumOrderAmount">Minimum Order Amount (Rs.)</label>
                        <input type="number" id="minimumOrderAmount" name="minimumOrderAmount" 
                               min="0" step="0.01" placeholder="0 (No minimum)">
                    </div>
                    <div class="form-group">
                        <label for="usageLimit">Usage Limit</label>
                        <input type="number" id="usageLimit" name="usageLimit" 
                               min="1" placeholder="Leave empty for unlimited">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="startDate">Start Date <span style="color: red;">*</span></label>
                        <input type="date" id="startDate" name="startDate" required>
                    </div>
                    <div class="form-group">
                        <label for="endDate">End Date <span style="color: red;">*</span></label>
                        <input type="date" id="endDate" name="endDate" required>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closePromoCodeModal()">Cancel</button>
                <button type="submit" id="promoCodeSubmitBtn" class="btn btn-primary">
                    <i class="fas fa-save"></i> Create Promo Code
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="modal" style="display: none;">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h3>🗑️ Confirm Delete</h3>
            <button type="button" class="close" onclick="closeDeleteModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p>Are you sure you want to delete this <span id="deleteType">promo code</span>?</p>
            <p><strong>"<span id="deleteName"></span>"</strong></p>
            <p style="color: #dc3545; font-size: 0.9rem;">⚠️ This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
            <button type="button" id="confirmDeleteBtn" class="btn btn-danger">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    </div>
</div>

<style>
/* Promo Code Management Specific Styles */
.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-left h2 {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 1.5rem;
}

.header-left p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 15px;
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    background: #007bff;
}

.stat-icon.active {
    background: #28a745;
}

.stat-icon.inactive {
    background: #6c757d;
}

.stat-icon.expired {
    background: #dc3545;
}

.stat-icon.usage {
    background: #17a2b8;
}

.stat-info h3 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
}

.stat-info p {
    margin: 5px 0 0 0;
    color: #666;
    font-size: 0.9rem;
}

.filters-section {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filter-group label {
    font-weight: 600;
    color: #333;
    white-space: nowrap;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 150px;
}

.table-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
}

.table-header {
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
}

.table-header h3 {
    margin: 0;
    color: #333;
}

.table-actions {
    display: flex;
    gap: 10px;
}

.table-wrapper {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.data-table th {
    background: #f8f9fa;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #dee2e6;
    white-space: nowrap;
}

.data-table td {
    padding: 12px;
    border-bottom: 1px solid #dee2e6;
    vertical-align: middle;
}

.data-table tbody tr:hover {
    background: #f8f9fa;
}

.promo-code {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    background: #e9ecef;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #495057;
}

.description-cell {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
}

.status-active {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-inactive {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.status-expired {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.status-upcoming {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.action-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    margin: 2px;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s ease;
}

.action-btn.edit-btn {
    background-color: #ffc107;
    color: #212529;
}

.action-btn.edit-btn:hover {
    background-color: #e0a800;
}

.action-btn.delete-btn {
    background-color: #dc3545;
    color: white;
}

.action-btn.delete-btn:hover {
    background-color: #c82333;
}

.action-btn.view-btn {
    background-color: #17a2b8;
    color: white;
}

.action-btn.view-btn:hover {
    background-color: #138496;
}

/* Modal Styles */



.modal-header {
    padding: 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: #f8f9fa;
    border-radius: 0 0 8px 8px;
}

.close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.close:hover {
    background: #e9ecef;
    color: #000;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.form-group small {
    color: #6c757d;
    font-size: 0.875rem;
    display: block;
    margin-top: 5px;
}

.form-row {
    display: flex;
    gap: 15px;
}

.form-row .form-group {
    flex: 1;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-align: center;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background-color: #545b62;
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background-color: #c82333;
}

.loading {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
    .stats-container {
        grid-template-columns: 1fr;
    }
    
    .content-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
    
    .filters-section {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .table-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
    
    .form-row {
        flex-direction: column;
    }
    
    .modal-content {
        margin: 10px;
        width: calc(100% - 20px);
    }
    
    .action-btn {
        font-size: 0.7rem;
        padding: 3px 6px;
    }
}

/* Animation for smooth transitions */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeIn 0.3s ease-in;
}

/* Code input auto-uppercase */
#code {
    text-transform: uppercase;
}

/* Special styling for required fields */
.form-group label span[style*="color: red"] {
    color: #dc3545 !important;
}
</style>

<script>
// Auto-uppercase promo code input
document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('code');
    if (codeInput) {
        codeInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
});
</script>
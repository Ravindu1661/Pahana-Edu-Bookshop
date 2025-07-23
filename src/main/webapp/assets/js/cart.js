// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Cart page loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // Global variables
    let cartItems = [];
    let subtotal = 0;
    let shipping = 250;
    let discount = 0;
    let total = 0;
    let promoApplied = false;
    let currentPromoCode = '';
    
    // Initialize
    initCartPage();
    
    function initCartPage() {
        console.log('🔧 Initializing cart page...');
        loadCartItems();
        loadCartCount();
        setupEventListeners();
    }
    
    // Load cart items
    function loadCartItems() {
        console.log('📦 Loading cart items...');
        showLoading();
        
        fetch(`${baseUrl}/customer/cart/items`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                cartItems = data.items || [];
                displayCartItems();
                calculateTotals();
                console.log(`✅ ${cartItems.length} cart items loaded`);
            } else {
                console.error('❌ Cart items API error:', data.message);
                showEmptyCart();
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Cart items fetch error:', error);
            showEmptyCart();
        });
    }
    
    // Display cart items
    function displayCartItems() {
        const container = document.getElementById('cartItemsContainer');
        const emptyState = document.getElementById('emptyCartState');
        const cartSection = document.querySelector('.cart-section');
        
        if (!container) return;
        
        if (cartItems.length === 0) {
            showEmptyCart();
            return;
        }
        
        // Show cart content
        if (emptyState) emptyState.style.display = 'none';
        if (cartSection) cartSection.style.display = 'block';
        
        container.innerHTML = cartItems.map(item => createCartItemHTML(item)).join('');
    }
    
    // Create cart item HTML
    function createCartItemHTML(item) {
        const imageUrl = getProductImage(item.imagePath);
        const itemTotal = (item.price * item.quantity).toFixed(2);
        
        return `
            <div class="cart-item-row">
                <div class="cart-item-image">
                    <img src="${imageUrl}" alt="${item.title}" onerror="this.src='${defaultImage}'">
                </div>
                
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-author">by ${item.author}</p>
                    <div class="cart-item-price">
                        <span class="current-price">Rs. ${item.price}</span>
                        ${item.originalPrice ? `<span class="original-price">Rs. ${item.originalPrice}</span>` : ''}
                    </div>
                    <p class="cart-item-stock">
                        <i class="fas fa-check-circle"></i> In Stock (${item.stock} available)
                    </p>
                </div>
                
                <div class="cart-item-quantity">
                    <label>Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" value="${item.quantity}" min="1" max="${item.stock}"
                               onchange="updateQuantity(${item.id}, this.value)">
                        <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, ${item.quantity + 1})"
                                ${item.quantity >= item.stock ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="cart-item-total">
                    <span class="item-total">Rs. ${itemTotal}</span>
                </div>
                
                <div class="cart-item-actions">
                    <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // Get product image URL
    function getProductImage(imagePath) {
        if (!imagePath || imagePath.trim() === '') {
            return defaultImage;
        }
        
        if (imagePath.startsWith('data:image/')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return baseUrl + '/' + imagePath;
    }
    
    // Show empty cart state
    function showEmptyCart() {
        const emptyState = document.getElementById('emptyCartState');
        const cartSection = document.querySelector('.cart-section');
        
        if (emptyState) emptyState.style.display = 'block';
        if (cartSection) cartSection.style.display = 'none';
    }
    
    // Calculate totals
    function calculateTotals() {
        subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Free shipping for orders over Rs. 3000
        shipping = subtotal >= 3000 ? 0 : 250;
        
        // Apply discount if promo is active
        if (promoApplied && discount > 0) {
            // Discount is already calculated, just use it
        } else {
            discount = 0;
        }
        
        total = subtotal + shipping - discount;
        
        updateTotalsDisplay();
    }
    
    // Update totals display
    function updateTotalsDisplay() {
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const discountEl = document.getElementById('discount');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toFixed(2)}`;
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`;
        }
        if (discountEl) discountEl.textContent = `Rs. ${discount.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `Rs. ${total.toFixed(2)}`;
    }
    
    // Update quantity
    function updateQuantity(cartItemId, newQuantity) {
        const quantity = parseInt(newQuantity);
        
        if (quantity < 1) {
            removeFromCart(cartItemId);
            return;
        }
        
        // Find the item to check stock
        const item = cartItems.find(item => item.id === cartItemId);
        if (item && quantity > item.stock) {
            showToast(`❌ Only ${item.stock} items available in stock`, 'error');
            return;
        }
        
        showLoading();
        
        fetch(`${baseUrl}/customer/cart/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItemId: cartItemId,
                quantity: quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                // Update local data
                const itemIndex = cartItems.findIndex(item => item.id === cartItemId);
                if (itemIndex !== -1) {
                    cartItems[itemIndex].quantity = quantity;
                }
                
                displayCartItems();
                calculateTotals();
                loadCartCount();
                showToast('✅ Quantity updated', 'success');
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Update quantity error:', error);
            showToast('❌ Error updating quantity', 'error');
        });
    }
    
    // Remove from cart
    function removeFromCart(cartItemId) {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }
        
        showLoading();
        
        fetch(`${baseUrl}/customer/cart/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItemId: cartItemId
            })
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                // Remove from local data
                cartItems = cartItems.filter(item => item.id !== cartItemId);
                
                // Reset promo if cart becomes empty
                if (cartItems.length === 0) {
                    promoApplied = false;
                    currentPromoCode = '';
                    discount = 0;
                }
                
                displayCartItems();
                calculateTotals();
                loadCartCount();
                showToast('✅ Item removed from cart', 'success');
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Remove from cart error:', error);
            showToast('❌ Error removing item', 'error');
        });
    }
    
    // Clear entire cart
    function clearCart() {
        if (cartItems.length === 0) {
            showToast('❌ Your cart is already empty', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to clear your entire cart?')) {
            return;
        }
        
        showLoading();
        
        fetch(`${baseUrl}/customer/cart/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                cartItems = [];
                promoApplied = false;
                currentPromoCode = '';
                discount = 0;
                displayCartItems();
                calculateTotals();
                loadCartCount();
                showToast('✅ Cart cleared', 'success');
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Clear cart error:', error);
            showToast('❌ Error clearing cart', 'error');
        });
    }
    
    // Apply promo code
    function applyPromoCode() {
        const promoInput = document.getElementById('promoInput');
        const promoCode = promoInput?.value.trim().toUpperCase();
        
        if (!promoCode) {
            showToast('❌ Please enter a promo code', 'error');
            return;
        }
        
        if (promoApplied && currentPromoCode === promoCode) {
            showToast('❌ This promo code is already applied', 'error');
            return;
        }
        
        showLoading();
        
        // Call the server-side promo validation
        fetch(`${baseUrl}/customer/cart/apply-promo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                promoCode: promoCode
            })
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                // Use the discountAmount from server response
                discount = parseFloat(data.discountAmount) || 0;
                promoApplied = true;
                currentPromoCode = data.promoCode;
                
                // Store additional promo info
                const promoInfo = {
                    code: data.promoCode,
                    type: data.discountType,
                    value: data.discountValue,
                    description: data.description
                };
                
                calculateTotals();
                
                // Show appropriate success message based on discount type
                let successMessage = `✅ Promo code applied! `;
                if (data.discountType === 'percentage') {
                    successMessage += `${data.discountValue}% discount - You saved Rs. ${discount.toFixed(2)}`;
                } else {
                    successMessage += `You saved Rs. ${discount.toFixed(2)}`;
                }
                
                if (data.description) {
                    successMessage += ` (${data.description})`;
                }
                
                showToast(successMessage, 'success');
                if (promoInput) promoInput.value = '';
                
                // Update promo display if exists
                updatePromoDisplay(promoInfo);
                
            } else {
                showToast('❌ ' + (data.message || 'Invalid promo code'), 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Apply promo error:', error);
            showToast('❌ Error applying promo code. Please try again.', 'error');
        });
    }
    
    // Update promo display (optional visual feedback)
    function updatePromoDisplay(promoInfo) {
        // If you have a promo display element, update it here
        const promoDisplay = document.getElementById('appliedPromoDisplay');
        if (promoDisplay) {
            promoDisplay.innerHTML = `
                <div class="applied-promo">
                    <i class="fas fa-tag"></i>
                    <span>${promoInfo.code} applied</span>
                    <button onclick="removePromoCode()" class="remove-promo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            promoDisplay.style.display = 'block';
        }
    }
    
    // Remove promo code
    function removePromoCode() {
        promoApplied = false;
        currentPromoCode = '';
        discount = 0;
        calculateTotals();
        
        const promoInput = document.getElementById('promoInput');
        if (promoInput) promoInput.value = '';
        
        const promoDisplay = document.getElementById('appliedPromoDisplay');
        if (promoDisplay) promoDisplay.style.display = 'none';
        
        showToast('✅ Promo code removed', 'info');
    }
    
    // Proceed to checkout
    function proceedToCheckout() {
        if (cartItems.length === 0) {
            showToast('❌ Your cart is empty', 'error');
            return;
        }
        
        // Store promo code data in session storage for checkout page
        if (promoApplied && currentPromoCode && discount > 0) {
            sessionStorage.setItem('appliedPromoCode', currentPromoCode);
            sessionStorage.setItem('promoDiscountAmount', discount.toString());
            sessionStorage.setItem('promoDiscountType', 'fixed'); // You can enhance this based on actual promo type
            console.log('📢 Storing promo for checkout:', currentPromoCode, 'Discount:', discount);
        } else {
            // Clear any previous promo data if no promo is applied
            sessionStorage.removeItem('appliedPromoCode');
            sessionStorage.removeItem('promoDiscountAmount');
            sessionStorage.removeItem('promoDiscountType');
        }
        
        // Store checkout data
        const checkoutData = {
            items: cartItems,
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: total,
            promoCode: currentPromoCode
        };
        
        // Store complete checkout data
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        showToast('🚀 Redirecting to checkout...', 'info');
        
        setTimeout(() => {
            window.location.href = 'checkout.jsp';
        }, 1000);
    }
    
    // Load cart count
    function loadCartCount() {
        fetch(`${baseUrl}/customer/cart/count`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartCountDisplay(data.count || 0);
            }
        })
        .catch(error => {
            console.error('❌ Cart count error:', error);
            // Fallback to local count
            updateCartCountDisplay(cartItems.length);
        });
    }
    
    function updateCartCountDisplay(count) {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        // Promo code enter key
        const promoInput = document.getElementById('promoInput');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyPromoCode();
                }
            });
        }
    }
    
    function performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (query) {
            window.location.href = `products.jsp?search=${encodeURIComponent(query)}`;
        }
    }
    
    // Utility functions
    function showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }
    
    function hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
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
        const toast = document.getElementById('toast');
        if (toast) toast.classList.remove('show');
    }
    
    // Global functions
    window.updateQuantity = updateQuantity;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    window.applyPromoCode = applyPromoCode;
    window.removePromoCode = removePromoCode;
    window.proceedToCheckout = proceedToCheckout;
    window.hideToast = hideToast;
    
    console.log('✅ Cart page initialized successfully');
});
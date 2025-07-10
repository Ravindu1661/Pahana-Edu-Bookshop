// Simple Products JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Products page loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Get all product cards
    let allProducts = Array.from(document.querySelectorAll('.product-card'));
    
    // Initialize
    loadCartCount();
    
    // Search products
    window.searchProducts = function() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        filterAndDisplay();
    };
    
    // Filter products by category
    window.filterProducts = function() {
        filterAndDisplay();
    };
    
    // Sort products
    window.sortProducts = function() {
        const sortBy = document.getElementById('sortSelect').value;
        const grid = document.getElementById('productsGrid');
        const visibleProducts = Array.from(grid.querySelectorAll('.product-card:not([style*="none"])'));
        
        visibleProducts.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return parseInt(b.dataset.id) - parseInt(a.dataset.id);
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'name':
                    return a.dataset.title.localeCompare(b.dataset.title);
                default:
                    return 0;
            }
        });
        
        // Reorder in DOM
        visibleProducts.forEach(product => grid.appendChild(product));
    };
    
    // Clear all filters
    window.clearFilters = function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('sortSelect').value = 'newest';
        filterAndDisplay();
    };
    
    // Filter and display products
    function filterAndDisplay() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const selectedCategory = document.getElementById('categoryFilter').value;
        
        let visibleCount = 0;
        
        allProducts.forEach(product => {
            let show = true;
            
            // Search filter
            if (searchTerm) {
                const title = product.dataset.title;
                const author = product.dataset.author;
                if (!title.includes(searchTerm) && !author.includes(searchTerm)) {
                    show = false;
                }
            }
            
            // Category filter
            if (selectedCategory && product.dataset.category !== selectedCategory) {
                show = false;
            }
            
            // Show/hide product
            if (show) {
                product.style.display = 'block';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });
        
        // Update count
        document.getElementById('productsCount').textContent = `Showing ${visibleCount} products`;
        
        // Sort after filtering
        if (visibleCount > 0) {
            sortProducts();
        }
    }
    
    // Add to cart
    window.addToCart = function(productId) {
        console.log('🛒 Adding product to cart:', productId);
        
        // Show success message immediately
        showToast('✅ Product added to cart!', 'success');
        
        // Try API call
        fetch(`${baseUrl}/customer/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                productId: productId,
                quantity: 1
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCartCount();
                showToast('✅ ' + data.message, 'success');
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.log('Cart API not available, using fallback');
            // Fallback - increment cart count manually
            const cartCount = document.getElementById('cartCount');
            const currentCount = parseInt(cartCount.textContent) || 0;
            updateCartCountDisplay(currentCount + 1);
        });
    };
    
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
            console.log('Cart count API not available');
            updateCartCountDisplay(0);
        });
    }
    
    // Update cart count display
    function updateCartCountDisplay(count) {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Cart functions
    window.openCart = function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            loadCartItems();
        }
    };
    
    window.closeCart = function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    };
    
    // Load cart items
    function loadCartItems() {
        const cartItems = document.getElementById('cartItems');
        
        fetch(`${baseUrl}/customer/cart/items`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.items.length > 0) {
                displayCartItems(data.items);
            } else {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.log('Cart items API not available');
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        });
    }
    
    // Display cart items
    function displayCartItems(items) {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        let total = 0;
        
        const itemsHTML = items.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            return `
                <div class="cart-item" style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <img src="${item.imagePath.startsWith('data:image/') ? item.imagePath : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" 
                         alt="${item.title}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; font-size: 14px;">${item.title}</h4>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">by ${item.author}</p>
                        <p style="margin: 5px 0; font-weight: bold; color: #27ae60;">Rs. ${item.price} × ${item.quantity}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = total.toFixed(2);
    }
    
    // Go to checkout
    window.goToCheckout = function() {
        window.location.href = 'cart.jsp';
    };
    
    // Toast notification
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
    }
    
    window.hideToast = function() {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.remove('show');
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
    
    console.log('✅ Products page initialized');
});
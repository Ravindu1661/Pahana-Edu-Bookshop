// Customer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Customer Dashboard loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // Global variables
    let currentUser = null;
    let cartItems = [];
    let categories = [];
    let recentProducts = [];
    let featuredProducts = [];
    
    // Initialize
    initDashboard();
    
    function initDashboard() {
        console.log('🔧 Initializing dashboard...');
        loadUserInfo();
        loadCategories();
        loadRecentProducts();
        loadFeaturedProducts();
        loadCartCount();
        setupEventListeners();
    }
    
    // Load user information
    function loadUserInfo() {
        console.log('👤 User loaded from session');
    }
    
    // Load categories
    function loadCategories() {
        console.log('🏷️ Loading categories...');
        
        fetch(`${baseUrl}/customer/categories`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                categories = data.categories || [];
                displayCategories();
                console.log(`✅ ${categories.length} categories loaded`);
            } else {
                console.error('❌ Categories API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Categories fetch error:', error);
            loadSampleCategories();
        });
    }
    
    // Load sample categories (fallback)
    function loadSampleCategories() {
        categories = [
            { id: 1, name: 'Fiction', description: 'Novels and stories', icon: 'fas fa-book' },
            { id: 2, name: 'Biography', description: 'Life stories', icon: 'fas fa-user' },
            { id: 3, name: 'Children', description: 'Kids books', icon: 'fas fa-child' },
            { id: 4, name: 'Education', description: 'Learning materials', icon: 'fas fa-graduation-cap' }
        ];
        displayCategories();
    }
    
    // Display categories
    function displayCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;
        
        categoriesGrid.innerHTML = categories.map(category => `
            <div class="category-card" onclick="viewCategoryProducts(${category.id})">
                <i class="${category.icon || 'fas fa-book'}"></i>
                <h3>${category.name}</h3>
                <p>${category.description || 'Browse ' + category.name + ' books'}</p>
            </div>
        `).join('');
    }
    
    // Load recent products
    function loadRecentProducts() {
        console.log('📚 Loading recent products...');
        
        fetch(`${baseUrl}/customer/products/recent?limit=8`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                recentProducts = data.products || [];
                displayRecentProducts();
                console.log(`✅ ${recentProducts.length} recent products loaded`);
            } else {
                console.error('❌ Recent products API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Recent products fetch error:', error);
        });
    }
    
    // Load featured products
    function loadFeaturedProducts() {
        console.log('⭐ Loading featured products...');
        
        fetch(`${baseUrl}/customer/products/featured?limit=6`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                featuredProducts = data.products || [];
                displayFeaturedProducts();
                console.log(`✅ ${featuredProducts.length} featured products loaded`);
            } else {
                console.error('❌ Featured products API error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Featured products fetch error:', error);
        });
    }
    
    // Display recent products
    function displayRecentProducts() {
        const grid = document.getElementById('recentProductsGrid');
        if (!grid) return;
        
        grid.innerHTML = recentProducts.map(product => createProductCard(product)).join('');
    }
    
    // Display featured products
    function displayFeaturedProducts() {
        const grid = document.getElementById('featuredProductsGrid');
        if (!grid) return;
        
        grid.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    }
    
    // Create product card HTML with complete product information
    function createProductCard(product) {
        const imageUrl = getProductImage(product.imagePath);
        const currentPrice = product.offerPrice || product.price;
        const originalPrice = product.offerPrice ? product.price : null;
        const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        
        return `
            <div class="product-card">
                <img src="${imageUrl}" alt="${product.title}" class="product-image" 
                     onerror="this.src='${defaultImage}'">
                <div class="product-info">
                    <div class="product-category">${product.categoryName || 'General'}</div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-author">by ${product.author}</p>
                    <p class="product-description">${truncateText(product.description || 'No description available', 80)}</p>
                    <div class="product-stock ${stockClass}">
                        <i class="fas fa-box"></i>
                        <span>${stockStatus} (${product.stock} available)</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">Rs. ${currentPrice}</span>
                        ${originalPrice ? `<span class="original-price">Rs. ${originalPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})" 
                                ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Enhanced out-of-stock display method
    function updateOutOfStockDisplay(productElement, isOutOfStock) {
        const stockDiv = productElement.querySelector('.product-stock');
        const addToCartBtn = productElement.querySelector('.add-to-cart');
        
        if (isOutOfStock) {
            // Update stock display
            if (stockDiv) {
                stockDiv.className = 'product-stock out-of-stock';
                stockDiv.innerHTML = '<i class="fas fa-box"></i><span>Out of Stock (0 available)</span>';
            }
            
            // Update button
            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Out of Stock';
                addToCartBtn.style.backgroundColor = '#ccc';
                addToCartBtn.style.cursor = 'not-allowed';
                addToCartBtn.style.opacity = '0.6';
            }
            
            // Add visual indicator to product card
            productElement.classList.add('out-of-stock-product');
            productElement.style.opacity = '0.8';
            
        } else {
            // Update stock display
            if (stockDiv) {
                stockDiv.className = 'product-stock in-stock';
                stockDiv.innerHTML = '<i class="fas fa-box"></i><span>In Stock (Available)</span>';
            }
            
            // Update button
            if (addToCartBtn) {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'Add to Cart';
                addToCartBtn.style.backgroundColor = '';
                addToCartBtn.style.cursor = 'pointer';
                addToCartBtn.style.opacity = '1';
            }
            
            // Remove visual indicator
            productElement.classList.remove('out-of-stock-product');
            productElement.style.opacity = '1';
        }
    }
    
    // Truncate text helper function
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
    
    // Add to cart function
    function addToCart(productId) {
        console.log('🛒 Adding product to cart:', productId);
        
        // Check if product is in stock before adding
        const productElement = document.querySelector(`[onclick="addToCart(${productId})"]`).closest('.product-card');
        if (productElement && productElement.classList.contains('out-of-stock-product')) {
            showToast('❌ Product is out of stock', 'error');
            return;
        }
        
        showLoading();
        
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
            hideLoading();
            if (data.success) {
                showToast('✅ Product added to cart!', 'success');
                updateCartCount();
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Add to cart error:', error);
            showToast('❌ Error adding to cart', 'error');
        });
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
        });
    }
    
    // Update cart count
    function updateCartCount() {
        loadCartCount();
    }
    
    // Update cart count display
    function updateCartCountDisplay(count) {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Open cart sidebar
    function openCart() {
        console.log('🛒 Opening cart sidebar');
        loadCartItems();
        
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close cart sidebar
    function closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Load cart items
    function loadCartItems() {
        fetch(`${baseUrl}/customer/cart/items`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cartItems = data.items || [];
                displayCartItems();
                updateCartTotal();
            } else {
                console.error('❌ Cart items error:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Cart items fetch error:', error);
            cartItems = [];
            displayCartItems();
            updateCartTotal();
        });
    }
    
    // Display cart items
    function displayCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            return;
        }
        
        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${getProductImage(item.imagePath)}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">Rs. ${item.price}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="margin-left: 10px; color: #e74c3c;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update cart total
    function updateCartTotal() {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalEl = document.getElementById('cartTotal');
        if (cartTotalEl) {
            cartTotalEl.textContent = total.toFixed(2);
        }
    }
    
    // Update cart item quantity
    function updateCartItemQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        
        fetch(`${baseUrl}/customer/cart/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItemId: itemId,
                quantity: newQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCartItems();
                updateCartCount();
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Update cart error:', error);
            showToast('❌ Error updating cart', 'error');
        });
    }
    
    // Remove from cart
    function removeFromCart(itemId) {
        fetch(`${baseUrl}/customer/cart/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItemId: itemId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('✅ Item removed from cart', 'success');
                loadCartItems();
                updateCartCount();
            } else {
                showToast('❌ ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Remove from cart error:', error);
            showToast('❌ Error removing item', 'error');
        });
    }
    
    // Go to checkout - UPDATED TO GO TO CART.JSP
    function goToCheckout() {
        if (cartItems.length === 0) {
            showToast('❌ Your cart is empty', 'error');
            return;
        }
        
        // Redirect to cart.jsp instead of checkout.jsp
        window.location.href = 'cart.jsp';
    }
    
    // View category products
    function viewCategoryProducts(categoryId) {
        window.location.href = `products.jsp?category=${categoryId}`;
    }
    
    // Search functionality
    function performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (query) {
            window.location.href = `products.jsp?search=${encodeURIComponent(query)}`;
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
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
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCart();
            }
        });
        
        // Setup navigation
        setupNavigation();
        
        // Setup contact form
        setupContactForm();
    }
    
    // Setup navigation between sections
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        const footerLinks = document.querySelectorAll('a[data-section]');
        
        // Add click handlers for navigation links
        [...navLinks, ...footerLinks].forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                showSection(sectionId);
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
            });
        });
    }
    
    // Show specific section
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
    
    // Setup contact form
    function setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactForm);
        }
    }
    
    // Handle contact form submission
    function handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Show loading
        showLoading();
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            hideLoading();
            showToast('✅ Message sent successfully! We\'ll get back to you soon.', 'success');
            e.target.reset();
        }, 2000);
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
    window.addToCart = addToCart;
    window.openCart = openCart;
    window.closeCart = closeCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.removeFromCart = removeFromCart;
    window.goToCheckout = goToCheckout;
    window.viewCategoryProducts = viewCategoryProducts;
    window.hideToast = hideToast;
    window.updateOutOfStockDisplay = updateOutOfStockDisplay;
    
});
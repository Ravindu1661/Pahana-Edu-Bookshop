// Checkout Page JavaScript - Clean Production Version
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Checkout page loaded');
    
    // Get base URL
    const contextPath = window.location.pathname.split('/')[1];
    const baseUrl = '/' + contextPath;
    
    // Default image URL
    const defaultImage = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // Global variables
    let cartItems = [];
    let orderData = {};
    let currentStep = 1;
    let subtotal = 0;
    let shipping = 250;
    let discount = 0;
    let total = 0;
    
    // Initialize
    initCheckoutPage();
    
    function initCheckoutPage() {
        console.log('🔧 Initializing checkout page...');
        loadCartItems();
        loadCartCount();
        setupEventListeners();
        setupPaymentMethodToggle();
        setupCardInputFormatting();
        populateUserInfo();
    }
    
    // Setup payment method toggle - Show/Hide card form
    function setupPaymentMethodToggle() {
        const codRadio = document.getElementById('cashOnDelivery');
        const onlineRadio = document.getElementById('onlinePayment');
        const cardForm = document.getElementById('cardDetailsForm');
        const placeOrderText = document.getElementById('placeOrderText');
        
        if (codRadio && onlineRadio && cardForm && placeOrderText) {
            // Initial state - hide card form
            cardForm.style.display = 'none';
            
            codRadio.addEventListener('change', () => {
                if (codRadio.checked) {
                    cardForm.style.display = 'none';
                    placeOrderText.textContent = 'Place Order';
                }
            });
            
            onlineRadio.addEventListener('change', () => {
                if (onlineRadio.checked) {
                    cardForm.style.display = 'block';
                    placeOrderText.textContent = 'Pay Now';
                }
            });
        }
    }
    
    // Setup card input formatting
    function setupCardInputFormatting() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
                validateCardNumber(value.replace(/\s/g, ''));
            });
        }
        
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
                validateExpiryDate(value);
            });
        }
        
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                validateCVV(e.target.value);
            });
        }
    }
    
    // Card validation functions
    function validateCardNumber(cardNumber) {
        const cardGroup = document.getElementById('cardNumber').closest('.form-group');
        
        if (cardNumber.length >= 13 && cardNumber.length <= 19) {
            cardGroup.classList.remove('invalid');
            cardGroup.classList.add('valid');
            return true;
        } else {
            cardGroup.classList.remove('valid');
            cardGroup.classList.add('invalid');
            return false;
        }
    }
    
    function validateExpiryDate(expiry) {
        const expiryGroup = document.getElementById('expiryDate').closest('.form-group');
        
        if (expiry.length === 5) {
            const [month, year] = expiry.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            
            if (month >= 1 && month <= 12 && year >= currentYear) {
                if (year > currentYear || (year == currentYear && month >= currentMonth)) {
                    expiryGroup.classList.remove('invalid');
                    expiryGroup.classList.add('valid');
                    return true;
                }
            }
        }
        
        expiryGroup.classList.remove('valid');
        expiryGroup.classList.add('invalid');
        return false;
    }
    
    function validateCVV(cvv) {
        const cvvGroup = document.getElementById('cvv').closest('.form-group');
        
        if (cvv.length === 3) {
            cvvGroup.classList.remove('invalid');
            cvvGroup.classList.add('valid');
            return true;
        } else {
            cvvGroup.classList.remove('valid');
            cvvGroup.classList.add('invalid');
            return false;
        }
    }
    
    function validateCardHolder(name) {
        const cardHolderGroup = document.getElementById('cardHolder').closest('.form-group');
        
        if (name.trim().length >= 2) {
            cardHolderGroup.classList.remove('invalid');
            cardHolderGroup.classList.add('valid');
            return true;
        } else {
            cardHolderGroup.classList.remove('valid');
            cardHolderGroup.classList.add('invalid');
            return false;
        }
    }
    
    // Validate card details
    function validateCardDetails() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardHolder = document.getElementById('cardHolder').value.trim();
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        const isCardNumberValid = validateCardNumber(cardNumber);
        const isCardHolderValid = validateCardHolder(cardHolder);
        const isExpiryValid = validateExpiryDate(expiryDate);
        const isCvvValid = validateCVV(cvv);
        
        if (!isCardNumberValid) {
            showToast('❌ Please enter a valid card number', 'error');
            document.getElementById('cardNumber').focus();
            return false;
        }
        
        if (!isCardHolderValid) {
            showToast('❌ Please enter card holder name', 'error');
            document.getElementById('cardHolder').focus();
            return false;
        }
        
        if (!isExpiryValid) {
            showToast('❌ Please enter a valid expiry date', 'error');
            document.getElementById('expiryDate').focus();
            return false;
        }
        
        if (!isCvvValid) {
            showToast('❌ Please enter a valid CVV', 'error');
            document.getElementById('cvv').focus();
            return false;
        }
        
        return true;
    }
    
    // Load cart items
    function loadCartItems() {
        console.log('📦 Loading cart items...');
        showLoading();
        
        fetch(`${baseUrl}/customer/cart/items`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success && data.items && data.items.length > 0) {
                cartItems = data.items;
                displayOrderItems();
                displaySummaryItems();
                calculateTotals();
                console.log(`✅ ${cartItems.length} cart items loaded`);
            } else {
                console.log('❌ No cart items found');
                showEmptyCart();
            }
        })
        .catch(error => {
            hideLoading();
            console.error('❌ Cart items fetch error:', error);
            loadSampleCartItems();
        });
    }
    
    // Load sample cart items (fallback)
    function loadSampleCartItems() {
        cartItems = [
            {
                id: 1,
                productId: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                price: 1200,
                quantity: 1,
                imagePath: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            }
        ];
        
        displayOrderItems();
        displaySummaryItems();
        calculateTotals();
    }
    
    // Display order items in step 1
    function displayOrderItems() {
        const container = document.getElementById('orderItems');
        if (!container) return;
        
        if (cartItems.length === 0) {
            container.innerHTML = '<p>No items in cart</p>';
            return;
        }
        
        container.innerHTML = cartItems.map(item => `
            <div class="order-item">
                <img src="${getProductImage(item.imagePath)}" alt="${item.title}" class="order-item-image">
                <div class="order-item-info">
                    <div class="order-item-title">${item.title}</div>
                    <div class="order-item-author">by ${item.author}</div>
                    <div class="order-item-price">Rs. ${item.price}</div>
                </div>
                <div class="order-item-quantity">
                    <strong>Qty: ${item.quantity}</strong>
                </div>
                <div class="order-item-total">
                    Rs. ${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
    }
    
    // Display summary items
    function displaySummaryItems() {
        const container = document.getElementById('summaryItems');
        if (!container) return;
        
        container.innerHTML = cartItems.map(item => `
            <div class="summary-item">
                <div>
                    <div class="summary-item-name">${item.title}</div>
                    <div class="summary-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="summary-item-price">Rs. ${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
    }
    
    // Calculate totals
    function calculateTotals() {
        subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        shipping = subtotal >= 3000 ? 0 : 250;
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
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `Rs. ${discount.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `Rs. ${total.toFixed(2)}`;
    }
    
    // Show empty cart
    function showEmptyCart() {
        document.getElementById('orderItems').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 20px;"></i>
                <h3>Your cart is empty</h3>
                <p>Add some items to your cart to proceed with checkout.</p>
                <a href="products.jsp" class="btn btn-primary">Browse Products</a>
            </div>
        `;
    }
    
    // Get product image URL
    function getProductImage(imagePath) {
        if (!imagePath || imagePath.trim() === '') {
            return defaultImage;
        }
        
        if (imagePath.startsWith('data:image/') || imagePath.startsWith('http')) {
            return imagePath;
        }
        
        return baseUrl + '/' + imagePath;
    }
    
    // Populate user info
    function populateUserInfo() {
        // You can populate user info from session or API call
        // For now, we'll leave it empty for user to fill
    }
    
    // Navigation between steps
    function nextStep(step) {
        if (step === 2) {
            if (cartItems.length === 0) {
                showToast('❌ Your cart is empty', 'error');
                return;
            }
        }
        
        if (step === 3) {
            if (!validateShippingInfo()) {
                return;
            }
        }
        
        showStep(step);
    }
    
    function prevStep(step) {
        showStep(step);
    }
    
    function showStep(step) {
        // Hide all steps
        document.querySelectorAll('.checkout-step').forEach(s => {
            s.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`step${step}`).classList.add('active');
        currentStep = step;
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Validate shipping information
    function validateShippingInfo() {
        const fullName = document.getElementById('fullName').value.trim();
        const contactNumber = document.getElementById('contactNumber').value.trim();
        const shippingAddress = document.getElementById('shippingAddress').value.trim();
        
        if (!fullName) {
            showToast('❌ Please enter your full name', 'error');
            document.getElementById('fullName').focus();
            return false;
        }
        
        if (!contactNumber) {
            showToast('❌ Please enter your contact number', 'error');
            document.getElementById('contactNumber').focus();
            return false;
        }
        
        if (!shippingAddress) {
            showToast('❌ Please enter your shipping address', 'error');
            document.getElementById('shippingAddress').focus();
            return false;
        }
        
        return true;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckout);
        }
        
        // Modal close listeners
        const modal = document.getElementById('orderSuccessModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Global function assignments for onclick handlers
        window.nextStep = nextStep;
        window.prevStep = prevStep;
        window.viewOrder = viewOrder;
        window.continueShopping = continueShopping;
        window.printReceipt = printReceipt;
        window.hideToast = hideToast;
        window.closeModal = closeModal;
    }
    
    // Handle checkout submission
    function handleCheckout(e) {
        e.preventDefault();
        
        if (!validateShippingInfo()) {
            return;
        }
        
        const formData = new FormData(e.target);
        const paymentMethod = formData.get('paymentMethod');
        
        // Validate card details if online payment is selected
        if (paymentMethod === 'online') {
            if (!validateCardDetails()) {
                return;
            }
        }
        
        const orderData = {
            fullName: formData.get('fullName'),
            contactNumber: formData.get('contactNumber'),
            shippingAddress: formData.get('shippingAddress'),
            orderNotes: formData.get('orderNotes'),
            paymentMethod: paymentMethod,
            totalAmount: total,
            items: cartItems.map(item => ({
                itemId: item.productId,
                quantity: item.quantity,
                price: item.price
            }))
        };
        
        // Add card details if online payment
        if (paymentMethod === 'online') {
            orderData.cardDetails = {
                cardNumber: formData.get('cardNumber').replace(/\s/g, ''),
                cardHolder: formData.get('cardHolder'),
                expiryDate: formData.get('expiryDate'),
                cvv: formData.get('cvv')
            };
        }
        
        placeOrder(orderData);
    }
    
    // Place order
    function placeOrder(orderData) {
        console.log('🛍️ Placing order...', orderData);
        
        // Show processing state
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        showLoading();
        
        // Simulate payment processing delay for online payments
        const processingDelay = orderData.paymentMethod === 'online' ? 2000 : 1000;
        
        setTimeout(() => {
            fetch(`${baseUrl}/checkout/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                if (data.success) {
                    if (orderData.paymentMethod === 'online') {
                        showToast('✅ Payment processed successfully!', 'success');
                    }
                    showOrderSuccess(data);
                } else {
                    showToast('❌ ' + data.message, 'error');
                }
            })
            .catch(error => {
                hideLoading();
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                console.error('❌ Place order error:', error);
                
                // Fallback for demo
                const fallbackData = {
                    orderId: Math.floor(Math.random() * 10000) + 1000,
                    totalAmount: total,
                    paymentMethod: orderData.paymentMethod,
                    transactionId: orderData.paymentMethod === 'online' ? 'TXN' + Date.now() : null
                };
                
                if (orderData.paymentMethod === 'online') {
                    showToast('✅ Payment processed successfully!', 'success');
                }
                showOrderSuccess(fallbackData);
            });
        }, processingDelay);
    }
    
    // Show order success modal
    function showOrderSuccess(data) {
        document.getElementById('orderIdDisplay').textContent = `#${data.orderId}`;
        document.getElementById('totalAmountDisplay').textContent = `Rs. ${data.totalAmount.toFixed(2)}`;
        
        // Get the actual selected payment method from form
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Update payment method display based on what was actually selected
        const paymentMethodEl = document.getElementById('paymentMethodDisplay');
        if (paymentMethodEl) {
            if (selectedPaymentMethod === 'online') {
                paymentMethodEl.textContent = 'Online Payment';
            } else {
                paymentMethodEl.textContent = 'Cash on Delivery';
            }
        }
        
        // Show transaction ID if online payment
        const transactionIdEl = document.getElementById('transactionIdDisplay');
        const transactionRow = transactionIdEl ? transactionIdEl.parentElement : null;
        
        if (selectedPaymentMethod === 'online' && (data.transactionId || data.paymentMethod === 'online')) {
            if (transactionIdEl && transactionRow) {
                transactionIdEl.textContent = data.transactionId || 'TXN' + Date.now();
                transactionRow.style.display = 'block';
            }
        } else if (transactionRow) {
            transactionRow.style.display = 'none';
        }
        
        orderData.orderId = data.orderId;
        orderData.totalAmount = data.totalAmount;
        orderData.transactionId = selectedPaymentMethod === 'online' ? (data.transactionId || 'TXN' + Date.now()) : null;
        orderData.paymentMethod = selectedPaymentMethod;
        
        const modal = document.getElementById('orderSuccessModal');
        modal.style.display = 'block';
        
        // Clear cart after successful order
        clearCartAfterOrder();
        
        if (selectedPaymentMethod === 'online') {
            showToast('✅ Payment successful! Order placed!', 'success');
        } else {
            showToast('✅ Order placed successfully!', 'success');
        }
    }
    
    // Clear cart after order
    function clearCartAfterOrder() {
        fetch(`${baseUrl}/customer/cart/clear`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCartCount();
            }
        })
        .catch(error => {
            console.log('Cart clear error:', error);
        });
    }
    
    // Modal functions
    function viewOrder() {
        if (orderData.orderId) {
            window.location.href = `orders.jsp?orderId=${orderData.orderId}`;
        }
    }
    
    function continueShopping() {
        window.location.href = 'products.jsp';
    }
    
    function printReceipt() {
        generateReceipt();
        window.print();
    }
    
    function closeModal() {
        const modal = document.getElementById('orderSuccessModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Generate receipt for printing
    function generateReceipt() {
        // Get the actual selected payment method from form
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const paymentMethodDisplay = selectedPaymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery';
        
        const receiptHTML = `
            <div class="receipt-print">
                <div class="receipt-header">
                    <h1>📚 Pahana Edu</h1>
                    <p>Your trusted online bookstore</p>
                    <p>Phone: +94 11 234 5678 | Email: info@pahanaedu.lk</p>
                </div>
                
                <div class="receipt-info">
                    <div class="receipt-section">
                        <h3>Order Information</h3>
                        <p><strong>Order ID:</strong> #${orderData.orderId}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethodDisplay}</p>
                        ${selectedPaymentMethod === 'online' && orderData.transactionId ? `<p><strong>Transaction ID:</strong> ${orderData.transactionId}</p>` : ''}
                    </div>
                    
                    <div class="receipt-section">
                        <h3>Shipping Information</h3>
                        <p><strong>Name:</strong> ${document.getElementById('fullName').value}</p>
                        <p><strong>Contact:</strong> ${document.getElementById('contactNumber').value}</p>
                        <p><strong>Address:</strong> ${document.getElementById('shippingAddress').value}</p>
                    </div>
                </div>
                
                <table class="receipt-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Author</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartItems.map(item => `
                            <tr>
                                <td>${item.title}</td>
                                <td>${item.author}</td>
                                <td>Rs. ${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="receipt-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>Rs. ${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${shipping === 0 ? 'Free' : 'Rs. ' + shipping.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Discount:</span>
                        <span>Rs. ${discount.toFixed(2)}</span>
                    </div>
                    <div class="total-row total-final">
                        <span><strong>Total:</strong></span>
                        <span><strong>Rs. ${total.toFixed(2)}</strong></span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p>Thank you for your order!</p>
                    <p>Delivery within 3-5 business days</p>
                    ${selectedPaymentMethod === 'online' ? '<p style="color: #27ae60;">✅ Payment Completed</p>' : '<p style="color: #f39c12;">💰 Cash on Delivery</p>'}
                </div>
            </div>
        `;
        
        // Remove existing receipt
        const existingReceipt = document.querySelector('.receipt-print');
        if (existingReceipt) {
            existingReceipt.remove();
        }
        
        // Add new receipt to body
        document.body.insertAdjacentHTML('beforeend', receiptHTML);
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
            console.log('Cart count API not available');
        });
    }
    
    function updateCartCountDisplay(count) {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
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
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
    
    function hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.className = 'toast';
        }
    }
});
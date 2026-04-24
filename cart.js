<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout – ShoeHub</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="checkout-page">
  <nav class="nav">
    <div class="nav-logo"><a href="index.html">SHOE<span class="accent">HUB</span></a></div>
    <div class="nav-links">
      <a href="index.html">← Back to Shop</a>
    </div>
  </nav>
  
  <main class="checkout-container">
    <h2>Checkout</h2>
    
    <div id="order-summary" class="order-summary">
      <h3>Order Summary</h3>
      <div id="cart-items-list"></div>
      <div class="total-line">
        <strong>Total: ৳<span id="checkout-total">0</span></strong>
      </div>
      <p style="font-size: 0.85rem; color: #666;">Payment Method: Cash on Delivery</p>
    </div>

    <form id="checkout-form">
      <div class="form-group">
        <label for="name">Full Name *</label>
        <input type="text" id="name" placeholder="Enter your full name" required>
      </div>
      
      <div class="form-group">
        <label for="phone">Phone Number *</label>
        <input type="tel" id="phone" placeholder="01XXXXXXXXX" required>
      </div>
      
      <div class="form-group">
        <label for="address">Full Address *</label>
        <textarea id="address" placeholder="House, Road, Area, City" rows="3" required></textarea>
      </div>
      
      <button type="submit" class="btn btn-primary btn-block">
        Place Order (Cash on Delivery)
      </button>
    </form>
    
    <div id="order-message" style="display:none; text-align: center; padding: 20px;"></div>
  </main>

  <script src="products.js"></script>
  <script src="cart.js"></script>
  <script>
    // Google Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYllyGKyxr8NDtW0oyAH3-7vEpXReZrOprrhmQvvQoeqG3Nc-fk-Y92XthIXSl-0EZ/exec';

    // Force cart UI update on page load
    document.addEventListener('DOMContentLoaded', function() {
      // First, make sure cart functions are available
      if (typeof getCart !== 'function') {
        console.error('cart.js not loaded properly');
        document.getElementById('cart-items-list').innerHTML = '<p>Error loading cart. Please go back and try again.</p>';
        return;
      }
      
      const cart = getCart();
      console.log('Cart loaded:', cart); // Debug - check console
      
      // Display cart items
      displayOrderSummary(cart);
      
      // If cart is empty, show a helpful message
      if (!cart || cart.length === 0) {
        document.getElementById('cart-items-list').innerHTML = `
          <p style="text-align: center; padding: 20px;">
            Your cart is empty.<br>
            <a href="index.html" style="color: #FF6B00; text-decoration: underline;">Browse products</a>
          </p>
        `;
        document.getElementById('checkout-form').style.display = 'none';
      }
    });

    function displayOrderSummary(cart) {
      const cartItemsList = document.getElementById('cart-items-list');
      const checkoutTotal = document.getElementById('checkout-total');
      
      if (!cart || cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty. <a href="index.html">Shop now</a></p>';
        document.getElementById('checkout-form').style.display = 'none';
        checkoutTotal.textContent = '0';
        return;
      }
      
      let html = '';
      let total = 0;
      
      cart.forEach(function(item) {
        // Find product from products array (loaded from products.js)
        const product = products.find(function(p) {
          return p.id === item.productId;
        });
        
        if (product) {
          const itemTotal = product.price * item.qty;
          total += itemTotal;
          html += `
            <div class="checkout-item">
              <div class="checkout-item-info">
                <img src="${product.images[0]}" alt="${product.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
                <div>
                  <strong>${product.name}</strong>
                  <p style="font-size:0.85rem;color:#666;margin:4px 0 0 0;">Size: UK ${item.size} | Qty: ${item.qty}</p>
                </div>
              </div>
              <span>৳${itemTotal}</span>
            </div>
          `;
        }
      });
      
      cartItemsList.innerHTML = html;
      checkoutTotal.textContent = total;
    }

    // Handle form submission
    document.getElementById('checkout-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const address = document.getElementById('address').value.trim();
      
      if (!name || !phone || !address) {
        alert('Please fill in all required fields (Name, Phone, Address).');
        return;
      }
      
      const cart = getCart();
      if (!cart || cart.length === 0) {
        alert('Your cart is empty. Please add products first.');
        window.location.href = 'index.html';
        return;
      }
      
      // Generate order ID
      const orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      
      // Prepare order items
      const orderItems = cart.map(function(item) {
        const product = products.find(function(p) { return p.id === item.productId; });
        return {
          productId: item.productId,
          name: product ? product.name : 'Unknown Product',
          size: item.size,
          qty: item.qty,
          price: product ? product.price : 0
        };
      });
      
      const total = orderItems.reduce(function(sum, item) {
        return sum + (item.price * item.qty);
      }, 0);
      
      const orderData = {
        orderId: orderId,
        name: name,
        phone: phone,
        address: address,
        items: orderItems,
        total: total
      };
      
      // Show loading
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;
      
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(orderData),
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors'
        });
        
        // Save order ID
        localStorage.setItem('lastOrderId', orderId);
        
        // Clear cart
        if (typeof clearCart === 'function') {
          clearCart();
        } else {
          localStorage.removeItem('shoehub_cart');
        }
        
        // Redirect
        window.location.href = 'thankyou.html';
        
      } catch (error) {
        console.error('Error:', error);
        // Still save order ID and redirect
        localStorage.setItem('lastOrderId', orderId);
        localStorage.removeItem('shoehub_cart');
        window.location.href = 'thankyou.html';
      }
    });
  </script>

  <style>
    .checkout-container {
      max-width: 500px;
      margin: 40px auto;
      padding: 24px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 1rem;
      font-family: inherit;
    }
    .checkout-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .checkout-item-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .total-line {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #333;
      font-size: 1.2rem;
    }
    .btn:disabled {
      opacity: 0.7;
    }
  </style>
</body>
</html>

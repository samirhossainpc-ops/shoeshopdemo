function getCart() {
  const cart = localStorage.getItem('shoehub_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('shoehub_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId, size, qty = 1) {
  let cart = getCart();
  const existing = cart.find(item => item.productId === productId && item.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, size, qty });
  }
  saveCart(cart);
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(item => !(item.productId === productId && item.size === size));
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem('shoehub_cart');
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEls = document.querySelectorAll('#cart-count');
  countEls.forEach(el => { if (el) el.textContent = count; });

  const totalEl = document.getElementById('cart-total');
  if (totalEl) {
    let total = 0;
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) total += product.price * item.qty;
    });
    totalEl.textContent = total;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cart-btn');
  const closeCart = document.getElementById('close-cart');
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');

  if (cartBtn && panel && overlay) {
    cartBtn.addEventListener('click', () => {
      panel.classList.add('open');
      overlay.classList.add('open');
      updateCartUI();
    });
    closeCart.addEventListener('click', () => {
      panel.classList.remove('open');
      overlay.classList.remove('open');
    });
    overlay.addEventListener('click', () => {
      panel.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
  updateCartUI();
});
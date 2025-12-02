<script>
let cart = [];

// DOM
const cartBtn = document.getElementById("cart-btn");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const subtotalEl = document.getElementById("subtotal");

// Open cart
cartBtn.onclick = () => {
  cartPanel.classList.add("open");
  cartOverlay.style.display = "block";
};

// Close cart
closeCart.onclick = closeCartPanel;
cartOverlay.onclick = closeCartPanel;

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartOverlay.style.display = "none";
}

// Add item (example function)
function addToCart(id, name, price, image) {
  const item = cart.find(i => i.id === id);

  if (item) {
    item.quantity++;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }

  updateCartUI();
}

// Update UI
function updateCartUI() {
  cartItems.innerHTML = "";
  let subtotal = 0;
  let count = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    count += item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}">
        <div>
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)}</p>
          <div>
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            ${item.quantity}
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  subtotalEl.textContent = subtotal.toFixed(2);
  cartCount.textContent = count;
}

// Change quantity
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  updateCartUI();
}
</script>

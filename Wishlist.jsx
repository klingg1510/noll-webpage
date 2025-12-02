<script>
(function () { 
  // Local storage keys
  const LS_WISHLIST = 'ws_wishlist_v1';
  const LS_CART = 'ws_cart_v1';

  // DOM references
  const btnWishlist = document.getElementById('ws-wishlist-btn');
  const badgeWishlist = document.getElementById('ws-wishlist-badge');
  const badgeCart = document.getElementById('ws-cart-badge');
  const btnCart = document.getElementById('ws-cart-btn');
  const overlay = document.getElementById('ws-overlay');
  const panel = document.getElementById('ws-panel');
  const closeBtn = document.getElementById('ws-close');
  const bodyEl = document.getElementById('ws-body');
  const countEl = document.getElementById('ws-count');
  const clearBtn = document.getElementById('ws-clear-btn');
  const uniqueCount = document.getElementById('ws-unique-count');

  // load or init arrays
  let wishlist = loadFromStorage(LS_WISHLIST) || []; // array of items
  let cart = loadFromStorage(LS_CART) || [];

  // helper to persist
  function saveWishlist() { localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist)); }
  function saveCart() { localStorage.setItem(LS_CART, JSON.stringify(cart)); }

  // fallback image handler
  function safeImg(src) {
    return src || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="14">No Image</text></svg>';
  }

  // UI render
  function renderWishlist() {
    bodyEl.innerHTML = '';
    if (!wishlist || wishlist.length === 0) {
      bodyEl.innerHTML = '<div class="ws-empty"><div style="font-size:36px;">🤍</div><div>Your wishlist is empty</div></div>';
    } else {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '12px';
      wishlist.forEach(item => {
        const root = document.createElement('div');
        root.className = 'ws-item';
        root.innerHTML = `
          <img class="ws-thumb" src="${safeImg(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.src='${safeImg('')}'" />
          <div class="ws-item-main">
            <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
              <div style="flex:1; min-width:0;">
                <h4 class="ws-item-title">${escapeHtml(item.name)}</h4>
                <p class="ws-item-sub">$${Number(item.price).toFixed(2)}</p>
              </div>
              <div style="margin-left:8px;">
                <button class="ws-small-btn" data-action="remove" data-id="${item.id}" title="Remove">✕</button>
              </div>
            </div>
            <div class="ws-item-actions">
              <button class="ws-small-btn" data-action="move" data-id="${item.id}">Move to cart</button>
            </div>
          </div>
        `;
        wrap.appendChild(root);
      });
      bodyEl.appendChild(wrap);
    }
    updateBadges();
  }

  function updateBadges() {
    const n = wishlist.length;
    const cartCount = cart.reduce((s, it) => s + (it.quantity || 1), 0);
    countEl.textContent = n;
    uniqueCount.textContent = `${n} unique`;
    if (n > 0) { badgeWishlist.style.display = 'inline-grid'; badgeWishlist.textContent = n; } else { badgeWishlist.style.display = 'none'; }
    if (cartCount > 0) { badgeCart.style.display = 'inline-grid'; badgeCart.textContent = cartCount; } else { badgeCart.style.display = 'none'; }
  }

  // escape helper for safety
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

  // click handlers (delegation)
  bodyEl.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'remove') removeFromWishlist(id);
    if (action === 'move') moveToCart(id);
  });

  // remove item
  function removeFromWishlist(id) {
    wishlist = wishlist.filter(i => i.id !== id);
    saveWishlist();
    renderWishlist();
  }

  // clear wishlist
  clearBtn.addEventListener('click', function () {
    if (!wishlist.length) return;
    if (!confirm('Clear all items from wishlist?')) return;
    wishlist = [];
    saveWishlist();
    renderWishlist();
  });

  // move to cart
  function moveToCart(id) {
    const item = wishlist.find(i => i.id === id);
    if (!item) return;
    // add to cart (simple merge by id)
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      exists.quantity = (exists.quantity || 1) + 1;
    } else {
      cart.push(Object.assign({}, item, { quantity: 1 }));
    }
    // remove from wishlist
    wishlist = wishlist.filter(i => i.id !== id);
    saveCart();
    saveWishlist();
    renderWishlist();
    // brief highlight animation on cart button
    animateCartButton();
  }

  function animateCartButton() {
    btnCart.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 220 });
  }

  // open/close panel
  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('open');
    btnWishlist.setAttribute('aria-expanded','true');
    panel.focus();
  }
  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    btnWishlist.setAttribute('aria-expanded','false');
  }

  btnWishlist.addEventListener('click', function () {
    if (panel.classList.contains('open')) closePanel(); else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  // cart button basic behavior (open cart link or show alert)
  btnCart.addEventListener('click', function () {
    // If you have a cart page, redirect there; default: show cart summary
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    // simple summary modal
    const lines = cart.map(i => `${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`);
    const total = cart.reduce((s,i)=> s + i.price * i.quantity, 0);
    alert('Cart\\n\\n' + lines.join('\\n') + '\\n\\nTotal: $' + total.toFixed(2));
  });

  // Provide public API to add/remove wishlist (so you can call from product pages)
  window.WS = {
    addToWishlist: function(item) {
      if (!item || !item.id) return;
      // avoid duplicate ids
      if (wishlist.find(i => i.id === item.id)) return;
      wishlist.unshift(item);
      saveWishlist();
      renderWishlist();
      // open panel briefly? you can uncomment:
      // openPanel();
    },
    removeFromWishlist: removeFromWishlist,
    moveToCart: moveToCart,
    getWishlist: function() { return wishlist.slice(); },
    getCart: function() { return cart.slice(); }
  };

  // helpers: load sample items if wishlist empty (for demo) - comment out in production
  function seedDemo() {
    if (!wishlist.length) {
      // add first item only for demo to show UI (comment these lines if you don't want demo)
      SAMPLE_ITEMS.forEach((it, idx) => {
        if (idx < 2) wishlist.push(it);
      });
      saveWishlist();
    }
  }

  // utility to load from storage safely
  function loadFromStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // initialize
  (function init() {
    // DEMO seeding: remove or comment out this call on real site
    seedDemo();

    renderWishlist();
    updateBadges();
  })();

})();
</script>
  WS.addToWishlist({ id: 'p99', name: 'New Product', price: 29.9, image: 'https://...' });
</script>

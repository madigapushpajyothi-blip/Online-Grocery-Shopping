/**
 * Online Grocery Store Platform
 * Application Core Logic & State Management
 */

(function () {
  "use strict";

  // ================= State Management =================
  const STATE = {
    cart: loadFromStorage("freshcart_cart", {}), // Map of productId -> quantity
    wishlist: new Set(loadFromStorage("freshcart_wishlist", [])),
    selectedCategory: "all",
    searchQuery: "",
    sortBy: "recommended",
    activePromo: null,
    selectedPaymentMethod: "card"
  };

  // LocalStorage Helpers
  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }

  function loadFromStorage(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  // DOM Elements Cache
  const DOM = {
    categoriesNav: document.getElementById("categoriesNav"),
    productsGrid: document.getElementById("productsGrid"),
    resultsCount: document.getElementById("resultsCount"),
    searchInput: document.getElementById("searchInput"),
    searchClear: document.getElementById("searchClear"),
    sortSelect: document.getElementById("sortSelect"),
    cartBtn: document.getElementById("cartBtn"),
    cartBadge: document.getElementById("cartBadge"),
    cartPricePreview: document.getElementById("cartPricePreview"),
    wishlistBtn: document.getElementById("wishlistBtn"),
    wishlistBadge: document.getElementById("wishlistBadge"),

    // Cart Drawer
    drawerBackdrop: document.getElementById("drawerBackdrop"),
    cartDrawer: document.getElementById("cartDrawer"),
    closeCartBtn: document.getElementById("closeCartBtn"),
    cartDrawerCount: document.getElementById("cartDrawerCount"),
    cartItemsList: document.getElementById("cartItemsList"),
    cartEmptyView: document.getElementById("cartEmptyView"),
    cartFooter: document.getElementById("cartFooter"),
    shippingFill: document.getElementById("shippingFill"),
    shippingText: document.getElementById("shippingText"),
    subtotalPrice: document.getElementById("subtotalPrice"),
    discountRow: document.getElementById("discountRow"),
    discountAmount: document.getElementById("discountAmount"),
    deliveryFee: document.getElementById("deliveryFee"),
    taxAmount: document.getElementById("taxAmount"),
    finalTotalPrice: document.getElementById("finalTotalPrice"),
    promoInput: document.getElementById("promoInput"),
    applyPromoBtn: document.getElementById("applyPromoBtn"),
    promoActiveTag: document.getElementById("promoActiveTag"),
    promoActiveText: document.getElementById("promoActiveText"),
    removePromoBtn: document.getElementById("removePromoBtn"),
    checkoutBtn: document.getElementById("checkoutBtn"),

    // Modals
    quickViewModal: document.getElementById("quickViewModal"),
    quickViewCard: document.getElementById("quickViewCard"),
    closeQvBtn: document.getElementById("closeQvBtn"),
    checkoutModal: document.getElementById("checkoutModal"),
    closeCheckoutBtn: document.getElementById("closeCheckoutBtn"),
    checkoutForm: document.getElementById("checkoutForm"),
    orderSuccessModal: document.getElementById("orderSuccessModal"),
    closeSuccessBtn: document.getElementById("closeSuccessBtn"),
    orderReceiptBox: document.getElementById("orderReceiptBox"),
    continueShoppingBtn: document.getElementById("continueShoppingBtn"),
    printReceiptBtn: document.getElementById("printReceiptBtn"),
    wishlistModal: document.getElementById("wishlistModal"),
    closeWishlistBtn: document.getElementById("closeWishlistBtn"),
    wishlistItemsList: document.getElementById("wishlistItemsList"),
    toastContainer: document.getElementById("toastContainer")
  };

  // ================= Toast Notification System =================
  function showToast(message, type = "info", icon = "ℹ️") {
    if (!DOM.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ================= Render Categories =================
  function renderCategories() {
    if (!DOM.categoriesNav) return;
    DOM.categoriesNav.innerHTML = CATEGORIES.map(cat => {
      const isActive = cat.id === STATE.selectedCategory;
      return `
        <button class="category-pill ${isActive ? "active" : ""}" data-category="${cat.id}">
          <span>${cat.icon}</span>
          <span>${cat.name}</span>
          <span class="pill-count">${cat.count}</span>
        </button>
      `;
    }).join("");

    DOM.categoriesNav.querySelectorAll(".category-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        STATE.selectedCategory = pill.getAttribute("data-category");
        renderCategories();
        renderProducts();
      });
    });
  }

  // ================= Filter & Sort Products =================
  function getFilteredProducts() {
    let list = [...PRODUCTS];

    // Filter by Category
    if (STATE.selectedCategory !== "all") {
      list = list.filter(p => p.category === STATE.selectedCategory);
    }

    // Filter by Search Query
    if (STATE.searchQuery.trim() !== "") {
      const query = STATE.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort Products
    switch (STATE.sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recommended":
      default:
        // Default catalog order
        break;
    }

    return list;
  }

  // ================= Render Product Cards =================
  function renderProducts() {
    if (!DOM.productsGrid) return;
    const filtered = getFilteredProducts();

    if (DOM.resultsCount) {
      DOM.resultsCount.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;
    }

    if (filtered.length === 0) {
      DOM.productsGrid.innerHTML = `
        <div class="empty-catalog">
          <div class="empty-icon">🔍</div>
          <h3>No matching groceries found</h3>
          <p>We couldn't find anything matching "${STATE.searchQuery}". Try searching for apples, milk, bread, or explore other categories.</p>
          <button class="btn-add-cart" id="resetSearchBtn" style="margin: 0 auto;">View All Products</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetSearchBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          STATE.searchQuery = "";
          STATE.selectedCategory = "all";
          if (DOM.searchInput) DOM.searchInput.value = "";
          if (DOM.searchClear) DOM.searchClear.style.display = "none";
          renderCategories();
          renderProducts();
        });
      }
      return;
    }

    DOM.productsGrid.innerHTML = filtered.map(product => {
      const isWishlisted = STATE.wishlist.has(product.id);
      const inCartQty = STATE.cart[product.id] || 0;
      const discountPercent = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

      // Badges
      let badgeClass = "";
      if (product.badge.toLowerCase().includes("sale")) badgeClass = "sale";
      else if (product.badge.toLowerCase().includes("organic")) badgeClass = "organic";
      else if (product.badge.toLowerCase().includes("bestseller")) badgeClass = "bestseller";

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="card-image-wrap" data-action="quick-view">
            <span class="card-badge ${badgeClass}">${product.badge}</span>
            <button class="card-wishlist-btn ${isWishlisted ? "active" : ""}" 
                    data-action="toggle-wishlist" 
                    title="${isWishlisted ? "Remove from wishlist" : "Save to wishlist"}">
              ${isWishlisted ? "❤️" : "🤍"}
            </button>
            <img src="${product.image}" 
                 alt="${product.name}" 
                 loading="lazy" 
                 onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';"/>
          </div>

          <div class="card-body">
            <div class="card-category-rating">
              <span class="card-category">${product.categoryName}</span>
              <span class="card-rating">
                <span class="star">★</span> ${product.rating} <span style="font-weight: 400; color: #94a3b8;">(${product.reviewsCount})</span>
              </span>
            </div>

            <h3 class="card-title" data-action="quick-view">${product.name}</h3>
            <div class="card-unit">${product.unit}</div>

            <div class="card-footer">
              <div class="card-pricing">
                <span class="current-price">$${product.price.toFixed(2)}</span>
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ""}
              </div>

              <div class="card-action-wrap">
                ${
                  inCartQty > 0
                    ? `
                    <div class="qty-stepper">
                      <button data-action="decrease-cart" title="Decrease quantity">−</button>
                      <span class="qty-val">${inCartQty}</span>
                      <button data-action="increase-cart" title="Increase quantity">+</button>
                    </div>
                  `
                    : `
                    <button class="btn-add-cart" data-action="add-cart">
                      <span>+</span> Add
                    </button>
                  `
                }
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachProductCardEvents();
  }

  // ================= Attach Card Event Listeners =================
  function attachProductCardEvents() {
    DOM.productsGrid.querySelectorAll(".product-card").forEach(card => {
      const productId = card.getAttribute("data-product-id");
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) return;

      // Click for Quick View
      card.querySelectorAll('[data-action="quick-view"]').forEach(el => {
        el.addEventListener("click", () => openQuickViewModal(product));
      });

      // Wishlist Toggle
      const wishlistBtn = card.querySelector('[data-action="toggle-wishlist"]');
      if (wishlistBtn) {
        wishlistBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleWishlist(product);
        });
      }

      // Add to Cart
      const addBtn = card.querySelector('[data-action="add-cart"]');
      if (addBtn) {
        addBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          addToCart(product.id, 1);
        });
      }

      // Steppers inside card
      const decBtn = card.querySelector('[data-action="decrease-cart"]');
      if (decBtn) {
        decBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          updateCartQuantity(product.id, -1);
        });
      }

      const incBtn = card.querySelector('[data-action="increase-cart"]');
      if (incBtn) {
        incBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          updateCartQuantity(product.id, 1);
        });
      }
    });
  }

  // ================= Wishlist Logic =================
  function toggleWishlist(product) {
    if (STATE.wishlist.has(product.id)) {
      STATE.wishlist.delete(product.id);
      showToast(`Removed "${product.name}" from wishlist`, "info", "🤍");
    } else {
      STATE.wishlist.add(product.id);
      showToast(`Added "${product.name}" to wishlist!`, "success", "❤️");
    }

    saveToStorage("freshcart_wishlist", Array.from(STATE.wishlist));
    updateWishlistBadge();
    renderProducts();
  }

  function updateWishlistBadge() {
    if (DOM.wishlistBadge) {
      DOM.wishlistBadge.textContent = STATE.wishlist.size;
    }
  }

  // ================= Cart Calculations & Drawer =================
  function addToCart(productId, qty = 1) {
    const current = STATE.cart[productId] || 0;
    STATE.cart[productId] = current + qty;
    saveToStorage("freshcart_cart", STATE.cart);

    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      showToast(`Added ${qty}x "${product.name}" to cart!`, "success", "🛒");
    }

    updateCartUI();
    renderProducts();
  }

  function updateCartQuantity(productId, delta) {
    const current = STATE.cart[productId] || 0;
    const newQty = current + delta;

    if (newQty <= 0) {
      delete STATE.cart[productId];
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        showToast(`Removed "${product.name}" from cart`, "info", "🗑️");
      }
    } else {
      STATE.cart[productId] = newQty;
    }

    saveToStorage("freshcart_cart", STATE.cart);
    updateCartUI();
    renderProducts();
  }

  function removeProductFromCart(productId) {
    delete STATE.cart[productId];
    saveToStorage("freshcart_cart", STATE.cart);
    updateCartUI();
    renderProducts();
    showToast("Item removed from cart", "info", "🗑️");
  }

  function calculateCartTotals() {
    let subtotal = 0;
    let itemCount = 0;

    Object.entries(STATE.cart).forEach(([id, qty]) => {
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        subtotal += product.price * qty;
        itemCount += qty;
      }
    });

    // Discount Calculation
    let discount = 0;
    if (STATE.activePromo && subtotal > 0) {
      if (STATE.activePromo.discountPercent) {
        discount = (subtotal * STATE.activePromo.discountPercent) / 100;
      } else if (STATE.activePromo.discountFixed) {
        discount = Math.min(STATE.activePromo.discountFixed, subtotal);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    // Free delivery threshold: $35.00
    const deliveryThreshold = 35.00;
    const delivery = (subtotal === 0 || subtotal >= deliveryThreshold) ? 0.00 : 3.99;

    // Estimated Tax: 5%
    const tax = subtotal > 0 ? (discountedSubtotal * 0.05) : 0;
    const total = discountedSubtotal + delivery + tax;

    return {
      subtotal,
      discount,
      delivery,
      tax,
      total,
      itemCount,
      deliveryThreshold
    };
  }

  function updateCartUI() {
    const totals = calculateCartTotals();

    // Update Header Badges
    if (DOM.cartBadge) DOM.cartBadge.textContent = totals.itemCount;
    if (DOM.cartDrawerCount) DOM.cartDrawerCount.textContent = totals.itemCount;
    if (DOM.cartPricePreview) DOM.cartPricePreview.textContent = `$${totals.total.toFixed(2)}`;

    // Update Free Shipping Bar
    if (DOM.shippingFill && DOM.shippingText) {
      if (totals.subtotal >= totals.deliveryThreshold) {
        DOM.shippingFill.style.width = "100%";
        DOM.shippingText.innerHTML = `<span>🎉 You've unlocked <strong>FREE Delivery!</strong></span>`;
      } else {
        const remaining = (totals.deliveryThreshold - totals.subtotal).toFixed(2);
        const percent = Math.min(100, (totals.subtotal / totals.deliveryThreshold) * 100);
        DOM.shippingFill.style.width = `${percent}%`;
        DOM.shippingText.innerHTML = `<span>Add <strong>$${remaining}</strong> more for FREE delivery</span><span>$${totals.deliveryThreshold}</span>`;
      }
    }

    // Render Cart Item Rows
    const cartEntries = Object.entries(STATE.cart);
    if (cartEntries.length === 0) {
      if (DOM.cartEmptyView) DOM.cartEmptyView.style.display = "flex";
      if (DOM.cartItemsList) DOM.cartItemsList.style.display = "none";
      if (DOM.cartFooter) DOM.cartFooter.style.display = "none";
    } else {
      if (DOM.cartEmptyView) DOM.cartEmptyView.style.display = "none";
      if (DOM.cartItemsList) DOM.cartItemsList.style.display = "flex";
      if (DOM.cartFooter) DOM.cartFooter.style.display = "block";

      DOM.cartItemsList.innerHTML = cartEntries.map(([id, qty]) => {
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return "";
        const itemTotal = (product.price * qty).toFixed(2);

        return `
          <div class="cart-item-row">
            <img class="cart-item-img" src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80';"/>
            <div class="cart-item-info">
              <div class="cart-item-name" title="${product.name}">${product.name}</div>
              <div class="cart-item-unit">${product.unit} · $${product.price.toFixed(2)}/each</div>
              <div class="cart-item-bottom">
                <div class="qty-stepper" style="padding: 1px 3px;">
                  <button data-cart-dec="${product.id}">−</button>
                  <span class="qty-val" style="font-size: 0.85rem;">${qty}</span>
                  <button data-cart-inc="${product.id}">+</button>
                </div>
                <div style="display: flex; align-items: center;">
                  <span class="cart-item-price">$${itemTotal}</span>
                  <button class="cart-item-remove-btn" data-cart-remove="${product.id}" title="Remove item">✕</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Attach cart item buttons
      DOM.cartItemsList.querySelectorAll("[data-cart-dec]").forEach(btn => {
        btn.addEventListener("click", () => updateCartQuantity(btn.getAttribute("data-cart-dec"), -1));
      });
      DOM.cartItemsList.querySelectorAll("[data-cart-inc]").forEach(btn => {
        btn.addEventListener("click", () => updateCartQuantity(btn.getAttribute("data-cart-inc"), 1));
      });
      DOM.cartItemsList.querySelectorAll("[data-cart-remove]").forEach(btn => {
        btn.addEventListener("click", () => removeProductFromCart(btn.getAttribute("data-cart-remove")));
      });
    }

    // Update Bill Breakdown
    if (DOM.subtotalPrice) DOM.subtotalPrice.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (DOM.deliveryFee) {
      DOM.deliveryFee.textContent = totals.delivery === 0 ? "FREE" : `$${totals.delivery.toFixed(2)}`;
    }
    if (DOM.taxAmount) DOM.taxAmount.textContent = `$${totals.tax.toFixed(2)}`;
    if (DOM.finalTotalPrice) DOM.finalTotalPrice.textContent = `$${totals.total.toFixed(2)}`;

    // Promo UI
    if (DOM.discountRow && DOM.discountAmount) {
      if (totals.discount > 0) {
        DOM.discountRow.style.display = "flex";
        DOM.discountAmount.textContent = `-$${totals.discount.toFixed(2)}`;
      } else {
        DOM.discountRow.style.display = "none";
      }
    }

    if (DOM.promoActiveTag && DOM.promoActiveText) {
      if (STATE.activePromo) {
        DOM.promoActiveTag.style.display = "flex";
        DOM.promoActiveText.textContent = `Applied "${STATE.activePromo.code}" (${STATE.activePromo.description})`;
      } else {
        DOM.promoActiveTag.style.display = "none";
      }
    }
  }

  // ================= Open / Close Drawers & Modals =================
  function openCartDrawer() {
    updateCartUI();
    DOM.drawerBackdrop.classList.add("active");
    DOM.cartDrawer.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCartDrawer() {
    DOM.drawerBackdrop.classList.remove("active");
    DOM.cartDrawer.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Quick View Modal
  function openQuickViewModal(product) {
    if (!DOM.quickViewModal || !DOM.quickViewCard) return;

    const inCartQty = STATE.cart[product.id] || 0;
    const isWishlisted = STATE.wishlist.has(product.id);

    DOM.quickViewCard.innerHTML = `
      <button class="modal-close-btn" id="modalCloseInner">✕</button>
      <div class="quick-view-content">
        <div class="qv-image-wrap">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';"/>
        </div>
        <div class="qv-details">
          <div class="card-category-rating" style="margin-bottom: 8px;">
            <span class="card-category">${product.categoryName}</span>
            <span class="card-rating"><span class="star">★</span> ${product.rating} (${product.reviewsCount} reviews)</span>
          </div>
          <h2 class="qv-title">${product.name}</h2>
          <div class="qv-unit">${product.unit} · <span style="color: #10b981; font-weight: 600;">In Stock (${product.stockCount} units)</span></div>

          <div class="qv-price-box">
            <span class="qv-price">$${product.price.toFixed(2)}</span>
            ${product.originalPrice ? `<span class="qv-orig-price">$${product.originalPrice.toFixed(2)}</span>` : ""}
          </div>

          <p class="qv-description">${product.description}</p>

          ${
            product.nutrition
              ? `
              <div class="nutrition-grid">
                ${Object.entries(product.nutrition).map(([k, v]) => `
                  <div class="nutrition-item">
                    <span>${k.toUpperCase()}:</span>
                    <span>${v}</span>
                  </div>
                `).join("")}
              </div>
            `
              : ""
          }

          <div style="display: flex; gap: 12px; margin-top: auto;">
            <button class="btn-checkout" id="qvAddToCartBtn" style="flex: 1;">
              🛒 Add to Cart (${inCartQty > 0 ? inCartQty + " already in cart" : "New"})
            </button>
            <button class="action-btn wishlist-btn ${isWishlisted ? "active" : ""}" id="qvWishlistBtn" style="padding: 0 16px;">
              ${isWishlisted ? "❤️ Saved" : "🤍 Wishlist"}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("modalCloseInner").addEventListener("click", () => {
      DOM.quickViewModal.classList.remove("active");
    });

    document.getElementById("qvAddToCartBtn").addEventListener("click", () => {
      addToCart(product.id, 1);
      DOM.quickViewModal.classList.remove("active");
    });

    document.getElementById("qvWishlistBtn").addEventListener("click", () => {
      toggleWishlist(product);
      DOM.quickViewModal.classList.remove("active");
    });

    DOM.quickViewModal.classList.add("active");
  }

  // Wishlist Modal View
  function openWishlistModal() {
    if (!DOM.wishlistModal || !DOM.wishlistItemsList) return;
    const wishlistItems = Array.from(STATE.wishlist).map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

    if (wishlistItems.length === 0) {
      DOM.wishlistItemsList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 3rem; margin-bottom: 10px;">🤍</div>
          <h3 style="font-weight: 700; margin-bottom: 6px;">Your Wishlist is Empty</h3>
          <p style="color: #64748b; font-size: 0.9rem;">Tap the heart icon on any product to save it here for later!</p>
        </div>
      `;
    } else {
      DOM.wishlistItemsList.innerHTML = wishlistItems.map(p => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #e2e8f0; gap: 12px;">
          <img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.95rem;">${p.name}</div>
            <div style="color: #10b981; font-weight: 700;">$${p.price.toFixed(2)} <span style="font-size: 0.8rem; color: #64748b; font-weight: 400;">(${p.unit})</span></div>
          </div>
          <button class="btn-add-cart" data-wishlist-cart="${p.id}" style="padding: 6px 14px;">+ Add to Cart</button>
          <button style="color: #ef4444; font-size: 1.1rem; padding: 4px;" data-wishlist-remove="${p.id}">✕</button>
        </div>
      `).join("");

      DOM.wishlistItemsList.querySelectorAll("[data-wishlist-cart]").forEach(btn => {
        btn.addEventListener("click", () => {
          addToCart(btn.getAttribute("data-wishlist-cart"), 1);
          showToast("Added item to cart!", "success", "🛒");
        });
      });

      DOM.wishlistItemsList.querySelectorAll("[data-wishlist-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-wishlist-remove");
          STATE.wishlist.delete(id);
          saveToStorage("freshcart_wishlist", Array.from(STATE.wishlist));
          updateWishlistBadge();
          renderProducts();
          openWishlistModal();
        });
      });
    }

    DOM.wishlistModal.classList.add("active");
  }

  // Checkout Flow
  function openCheckoutModal() {
    const totals = calculateCartTotals();
    if (totals.itemCount === 0) {
      showToast("Your cart is empty! Add items first.", "info", "🛒");
      return;
    }
    closeCartDrawer();
    DOM.checkoutModal.classList.add("active");
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const totals = calculateCartTotals();
    const fullName = document.getElementById("custName")?.value || "Valued Customer";
    const address = document.getElementById("custAddress")?.value || "Your Address";
    const slot = document.getElementById("deliverySlot")?.value || "ASAP (30-45 mins)";

    const orderId = "FC-" + Math.floor(100000 + Math.random() * 900000);
    const orderItems = Object.entries(STATE.cart).map(([id, qty]) => {
      const p = PRODUCTS.find(prod => prod.id === id);
      return p ? { name: p.name, qty, price: p.price, total: (p.price * qty).toFixed(2) } : null;
    }).filter(Boolean);

    // Populate Success Receipt
    if (DOM.orderReceiptBox) {
      DOM.orderReceiptBox.innerHTML = `
        <div class="receipt-meta-row"><span>Order ID:</span><strong>#${orderId}</strong></div>
        <div class="receipt-meta-row"><span>Customer:</span><strong>${fullName}</strong></div>
        <div class="receipt-meta-row"><span>Delivery Address:</span><strong>${address}</strong></div>
        <div class="receipt-meta-row"><span>Delivery Slot:</span><strong>${slot}</strong></div>
        <div class="receipt-meta-row"><span>Payment Method:</span><strong>${STATE.selectedPaymentMethod.toUpperCase()}</strong></div>
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0;"/>
        <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.85rem;">Items Ordered:</div>
        ${orderItems.map(item => `
          <div class="receipt-meta-row" style="font-size: 0.8rem; color: #475569;">
            <span>${item.qty}x ${item.name}</span>
            <span>$${item.total}</span>
          </div>
        `).join("")}
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0;"/>
        <div class="receipt-meta-row" style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">
          <span>Paid Total:</span>
          <span>$${totals.total.toFixed(2)}</span>
        </div>
      `;
    }

    // Reset Cart
    STATE.cart = {};
    STATE.activePromo = null;
    saveToStorage("freshcart_cart", {});
    updateCartUI();
    renderProducts();

    DOM.checkoutModal.classList.remove("active");
    DOM.orderSuccessModal.classList.add("active");
    showToast("Order placed successfully! 🎉", "success", "✅");
  }

  // ================= Event Listeners Initialization =================
  function initEventListeners() {
    // Search Input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener("input", (e) => {
        STATE.searchQuery = e.target.value;
        if (DOM.searchClear) {
          DOM.searchClear.style.display = STATE.searchQuery ? "block" : "none";
        }
        renderProducts();
      });
    }

    if (DOM.searchClear) {
      DOM.searchClear.addEventListener("click", () => {
        STATE.searchQuery = "";
        DOM.searchInput.value = "";
        DOM.searchClear.style.display = "none";
        renderProducts();
      });
    }

    // Sort Dropdown
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener("change", (e) => {
        STATE.sortBy = e.target.value;
        renderProducts();
      });
    }

    // Cart Drawer Open / Close
    if (DOM.cartBtn) DOM.cartBtn.addEventListener("click", openCartDrawer);
    if (DOM.closeCartBtn) DOM.closeCartBtn.addEventListener("click", closeCartDrawer);
    if (DOM.drawerBackdrop) DOM.drawerBackdrop.addEventListener("click", closeCartDrawer);

    // Wishlist Drawer / Modal
    if (DOM.wishlistBtn) DOM.wishlistBtn.addEventListener("click", openWishlistModal);
    if (DOM.closeWishlistBtn) DOM.closeWishlistBtn.addEventListener("click", () => DOM.wishlistModal.classList.remove("active"));

    // Modal close backdrops
    [DOM.quickViewModal, DOM.checkoutModal, DOM.orderSuccessModal, DOM.wishlistModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });
    });

    if (DOM.closeCheckoutBtn) {
      DOM.closeCheckoutBtn.addEventListener("click", () => DOM.checkoutModal.classList.remove("active"));
    }
    if (DOM.closeSuccessBtn) {
      DOM.closeSuccessBtn.addEventListener("click", () => DOM.orderSuccessModal.classList.remove("active"));
    }
    if (DOM.continueShoppingBtn) {
      DOM.continueShoppingBtn.addEventListener("click", () => DOM.orderSuccessModal.classList.remove("active"));
    }
    if (DOM.printReceiptBtn) {
      DOM.printReceiptBtn.addEventListener("click", () => window.print());
    }

    // Promo Code Application
    if (DOM.applyPromoBtn && DOM.promoInput) {
      DOM.applyPromoBtn.addEventListener("click", () => {
        const code = DOM.promoInput.value.trim().toUpperCase();
        if (PROMO_CODES[code]) {
          STATE.activePromo = { code, ...PROMO_CODES[code] };
          DOM.promoInput.value = "";
          updateCartUI();
          showToast(`Coupon "${code}" applied!`, "success", "🏷️");
        } else {
          showToast("Invalid promo code. Try 'FRESH20' or 'GROCERY10'!", "info", "❌");
        }
      });
    }

    if (DOM.removePromoBtn) {
      DOM.removePromoBtn.addEventListener("click", () => {
        STATE.activePromo = null;
        updateCartUI();
        showToast("Coupon removed", "info", "🏷️");
      });
    }

    // Payment Selection Options in Checkout
    document.querySelectorAll(".payment-card-option").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".payment-card-option").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        STATE.selectedPaymentMethod = card.getAttribute("data-method");
      });
    });

    // Checkout Form Submit
    if (DOM.checkoutBtn) DOM.checkoutBtn.addEventListener("click", openCheckoutModal);
    if (DOM.checkoutForm) DOM.checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  }

  // ================= Initialize App =================
  function init() {
    renderCategories();
    renderProducts();
    updateCartUI();
    updateWishlistBadge();
    initEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

function initPopup() {
  // Toggle the mobile navigation menu.
  const toggleMenu = document.querySelector(".toggle-menu");
  if (toggleMenu) {
    toggleMenu.addEventListener("click", () => {
      const nav = toggleMenu.closest(".container, .universal-container")?.querySelector("nav");
      if (!nav) return;
      const isOpen = nav.classList.toggle("open");
      toggleMenu.setAttribute("aria-expanded", String(isOpen));
      toggleMenu.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Toggle navigation menu");
    });

    // Close the menu when a link is clicked
    document.querySelectorAll("nav a").forEach((link) => {
      link.addEventListener("click", () => {
        const nav = toggleMenu.closest(".container, .universal-container")?.querySelector("nav");
        nav?.classList.remove("open");
        toggleMenu.setAttribute("aria-expanded", "false");
        toggleMenu.setAttribute("aria-label", "Toggle navigation menu");
      });
    });

    // Close the menu with Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const nav = toggleMenu.closest(".container, .universal-container")?.querySelector("nav");
        nav?.classList.remove("open");
        toggleMenu.setAttribute("aria-expanded", "false");
        toggleMenu.setAttribute("aria-label", "Toggle navigation menu");
      }
    });
  }

  const eventForm = document.querySelector(".event-booking-form");
  if (eventForm) {
    const captcha = eventForm.querySelector(".g-recaptcha");
    const captchaError = eventForm.querySelector(".recaptcha-error");

    eventForm.addEventListener("submit", (event) => {
      const response = eventForm.querySelector('[name="g-recaptcha-response"]');
      event.preventDefault();
      captchaError.classList.toggle("is-success", Boolean(response?.value));
      if (response?.value) {
        captchaError.textContent = "Test response received. Verify this token on your server before processing event bookings.";
      } else {
        captchaError.textContent = "Please complete the reCAPTCHA verification before submitting.";
        captcha?.focus();
      }
    });
  }

  const popup = document.getElementById("popup");
  const closeBtn = document.querySelector(".close");
  const buttons = document.querySelectorAll(".subscribeBtn");
  const form = document.querySelector("#popup form");

  let lastTrigger = null;
  const closePopup = () => {
    if (!popup) return;
    popup.style.display = "none";
    popup.setAttribute("aria-hidden", "true");
    lastTrigger?.focus();
  };

  if (popup && closeBtn) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        lastTrigger = btn;
        popup.style.display = "flex";
        popup.setAttribute("aria-hidden", "false");
        form?.querySelector("input")?.focus();
      });
    });

    closeBtn.addEventListener("click", () => {
      closePopup();
    });

    window.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (popup.style.display !== "flex") return;

      if (event.key === "Escape") {
        closePopup();
        return;
      }

      if (event.key === "Tab") {
        const focusable = popup.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Thank you for subscribing!");
      closePopup();
      form.reset();
    });
  }

  const cartToast = document.getElementById('cart-toast');
  const showCartToast = (message = "Added to cart") => {
    if (!cartToast) return;
    cartToast.textContent = message;
    cartToast.classList.add('show');
    cartToast.style.display = 'block';
    cartToast.style.opacity = '1';
    cartToast.style.transform = 'translateY(0)';
    clearTimeout(showCartToast.timer);
    showCartToast.timer = setTimeout(() => {
      cartToast.classList.remove('show');
      cartToast.style.display = 'none';
      cartToast.style.opacity = '0';
      cartToast.style.transform = 'translateY(20px)';
    }, 1800);
  };

  const cartItems = document.getElementById("cart-items");
  const cartStorageKey = "bean-boutique-cart";
  const parsePrice = (priceText) => {
    const match = priceText.trim().match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return null;

    const amount = Number(match[2].replace(/,/g, ""));
    return Number.isFinite(amount) ? { prefix: match[1], amount, suffix: match[3] } : null;
  };

  const createQuantityControl = (name, quantity) => {
    const control = document.createElement("div");
    control.className = "quantity-control";

    const decreaseButton = document.createElement("button");
    decreaseButton.className = "quantity-button";
    decreaseButton.type = "button";
    decreaseButton.dataset.quantityAction = "decrease";
    decreaseButton.setAttribute("aria-label", `Decrease ${name} quantity`);
    decreaseButton.textContent = "−";

    const quantityValue = document.createElement("span");
    quantityValue.className = "quantity-value";
    quantityValue.setAttribute("aria-live", "polite");
    quantityValue.textContent = String(quantity);

    const increaseButton = document.createElement("button");
    increaseButton.className = "quantity-button";
    increaseButton.type = "button";
    increaseButton.dataset.quantityAction = "increase";
    increaseButton.setAttribute("aria-label", `Increase ${name} quantity`);
    increaseButton.textContent = "+";

    control.append(decreaseButton, quantityValue, increaseButton);
    return control;
  };

  const readCart = () => {
    try {
      const storedCart = localStorage.getItem(cartStorageKey);
      if (storedCart === null) return null;

      const parsedCart = JSON.parse(storedCart);
      if (!Array.isArray(parsedCart) || !parsedCart.every((item) =>
        item &&
        typeof item.name === "string" &&
        typeof item.priceText === "string" &&
        parsePrice(item.priceText) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )) {
        console.error("Unable to load the cart because its saved data is invalid.");
        return [];
      }
      return parsedCart;
    } catch (error) {
      console.error("Unable to read the saved cart.", error);
      return [];
    }
  };

  let cart = readCart();
  const hasStoredCart = cart !== null;
  if (cart === null) {
    cart = cartItems
      ? Array.from(cartItems.rows, (row) => {
        const name = row.cells[0]?.textContent.trim();
        const priceText = row.cells[1]?.textContent.trim();
        const quantity = Number(row.querySelector(".quantity-value")?.textContent);
        if (!name || !priceText || !parsePrice(priceText) || !Number.isInteger(quantity) || quantity < 1) {
          console.error("Unable to initialize the cart from invalid item data.");
          return null;
        }
        return { name, priceText, quantity };
      }).filter(Boolean)
      : [];
  }

  const saveCart = () => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
      console.error("Unable to save the cart.", error);
    }
  };

  const renderCart = () => {
    if (!cartItems) return;
    cartItems.replaceChildren();
    cart.forEach((item, index) => {
      const price = parsePrice(item.priceText);
      if (!price) {
        console.error("Unable to display a cart item with an invalid price.");
        return;
      }

      const row = cartItems.insertRow();
      row.dataset.cartItemIndex = String(index);
      row.insertCell().textContent = item.name;
      row.insertCell().textContent = item.priceText;
      row.insertCell().append(createQuantityControl(item.name, item.quantity));
      row.insertCell().textContent = `${price.prefix}${(price.amount * item.quantity).toFixed(2)}${price.suffix}`;
    });
  };

  if (cartItems) {
    renderCart();
    if (!hasStoredCart) saveCart();
  }

  cartItems?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest("button[data-quantity-action]");
    const row = button?.closest("tr");
    if (!button || !row || !cartItems.contains(button)) return;

    const index = Number(row.dataset.cartItemIndex);
    const item = cart[index];
    if (!item || !Number.isInteger(item.quantity) || item.quantity < 1) {
      console.error("Unable to update a cart item with an invalid quantity.");
      return;
    }

    if (button.dataset.quantityAction === "decrease" && item.quantity === 1) {
      cart.splice(index, 1);
      showCartToast(`${item.name} removed from your order`);
    } else if (button.dataset.quantityAction === "increase" || button.dataset.quantityAction === "decrease") {
      item.quantity += button.dataset.quantityAction === "increase" ? 1 : -1;
      showCartToast(`${item.name} quantity updated`);
    } else {
      return;
    }

    saveCart();
    renderCart();
  });

  document.querySelectorAll(".universal-section button, main article button, .recommendation-card .add-to-cart-button")
    .forEach((button) => {
      if (!button.textContent.trim().toLowerCase().includes("add to cart")) return;

      button.addEventListener("click", () => {
        const card = button.closest(".recommendation-card, .universal-section > div, main article");
        const name = card?.dataset.name || card?.querySelector("h2, h3")?.textContent.trim() ||
          card?.querySelectorAll("p")[1]?.textContent.trim();
        const priceText = card?.dataset.price || card?.querySelector("span")?.textContent.trim() ||
          card?.querySelector("p")?.textContent.trim();
        if (!name || !priceText || !parsePrice(priceText)) {
          console.error("Unable to add a product with invalid name or price data.");
          return;
        }

        const existingItem = cart.find((item) => item.name === name && item.priceText === priceText);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ name, priceText, quantity: 1 });
        }

        saveCart();
        renderCart();
        showCartToast(`${name} added to your order`);
      });
    });

  const checkoutButton = document.getElementById("checkout-button");
  const checkoutStatus = document.getElementById("checkout-status");
  checkoutButton?.addEventListener("click", () => {
    if (checkoutStatus) {
      checkoutStatus.textContent = "Online checkout is not set up yet. Your selected items are ready to review.";
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPopup);
} else {
  initPopup();
}

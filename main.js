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

  const cartButtons = document.querySelectorAll('.universal-section button, .image-container button');
  cartButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.textContent.trim().toLowerCase().includes('add to cart')) {
        showCartToast();
      }
    });
  });

  const cartItems = document.getElementById("cart-items");
  const updateCartRow = (row, quantity) => {
    const quantityValue = row.querySelector(".quantity-value");
    const totalCell = row.cells[3];
    const price = row.cells[1].textContent.trim().match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!quantityValue || !totalCell || !price) {
      console.error("Unable to update a cart item with invalid quantity or price data.");
      return false;
    }

    const unitPrice = Number(price[2].replace(/,/g, ""));
    if (!Number.isFinite(unitPrice)) {
      console.error("Unable to update a cart item with an invalid price.");
      return false;
    }

    quantityValue.textContent = String(quantity);
    totalCell.textContent = `${price[1]}${(unitPrice * quantity).toFixed(2)}${price[3]}`;
    return true;
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

  cartItems?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest("button[data-quantity-action]");
    const row = button?.closest("tr");
    if (!button || !row || !cartItems.contains(button)) return;

    const quantity = Number(row.querySelector(".quantity-value")?.textContent);
    if (!Number.isInteger(quantity) || quantity < 1) {
      console.error("Unable to update a cart item with an invalid quantity.");
      return;
    }

    const name = row.cells[0]?.textContent.trim() || "Item";
    if (button.dataset.quantityAction === "decrease" && quantity === 1) {
      row.remove();
      showCartToast(`${name} removed from your order`);
      return;
    }

    const newQuantity = quantity + (button.dataset.quantityAction === "increase" ? 1 : -1);
    if (updateCartRow(row, newQuantity)) {
      showCartToast(`${name} quantity updated`);
    }
  });

  document.querySelectorAll(".recommendation-card .add-to-cart-button").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".recommendation-card");
      const name = card?.dataset.name;
      const priceText = card?.dataset.price;
      if (!cartItems || !name || !priceText) return;

      const price = Number(priceText.replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(price)) return;

      const existingRow = Array.from(cartItems.rows).find(
        (row) => row.cells[0]?.textContent.trim() === name
      );
      if (existingRow) {
        const quantity = Number(existingRow.querySelector(".quantity-value")?.textContent) + 1;
        updateCartRow(existingRow, quantity);
      } else {
        const row = cartItems.insertRow();
        row.insertCell().textContent = name;
        row.insertCell().textContent = `$${price.toFixed(2)}`;
        row.insertCell().append(createQuantityControl(name, 1));
        row.insertCell().textContent = `$${price.toFixed(2)}`;
      }

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

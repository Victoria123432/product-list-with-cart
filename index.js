const cartContent = document.querySelector(".cart-content");
const cartCounter = document.querySelector(".cart h4 span");
const totalCounter = document.querySelector(".total-order-price span");
const confirmOrderButton = document.getElementById("confirm-order");
const modal = document.querySelector(".modal");
const modalOverlay = document.querySelector(".modal-overlay");
const startNewOrderButton = document.getElementById("new-order");

let cartItems = [];

async function loadProducts() {
  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    const container = document.querySelector(".products");

    products.forEach((product) => {
      const productHTML = `
          <div class="item">
            <div class="item-img-wrapper"> 
              <img src="${product.image.desktop}" alt="${product.name}" />
              <button class="add-to-cart" data-id="${product.name}">
                <img src="assets/images/icon-add-to-cart.svg" alt="Add to Cart Icon" />
                Add to Cart
              </button>
              <div class="adding-to-cart">
                <div class="less"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg></div>
                <p>1</p>
                <div class="more"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg></div>
              </div>
            </div>

            <div class="description">
              <div class="category">${product.category}</div>
              <div class="name">${product.name}</div>
              <div class="price">$<span>${product.price.toFixed(2)}</span></div>
            </div>
          </div>
        `;
      container.innerHTML += productHTML;
    });
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach((button) => {
      button.addEventListener("click", showAddToCart);
    });
    setupQuantityButtons();
  } catch (error) {
    console.error("Error fetching the data:", error);
  }
}

function showAddToCart(event) {
  const button = event.target;
  const productItem = button.closest(".item");
  const addingToCartDiv = productItem.querySelector(".adding-to-cart");
  const productButton = productItem.querySelector(".add-to-cart");
  addingToCartDiv.style.display = "flex";
  productButton.style.display = "none";
  const productName = productItem.querySelector(".name").textContent;
  const productPrice = parseFloat(
    productItem.querySelector(".price span").textContent
  );
  const productImg = productItem.querySelector("img");

  addToCart({
    name: productName,
    price: productPrice,
    quantity: 1,
  });

  productImg.classList.add("selected");
}

function addToCart(product) {
  cartItems.push(product);

  updateCart();
}

function updateCart() {
  const addedItemsContainer = document.querySelector(".added-items");
  let totalPrice = 0;

  addedItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartContent.classList.remove("has-items");
  } else {
    cartItems.forEach((item) => {
      const productHTML = `
          <div class="product-cart-info-wrapper">
                    <div class="product-cart-info">
                      <div class="name">${item.name}</div>
                      <div class="description">
                        <div class="num-of-items">x<span>${
                          item.quantity
                        }</span></div>
                        <div class="price-per-1">$ @<span>${
                          item.price
                        }</span></div>
                        <div class="total-price">$<span>${
                          item.quantity * item.price
                        }</span></div>
                      </div>
                    </div>
                    <div class="close-btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        fill="none"
                        viewBox="0 0 10 10"
                      >
                        <path
                          fill="#CAAFA7"
                          d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"
                        />
                      </svg>
                    </div>
  
          `;
      addedItemsContainer.innerHTML += productHTML;
      totalPrice += item.quantity * item.price;
    });

    cartContent.classList.add("has-items");
  }

  cartCounter.textContent = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  totalCounter.textContent = totalPrice;
  removeItem();
}

function setupQuantityButtons() {
  document.querySelectorAll(".adding-to-cart").forEach((element) => {
    const lessButton = element.querySelector(".less");
    const moreButton = element.querySelector(".more");
    const quantityDisplay = element.querySelector("p");
    const addingToCartDiv = element;
    const productButton = element
      .closest(".item")
      .querySelector(".add-to-cart");

    const productName = element
      .closest(".item")
      .querySelector(".name").textContent;

    const productImg = element.closest(".item").querySelector("img");

    lessButton.addEventListener("click", () => {
      const item = cartItems.find((cartItem) => cartItem.name === productName);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        quantityDisplay.textContent = item.quantity;
      } else if (item && item.quantity === 1) {
        cartItems = cartItems.filter(
          (cartItem) => cartItem.name !== productName
        );
        addingToCartDiv.style.display = "none";
        productButton.style.display = "flex";
        productImg.classList.remove("selected");
      }

      updateCart();
    });
    moreButton.addEventListener("click", () => {
      let item = cartItems.find((cartItem) => cartItem.name === productName);

      if (item) {
        item.quantity += 1;
      }

      quantityDisplay.textContent = item.quantity;
      updateCart();
    });
  });
}

function removeItem() {
  const addedItemsContainer = document.querySelector(".added-items");
  addedItemsContainer.querySelectorAll(".close-btn").forEach((closeButton) => {
    closeButton.addEventListener("click", (event) => {
      // Знаходимо відповідний товар у кошику
      const productName = event.target
        .closest(".product-cart-info-wrapper")
        .querySelector(".name").textContent;

      // Видаляємо товар із масиву кошика
      cartItems = cartItems.filter((cartItem) => cartItem.name !== productName);

      // Оновлюємо кошик
      updateCart();

      // Відновлюємо стан товару на сторінці
      const productItem = Array.from(document.querySelectorAll(".item")).find(
        (item) =>
          item.querySelector(".name").textContent.trim() === productName.trim()
      );

      if (productItem) {
        const addingToCartDiv = productItem.querySelector(".adding-to-cart");
        const productButton = productItem.querySelector(".add-to-cart");
        const quantityDisplay = addingToCartDiv.querySelector("p");
        const productImg = productItem.querySelector("img");

        // Приховуємо панель кількості та відновлюємо кнопку додавання
        addingToCartDiv.style.display = "none";
        productButton.style.display = "flex";
        quantityDisplay.textContent = 1;
        productImg.classList.remove("selected");
      }
    });
  });
}
setupQuantityButtons();
loadProducts();

function showModal() {
  modal.classList.add("active");
  modalOverlay.classList.add("active");
}

function hideModal() {
  modal.classList.remove("active");
  modalOverlay.classList.remove("active");
}

confirmOrderButton.addEventListener("click", () => {
  const orderTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  modal.querySelector(".total-order-price span").textContent =
    orderTotal.toFixed(2);

  const productCartInfoWrapper = modal.querySelector(
    ".product-cart-info-wrapper-modal"
  );

  productCartInfoWrapper.innerHTML = "";

  cartItems.forEach((item) => {
    const itemHTML = `
        <div class="product-cart-info">
            <div class="name">${item.name}</div>
            <div class="description-modal">
              <div class="modal-sub-sesc">
                <div class="num-of-items">x<span>${item.quantity}</span></div>
                <div class="price-per-1">$ @<span>${item.price}</span></div>
              </div>
              <div class="total-price">$<span>${
                item.quantity * item.price
              }</span></div>
            </div>
          </div>
  `;
    productCartInfoWrapper.innerHTML += itemHTML;
  });
  showModal();
});

startNewOrderButton.addEventListener("click", hideModal);
modalOverlay.addEventListener("click", hideModal);

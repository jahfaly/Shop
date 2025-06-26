document.addEventListener("DOMContentLoaded", () => {
  const cart = [];
  const cartCount = document.getElementById("cart-count");
  const cartModal = document.getElementById("cart-modal");
  const cartItemsList = document.getElementById("cart-items");
  const closeCartBtn = document.getElementById("close-cart");
  const openCartBtn = document.getElementById("cart-btn");

  const orderForm = document.getElementById("order-form");
  const orderConfirmation = document.getElementById("order-confirmation");
  const orderError = document.getElementById("order-error");

  function sendTelegramMessage(orderData) {
    const TOKEN = '8125099879:AAEDum2IcX2Lr5WnYBejbB9cNS3zDN_RfyM';
    const CHAT_ID = '970400014';

    const message = `
🛒 *Новый заказ!*

👤 Имя: ${orderData.name}
📞 Телефон: ${orderData.phone}
📍 Адрес: ${orderData.address}

🧾 Заказ:
${orderData.items.map(item => `— ${item.title} (${item.price}тг)`).join('\n')}

💰 Итого: ${orderData.total}тг
`;

    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  }

  // Обработчик кнопок "В корзину"
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".bg-white");
      const title = card.querySelector("h3").textContent.trim();
      const priceText = card.querySelector("span").textContent.trim();
      const price = parseInt(priceText.replace(/\D/g, ""));

      cart.push({ title, price });
      cartCount.textContent = cart.length;

      renderCartItems();
    });
  });

  // Открыть корзину
  openCartBtn.addEventListener("click", () => {
    cartModal.classList.remove("hidden");
  });

  // Закрыть корзину
  closeCartBtn.addEventListener("click", () => {
    cartModal.classList.add("hidden");
  });

  // Отправка формы заказа
  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      orderError.textContent = "Корзина пуста. Пожалуйста, добавьте товар перед оформлением заказа.";
      orderError.classList.remove("hidden");
      return;
    }

    orderError.classList.add("hidden");

    const savedItems = [...cart];
    const totalSum = savedItems.reduce((sum, item) => sum + item.price, 0);

    // Список заказанных товаров
    cartItemsList.innerHTML = "";
    savedItems.forEach(item => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center border-b pb-1";
      li.innerHTML = `<span>${item.title} — ${item.price}тг</span>`;
      cartItemsList.appendChild(li);
    });

    const totalLi = document.createElement("li");
    totalLi.className = "font-bold pt-2 text-right";
    totalLi.textContent = `Итого: ${totalSum}тг`;
    cartItemsList.appendChild(totalLi);

    // Получение данных формы
    const formData = new FormData(orderForm);
    const orderData = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      items: savedItems,
      total: totalSum
    };

    // Отправка в Telegram
    sendTelegramMessage(orderData);

    // Очистка корзины
    cart.length = 0;
    cartCount.textContent = 0;

    // Сообщение
    orderConfirmation.textContent = `Спасибо за заказ на сумму ${totalSum}тг! Мы с вами свяжемся.`;
    orderConfirmation.classList.remove("hidden");
    orderForm.classList.add("hidden");
    orderForm.reset();
  });

  // Отображение товаров в корзине
  function renderCartItems() {
    cartItemsList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center border-b pb-1";
      li.innerHTML = `
        <span>${item.title} — ${item.price}тг</span>
        <button class="text-red-500 hover:underline" data-index="${index}">Удалить</button>
      `;
      cartItemsList.appendChild(li);
      total += item.price;
    });

    const totalLi = document.createElement("li");
    totalLi.className = "font-bold pt-2 text-right";
    totalLi.textContent = `Итого: ${total}тг`;
    cartItemsList.appendChild(totalLi);

    cartItemsList.querySelectorAll("button[data-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        cart.splice(index, 1);
        cartCount.textContent = cart.length;
        renderCartItems();
      });
    });

    if (cart.length > 0) {
      orderForm.classList.remove("hidden");
      orderConfirmation.classList.add("hidden");
      orderError.classList.add("hidden");
    }
  }
});

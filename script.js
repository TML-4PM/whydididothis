// script.js
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  initChatbot();
});

/* ===================== Product Loading ===================== */
/**
 * Fetch product data from data/productList.json and dynamically create product elements.
 */
async function loadProducts() {
  try {
    // Fetch the product list from the data folder
    const response = await fetch("data/productList.json");
    if (!response.ok) {
      throw new Error(`Failed to load product data: ${response.status}`);
    }
    const data = await response.json();
    console.log("Product data loaded:", data);
    
    const productListDiv = document.getElementById("product-list");
    productListDiv.innerHTML = "";

    // Check that data.categories exists and is an array
    if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
      productListDiv.innerHTML = "<p>No products available.</p>";
      return;
    }
    
    // Create product elements for each category and item
    data.categories.forEach(category => {
      const categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category");
      categoryDiv.innerHTML = `<h3>${category.category}</h3>`;
      
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach(product => {
          const productDiv = document.createElement("div");
          productDiv.classList.add("product-item");

          // Checkbox for product selection
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = product.sku;
          checkbox.value = product.sku;

          // Label displaying product name and price
          const label = document.createElement("label");
          label.setAttribute("for", product.sku);
          label.textContent = `${product.name} - $${parseFloat(product.price).toFixed(2)}`;

          // Quantity input for product (default: 1)
          const qtyInput = document.createElement("input");
          qtyInput.type = "number";
          qtyInput.id = `qty-${product.sku}`;
          qtyInput.min = "1";
          qtyInput.value = "1";
          qtyInput.classList.add("quantity-input");

          productDiv.appendChild(checkbox);
          productDiv.appendChild(label);
          productDiv.appendChild(qtyInput);
          categoryDiv.appendChild(productDiv);
        });
      } else {
        categoryDiv.innerHTML += "<p>No products in this category.</p>";
      }
      productListDiv.appendChild(categoryDiv);
    });
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("product-list").innerHTML = "<p>Error loading products.</p>";
  }
}

/* ===================== Quote Calculation ===================== */
/**
 * Calculate the final quote based on selected products, service add-ons, and customization options.
 */
function generateQuote() {
  let selectedProducts = [];
  let productTotal = 0;

  // Process each checked product
  const checkboxes = document.querySelectorAll("#product-list input[type='checkbox']:checked");
  checkboxes.forEach(checkbox => {
    const sku = checkbox.value;
    const quantity = parseInt(document.getElementById(`qty-${sku}`).value, 10) || 1;
    const labelText = document.querySelector(`label[for='${sku}']`).textContent;
    // Expected format: "Product Name - $price"
    const [name, priceStr] = labelText.split(" - $");
    const price = parseFloat(priceStr);
    const cost = price * quantity;
    selectedProducts.push({ name, quantity, cost });
    productTotal += cost;
  });

  // Calculate service add-on cost
  let addonTotal = 0;
  const addonIds = ["addon-install", "addon-config", "addon-network"];
  addonIds.forEach(id => {
    const addonElem = document.getElementById(id);
    if (addonElem && addonElem.checked) {
      addonTotal += parseFloat(addonElem.value);
    }
  });

  // Customization values
  const numDevices = parseInt(document.getElementById("num-devices").value, 10) || 1;
  const techHours = parseFloat(document.getElementById("tech-hours").value) || 0;
  const travelCost = parseFloat(document.getElementById("travel-cost").value) || 0;
  const complexity = parseFloat(document.getElementById("complexity").value) || 1;
  const scheduleDate = document.getElementById("schedule-date").value || "Not set";
  const technicianCost = techHours * 50; // Assume $50 per technician hour

  // Final cost calculation:
  // Multiply the product cost by the number of devices and complexity, then add add-on, technician, and travel costs.
  const finalCost = productTotal * numDevices * complexity + addonTotal + technicianCost + travelCost;

  // Build a detailed quote summary
  let summaryLines = selectedProducts.map(
    p => `${p.name} x${p.quantity} - $${p.cost.toFixed(2)}`
  );
  if (addonTotal > 0) summaryLines.push(`Service Add-Ons - $${addonTotal.toFixed(2)}`);
  if (technicianCost > 0) summaryLines.push(`Technician Cost - $${technicianCost.toFixed(2)}`);
  if (travelCost > 0) summaryLines.push(`Travel Cost - $${travelCost.toFixed(2)}`);
  summaryLines.push(`Devices: ${numDevices}`);
  summaryLines.push(`Complexity Multiplier: ${complexity}`);
  summaryLines.push(`Preferred Date: ${scheduleDate}`);
  summaryLines.push(`Final Cost: $${finalCost.toFixed(2)}`);

  // Update the DOM with the quote summary and total
  document.getElementById("quote-summary").innerHTML = summaryLines.join("<br>");
  document.getElementById("total-price").textContent = `Total: $${finalCost.toFixed(2)}`;
}

/* ===================== CSV Export Functionality ===================== */
/**
 * Export the current quote as a CSV file.
 */
function exportCSV() {
  const summaryText = document.getElementById("quote-summary").innerText;
  const totalText = document.getElementById("total-price").innerText;
  const csvContent = `Quote Summary\n${summaryText}\n${totalText}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const csvUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = csvUrl;
  link.download = "quote_summary.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ===================== Print and Email Placeholders ===================== */
/**
 * Trigger print (simulate print-to-PDF).
 */
function printQuote() {
  window.print();
}

/**
 * Simulate sending an email with the quote.
 */
function sendEmail() {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }
  const quoteSummary = document.getElementById("quote-summary").innerText;
  const totalPrice = document.getElementById("total-price").innerText;
  // Placeholder: In production, integrate with an email/PDF service.
  alert(`Email sent to troy.latter@unisys.com with the following details:\n${quoteSummary}\n${totalPrice}\nCustomer Email: ${email}`);
}

/**
 * Simulate fetching a stored quote.
 */
function fetchQuote() {
  const email = document.getElementById("email").value;
  if (email) {
    alert(`Fetching stored quote for ${email}...`);
  } else {
    alert("Please enter a valid email address.");
  }
}

/**
 * Simulate job scheduling.
 */
function scheduleJob() {
  const scheduleDate = document.getElementById("schedule-date").value;
  if (scheduleDate) {
    alert(`Job scheduled on ${scheduleDate}. A confirmation email will be sent.`);
  } else {
    alert("Please select a date for installation.");
  }
}

/* ===================== Chatbot Functionality ===================== */
function initChatbot() {
  const chatbot = document.getElementById("chatbot");
  chatbot.classList.add("chatbot-closed");
}

function toggleChatbot() {
  document.getElementById("chatbot").classList.toggle("chatbot-closed");
}

function sendChatMessage() {
  const input = document.getElementById("chatbot-input");
  const message = input.value.trim();
  if (!message) return;
  appendChatMessage("You", message);
  input.value = "";
  setTimeout(() => {
    const response = getChatbotResponse(message);
    appendChatMessage("Chatbot", response);
  }, 500);
}

function appendChatMessage(sender, message) {
  const messagesDiv = document.getElementById("chatbot-messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message");
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getChatbotResponse(input) {
  input = input.toLowerCase();
  if (input.includes("product")) return "We offer a range of laptops, monitors, and peripherals.";
  if (input.includes("price")) return "Our pricing is dynamic and based on several factors including quantity and add-ons.";
  return "I'm here to help! Could you please provide more details?";
}

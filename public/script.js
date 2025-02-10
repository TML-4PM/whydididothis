document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  initChatbot();
});

// Load products from the JSON file and render them
async function loadProducts() {
  try {
    const response = await fetch("data/productList.json");
    if (!response.ok) throw new Error("Failed to fetch product data");
    const data = await response.json();
    console.log("Product data loaded:", data);

    const productListDiv = document.getElementById("product-list");
    productListDiv.innerHTML = "";

    data.categories.forEach((category) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category");
      categoryDiv.innerHTML = `<h3>${category.category}</h3>`;

      category.items.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product-item");

        // Checkbox for selection
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = product.sku;
        checkbox.value = product.sku;

        // Label with product name and price
        const label = document.createElement("label");
        label.setAttribute("for", product.sku);
        label.textContent = `${product.name} - $${parseFloat(product.price).toFixed(2)}`;

        // Quantity input
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
      productListDiv.appendChild(categoryDiv);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// Generate a quote based on selected products, add-ons, and customization inputs
function generateQuote() {
  let selectedProducts = [];
  let productTotal = 0;

  document.querySelectorAll("#product-list input[type='checkbox']:checked").forEach((checkbox) => {
    const sku = checkbox.value;
    const quantity = parseInt(document.getElementById(`qty-${sku}`).value) || 1;
    const labelText = document.querySelector(`label[for='${sku}']`).textContent;
    const [name, priceText] = labelText.split(" - $");
    const price = parseFloat(priceText);
    const cost = price * quantity;
    selectedProducts.push({ name, quantity, cost });
    productTotal += cost;
  });

  // Calculate add-on cost
  let addonCost = 0;
  const addonIds = ["addon-install", "addon-config", "addon-network"];
  addonIds.forEach((id) => {
    const addonElem = document.getElementById(id);
    if (addonElem && addonElem.checked) {
      addonCost += parseFloat(addonElem.value);
    }
  });

  // Get customization options
  const numDevices = parseInt(document.getElementById("num-devices").value) || 1;
  const techHours = parseFloat(document.getElementById("tech-hours").value) || 0;
  const travelCost = parseFloat(document.getElementById("travel-cost").value) || 0;
  const complexity = parseFloat(document.getElementById("complexity").value) || 1;
  const scheduleDate = document.getElementById("schedule-date").value || "Not set";
  const technicianCost = techHours * 50; // Assume $50 per hour

  // Final cost calculation
  const finalCost = productTotal * numDevices * complexity + addonCost + technicianCost + travelCost;

  // Build summary
  let summaryLines = selectedProducts.map(
    (p) => `${p.name} x${p.quantity} - $${p.cost.toFixed(2)}`
  );
  if (addonCost > 0) summaryLines.push(`Service Add-Ons - $${addonCost.toFixed(2)}`);
  if (technicianCost > 0) summaryLines.push(`Technician Cost - $${technicianCost.toFixed(2)}`);
  if (travelCost > 0) summaryLines.push(`Travel Cost - $${travelCost.toFixed(2)}`);
  summaryLines.push(`Devices: ${numDevices}`);
  summaryLines.push(`Complexity Multiplier: ${complexity}`);
  summaryLines.push(`Preferred Date: ${scheduleDate}`);
  summaryLines.push(`Final Cost: $${finalCost.toFixed(2)}`);

  document.getElementById("quote-summary").innerHTML = summaryLines.join("<br>");
  document.getElementById("total-price").textContent = `Total: $${finalCost.toFixed(2)}`;
}

// Simulate print-to-PDF functionality (here, using window.print as a placeholder)
function printQuote() {
  window.print();
}

// Export the current quote as CSV and trigger download
function exportCSV() {
  const summaryDiv = document.getElementById("quote-summary").innerText;
  const totalPriceText = document.getElementById("total-price").textContent;
  const csvContent = "data:text/csv;charset=utf-8," + 
    "Quote Summary\n" + summaryDiv + "\n" + totalPriceText;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "quote_summary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Simulate sending an email with PDF attachment and full details
function sendEmail() {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }
  // Gather quote details
  const quoteSummary = document.getElementById("quote-summary").innerText;
  const totalPrice = document.getElementById("total-price").textContent;
  // Here you would integrate with a backend to generate a PDF and send the email.
  // For now, we simulate with an alert.
  alert(`Email sent to troy.latter@unisys.com with the following details:\n${quoteSummary}\n${totalPrice}\nCustomer Email: ${email}`);
}

// Placeholder: simulate fetching a saved quote based on email
function fetchQuote() {
  const email = document.getElementById("email").value;
  if (email) {
    alert(`Fetching stored quote for ${email}...`);
  } else {
    alert("Please enter a valid email address.");
  }
}

// Placeholder: simulate scheduling a job with calendar integration
function scheduleJob() {
  const scheduleDate = document.getElementById("schedule-date").value;
  if (scheduleDate) {
    alert(`Job scheduled on ${scheduleDate}. A confirmation email will be sent.`);
  } else {
    alert("Please select a date for installation.");
  }
}

/* Chatbot functionality */
function initChatbot() {
  // Initialize chatbot UI state
  const chatbotDiv = document.getElementById("chatbot");
  chatbotDiv.classList.add("chatbot-closed");
}

function toggleChatbot() {
  const chatbotDiv = document.getElementById("chatbot");
  chatbotDiv.classList.toggle("chatbot-closed");
}

function sendChatMessage() {
  const input = document.getElementById("chatbot-input");
  const message = input.value.trim();
  if (!message) return;
  appendChatMessage("You", message);
  input.value = "";
  // Simulate chatbot response after 500ms
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
  // Simple static responses for demonstration
  if (input.toLowerCase().includes("product")) {
    return "We offer a wide range of products including laptops, monitors, and accessories.";
  }
  if (input.toLowerCase().includes("price")) {
    return "Our pricing is dynamic and based on multiple factors such as quantity, add-ons, and complexity.";
  }
  return "I'm here to help! Please provide more details about your query.";
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  initChatbot();
});

// Load products from the JSON file and inject into the product list section
async function loadProducts() {
  try {
    const response = await fetch("data/productList.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Loaded product data:", data);
    const productListDiv = document.getElementById("product-list");
    productListDiv.innerHTML = "";

    if (!data.categories || data.categories.length === 0) {
      productListDiv.innerHTML = "<p>No products available.</p>";
      return;
    }

    data.categories.forEach((category) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category");
      categoryDiv.innerHTML = `<h3>${category.category}</h3>`;

      if (category.items && category.items.length > 0) {
        category.items.forEach((product) => {
          const productDiv = document.createElement("div");
          productDiv.classList.add("product-item");

          // Checkbox for product selection
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

// Generate quote by calculating product costs, add-ons, and customization inputs
function generateQuote() {
  let selectedProducts = [];
  let productTotal = 0;

  document.querySelectorAll("#product-list input[type='checkbox']:checked").forEach((checkbox) => {
    const sku = checkbox.value;
    const quantity = parseInt(document.getElementById(`qty-${sku}`).value) || 1;
    const labelText = document.querySelector(`label[for='${sku}']`).textContent;
    // Expect label format "Product Name - $price"
    const [name, priceText] = labelText.split(" - $");
    const price = parseFloat(priceText);
    const cost = price * quantity;
    selectedProducts.push({ name, quantity, cost });
    productTotal += cost;
  });

  // Add-on cost from service add-ons
  let addonTotal = 0;
  ["addon-install", "addon-config", "addon-network"].forEach((id) => {
    const addonElem = document.getElementById(id);
    if (addonElem && addonElem.checked) {
      addonTotal += parseFloat(addonElem.value);
    }
  });

  // Customization options
  const numDevices = parseInt(document.getElementById("num-devices").value) || 1;
  const techHours = parseFloat(document.getElementById("tech-hours").value) || 0;
  const travelCost = parseFloat(document.getElementById("travel-cost").value) || 0;
  const complexity = parseFloat(document.getElementById("complexity").value) || 1;
  const scheduleDate = document.getElementById("schedule-date").value || "Not set";
  const technicianCost = techHours * 50; // $50/hour assumed

  // Final cost calculation
  const finalCost = productTotal * numDevices * complexity + addonTotal + technicianCost + travelCost;

  // Build quote summary
  let summaryLines = selectedProducts.map(
    (p) => `${p.name} x${p.quantity} - $${p.cost.toFixed(2)}`
  );
  if (addonTotal > 0) summaryLines.push(`Service Add-Ons - $${addonTotal.toFixed(2)}`);
  if (technicianCost > 0) summaryLines.push(`Technician Cost - $${technicianCost.toFixed(2)}`);
  if (travelCost > 0) summaryLines.push(`Travel Cost - $${travelCost.toFixed(2)}`);
  summaryLines.push(`Devices: ${numDevices}`);
  summaryLines.push(`Complexity Multiplier: ${complexity}`);
  summaryLines.push(`Preferred Date: ${scheduleDate}`);
  summaryLines.push(`Final Cost: $${finalCost.toFixed(2)}`);

  document.getElementById("quote-summary").innerHTML = summaryLines.join("<br>");
  document.getElementById("total-price").textContent = `Total: $${finalCost.toFixed(2)}`;
}

// Print-to-PDF (placeholder using window.print)
function printQuote() {
  window.print();
}

// Export the quote as CSV
function exportCSV() {
  const summaryText = document.getElementById("quote-summary").innerText;
  const totalText = document.getElementById("total-price").textContent;
  const csvData = `Quote Summary\n${summaryText}\n${totalText}`;
  const csvBlob = new Blob([csvData], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);
  const link = document.createElement("a");
  link.href = csvUrl;
  link.download = "quote_summary.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Simulate sending an email with PDF attachment (placeholder)
function sendEmail() {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }
  const quoteSummary = document.getElementById("quote-summary").innerText;
  const totalPrice = document.getElementById("total-price").textContent;
  // In production, integrate with an email API that sends a PDF attachment
  alert(`Email sent to troy.latter@unisys.com with:\n${quoteSummary}\n${totalPrice}\nCustomer Email: ${email}`);
}

// Placeholder for fetching a stored quote by email
function fetchQuote() {
  const email = document.getElementById("email").value;
  if (email) {
    alert(`Fetching stored quote for ${email}...`);
  } else {
    alert("Please enter a valid email address.");
  }
}

// Placeholder for scheduling a job
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
  const chatMessages = document.getElementById("chatbot-messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message");
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getChatbotResponse(input) {
  input = input.toLowerCase();
  if (input.includes("product")) return "We offer a range of laptops, monitors, and peripherals.";
  if (input.includes("price")) return "Our pricing adjusts based on quantity, add-ons, and installation complexity.";
  return "I'm here to help! Could you please provide more details?";
}

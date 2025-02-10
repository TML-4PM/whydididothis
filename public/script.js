document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

// Load products from the JSON file located at public/data/productList.json
async function loadProducts() {
  try {
    const response = await fetch("data/productList.json");
    if (!response.ok) {
      throw new Error("Failed to load product data.");
    }
    const data = await response.json();
    console.log("Product data loaded:", data);
    const productListDiv = document.getElementById("product-list");
    productListDiv.innerHTML = "";

    // For each category, create a section and list products
    data.categories.forEach((category) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category");
      categoryDiv.innerHTML = `<h3>${category.category}</h3>`;

      category.items.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product-item");

        // Checkbox for selecting the product
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = product.sku;
        checkbox.value = product.sku;

        // Label shows product name and price
        const label = document.createElement("label");
        label.setAttribute("for", product.sku);
        label.textContent = `${product.name} - $${parseFloat(product.price).toFixed(2)}`;

        // Quantity input for the product
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

// Generate the quote by summing product, add-on, and customization costs
function generateQuote() {
  let selectedProducts = [];
  let productTotal = 0;

  // Calculate product costs
  document.querySelectorAll("#product-list input[type='checkbox']:checked").forEach((checkbox) => {
    const sku = checkbox.value;
    const quantity = parseInt(document.getElementById(`qty-${sku}`).value) || 1;
    const labelText = document.querySelector(`label[for='${sku}']`).textContent;
    // Expected format: "Product Name - $price"
    const [name, priceText] = labelText.split(" - $");
    const price = parseFloat(priceText);
    const cost = price * quantity;
    selectedProducts.push({ name, quantity, cost });
    productTotal += cost;
  });

  // Calculate add-on costs
  let addonTotal = 0;
  ["addon-install", "addon-config", "addon-network"].forEach((id) => {
    const checkbox = document.getElementById(id);
    if (checkbox && checkbox.checked) {
      addonTotal += parseFloat(checkbox.value);
    }
  });

  // Get customization values
  const numDevices = parseInt(document.getElementById("num-devices").value) || 0;
  const techHours = parseFloat(document.getElementById("tech-hours").value) || 0;
  const travelCost = parseFloat(document.getElementById("travel-cost").value) || 0;
  const complexity = parseFloat(document.getElementById("complexity").value) || 1;
  // Assume a technician hourly rate of $50
  const technicianCost = techHours * 50;
  // For demonstration, we assume the number of devices multiplies the product cost (if applicable)
  const deviceMultiplier = numDevices;

  // Compute final cost: (products cost * device multiplier * complexity) + add-on + technician + travel
  const finalCost = productTotal * deviceMultiplier * complexity + addonTotal + technicianCost + travelCost;

  // Build the quote summary text
  const summaryLines = selectedProducts.map(
    (p) => `${p.name} x${p.quantity} - $${p.cost.toFixed(2)}`
  );
  if (addonTotal > 0) summaryLines.push(`Service Add-Ons - $${addonTotal.toFixed(2)}`);
  if (technicianCost > 0) summaryLines.push(`Technician Cost - $${technicianCost.toFixed(2)}`);
  if (travelCost > 0) summaryLines.push(`Travel Cost - $${travelCost.toFixed(2)}`);
  summaryLines.push(`Device Multiplier: ${deviceMultiplier}`);
  summaryLines.push(`Complexity Multiplier: ${complexity}`);
  summaryLines.push(`Final Cost: $${finalCost.toFixed(2)}`);

  document.getElementById("quote-summary").innerHTML = summaryLines.join("<br>");
  document.getElementById("total-price").textContent = `Total: $${finalCost.toFixed(2)}`;
}

function printQuote() {
  window.print();
}

function sendEmail() {
  const email = document.getElementById("email").value;
  if (email) {
    // Placeholder for sending email (e.g., via a backend API)
    alert(`Email sent to ${email} with your quote.`);
  } else {
    alert("Please enter a valid email address.");
  }
}

function fetchQuote() {
  const email = document.getElementById("email").value;
  if (email) {
    // Placeholder: You might fetch a stored quote based on the email
    alert(`Fetching quote for ${email}...`);
  } else {
    alert("Please enter a valid email address.");
  }
}

function scheduleJob() {
  // Placeholder: Integrate scheduling (e.g., open a calendar widget)
  alert("Job scheduling feature is under development.");
}

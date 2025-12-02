<script>
/* ===========================
   CART DATA (Bạn chỉnh số tại đây)
   =========================== */
let subtotal = 150;  
let tax = 0;         
let shipping = 12;   
let freeShippingThreshold = 200;

let appliedPromo = null;

/* Promo list */
const promoList = {
  "BOTANICAL10": 0.10,
  "SPRING15": 0.15,
  "FIRST20": 0.20
};

function format(num) {
  return num.toFixed(2);
}

function updateUI() {
  document.getElementById("subtotal").textContent = format(subtotal);
  document.getElementById("tax").textContent = format(tax);

  let discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  document.getElementById("discount-row").style.display = discount > 0 ? "flex" : "none";
  if (discount > 0) {
    document.getElementById("discount-label").textContent =
      `Discount (${appliedPromo.code})`;
    document.getElementById("discount-amount").textContent = format(discount);
  }

  let finalSubtotal = subtotal - discount;
  let shippingCost = finalSubtotal >= freeShippingThreshold ? 0 : shipping;
  document.getElementById("shipping").textContent = format(shippingCost);

  if (shippingCost === 0) {
    document.getElementById("free-shipping-msg").style.display = "none";
  } else {
    let remain = freeShippingThreshold - finalSubtotal;
    document.getElementById("free-shipping-msg").style.display = "block";
    document.getElementById("free-shipping-msg").innerHTML =
      `Add <b>$${format(remain)}</b> more for free shipping!`;
  }

  let total = finalSubtotal + tax + shippingCost;
  document.getElementById("total").textContent = format(total);
}

function applyPromo() {
  let code = document.getElementById("promoInput").value.trim().toUpperCase();
  document.getElementById("promo-error").textContent = "";
  document.getElementById("promo-success").textContent = "";

  if (!code) {
    document.getElementById("promo-error").textContent =
      "Please enter a promo code";
    return;
  }

  if (promoList[code]) {
    appliedPromo = { code, discount: promoList[code] };
    document.getElementById("promo-applied-box").style.display = "block";
    document.getElementById("promo-input-box").style.display = "none";
    document.getElementById("promo-applied-text").textContent =
      `${code} (${promoList[code] * 100}% off)`;
    updateUI();
    return;
  }

  document.getElementById("promo-error").textContent = "Invalid promo code";
}

function removePromo() {
  appliedPromo = null;
  document.getElementById("promo-applied-box").style.display = "none";
  document.getElementById("promo-input-box").style.display = "block";
  updateUI();
}

/* Initial UI */
updateUI();
</script>

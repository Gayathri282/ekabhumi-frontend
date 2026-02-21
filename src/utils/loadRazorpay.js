export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
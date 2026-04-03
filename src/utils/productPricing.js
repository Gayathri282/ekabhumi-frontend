const DEFAULT_DISCOUNT_RATE = 0.16;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundToNearestTen = (value) => Math.max(0, Math.round(value / 10) * 10);

export function getProductPricing(product) {
  const basePrice = toNumber(
    product?.original_price
    ?? product?.selling_price
    ?? product?.compare_at_price
    ?? product?.mrp
    ?? product?.list_price
    ?? product?.price
  );

  const explicitOffer = toNumber(
    product?.offer_price
    ?? product?.sale_price
    ?? product?.discount_price
  );

  const derivedOffer = basePrice > 0
    ? roundToNearestTen(basePrice * (1 - DEFAULT_DISCOUNT_RATE))
    : 0;

  const offerPrice = explicitOffer > 0 && explicitOffer < basePrice
    ? explicitOffer
    : derivedOffer > 0 && derivedOffer < basePrice
      ? derivedOffer
      : basePrice;

  const savings = Math.max(0, basePrice - offerPrice);
  const discountPercent = basePrice > offerPrice && basePrice > 0
    ? Math.round((savings / basePrice) * 100)
    : 0;

  return {
    basePrice,
    offerPrice,
    savings,
    discountPercent,
    hasDiscount: discountPercent > 0,
  };
}

export function formatCurrency(value) {
  return toNumber(value).toLocaleString("en-IN");
}

// === src/services/PricingService.js ===
// Pure functions containing zero DB logic. 100% easily unit-testable.

export const PricingService = {
  /**
   * Calculates the base effective price of an item given its platform discount
   */
  calculateEffectivePrice(basePrice, discountPercentage) {
    const price = Number(basePrice) || 0;
    const discount = Number(discountPercentage) || 0;
    if (discount <= 0) return price;
    return price * (1 - discount / 100);
  },

  /**
   * Distributes a cart-wide coupon discount proportionally across eligible items
   */
  calculateItemDiscountShare(itemTotal, eligibleSubtotal, totalCouponDiscount) {
    if (eligibleSubtotal <= 0) return 0;
    return (itemTotal / eligibleSubtotal) * totalCouponDiscount;
  },

  /**
   * Calculates platform commission, ensuring the platform eats the cost of platform-sponsored coupons.
   */
  calculateCommission(
    itemTotal,
    commissionRate,
    itemDiscountShare,
    couponSponsor,
  ) {
    let commissionCut = itemTotal * (Number(commissionRate) / 100);

    if (couponSponsor === "platform" && itemDiscountShare > 0) {
      commissionCut -= itemDiscountShare;
      if (commissionCut < 0) commissionCut = 0;
    }

    return commissionCut;
  },

  /**
   * Safe calculation of maximum loyalty points applicable
   */
  calculateApplicableLoyaltyPoints(
    availablePoints,
    requestedPoints,
    cartSubtotal,
    couponDiscount,
  ) {
    const safeRequested = Math.max(0, parseInt(requestedPoints) || 0);
    const safeAvailable = parseInt(availablePoints) || 0;
    const maxApplicable = Math.floor(
      Math.max(0, cartSubtotal - couponDiscount),
    );

    return Math.min(safeRequested, safeAvailable, maxApplicable);
  },
};

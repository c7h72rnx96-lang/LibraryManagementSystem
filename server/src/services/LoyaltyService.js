export const LoyaltyService = {
  calculateApplicablePoints(
    availablePoints,
    requestedPoints,
    cartSubtotal,
    couponDiscount,
  ) {
    const safeRequested = Math.max(0, parseInt(requestedPoints) || 0);
    const safeAvailable = parseInt(availablePoints) || 0;

    // Cannot redeem more points than the cart's remaining value
    const maxApplicable = Math.floor(
      Math.max(0, cartSubtotal - couponDiscount),
    );

    return Math.min(safeRequested, safeAvailable, maxApplicable);
  },

  calculatePointsEarned(totalSpent) {
    // 1 point earned for every 100 Rs spent
    return Math.floor(totalSpent / 100);
  },
};

export const CommissionService = {
  calculateSplit(itemTotal, commissionRate, itemDiscountShare, couponSponsor) {
    let platformCut = itemTotal * (Number(commissionRate) / 100);

    // If the platform sponsored the coupon, the platform eats the cost
    if (couponSponsor === "platform" && itemDiscountShare > 0) {
      platformCut -= itemDiscountShare;
      if (platformCut < 0) platformCut = 0; // Platform takes a loss, but doesn't pay out extra
    }

    const sellerEarnings = itemTotal - platformCut;

    return {
      platformCut: Number(platformCut.toFixed(2)),
      sellerEarnings: Number(sellerEarnings.toFixed(2)),
    };
  },
};

import { LoyaltyService } from "../services/LoyaltyService.js";
import { CommissionService } from "../services/CommissionService.js";

describe("Business Logic Services", () => {
  it("Loyalty: Caps redemption to cart value", () => {
    const applied = LoyaltyService.calculateApplicablePoints(
      1000,
      1000,
      500,
      0,
    );
    expect(applied).toBe(500); // Only allowed to use 500 points to cover the 500 subtotal
  });

  it("Commission: Platform eats coupon cost", () => {
    // 1000 item, 10% commission, 200 coupon paid by platform
    const result = CommissionService.calculateSplit(1000, 10, 200, "platform");
    expect(result.sellerEarnings).toBe(1000); // Seller gets full 1000
    expect(result.platformCut).toBe(0); // Platform cut (100) minus coupon cost (200) floors to 0
  });

  it("Commission: Seller eats coupon cost", () => {
    const result = CommissionService.calculateSplit(1000, 10, 200, "seller");
    expect(result.sellerEarnings).toBe(800); // Seller takes the 200 hit
    expect(result.platformCut).toBe(100); // Platform still gets its 100
  });
});

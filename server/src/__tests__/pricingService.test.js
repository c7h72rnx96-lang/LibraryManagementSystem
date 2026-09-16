// === src/__tests__/pricingService.test.js ===
import { PricingService } from "../services/PricingService.js";

describe("PricingService Business Rules", () => {
  it("calculates effective price correctly", () => {
    expect(PricingService.calculateEffectivePrice(100, 20)).toBe(80);
    expect(PricingService.calculateEffectivePrice(500, 0)).toBe(500);
    expect(PricingService.calculateEffectivePrice(500, null)).toBe(500);
  });

  it("distributes coupon discounts proportionally", () => {
    const share = PricingService.calculateItemDiscountShare(400, 1000, 200);
    expect(share).toBe(80); // (400/1000) * 200
  });

  it("deducts platform coupon value from platform commission safely", () => {
    // Platform eats cost
    let commission = PricingService.calculateCommission(100, 10, 5, "platform");
    expect(commission).toBe(5); // (100 * 10%) - 5

    // Protects against negative commission
    let negativeCommission = PricingService.calculateCommission(
      100,
      10,
      15,
      "platform",
    );
    expect(negativeCommission).toBe(0);

    // Seller-sponsored coupon does not affect platform commission
    let sellerSponsorCommission = PricingService.calculateCommission(
      100,
      10,
      5,
      "seller",
    );
    expect(sellerSponsorCommission).toBe(10);
  });
});

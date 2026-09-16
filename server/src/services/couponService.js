// === src/services/couponService.js ===
import { Coupon, Cart, CartItem, Book } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { DISCOUNT_TYPE } from "../constants/appConstants.js";

export const CouponService = {
  isBookEligible(coupon, book) {
    if (coupon.sellerId && book.sellerId !== coupon.sellerId) return false;
    if (coupon.applicableGenreId && book.genreId !== coupon.applicableGenreId)
      return false;
    if (coupon.excludeDiscountedItems && book.discountPercentage > 0)
      return false;
    return true;
  },

  calculateDiscount(coupon, eligibleSubtotal) {
    if (coupon.discountType === DISCOUNT_TYPE.FREE_SHIPPING) return 0;

    if (coupon.discountType === DISCOUNT_TYPE.PERCENTAGE) {
      let discount = (eligibleSubtotal * Number(coupon.discountValue)) / 100;
      if (
        coupon.maxDiscountAmount &&
        discount > Number(coupon.maxDiscountAmount)
      ) {
        return Number(coupon.maxDiscountAmount);
      }
      return discount;
    }

    return Math.min(Number(coupon.discountValue), eligibleSubtotal);
  },

  async validate(code, userId) {
    if (!code) throw new AppError("Coupon code is required", 400);

    const coupon = await Coupon.findOne({
      where: { code: code.trim().toUpperCase(), isActive: true },
    });

    if (!coupon) throw new AppError("Invalid coupon code.", 404);
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new AppError("Coupon has expired.", 400);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached.", 400);
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, include: [Book] }],
    });

    if (!cart || cart.CartItems.length === 0)
      throw new AppError("Cart is empty.", 400);

    let eligibleSubtotal = 0;
    cart.CartItems.forEach((item) => {
      if (this.isBookEligible(coupon, item.Book)) {
        const price =
          item.Book.discountPercentage > 0
            ? Number(item.Book.price) * (1 - item.Book.discountPercentage / 100)
            : Number(item.Book.price);
        eligibleSubtotal += price * item.quantity;
      }
    });

    if (eligibleSubtotal === 0)
      throw new AppError(
        "No items in your cart are eligible for this promo.",
        400,
      );
    if (eligibleSubtotal < Number(coupon.minOrderAmount)) {
      throw new AppError(
        `Add Rs. ${(Number(coupon.minOrderAmount) - eligibleSubtotal).toFixed(2)} more in eligible items!`,
        400,
      );
    }

    const discountAmount =
      this.calculateDiscount(coupon, eligibleSubtotal) ||
      (coupon.discountType === DISCOUNT_TYPE.FREE_SHIPPING ? 100 : 0);

    return {
      valid: true,
      code: coupon.code,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountType: coupon.discountType,
      isStackable: coupon.isStackable,
      sponsor: coupon.sponsor,
      sellerId: coupon.sellerId || null,
    };
  },
};

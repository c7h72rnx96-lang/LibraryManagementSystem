import { Coupon, Order, Cart, CartItem, Book } from "../models/index.js";
import { Op } from "sequelize";

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code)
      return res.status(400).json({ message: "Coupon code is required" });

    const coupon = await Coupon.findOne({
      where: { code: code.trim().toUpperCase(), isActive: true },
    });

    if (!coupon)
      return res.status(404).json({ message: "Invalid coupon code." });
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt))
      return res.status(400).json({ message: "Coupon has expired." });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: "Coupon usage limit reached." });

    if (coupon.isFirstOrderOnly) {
      const pastOrders = await Order.count({ where: { userId } });
      if (pastOrders > 0)
        return res
          .status(400)
          .json({ message: "This code is for first-time buyers only." });
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, include: [Book] }],
    });

    if (!cart || cart.CartItems.length === 0)
      return res.status(400).json({ message: "Cart is empty." });

    let eligibleSubtotal = 0;

    cart.CartItems.forEach((item) => {
      const book = item.Book;
      let isEligible = true;

      if (coupon.sellerId && book.sellerId !== coupon.sellerId)
        isEligible = false;
      if (coupon.applicableGenreId && book.genreId !== coupon.applicableGenreId)
        isEligible = false;
      if (coupon.excludeDiscountedItems && book.discountPercentage > 0)
        isEligible = false;

      if (isEligible) {
        const price =
          book.discountPercentage > 0
            ? Number(book.price) * (1 - book.discountPercentage / 100)
            : Number(book.price);
        eligibleSubtotal += price * item.quantity;
      }
    });

    if (eligibleSubtotal === 0)
      return res
        .status(400)
        .json({
          message: "No items in your cart are eligible for this promo.",
        });

    if (eligibleSubtotal < Number(coupon.minOrderAmount)) {
      const shortfall = Number(coupon.minOrderAmount) - eligibleSubtotal;
      return res
        .status(400)
        .json({
          message: `Add Rs. ${shortfall.toFixed(2)} more in eligible items to unlock this discount!`,
        });
    }

    let discountAmount = 0;
    if (coupon.discountType === "free_shipping") {
      discountAmount = 100;
    } else if (coupon.discountType === "percentage") {
      discountAmount = (eligibleSubtotal * Number(coupon.discountValue)) / 100;
      if (
        coupon.maxDiscountAmount &&
        discountAmount > Number(coupon.maxDiscountAmount)
      ) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), eligibleSubtotal);
    }

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountType: coupon.discountType,
      isStackable: coupon.isStackable,
      sponsor: coupon.sponsor,
      sellerId: coupon.sellerId || null,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ message: "Error validating coupon." });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      expiresAt,
      sponsor,
      isStackable,
      isFirstOrderOnly,
      excludeDiscountedItems,
    } = req.body;

    const existing = await Coupon.findOne({
      where: { code: code.trim().toUpperCase() },
    });
    if (existing)
      return res.status(400).json({ message: "Coupon code already exists." });

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || 100,
      expiresAt: expiresAt || null,
      sponsor: sponsor || "platform",
      isStackable: isStackable || false,
      isFirstOrderOnly: isFirstOrderOnly || false,
      excludeDiscountedItems: excludeDiscountedItems || false,
      sellerId: req.user.role === "seller" ? req.user.id : null,
    });

    res.status(201).json({ message: "Coupon created successfully!", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error creating coupon." });
  }
};

export const generateBulkCoupons = async (req, res) => {
  try {
    const {
      prefix,
      count,
      discountType,
      discountValue,
      minOrderAmount,
      isFirstOrderOnly,
    } = req.body;

    const couponsToCreate = [];
    for (let i = 0; i < count; i++) {
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      couponsToCreate.push({
        code: `${prefix.toUpperCase()}-${randomSuffix}`,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        isFirstOrderOnly: isFirstOrderOnly || false,
        usageLimit: 1,
        sponsor: "platform",
        isStackable: false,
        isActive: true,
      });
    }

    await Coupon.bulkCreate(couponsToCreate);
    res
      .status(201)
      .json({ message: `Successfully generated ${count} unique codes.` });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate bulk codes." });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons." });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res
      .status(200)
      .json({
        message: `Coupon ${coupon.isActive ? "Activated" : "Disabled"}!`,
        coupon,
      });
  } catch (error) {
    res.status(500).json({ message: "Error updating coupon." });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    await coupon.destroy();
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coupon." });
  }
};

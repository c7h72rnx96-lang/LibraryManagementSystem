import { Coupon, Order, Cart, CartItem, Book } from "../models/index.js";
import { Op } from "sequelize";

// Inside src/controllers/couponController.js
// Replace ONLY validateCoupon:
import { CouponService } from "../services/couponService.js";

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Notice we do NOT pass `cartSubtotal` from req.body anymore!
    const result = await CouponService.validate(code, userId);

    return res.status(200).json(result);
  } catch (error) {
    // Pass the error to our new Global Error Handler
    next(error);
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
    res.status(200).json({
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

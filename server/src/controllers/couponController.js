import { Coupon } from "../models/index.js";
import { Op } from "sequelize";

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartSubtotal } = req.body;

    if (!code)
      return res.status(400).json({ message: "Coupon code is required" });

    const coupon = await Coupon.findOne({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code." });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: "Coupon has expired." });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached." });
    }

    if (Number(cartSubtotal) < Number(coupon.minOrderAmount)) {
      return res.status(400).json({
        message: `Minimum order of Rs. ${coupon.minOrderAmount} required for this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount =
        (Number(cartSubtotal) * Number(coupon.discountValue)) / 100;
      if (
        coupon.maxDiscountAmount &&
        discountAmount > Number(coupon.maxDiscountAmount)
      ) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(
        Number(coupon.discountValue),
        Number(cartSubtotal),
      );
    }

    return res.status(200).json({
      valid: true,
      code: coupon.code,
      discountAmount: Number(discountAmount.toFixed(2)),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
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
    });

    res.status(201).json({ message: "Coupon created successfully!", coupon });
  } catch (error) {
    res.status(500).json({ message: "Error creating coupon." });
  }
};

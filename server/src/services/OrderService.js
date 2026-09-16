import {
  Cart,
  CartItem,
  Book,
  Order,
  OrderItem,
  User,
  Coupon,
} from "../models/index.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";
import { PricingService } from "./PricingService.js";
import { CouponService } from "./couponService.js";
import { LoyaltyService } from "./LoyaltyService.js";
import { CommissionService } from "./CommissionService.js";
import { AppError } from "../utils/AppError.js";
import {
  ORDER_STATUS,
  ITEM_STATUS,
  DISCOUNT_TYPE,
  PAYMENT_STATUS,
} from "../constants/appConstants.js";

// Strict State Machine for Order Transitions
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [], // Terminal state
  [ORDER_STATUS.CANCELLED]: [], // Terminal state
};

export const OrderService = {
  async checkout(userId, payload) {
    const transaction = await sequelize.transaction();

    try {
      const {
        fullName,
        phone,
        address,
        city,
        paymentMethod,
        cartItemIds,
        couponCode,
        redeemPoints = 0,
      } = payload;

      if (!cartItemIds || cartItemIds.length === 0)
        throw new AppError("No items selected", 400, "CHECKOUT_EMPTY");

      const cart = await Cart.findOne({
        where: { userId },
        include: [{ model: CartItem }],
        transaction,
      });
      const selectedItems =
        cart?.CartItems?.filter((item) => cartItemIds.includes(item.id)) || [];
      if (selectedItems.length === 0)
        throw new AppError("Items not found", 400, "CHECKOUT_INVALID_ITEMS");

      const bookIds = selectedItems.map((item) => item.bookId).sort();
      const lockedBooks = await Book.findAll({
        where: { id: { [Op.in]: bookIds } },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const bookMap = new Map(lockedBooks.map((b) => [b.id, b]));
      let subtotal = 0;
      let eligibleSubtotal = 0;

      let appliedCoupon = couponCode
        ? await Coupon.findOne({
            where: { code: couponCode.trim().toUpperCase(), isActive: true },
            transaction,
          })
        : null;

      for (const item of selectedItems) {
        const book = bookMap.get(item.bookId);
        if (!book)
          throw new AppError("Book unavailable.", 400, "BOOK_UNAVAILABLE");
        if (book.stock < item.quantity)
          throw new AppError(
            `Insufficient stock for "${book.title}".`,
            400,
            "INSUFFICIENT_STOCK",
          );

        const effectivePrice = PricingService.calculateEffectivePrice(
          book.price,
          book.discountPercentage,
        );
        const lineTotal = effectivePrice * item.quantity;
        subtotal += lineTotal;

        if (
          appliedCoupon &&
          CouponService.isBookEligible(appliedCoupon, book)
        ) {
          eligibleSubtotal += lineTotal;
        }
      }

      let couponDiscount = 0;
      if (
        appliedCoupon &&
        eligibleSubtotal >= Number(appliedCoupon.minOrderAmount)
      ) {
        couponDiscount = CouponService.calculateDiscount(
          appliedCoupon,
          eligibleSubtotal,
        );
        appliedCoupon.usedCount += 1;
        await appliedCoupon.save({ transaction });
      } else {
        appliedCoupon = null;
      }

      const customer = await User.findByPk(userId, { transaction });
      const pointsToRedeem =
        appliedCoupon && !appliedCoupon.isStackable ? 0 : redeemPoints;

      // Delegated to LoyaltyService
      const loyaltyDiscount = LoyaltyService.calculateApplicablePoints(
        customer.loyaltyPoints,
        pointsToRedeem,
        subtotal,
        couponDiscount,
      );
      if (loyaltyDiscount > 0) customer.loyaltyPoints -= loyaltyDiscount;

      let deliveryFee =
        subtotal >= 1000 ||
        appliedCoupon?.discountType === DISCOUNT_TYPE.FREE_SHIPPING
          ? 0
          : 100;
      const grandTotal =
        Math.max(0, subtotal - couponDiscount - loyaltyDiscount) + deliveryFee;

      const order = await Order.create(
        {
          userId,
          totalAmount: subtotal,
          deliveryFee,
          grandTotal,
          fullName,
          phone,
          address,
          city,
          paymentMethod: paymentMethod || "COD",
          paymentStatus:
            paymentMethod === "COD"
              ? PAYMENT_STATUS.PENDING
              : PAYMENT_STATUS.PAID,
          orderStatus: ORDER_STATUS.PROCESSING,
        },
        { transaction },
      );

      let totalLoyaltyPointsEarned = 0;

      for (const item of selectedItems) {
        const book = bookMap.get(item.bookId);
        const effectivePrice = PricingService.calculateEffectivePrice(
          book.price,
          book.discountPercentage,
        );
        let itemTotal = effectivePrice * item.quantity;
        let itemDiscountShare = 0;

        if (
          appliedCoupon &&
          appliedCoupon.discountType !== DISCOUNT_TYPE.FREE_SHIPPING &&
          CouponService.isBookEligible(appliedCoupon, book)
        ) {
          itemDiscountShare = PricingService.calculateItemDiscountShare(
            itemTotal,
            eligibleSubtotal,
            couponDiscount,
          );
        }

        const seller = await User.findByPk(book.sellerId, { transaction });
        const commissionRate = seller ? seller.commissionRate : 10.0;

        // Delegated to CommissionService
        const { platformCut, sellerEarnings } =
          CommissionService.calculateSplit(
            itemTotal,
            commissionRate,
            itemDiscountShare,
            appliedCoupon?.sponsor,
          );

        await OrderItem.create(
          {
            orderId: order.id,
            bookId: book.id,
            sellerId: book.sellerId,
            quantity: item.quantity,
            priceAtPurchase: effectivePrice,
            commissionCut: platformCut,
            sellerEarnings,
            itemStatus: ITEM_STATUS.PENDING,
          },
          { transaction },
        );

        book.stock -= item.quantity;
        await book.save({ transaction });

        totalLoyaltyPointsEarned +=
          LoyaltyService.calculatePointsEarned(itemTotal);
      }

      customer.loyaltyPoints =
        (customer.loyaltyPoints || 0) + totalLoyaltyPointsEarned;
      await customer.save({ transaction });
      await CartItem.destroy({
        where: { id: { [Op.in]: cartItemIds } },
        transaction,
      });

      await transaction.commit();

      return {
        orderId: order.id,
        pointsEarned: totalLoyaltyPointsEarned,
        loyaltyDiscount,
        couponDiscount,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");

    // Strict State Machine Validation
    const allowedNextStates = VALID_TRANSITIONS[order.orderStatus];
    if (!allowedNextStates || !allowedNextStates.includes(newStatus)) {
      throw new AppError(
        `Cannot change order from ${order.orderStatus} to ${newStatus}`,
        400,
        "INVALID_ORDER_TRANSITION",
      );
    }

    if (newStatus === ORDER_STATUS.DELIVERED) {
      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
      });

      for (const item of orderItems) {
        const seller = await User.findByPk(item.sellerId);
        if (seller) {
          seller.walletBalance =
            Number(seller.walletBalance) + Number(item.sellerEarnings);
          await seller.save();
        }
        item.itemStatus = ITEM_STATUS.DELIVERED;
        await item.save();
      }

      if (order.paymentMethod === "COD")
        order.paymentStatus = PAYMENT_STATUS.PAID;
    }

    order.orderStatus = newStatus;
    await order.save();
    return order;
  },
};

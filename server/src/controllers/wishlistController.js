import { Wishlist, Book, Author } from "../models/index.js";

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Book, include: [{ model: Author, attributes: ["name"] }] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const existing = await Wishlist.findOne({ where: { userId, bookId } });

    if (existing) {
      await existing.destroy();
      return res
        .status(200)
        .json({ message: "Removed from wishlist", added: false });
    }

    await Wishlist.create({ userId, bookId });
    res.status(201).json({ message: "Added to wishlist", added: true });
  } catch (error) {
    next(error);
  }
};

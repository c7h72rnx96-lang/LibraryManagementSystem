import { Book, Author, Genre, User } from "./models/index.js";
import { sequelize } from "./config/database.js";
import { Coupon } from "./models/index.js";

const seedBooksData = async () => {
  try {
    console.log("🔥 Connecting to database...");
    await sequelize.authenticate();

    console.log("🌱 Seeding 20 books for showcase...");

    // 1. Fetch both Admin and Seller
    const admin = await User.findOne({ where: { role: "admin" } });
    const seller = await User.findOne({ where: { role: "seller" } });

    if (!admin || !seller) {
      console.log(
        "⚠️ Missing Admin or Seller account. Run your createAdmin script first.",
      );
      process.exit(1);
    }
    // Inside seedBooksData, right before process.exit(0):
    await Coupon.findOrCreate({
      where: { code: "WELCOME10" },
      defaults: {
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscountAmount: 200,
        usageLimit: 1000,
        isActive: true,
      },
    });
    console.log("🎟️ Default Coupon seeded: WELCOME10");

    // 2. Define 20 Books (First 10 for Admin, Last 10 for Seller)
    const booksData = [
      // --- ADMIN'S BOOKS (Platform Official Store) ---
      {
        title: "The Great Gatsby",
        authorName: "F. Scott Fitzgerald",
        genreName: "Classic",
        price: 450,
        stock: 25,
        description: "A portrait of the Jazz Age.",
        owner: admin.id,
      },
      {
        title: "To Kill a Mockingbird",
        authorName: "Harper Lee",
        genreName: "Fiction",
        price: 550,
        stock: 15,
        description: "Storytelling about racial injustice.",
        owner: admin.id,
      },
      {
        title: "1984",
        authorName: "George Orwell",
        genreName: "Sci-Fi",
        price: 500,
        stock: 30,
        description: "A dystopian social science fiction novel.",
        owner: admin.id,
      },
      {
        title: "Sapiens",
        authorName: "Yuval Noah Harari",
        genreName: "Non-Fiction",
        price: 950,
        stock: 10,
        description: "A brief history of humankind.",
        owner: admin.id,
      },
      {
        title: "Dune",
        authorName: "Frank Herbert",
        genreName: "Sci-Fi",
        price: 890,
        stock: 14,
        description: "A sweeping science fiction masterpiece.",
        owner: admin.id,
      },
      {
        title: "Fahrenheit 451",
        authorName: "Ray Bradbury",
        genreName: "Sci-Fi",
        price: 480,
        stock: 22,
        description: "A dystopian novel about book burning.",
        owner: admin.id,
      },
      {
        title: "Brave New World",
        authorName: "Aldous Huxley",
        genreName: "Sci-Fi",
        price: 520,
        stock: 18,
        description: "A futuristic society based on intelligence.",
        owner: admin.id,
      },
      {
        title: "The Catcher in the Rye",
        authorName: "J.D. Salinger",
        genreName: "Fiction",
        price: 420,
        stock: 18,
        description: "A story of teenage alienation.",
        owner: admin.id,
      },
      {
        title: "Animal Farm",
        authorName: "George Orwell",
        genreName: "Classic",
        price: 350,
        stock: 40,
        description: "A satirical allegorical novella.",
        owner: admin.id,
      },
      {
        title: "The Odyssey",
        authorName: "Homer",
        genreName: "Classic",
        price: 600,
        stock: 12,
        description: "An epic poem from ancient Greece.",
        owner: admin.id,
      },

      // --- SELLER'S BOOKS (The Vintage Page) ---
      {
        title: "Atomic Habits",
        authorName: "James Clear",
        genreName: "Self-Help",
        price: 850,
        stock: 50,
        description: "Build good habits & break bad ones.",
        owner: seller.id,
      },
      {
        title: "The Alchemist",
        authorName: "Paulo Coelho",
        genreName: "Adventure",
        price: 480,
        stock: 40,
        description: "Follows a young Andalusian shepherd.",
        owner: seller.id,
      },
      {
        title: "Rich Dad Poor Dad",
        authorName: "Robert Kiyosaki",
        genreName: "Business",
        price: 650,
        stock: 35,
        description: "What the rich teach their kids about money.",
        owner: seller.id,
      },
      {
        title: "Thinking, Fast and Slow",
        authorName: "Daniel Kahneman",
        genreName: "Psychology",
        price: 900,
        stock: 20,
        description: "The two systems that drive the way we think.",
        owner: seller.id,
      },
      {
        title: "The Hobbit",
        authorName: "J.R.R. Tolkien",
        genreName: "Fantasy",
        price: 750,
        stock: 12,
        description: "The adventures of Bilbo Baggins.",
        owner: seller.id,
      },
      {
        title: "Pride and Prejudice",
        authorName: "Jane Austen",
        genreName: "Romance",
        price: 400,
        stock: 20,
        description: "A romantic novel of manners.",
        owner: seller.id,
      },
      {
        title: "The Psychology of Money",
        authorName: "Morgan Housel",
        genreName: "Business",
        price: 700,
        stock: 45,
        description: "Timeless lessons on wealth and greed.",
        owner: seller.id,
      },
      {
        title: "Meditations",
        authorName: "Marcus Aurelius",
        genreName: "Philosophy",
        price: 550,
        stock: 28,
        description: "Stoic philosophy for daily life.",
        owner: seller.id,
      },
      {
        title: "The Power of Habit",
        authorName: "Charles Duhigg",
        genreName: "Self-Help",
        price: 620,
        stock: 30,
        description: "Why we do what we do in life and business.",
        owner: seller.id,
      },
      {
        title: "Deep Work",
        authorName: "Cal Newport",
        genreName: "Productivity",
        price: 680,
        stock: 25,
        description: "Rules for focused success in a distracted world.",
        owner: seller.id,
      },
    ];

    for (const b of booksData) {
      let [author] = await Author.findOrCreate({
        where: { name: b.authorName },
        defaults: { biography: `Renowned author of ${b.title}` },
      });

      let [genre] = await Genre.findOrCreate({
        where: { name: b.genreName },
      });

      const coverImage = `https://placehold.co/400x600/1e293b/a855f7?text=${encodeURIComponent(b.title)}`;

      const existingBook = await Book.findOne({ where: { title: b.title } });
      if (!existingBook) {
        await Book.create({
          title: b.title,
          description: b.description,
          price: b.price,
          stock: b.stock,
          image: coverImage,
          authorId: author.id,
          genreId: genre.id,
          sellerId: b.owner,
        });
        console.log(`✅ Added Book: ${b.title}`);
      }
    }

    console.log("🎉 All 20 Showcase books seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding books:", error);
    process.exit(1);
  }
};

seedBooksData();

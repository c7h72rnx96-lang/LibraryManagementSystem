import "dotenv/config";
import { Book, Author, Genre, sequelize } from "./models/index.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const baseBooks = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    description:
      "A young boy discovers he is a wizard and attends a magical school.",
    image:
      "https://m.media-amazon.com/images/I/81q77Q39nHL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    description: "A planetary duke's son is tasked with ruling a desert world.",
    image:
      "https://m.media-amazon.com/images/I/81ym36dMkcL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    genre: "Business & Finance",
    description:
      "What the rich teach their kids about money that the poor and middle class do not!",
    image:
      "https://m.media-amazon.com/images/I/81bsw6fnUiL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    description:
      "An easy and proven way to build good habits and break bad ones.",
    image:
      "https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian Fiction",
    description: "A totalitarian regime controls every aspect of life.",
    image:
      "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    description:
      "A reluctant hobbit leaves his peaceful home to reclaim a mountain.",
    image:
      "https://m.media-amazon.com/images/I/712cDO7d73L._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic Fiction",
    description:
      "A mysterious millionaire's obsession with a beautiful former lover.",
    image:
      "https://m.media-amazon.com/images/I/81af+MCATTL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic Fiction",
    description: "A lawyer in the Depression-era South defends a black man.",
    image:
      "https://m.media-amazon.com/images/I/81gepf1eMqL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Business & Finance",
    description:
      "Timeless lessons on wealth, greed, and happiness doing well with money.",
    image:
      "https://m.media-amazon.com/images/I/71TRUbziHeL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    description:
      "A lone astronaut must save the earth from disaster in this sci-fi thriller.",
    image:
      "https://m.media-amazon.com/images/I/81577H8eooL._AC_UF1000,1000_QL80_.jpg",
  },
];

const runSeed = async () => {
  try {
    console.log("🌱 Connecting to Neon database...");
    await sequelize.authenticate();

    console.log(
      "☁️ Uploading 10 base images to Cloudinary (this takes about 15 seconds)...",
    );

    // 1. Upload images once and store the secure URLs in a dictionary
    const uploadedImages = {};
    for (const item of baseBooks) {
      const uploadResponse = await cloudinary.uploader.upload(item.image, {
        folder: "library_books",
      });
      uploadedImages[item.title] = uploadResponse.secure_url;
      console.log(`Uploaded cover for: ${item.title}`);
    }

    console.log("📚 Generating 200 books into the database...");

    // 2. Loop 20 times to multiply our 10 books into 200 books
    for (let batch = 1; batch <= 20; batch++) {
      for (const item of baseBooks) {
        const [genre] = await Genre.findOrCreate({
          where: { name: item.genre },
        });
        const [author] = await Author.findOrCreate({
          where: { name: item.author },
        });

        await Book.create({
          title: `${item.title} (Copy ${batch})`, // Makes the titles slightly unique!
          description: item.description,
          stock: Math.floor(Math.random() * 30) + 1, // Randomizes stock between 1 and 30
          image: uploadedImages[item.title], // Re-uses the Cloudinary URL we already generated
          authorId: author.id,
          genreId: genre.id,
        });
      }
    }

    console.log(
      "🎉 SUCCESS: 200 books permanently added to your cloud library!",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeed();

import "dotenv/config";
import { Book, Author, Genre } from "./models/index.js"; // <-- Removed sequelize here
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
    image: "https://covers.openlibrary.org/b/id/7984916-L.jpg",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    description: "A planetary duke's son is tasked with ruling a desert world.",
    image: "https://covers.openlibrary.org/b/id/13155138-L.jpg",
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    genre: "Business & Finance",
    description:
      "What the rich teach their kids about money that the poor and middle class do not!",
    image: "https://covers.openlibrary.org/b/id/10521270-L.jpg",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    description:
      "An easy and proven way to build good habits and break bad ones.",
    image: "https://covers.openlibrary.org/b/id/12836261-L.jpg",
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian Fiction",
    description: "A totalitarian regime controls every aspect of life.",
    image: "https://covers.openlibrary.org/b/id/15321852-L.jpg",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    description:
      "A reluctant hobbit leaves his peaceful home to reclaim a mountain.",
    image: "https://covers.openlibrary.org/b/id/8406786-L.jpg",
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic Fiction",
    description:
      "A mysterious millionaire's obsession with a beautiful former lover.",
    image: "https://covers.openlibrary.org/b/id/8259468-L.jpg",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic Fiction",
    description: "A lawyer in the Depression-era South defends a black man.",
    image: "https://covers.openlibrary.org/b/id/11261314-L.jpg",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Business & Finance",
    description:
      "Timeless lessons on wealth, greed, and happiness doing well with money.",
    image: "https://covers.openlibrary.org/b/id/10702678-L.jpg",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    description:
      "A lone astronaut must save the earth from disaster in this sci-fi thriller.",
    image: "https://covers.openlibrary.org/b/id/12644265-L.jpg",
  },
];

const runSeed = async () => {
  try {
    console.log(
      "☁️ Uploading 10 base images to Cloudinary (this takes about 15 seconds)...",
    );

    // 1. Upload images once and store the secure URLs in a dictionary
    const uploadedImages = {};
    // ... the rest of the file stays exactly the same ...

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

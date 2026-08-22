import { sequelize } from "./config/database.js";
import { Book, Author, Genre } from "./models/index.js";

const booksData = [
  {
    title: "Quiet",
    author: "Susan Cain",
    genre: "Psychology",
    desc: "Understanding introversion and the power of introverts in a world that can't stop talking.",
  },
  {
    title: "Chatter",
    author: "Ethan Kross",
    genre: "Psychology",
    desc: "Controlling the voice in your head and turning inner critics into inner coaches.",
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    genre: "Spirituality",
    desc: "Getting out of your head and finding spiritual enlightenment in the present moment.",
  },
  {
    title: "Don't Believe Everything You Think",
    author: "Joseph Nguyen",
    genre: "Self-Help",
    desc: "Breaking thought loops and finding peace by overcoming overthinking.",
  },
  {
    title: "Stop Overthinking",
    author: "Nick Trenton",
    genre: "Self-Help",
    desc: "23 techniques to relieve stress, stop negative spirals, and declutter your mind.",
  },
  {
    title: "The Introvert Advantage",
    author: "Marti Olsen Laney",
    genre: "Psychology",
    desc: "Living confidently as an introvert in an extrovert world.",
  },
  {
    title: "How to Stop Worrying and Start Living",
    author: "Dale Carnegie",
    genre: "Self-Help",
    desc: "Time-tested methods for conquering chronic worrying and anxiety.",
  },
  {
    title: "The Untethered Soul",
    author: "Michael A. Singer",
    genre: "Spirituality",
    desc: "The journey beyond yourself and detaching from your inner thoughts.",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    desc: "Exploring regret, 'what ifs,' and the infinite choices of life in a magical library.",
  },
  {
    title: "Eleanor Oliphant Is Completely Fine",
    author: "Gail Honeyman",
    genre: "Fiction",
    desc: "A beautiful story about overcoming loneliness, isolation, and finding human connection.",
  },
  {
    title: "The Book of Overthinking",
    author: "Gwendoline Smith",
    genre: "Psychology",
    desc: "Explains rumination and uses cognitive-behavioral approaches to interrupt the cycle.",
  },
  {
    title: "Don't Overthink It",
    author: "Anne Bogel",
    genre: "Self-Help",
    desc: "Make easier decisions, stop second-guessing, and bring more joy to your life.",
  },
  {
    title: "The Worry Trick",
    author: "David Carbonell",
    genre: "Psychology",
    desc: "How your brain tricks you into expecting the worst and how to break free.",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    desc: "A groundbreaking tour of the mind and the two systems that drive the way we think.",
  },
  {
    title: "The Happiness Trap",
    author: "Russ Harris",
    genre: "Psychology",
    desc: "How to stop struggling and start living using Acceptance and Commitment Therapy.",
  },
  {
    title: "Feeling Good",
    author: "David D. Burns",
    genre: "Psychology",
    desc: "The new mood therapy: clinically proven drug-free treatment for depression.",
  },
  {
    title: "Mind Over Mood",
    author: "Dennis Greenberger",
    genre: "Psychology",
    desc: "Change how you feel by changing the way you think using CBT.",
  },
  {
    title: "The Anxiety and Phobia Workbook",
    author: "Edmund J. Bourne",
    genre: "Psychology",
    desc: "A practical step-by-step guide to managing anxiety and phobias.",
  },
  {
    title: "The Gifts of Imperfection",
    author: "Brené Brown",
    genre: "Self-Help",
    desc: "Let go of who you think you're supposed to be and embrace who you are.",
  },
  {
    title: "Radical Acceptance",
    author: "Tara Brach",
    genre: "Spirituality",
    desc: "Embracing your life with the heart of a Buddha and healing from trauma.",
  },
  {
    title: "Solitude: A Return to the Self",
    author: "Anthony Storr",
    genre: "Psychology",
    desc: "Explores how being alone can contribute to creativity and psychological development.",
  },
  {
    title: "Party of One",
    author: "Anneli Rufus",
    genre: "Psychology",
    desc: "The loner's manifesto: why introverts and loners are actually perfectly fine.",
  },
  {
    title: "Introvert Power",
    author: "Laurie Helgoe",
    genre: "Psychology",
    desc: "Why your inner life is your hidden strength.",
  },
  {
    title: "The Secret Lives of Introverts",
    author: "Jenn Granneman",
    genre: "Psychology",
    desc: "Inside our hidden world and why we need it to thrive.",
  },
  {
    title: "The Powerful Purpose of Introverts",
    author: "Holley Gerth",
    genre: "Self-Help",
    desc: "Why the world needs you to be you.",
  },
  {
    title: "Walden",
    author: "Henry David Thoreau",
    genre: "Philosophy",
    desc: "A classic reflection upon simple living in natural surroundings.",
  },
  {
    title: "Letters from a Stoic",
    author: "Seneca",
    genre: "Philosophy",
    desc: "Ancient wisdom on living a virtuous and resilient life.",
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    genre: "Philosophy",
    desc: "The private journals of the Roman Emperor and Stoic philosopher.",
  },
  {
    title: "A Guide to the Good Life",
    author: "William B. Irvine",
    genre: "Philosophy",
    desc: "The ancient art of Stoic joy applied to modern life.",
  },
  {
    title: "The Art of Solitude",
    author: "Stephen Batchelor",
    genre: "Philosophy",
    desc: "A philosophical exploration of the beauty and peace found in solitude.",
  },
  {
    title: "A Man Called Ove",
    author: "Fredrik Backman",
    genre: "Fiction",
    desc: "A heartwarming tale of a grumpy but lovable lonely man finding friendship.",
  },
  {
    title: "The Perks of Being a Wallflower",
    author: "Stephen Chbosky",
    genre: "Fiction",
    desc: "A poignant coming-of-age story of an introverted teenager navigating high school.",
  },
  {
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    genre: "Fiction",
    desc: "A stunning and elegiac novel of first love and the complexities of human emotion.",
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    desc: "The classic novel of teenage angst, alienation, and rebellion.",
  },
  {
    title: "Convenience Store Woman",
    author: "Sayaka Murata",
    genre: "Fiction",
    desc: "A quirky and profound look at societal expectations and finding your own weird path.",
  },
  {
    title: "The Remains of the Day",
    author: "Kazuo Ishiguro",
    genre: "Fiction",
    desc: "A beautiful, tragic story of duty, missed opportunities, and unspoken love.",
  },
  {
    title: "The Stranger",
    author: "Albert Camus",
    genre: "Fiction",
    desc: "A masterpiece of existentialism exploring the absurdity of human life.",
  },
  {
    title: "No Longer Human",
    author: "Osamu Dazai",
    genre: "Fiction",
    desc: "A hauntingly beautiful exploration of a man alienated from society.",
  },
  {
    title: "The Bell Jar",
    author: "Sylvia Plath",
    genre: "Fiction",
    desc: "A harrowing and deeply personal descent into mental illness.",
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    genre: "Philosophy",
    desc: "A psychiatrist's memoir of the Holocaust and his theory of finding meaning in suffering.",
  },
  {
    title: "The Courage to Be Disliked",
    author: "Ichiro Kishimi",
    genre: "Philosophy",
    desc: "How to free yourself, change your life, and achieve real happiness.",
  },
  {
    title: "The Daily Stoic",
    author: "Ryan Holiday",
    genre: "Philosophy",
    desc: "366 meditations on wisdom, perseverance, and the art of living.",
  },
  {
    title: "Ego Is the Enemy",
    author: "Ryan Holiday",
    genre: "Philosophy",
    desc: "Master your greatest opponent: your own ego.",
  },
  {
    title: "Amor Fati",
    author: "Michael A. Singer",
    genre: "Philosophy",
    desc: "The stoic mindset of loving your fate and embracing whatever life brings.",
  },
  {
    title: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    genre: "Philosophy",
    desc: "The timeless art of turning trials into triumph.",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    desc: "A magical fable about following your dreams and listening to your heart.",
  },
  {
    title: "Siddhartha",
    author: "Hermann Hesse",
    genre: "Fiction",
    desc: "A classic novel of self-discovery and spiritual awakening in ancient India.",
  },
];

const seedDatabase = async () => {
  try {
    console.log("🔥 Connecting to database...");
    await sequelize.authenticate();

    console.log("🧹 Wiping old books, authors, and genres...");
    await sequelize.query("TRUNCATE TABLE books CASCADE;");
    await sequelize.query("TRUNCATE TABLE authors CASCADE;");
    await sequelize.query("TRUNCATE TABLE genres CASCADE;");

    console.log(
      "📚 Fetching REAL covers from Google Books API... (This might take 10-15 seconds)",
    );

    for (const data of booksData) {
      const [author] = await Author.findOrCreate({
        where: { name: data.author },
      });
      const [genre] = await Genre.findOrCreate({ where: { name: data.genre } });

      const price = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
      const discountPercentage = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
      const stock = Math.floor(Math.random() * 40) + 10;

      // NEW: Smart Image Fetching using Google Books API
      // If a book cover really can't be found, we create a beautiful dark-mode placeholder!
      let image = `https://placehold.co/400x600/1e293b/ffffff?text=${encodeURIComponent(data.title)}`;

      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(data.title)}+inauthor:${encodeURIComponent(data.author)}&maxResults=1`,
        );
        const searchData = await response.json();

        if (
          searchData.items &&
          searchData.items.length > 0 &&
          searchData.items[0].volumeInfo.imageLinks
        ) {
          // Grab the thumbnail, upgrade it to https, and remove the weird curl edge effect Google adds
          let thumb = searchData.items[0].volumeInfo.imageLinks.thumbnail;
          image = thumb.replace("http:", "https:").replace("&edge=curl", "");
        }
      } catch (err) {
        console.log(`⚠️ Using placeholder for: ${data.title}`);
      }

      await Book.create({
        title: data.title,
        description: data.desc,
        price,
        discountPercentage,
        stock,
        image,
        authorId: author.id,
        genreId: genre.id,
      });
    }

    console.log(
      "✅ All books successfully seeded! You can now start your server.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();

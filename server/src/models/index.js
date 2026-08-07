import User from "./User.js";
import Author from "./Author.js";
import Genre from "./Genre.js";
import Book from "./Book.js";

// Relationships

Author.hasMany(Book, {
  foreignKey: "authorId",
});

Book.belongsTo(Author, {
  foreignKey: "authorId",
});

Genre.hasMany(Book, {
  foreignKey: "genreId",
});

Book.belongsTo(Genre, {
  foreignKey: "genreId",
});

export { User, Author, Genre, Book };

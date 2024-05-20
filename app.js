import express from "express";
import fs from "fs";
import { ApolloServer } from 'apollo-server-express';
const app = express();

// Test data for books.
const books = [
    { id: 1, title: "Shamran", releaseYear: 1985, authorId: 1  },
    { id: 2, title: "Øvelser i Mørke", releaseYear: 2024, authorId: 2 },
    { id: 3, title: "Intethvid", releaseYear: 2018, authorId: 3 },
    { id: 4, title: "Akvariet", releaseYear: 2022, authorId: 4 },
];

// Test data for authors.
const authors = [
    { id: 1, name: "Bjarne Reuter" },
    { id: 2, name: "Naja Marie Aidt" },
    { id: 3, name: "Anders Meidahl" },
    { id: 4, name: "Anne Cathrine Bomann" },
];

// Imports the GraphQL schema from the schema.graphql file
const schemaPath = "schema.graphql"
const typeDefs = fs.readFileSync(schemaPath, 'utf8');

// Defines the resolvers
const resolvers = {
    Query: {
        books: () => books,
        book: (_, { id }) => books.find(book => book.id === id),
        authors: () => authors,
        author: (_, { id }) => authors.find(author => author.id === id),
      },
      Mutation: {
        createBook: (_, { authorId, title, releaseYear }) => {
          const book = { id: Date.now().toString(), authorId, title, releaseYear };
          books.push(book);
          return book;
        },
        updateBook: (_, { id, authorId, title, releaseYear }) => {
          const book = books.find(book => book.id === id);
          if (authorId) book.authorId = authorId;
          if (title) book.title = title;
          if (releaseYear) book.releaseYear = releaseYear;
          return book;
        },
        deleteBook: (_, { id }) => {
            const index = books.findIndex(book => book.id === id);
            if (index !== -1) {
              books.splice(index, 1);
              return { message: 'Book deleted successfully' };
            }
            throw new Error('Book not found');
          },
        },
        Book: {
          author: (book) => authors.find(author => author.id === book.authorId),
        },
        Author: {
          books: (author) => books.filter(book => book.authorId === author.id),
        },
};
  
  // Creates a new ApolloServer instance and applies it to the Express app
  const server = new ApolloServer({ typeDefs, resolvers });
  
  // Start the server
  server.start().then(() => {
    // Applies the ApolloServer instance to the Express app
    server.applyMiddleware({ app });
  
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log("Server is running on port", PORT));
  });

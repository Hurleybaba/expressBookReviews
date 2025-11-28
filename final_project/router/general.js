const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  // Register a new user: expect { username, password } in the body
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // check if username already exists
  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
// internal helper endpoint that returns the book database JSON
// provides an async URL so we can demonstrate axios usage in other handlers
public_users.get("/data/books", (req, res) => {
  return res.json(books);
});

public_users.get("/", async function (req, res) {
  // Return the full books list using async axios call to the internal data endpoint
  try {
    const response = await axios.get("http://127.0.0.1:5000/data/books");
    return res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load books", error: err.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get("http://127.0.0.1:5000/data/books");
    const allBooks = response.data || {};
    const book = allBooks[isbn];
    if (!book)
      return res
        .status(404)
        .json({ message: `Book not found for ISBN ${isbn}` });
    return res.send(JSON.stringify(book, null, 4));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch book by ISBN", error: err.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const authorQuery = req.params.author;
  try {
    const response = await axios.get("http://127.0.0.1:5000/data/books");
    const allBooks = response.data || {};
    const keys = Object.keys(allBooks);
    const matches = keys
      .filter(
        (k) =>
          (allBooks[k].author || "").toLowerCase() ===
          (authorQuery || "").toLowerCase()
      )
      .map((k) => ({ isbn: k, ...allBooks[k] }));

    if (matches.length === 0)
      return res
        .status(404)
        .json({ message: `No books found for author '${authorQuery}'` });

    return res.send(JSON.stringify(matches, null, 4));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch books by author", error: err.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const titleQuery = req.params.title;
  try {
    const response = await axios.get("http://127.0.0.1:5000/data/books");
    const allBooks = response.data || {};
    const keys = Object.keys(allBooks);
    const matches = keys
      .filter(
        (k) =>
          (allBooks[k].title || "").toLowerCase() ===
          (titleQuery || "").toLowerCase()
      )
      .map((k) => ({ isbn: k, ...allBooks[k] }));

    if (matches.length === 0)
      return res
        .status(404)
        .json({ message: `No books found for title '${titleQuery}'` });

    return res.send(JSON.stringify(matches, null, 4));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch books by title", error: err.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book not found for ISBN ${isbn}` });
  }
  return res.send(JSON.stringify(book.reviews || {}, null, 4));
});

module.exports.general = public_users;

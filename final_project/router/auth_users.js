const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // A valid username is a non-empty string and not already taken
  if (!username || typeof username !== "string" || username.trim().length === 0)
    return false;
  const existing = users.find((u) => u.username === username);
  return !existing;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  if (!username || !password) return false;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return !!user;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // create JWT and store in session.authorization
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  return res
    .status(200)
    .json({ message: "User successfully logged in", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book)
    return res.status(404).json({ message: `Book not found for ISBN ${isbn}` });
  // determine username from decoded token (set by middleware) or session
  const username =
    (req.user && req.user.username) ||
    (req.session &&
      req.session.authorization &&
      req.session.authorization.username);
  if (!username) return res.status(401).json({ message: "Not authenticated" });
  const { review } = req.body || {};
  if (!review)
    return res
      .status(400)
      .json({ message: "Review text is required in request body" });

  if (!book.reviews) book.reviews = {};
  // add or replace review for the user
  book.reviews[username] = review;

  return res
    .status(200)
    .json({ message: "Review added/updated", reviews: book.reviews });
});

// Delete a book review for the authenticated user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book)
    return res.status(404).json({ message: `Book not found for ISBN ${isbn}` });

  const username =
    (req.user && req.user.username) ||
    (req.session &&
      req.session.authorization &&
      req.session.authorization.username);
  if (!username) return res.status(401).json({ message: "Not authenticated" });

  if (!book.reviews || !book.reviews[username]) {
    return res
      .status(404)
      .json({ message: `No review by '${username}' for ISBN ${isbn}` });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

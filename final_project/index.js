const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  // session-based authentication middleware
  try {
    const sessionAuth = req.session ? req.session.authorization : null;
    if (!sessionAuth) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const token = sessionAuth.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    // verify JWT - secret string "access" is used by the example login flow
    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // Attach decoded info to request for downstream handlers
      req.user = decoded;
      next();
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Authentication failure", error: err.message });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

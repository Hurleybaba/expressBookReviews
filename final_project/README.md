Practice-Project

## Notes

This project includes session-based authentication middleware in `index.js` for paths under `/customer/auth/*`.
The middleware checks `req.session.authorization.accessToken`, verifies it using JWT (secret: `access`), attaches the decoded payload to `req.user` on success, and returns 401/403 responses when authentication fails.

## Public endpoints implemented (router/general.js)

- POST /register -> register a new user (body: username, password)
- GET / -> get full books list
- GET /isbn/:isbn -> get book details by ISBN
- GET /author/:author -> find books by author
- GET /title/:title -> find books by title
- GET /review/:isbn -> get reviews for a book

All list and lookup responses are returned as pretty JSON (using JSON.stringify) for easy reading.

## Authenticated review endpoints (router/auth_users.js)

- PUT /customer/auth/review/:isbn -> add or update a review for the logged-in user (body: { review })
- DELETE /customer/auth/review/:isbn -> delete the logged-in user's review for the book

The authentication middleware uses session to find the JWT at `req.session.authorization.accessToken` and verifies it using JWT secret `access`. After verification, the middleware attaches the decoded payload on `req.user` which the review endpoints use to determine the username performing the action.

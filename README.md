# COMP3123 Assignment 1 — Secure Employee REST API

**Course:** COMP3123, Fall 2026 · **Backend:** Node.js, Express, MongoDB, Mongoose  
**Assignment due:** Sunday, October 18, 2026 at 11:59 PM (no late submissions)  
**Database (exact name):** `comp3123_assignment1`

This project provides a secured JSON REST API for user signup/login and per-user employee management. Employees belong to the authenticated user who created them. Employee routes cannot be used without a valid JWT, and users cannot view/change/delete another user's employees.

> **Important:** This is a source-code project to run, verify, understand, and complete with your own evidence. Real MongoDB, Postman, GitHub, and screenshot results **cannot** be established from a ZIP. Run the API yourself, verify the behavior, and capture evidence before submission.

## 1. Technology and design

- **Runtime:** Node.js 20+ and Express 4; REST/JSON
- **Database:** MongoDB with Mongoose 8, schemas and indexes
- **User login:** username **or** email + password, using `bcryptjs` and signed HS256 JSON Web Tokens (`jsonwebtoken`)
- **Input validation:** `express-validator` before operations; unknown request body fields rejected (including client attempts to assign employee ownership)
- **API security:** `helmet` HTTP response headers; `express-rate-limit` on authentication and general traffic
- **Logging:** `winston` JSON logs written locally to `logs/app.log` and `logs/error.log`
- **Error responses:** centralized handler, consistent JSON structure
- **Developer testing:** native Node test runner + `supertest`; importable Postman v2.1 collection

```text
src/
  app.js                     Express application, Helmet, rate limits, routes, health
  server.js                  startup, config and MongoDB connection
  config/db.js               MongoDB connection with required DB name
  models/User.js             username/email unique, password hashing, timestamps
  models/Employee.js         fields plus required user ObjectId reference
  routes/                    /api/v1/user and /api/v1/emp routers
  controllers/               signup, login, owner-scoped employee CRUD
  validators/                email/password/salary/dates/ObjectId validation
  middleware/                authentication, request logging, error handling, limits
  utils/                     errors, logger, async helper
postman/                     exportable collection (39 checks/requests)
tests/                       automated tests not requiring MongoDB
screenshots/                 put your own evidence here
logs/                        local log folder (generated *.log ignored by Git)
docs/                        screenshot and submission guides
```

## 2. Prerequisites and installation

1. Install **Node.js 20 or later**, **MongoDB Community Server** (or obtain a safe MongoDB Atlas connection), and **Postman**. MongoDB Compass is useful for screenshots.
2. Create a public repository named `YOUR_STUDENT_NUMBER_COMP3123_Assignment1` as instructed. Clone it, then copy this project's files into the working folder (do not include `node_modules`).
3. Open a terminal in the folder containing `package.json` and run:

```powershell
npm install
Copy-Item .env.example .env
```

In your local `.env`, set `JWT_SECRET` to a *new random secret*. You can generate one in PowerShell with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy only the output into `.env` as `JWT_SECRET=...`. **Never upload your `.env` or real secrets to GitHub, D2L screenshots, or chat.**

4. Start MongoDB. If using a local MongoDB service in Windows, open **Services** and start the MongoDB Server service (or use your existing local MongoDB setup). Confirm the MongoDB connection using MongoDB Compass.
5. Ensure the following setting appears in `.env`:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/comp3123_assignment1
```

6. Start the API:

```powershell
npm start
```

In another terminal:

```powershell
curl.exe http://localhost:3000/health
```

Expected: HTTP 200 JSON with `success: true`, `status: "ok"` and, when MongoDB is connected, `database: "connected"`. MongoDB creates the database and collections when documents are first inserted; if Compass doesn't show the database yet, register a test user and refresh.

### Configuration variables

| Variable | Example | Use |
|---|---|---|
| `NODE_ENV` | `development` | environment |
| `PORT` | `3000` | API port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/comp3123_assignment1` | MongoDB connection, not a secret if local-only |
| `JWT_SECRET` | **your own random 32+-character secret** | signs/verifies JWTs; required |
| `JWT_EXPIRES_IN` | `1h` | token duration |
| `AUTH_RATE_LIMIT_MAX` | `30` | login/signup combined maximum per IP per 15 minutes |
| `API_RATE_LIMIT_MAX` | `200` | general API maximum per IP per 15 minutes |

The server explicitly selects `comp3123_assignment1` using Mongoose's `dbName` connection option. Actual credentials must stay in `.env` and not be committed.

## 3. API reference

**Base URL:** `http://localhost:3000`. Employee endpoints require `Authorization: Bearer <jwt>`.

| Method | Route | Success | Action |
|---|---|---|---|
| POST | `/api/v1/user/signup` | **201** | Register a new user |
| POST | `/api/v1/user/login` | **200** | Login by username or email, return JWT |
| GET | `/api/v1/emp/employees` | **200** | List employees owned by current user |
| POST | `/api/v1/emp/employees` | **201** | Create employee under current user |
| GET | `/api/v1/emp/employees/{eid}` | **200** | Retrieve own employee |
| PUT | `/api/v1/emp/employees/{eid}` | **200** | Update own employee (one or more allowed fields) |
| DELETE | `/api/v1/emp/employees?eid=xxx` | **204** | Delete own employee; empty response |
| GET | `/health` | **200** | API and database state |

**Do not change the DELETE URL to `/employees/{eid}` for this assignment.** The required URL has the ID in the `eid` query parameter.

### Request samples (replace placeholders)

**Signup**: `POST /api/v1/user/signup`, `Content-Type: application/json`:

```json
{
  "username": "example_student_a",
  "email": "example.student.a@example.com",
  "password": "YOUR_TEST_PASSWORD_HERE"
}
```

Username: 3–30 letters/numbers/underscores. Email: valid and unique. Password: 8–72 characters with upper/lowercase and a number. **The request example is a placeholder; use a strong, disposable test password locally.** Responses never include the password or its hash.

**Login by username**: `POST /api/v1/user/login`:

```json
{ "username": "example_student_a", "password": "YOUR_TEST_PASSWORD_HERE" }
```

**Login by email**:

```json
{ "email": "example.student.a@example.com", "password": "YOUR_TEST_PASSWORD_HERE" }
```

Successful login returns `data.token`. In Postman, set the employee request's Bearer Token to the returned value or set header `Authorization: Bearer <token>`.

**Create employee**: `POST /api/v1/emp/employees`:

```json
{
  "first_name": "Jordan",
  "last_name": "Testerson",
  "email": "jordan@example.com",
  "position": "Backend Developer",
  "salary": 62000,
  "date_of_joining": "2026-01-15",
  "department": "Engineering"
}
```

All seven fields are required for creation. Salary must be positive; joining date must be valid ISO 8601; other fields are validated for type, format and length. `user`, `created_at`, and `updated_at` are **assigned by the server**; do not send them. `PUT` accepts one or more of these allowed employee fields to update.

### Example responses

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "Jordan",
    "last_name": "Testerson",
    "email": "jordan@example.com",
    "position": "Backend Developer",
    "salary": 62000,
    "date_of_joining": "2026-01-15T00:00:00.000Z",
    "department": "Engineering",
    "user": "507f191e810c19729de860ea",
    "created_at": "2026-10-18T12:00:00.000Z",
    "updated_at": "2026-10-18T12:00:00.000Z"
  }
}
```

This is an *illustrative format*, not a claim of an observed API response. Validations produce errors like:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "salary", "message": "salary must be a positive number", "location": "body" }]
  }
}
```

### Status codes

| Status | Meaning in this project |
|---|---|
| 200 OK | Successful GET, login, update or health check |
| 201 Created | New user or new employee |
| 204 No Content | Successful deletion, **no JSON body** |
| 400 Bad Request | Invalid data, malformed JSON or invalid ObjectId |
| 401 Unauthorized | Wrong login, missing, invalid or expired JWT |
| 403 Forbidden | Valid user trying to access someone else's employee |
| 404 Not Found | No such employee or unsupported route |
| 409 Conflict | Duplicate username or email |
| 429 Too Many Requests | IP exceeded authentication/API request limits |
| 500 Internal Server Error | Unexpected server/database exception; no stack details in response |

## 4. Authentication, ownership and database relationship

- `User.password` is hashed using bcrypt with cost factor **12** in a Mongoose pre-save hook. `select: false` keeps the stored hash out of normal queries, and the `toJSON` transform removes it from responses even on login.
- Login looks up one unique username or email and compares the supplied password using bcrypt. The API signs an HS256 JWT whose subject (`sub`) is the MongoDB user ID. Token expiry comes from `JWT_EXPIRES_IN`.
- Every employee route uses authentication middleware to check the Bearer header, verify the signature/expiry, and confirm the user still exists. Missing, malformed, invalid and expired tokens return **401**.
- Every `Employee` document has a required, immutable `user` ObjectId reference to a `User` and timestamps `created_at`/`updated_at`.
- **Never trust `user` from the request.** The server sets ownership from `req.user.id` after JWT verification.
- Listing and get-by-ID use a database filter `{ user: req.user.id }`. Update/delete use atomic Mongoose operations filtered by both employee ID **and** current user ID. Failed matching operations determine whether the employee exists, returning **403** for another user's employee, otherwise **404**. This meets the assignment's two-user forbidden-access demonstration, though using a generic 404 for other users could avoid revealing whether an ID exists in some production systems.

## 5. Security protections

**Helmet** sets security-focused response headers (including `X-Content-Type-Options: nosniff`). It helps reduce several common browser-related attack surfaces and prevents exposing default Express identification. Check the Postman **Headers** tab on `/health`.

**Rate limiting** protects *both* `POST /api/v1/user/signup` and `POST /api/v1/user/login` with a shared limiter: by default 30 requests per IP over 15 minutes, including unsuccessful authentication attempts. A general rate limiter allows 200 requests per IP over 15 minutes. Exceeding the limit returns **429** with JSON `RATE_LIMITED` and rate-limit response headers. This implementation uses local in-memory counts, appropriate for a single-instance course project but not a distributed production deployment. To test, follow `docs/SCREENSHOT_CHECKLIST.md`: temporarily set `AUTH_RATE_LIMIT_MAX=3`, restart, send four login requests, then restore the normal setting.

**Request validation** checks required values, email patterns, password strength, numeric positive salaries, ISO 8601 joining dates, string lengths, valid MongoDB IDs, and unknown body fields. Express has a 16 KB JSON request-body limit. Duplicate indexes produce 409; malformed JSON produces 400.

**Environment configuration** uses `dotenv` and keeps database configuration/JWT secrets outside tracked code. The server refuses to start with a missing/placeholder or short JWT secret.

## 6. Error handling and local logging

The shared error handler sends predictable JSON and hides internal error details from HTTP clients. Specific errors cover duplicates, invalid credentials, missing/invalid/expired JWT, invalid employee IDs, missing resources, employee ownership failures, validation failures, malformed JSON and unknown routes. Database/server failures produce sanitized 500 responses.

`logs/app.log` receives JSON log records including timestamp, event/message, request HTTP method, path (without query parameters), response status code and elapsed time. It also logs startup, authentication outcomes, validations, forbidden ownership attempts and successful CRUD operations. `logs/error.log` records application errors. **Never log request bodies, passwords, full tokens, JWT signing keys, MongoDB passwords, or Authorization headers.** Generated logs are excluded by `.gitignore`; the `logs/README.md` illustrates how to capture evidence.

## 7. Testing in Postman and Node

### Automated Node tests

```powershell
npm test
```

These fast smoke tests verify health, missing and invalid JWT, signup validation, unknown route JSON errors, invalid JSON, expired tokens, and login credential validation. **They do not replace database-backed tests**, because they deliberately run without a live MongoDB.

### Database-backed Postman test workflow

1. Start MongoDB and `npm start`.
2. In Postman, **Import** `postman/COMP3123_Assignment1.postman_collection.json`.
3. Open the collection **Variables** tab, set `testPassword` to a disposable strong password **locally** (at least eight characters, an uppercase/lowercase letter and a digit), and save. The collection does not contain any real password.
4. With `AUTH_RATE_LIMIT_MAX=30` (or a higher value), run the collection **top to bottom** in Collection Runner. The first user-A signup generates unique test identities for this run. The tests then store the JWTs and employee IDs in collection variables.
5. Inspect the response status codes and the two-user ownership tests. Run **A and B cross-user GET, PUT, DELETE** and confirm **403**. Capture real screenshots.
6. Open MongoDB Compass and inspect `comp3123_assignment1.users` and `.employees` to verify bcrypt password hashes and matching owner ObjectIds. **Take these screenshots before the collection's final DELETE requests** (or create test employees again).
7. Check `logs/app.log`, `/health`, and response security headers. Capture screenshots. Run the separate rate-limit test using the screenshot guide.
8. Export the finalized Postman collection if you modify it. Include it in your submission.

**Warning:** The default login/signup limit and Collection Runner requests share an IP-based rate-limit window. If you just performed manual authentication tests, restart the server or allow the previous 15-minute window to expire before running the full collection. Do not put real credentials in the collection export.

## 8. GitHub and submission

Create a public GitHub repo named exactly `YOUR_STUDENT_NUMBER_COMP3123_Assignment1`, replacing the placeholder with your actual student number. Review/test your files and commit meaningful changes **as you develop and validate them**; do not pretend an instant upload was a semester-long commit history. Example commands:

```powershell
git init
git add .
git commit -m "Set up secure employee API project"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_STUDENT_NUMBER_COMP3123_Assignment1.git
git push -u origin main
```

Use subsequent meaningful commits for changes you personally make, such as testing fixes or documentation improvements. Ensure `git status` never stages `.env`, `node_modules`, tokens or real secrets.

For D2L, submit the **GitHub repository link, project ZIP with `node_modules` and `.env` removed, Postman collection, README, `.env.example`, MongoDB and Postman screenshots, Helmet/rate-limit/health/log evidence, and two-user ownership tests**. Supply **non-sensitive disposable test credentials** for marking through your instructor-approved private submission method, not by committing real credentials. See `docs/SUBMISSION_CHECKLIST.md` and `docs/SCREENSHOT_CHECKLIST.md`.

## 9. How to explain this implementation

Be prepared to explain: JWT signing/verifying and Bearer headers; bcrypt salted password hashes; `User._id` → `Employee.user` relationships; owner-based query filters; why input validation happens before DB writes; Helmet response headers; rate-limit windows and 429; centralized error JSON; log data excluding secrets; the `/health` JSON; and the meaning of each HTTP status code. These topics are specifically listed in the assignment.

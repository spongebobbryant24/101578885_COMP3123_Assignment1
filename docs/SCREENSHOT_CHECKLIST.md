# Screenshot checklist — take these yourself

The assignment requires genuine proof of working API requests and MongoDB data. The project ZIP **does not include any fabricated screenshots**. Save screenshots under `screenshots/` or submit them in a separate evidence ZIP as allowed by D2L.

| File to capture | What the screenshot must show |
|---|---|
| `01-health-200.png` | GET `/health` succeeds, JSON body, HTTP 200 |
| `02-signup-201.png` | POST signup success and HTTP 201, no password in response |
| `03-login-jwt-200.png` | POST login succeeds with token (mask most of the JWT before sharing) |
| `04-emp-create-201.png` | Authenticated POST creates employee with a `user` owner ID |
| `05-emp-list-200.png` | GET list shows only the logged-in user's employees |
| `06-emp-get-id-200.png` | GET own employee by its ID |
| `07-emp-update-200.png` | PUT updates an employee's position/salary |
| `08-emp-delete-204.png` | DELETE by query `?eid=...` returns **204 No Content** |
| `09-validation-400.png` | Missing/invalid employee fields produce 400 JSON errors |
| `10-duplicate-409.png` | Duplicate username/email returns 409 Conflict |
| `11-jwt-missing-401.png` | Protected API without token returns 401 |
| `12-jwt-invalid-401.png` | Invalid JWT returns 401 |
| `13-userB-cannot-get-userA-403.png` | User B's token is rejected when GETting A's employee |
| `14-userB-cannot-update-or-delete-A-403.png` | At least one PUT/DELETE forbidden operation; capture both if possible |
| `15-userA-cannot-get-userB-403.png` | Reverse direction: A cannot read B's employee |
| `16-rate-limit-429.png` | Repeated login requests return 429 Too Many Requests (see instructions below) |
| `17-helmet-headers.png` | Postman Headers tab shows Helmet header e.g. `x-content-type-options: nosniff` |
| `18-logs.png` | `logs/app.log` shows timestamps, paths, status codes and auth/security events |
| `19-mongodb-db.png` | MongoDB Compass database `comp3123_assignment1` |
| `20-mongodb-users.png` | Users collection has 2 test users with bcrypt hashes, NOT plaintext passwords |
| `21-mongodb-employees-owners.png` | Employees collection shows `user` ObjectIds matching the users' `_id` values |
| `22-postman-runner.png` | Collection Runner showing successful tests (optional but useful) |

**Important:** Postman collection Runner deletes the test employees at the end of the workflow. Take MongoDB ownership screenshots **before running the final DELETE requests**, or recreate employees for evidence. Avoid showing unmasked JWTs, real passwords, `.env` contents or private connection strings.

## Rate limiter demonstration

1. Temporarily set `AUTH_RATE_LIMIT_MAX=3` in **your private** `.env` file.
2. Restart with `npm start` to reset the in-memory window.
3. Send `POST /api/v1/user/login` with invalid credentials four times quickly from Postman. Earlier requests return 401 and the fourth should return 429.
4. Screenshot the 429 JSON response; optionally capture the `RateLimit-*` response headers.
5. Restore `AUTH_RATE_LIMIT_MAX=30` and restart **before** running the full collection.

Each rate-limit window is 15 minutes. A restart also clears the in-memory rate-limit counters.

## Expired JWT test (recommended)

1. In your private `.env` temporarily set `JWT_EXPIRES_IN=1s`; restart the API.
2. Login to get a token, allow at least two seconds to pass, then call `GET /api/v1/emp/employees` with that Bearer token.
3. Confirm **401** with `TOKEN_EXPIRED`, take a screenshot if helpful, then restore `JWT_EXPIRES_IN=1h` and restart.


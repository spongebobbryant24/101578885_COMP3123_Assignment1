# D2L submission checklist for COMP3123 Assignment 1

**Due: Sunday, October 18, 2026, 11:59 PM. No late submissions.**

- [ ] Node, MongoDB, Mongoose, Express work locally; database name exactly `comp3123_assignment1`
- [ ] Signup (201), login by username AND email (200), hashed password, JWT returned
- [ ] All five employee CRUD routes work with exact HTTP method, URL and status code
- [ ] User A and User B can each create and list only their own employees
- [ ] Cross-user GET/PUT/DELETE are denied in both directions (403)
- [ ] Validation (400), invalid/missing/expired JWT (401), duplicate accounts (409), missing employees (404)
- [ ] Rate limiting (429) and Helmet header evidenced
- [ ] `/health` (200) screenshot and log file evidence
- [ ] MongoDB screenshots: database, both collections, matching owner ObjectIds, password bcrypt hash
- [ ] Postman collection exported and screenshot/evidence files named clearly
- [ ] GitHub repo public and named `STUDENTNUMBER_COMP3123_Assignment1`
- [ ] Actual Git history reflects meaningful development work; code/docs reviewed
- [ ] README, `.env.example`, `.gitignore`, configuration, source, Postman collection included
- [ ] `node_modules`, `.env`, real passwords, private DB URIs and JWT secrets excluded
- [ ] ZIP contains project source and screenshots (or evidence ZIP if D2L allows)
- [ ] Supply disposable sample test credentials privately for marking, if required
- [ ] GitHub URL and ZIP/evidence items submitted in D2L before deadline

**Example final local folder:** `COMP3123_Assignment1_Backend/` with `src/`, `postman/`, `tests/`, `docs/`, `screenshots/`, `README.md`, `package.json`, `package-lock.json`, `.env.example` and `.gitignore`.

**Safest clean ZIP option after committing the complete submission files and evidence:**

```powershell
# Run from the Git repository folder (after committing source and intended screenshots).
git archive --format=zip --output=../COMP3123_Assignment1_Submission.zip HEAD
```

This includes tracked dotfiles such as `.env.example` and `.gitignore` but excludes ignored `.env` and `node_modules` files, as long as you never committed those secrets. Open the ZIP and verify that all requested screenshot files and the Postman collection are included. You may submit screenshots separately if D2L allows.

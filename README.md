# GoDaddy Domain Management Dashboard

A full-stack dashboard to manage and monitor domains across **multiple GoDaddy accounts** from a single UI.

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend  | Spring Boot 3.5 (Java 21)         |
| Database | MongoDB Atlas                     |
| Auth     | JWT (stateless)                   |
| Security | AES-256 encrypted API keys in DB  |

## Architecture

```
React (Vite) → Spring Boot → MongoDB Atlas
                    ↓
             GoDaddy REST API
         (per account, server-side only)
```

API keys are **never sent to the frontend**. They are encrypted with AES-256 before storage and decrypted only inside the backend service layer when making GoDaddy API calls.

---

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)

---

## Backend Setup

### 1. Create a MongoDB Atlas cluster

1. Sign in at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster (M0 free tier is fine for development)
3. **Database Access** → create a database user with read/write on your database
4. **Network Access** → add your IP (or `0.0.0.0/0` for dev only)
5. **Connect** → choose **Drivers** → copy the connection string

Use a database name such as `godaddy_dashboard` in the URI path:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/godaddy_dashboard?retryWrites=true&w=majority
```

Replace `<password>` with your URL-encoded password if it contains special characters.

### 2. Configure environment variables

Copy `.env.example` and set real values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/godaddy_dashboard?retryWrites=true&w=majority
JWT_SECRET=your-32-char-secret-here-change-me
ENCRYPTION_KEY=exactly-32-characters-key-here!!
ADMIN_PASSWORD=your_admin_password
```

> The `ENCRYPTION_KEY` must be **exactly 32 characters** for AES-256.

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend starts on `http://localhost:8080`.

On first start, an admin user is seeded automatically using `ADMIN_PASSWORD`.

Collections (`users`, `godaddy_accounts`, `domains`) are created automatically on first write.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`. All `/api` requests are proxied to the backend.

---

## Usage

1. Open `http://localhost:5173`
2. Login with `admin` / your `ADMIN_PASSWORD`
3. Go to **Accounts** → **Add Account**
4. Enter your GoDaddy account name, API Key, and API Secret
5. Click **Sync All** on the Dashboard to fetch all domains
6. Domains auto-sync every 24 hours (configurable via `APP_SYNC_INTERVAL_MS`)

---

## API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/auth/login`         | Login, returns JWT                 |
| GET    | `/api/accounts`           | List all accounts (no keys)        |
| POST   | `/api/accounts`           | Add GoDaddy account                |
| DELETE | `/api/accounts/{id}`      | Remove account + its domains       |
| GET    | `/api/domains/all`        | Get all domains (search/filter)    |
| GET    | `/api/domains/stats`      | Dashboard stats                    |
| POST   | `/api/domains/sync`       | Sync all accounts from GoDaddy     |
| POST   | `/api/domains/sync/{id}`  | Sync single account                |
| PATCH  | `/api/domains/{id}/tag`   | Update client tag on a domain      |

---

## Security Notes

- API keys are AES-256 encrypted before being stored in MongoDB
- JWT tokens expire after 24 hours
- All GoDaddy API calls happen server-side — keys never reach the browser
- Use HTTPS in production (reverse proxy via Nginx or AWS ALB)
- Rotate your `JWT_SECRET` and `ENCRYPTION_KEY` if ever exposed
- Restrict Atlas **Network Access** to known IPs in production

---

## GoDaddy API Keys

Get your API keys from: https://developer.godaddy.com/keys

Use **Production** keys (not OTE/test) to see real domains.

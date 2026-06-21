# Nexachain AI — Investment & Referral Platform (MERN)

A full-stack MERN implementation of the technical assessment: investment
tracking, daily ROI distribution, multi-level referral income, and a React
dashboard, built end-to-end with ES Modules (`import`/`export`).

## Tech Stack

- **Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs, node-cron
- **Frontend:** React 18 (Vite), React Router, Recharts, Axios
- **Database:** MongoDB (replica set recommended — see Assumptions)

---

## Project Structure

```
nexachain-platform/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/                      # User, Investment, ReferralIncome, RoiHistory
│   ├── middleware/                  # auth (JWT), errorHandler
│   ├── controllers/                 # auth, investment, dashboard, referral
│   ├── routes/                      # REST route definitions
│   ├── services/                    # roiService.js, referralService.js (business logic)
│   ├── jobs/roiCronJob.js           # node-cron daily ROI scheduler
│   ├── postman_collection.json      # Importable Postman collection
│   └── server.js                    # App entry point
└── frontend/
    └── src/
        ├── api/axios.js             # Axios instance with JWT interceptor
        ├── context/AuthContext.jsx  # Auth state/provider
        ├── pages/                   # Login, Register, Dashboard
        └── components/              # Cards, tables, chart, referral tree
```

---

## 1. Project Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance. **A replica set is required** (even a local
  single-node one) because the ROI service uses MongoDB transactions to
  keep wallet updates and history records consistent. See [Assumptions](#assumptions).

### Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in real values
npm run dev               # nodemon, or `npm start` for plain node
```

The API boots on `http://localhost:5000` and the ROI cron job is
registered automatically on startup.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL if not default
npm run dev
```

The dashboard runs on `http://localhost:5173`.

### Quick local MongoDB replica set (for transactions)

```bash
mongod --replSet rs0 --dbpath ./data --port 27017
# in a separate shell:
mongosh --eval "rs.initiate()"
```

Alternatively, use a free MongoDB Atlas cluster — Atlas clusters are
replica sets by default, so transactions work out of the box.

---

## 2. Environment Variables

### backend/.env

| Variable | Description | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/nexachain` |
| `JWT_SECRET` | Secret used to sign JWTs | long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `REFERRAL_LEVELS` | Number of referral levels to pay out | `5` |
| `REFERRAL_LEVEL_PERCENTAGES` | Comma list, one % per level | `5,3,2,1,1` |
| `ROI_CRON_SCHEDULE` | Cron expression for ROI job | `0 0 * * *` (midnight daily) |

### frontend/.env

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## 3. API Documentation

Full request/response samples are in
[`backend/postman_collection.json`](./backend/postman_collection.json) —
import it directly into Postman. Summary below.

All private routes require header: `Authorization: Bearer <token>`

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a user, optional `referralCode` |
| POST | `/api/auth/login` | Public | Returns JWT + user profile |
| GET | `/api/auth/me` | Private | Current authenticated user |

### Investments
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/investments` | Private | Create an investment (`investmentAmount`, `planName`, `durationInDays`, `dailyRoiPercentage`) |
| GET | `/api/investments?page=&limit=&status=` | Private | Paginated list of the user's investments |

### Dashboard
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Private | Total investments, today's ROI, total ROI, level income, wallet balance |
| GET | `/api/dashboard/roi-history?page=&limit=` | Private | Paginated ROI ledger |
| GET | `/api/dashboard/referral-income-history?page=&limit=` | Private | Paginated referral income ledger |

### Referrals
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/referrals/direct` | Private | Direct (level-1) referrals |
| GET | `/api/referrals/tree` | Private | Full nested referral tree |

---

## 4. Business Logic Notes

### Daily ROI (`services/roiService.js`)
1. The cron job (or a manual trigger) finds all `Active` investments still
   within their `startDate`–`endDate` window.
2. For each investment, ROI = `investmentAmount * dailyRoiPercentage / 100`.
3. A `RoiHistory` record is **inserted first**, inside a MongoDB
   transaction. `RoiHistory` has a **unique compound index on
   `(investment, date)`** — if a record for that investment/day already
   exists, the insert throws `E11000` and the function exits as a no-op.
   This is the core idempotency guarantee: **running the job twice never
   double-credits a wallet**, because the second attempt can never create
   a second history row for the same day.
4. Only after the history row is successfully created does the service
   credit `walletBalance` / `totalRoiEarned` on the user, and trigger
   referral payouts — all inside the same transaction.
5. Investments whose `endDate` has passed are automatically flipped to
   `Completed` before ROI processing runs.

### Referral / Level Income (`services/referralService.js`)
1. Starting from the investing user, the service walks up the
   `referredBy` chain level by level (configurable depth via
   `REFERRAL_LEVELS`).
2. Each ancestor is credited `baseAmount * levelPercentage / 100` (only
   if their `accountStatus` is `Active`).
3. `ReferralIncome` has a **unique compound index on
   `(sourceInvestment, beneficiary, level, date)`** so the same ROI event
   can never pay out a given ancestor twice, even on retries.
4. Income is currently calculated on each day's **ROI payout**, not on
   the original lump-sum investment — see Assumptions below.

### Cron Job (`jobs/roiCronJob.js`)
- Uses `node-cron`, schedule configurable via `ROI_CRON_SCHEDULE`
  (default `0 0 * * *` — every day at 12:00 AM).
- Delegates entirely to `processDailyRoiForAllInvestments()`, the same
  idempotent service function used everywhere else, so manual triggers
  and the scheduled job behave identically.

---

## 5. Assumptions Made During Development

1. **Referral income is paid on daily ROI**, not on the lump-sum
   investment amount, since the brief described "daily ROI" and "level
   income" as two related, ongoing income streams. This is configurable
   via `REFERRAL_LEVEL_PERCENTAGES` and easy to switch to a one-time
   on-investment payout if the business intends that instead.
2. **MongoDB transactions require a replica set.** Standalone
   `mongod` instances don't support `session.withTransaction()`. Local
   dev therefore needs a single-node replica set (one command, see
   setup above) or an Atlas cluster.
3. **Account status gating:** only users with `accountStatus: 'Active'`
   can log in or receive referral income; `Inactive` ancestors are
   skipped but traversal continues up the chain so eligible ancestors
   further up still get paid.
4. **Wallet balance is a single pooled balance** combining ROI and level
   income, per the schema in the brief (`walletBalance` is one field).
   `totalRoiEarned` and `totalLevelIncomeEarned` are tracked separately
   for reporting/dashboard purposes only.
5. **Investment plans** are stored inline on the `Investment` document
   (`planDetails: { name, durationInDays }`) rather than as a separate
   `Plan` collection, since the brief didn't request standalone plan
   management (no plan CRUD endpoints were specified).
6. **Pagination** defaults to 20 records/page (max 100) on all list
   endpoints to keep query performance predictable as data grows.
7. **Rate limiting** (300 req / 15 min per IP) is applied globally to
   `/api` as a baseline anti-abuse measure; a production deployment
   would likely tighten this further on `/api/auth/*` specifically.

---

## 6. Security Practices Implemented

- Passwords hashed with bcrypt (cost factor 10), never returned in API
  responses (`select: false` + custom `toJSON`).
- JWT-based stateless auth; all private routes wrapped in `protect`
  middleware which also re-validates `accountStatus` on every request.
- `helmet` for secure HTTP headers, `cors` scoped to `CLIENT_URL`.
- Centralized error handler normalizes Mongoose cast/validation/duplicate
  errors instead of leaking raw stack traces in production.
- Strategic indexes (`referredBy`, `status`, unique compound indexes on
  `RoiHistory` and `ReferralIncome`) for both performance and
  idempotency.

---

## 7. Submission Checklist Mapping

| Requirement | Location |
|---|---|
| Database Schema Files | `backend/models/*.js` |
| API Source Code | `backend/routes/`, `backend/controllers/` |
| Business Logic Implementation | `backend/services/*.js` |
| React Dashboard | `frontend/src/` |
| Cron Job Implementation | `backend/jobs/roiCronJob.js` |
| API Documentation | `backend/postman_collection.json` + section 3 above |

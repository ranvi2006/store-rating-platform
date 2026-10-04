# Store Rating Platform

A role-based web app for discovering stores and submitting ratings from 1 to 5. Administrators manage users and stores, normal users submit or update ratings, and store owners review their store's rating summary.

## Features

### Administrator

- View totals for users, stores, and ratings.
- Create normal users, administrators, and store owners.
- Add stores and assign an owner.
- Search, filter, and sort users and stores.
- View user details, including the average rating for store owners.

### Normal user

- Create an account and sign in.
- Search stores by name or address.
- View each store's overall rating and their own rating.
- Submit a rating from 1 to 5 or change a previous rating.
- Change their password and sign out.

### Store owner

- Sign in to the owner dashboard.
- View the assigned store's average rating and the users who rated it.
- Change their password and sign out.

### Validation

- Names: 20 to 60 characters.
- Email: standard email format.
- Address: up to 400 characters; optional.
- Password: 8 to 16 characters with at least one uppercase letter and one special character.
- Rating: integer from 1 to 5. Each user has one rating per store; submitting again updates that rating.

## Technology

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, JWT authentication
- Database: MySQL

## Requirements

- Node.js 20.19+ or 22.12+
- MySQL server and a MySQL user with permission to create and alter tables

## Setup

### 1. Configure the backend

Copy `backend/.env.example` to `backend/.env` and set your local MySQL credentials, initial admin password, and a private JWT secret:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_initial_admin_password
JWT_SECRET=replace_with_a_long_random_secret
```

`DB_NAME` must be `store_rating` unless you also change the database name in `backend/schema.sql`. Keep `.env` local and do not commit real credentials. `ADMIN_PASSWORD` is required by the seed script and is never stored in source code.

### 2. Create the database tables

Run `backend/schema.sql` using MySQL Workbench, or with the MySQL command-line client from a shell that supports input redirection:

```sh
mysql -u your_mysql_user -p < backend/schema.sql
```

For a fresh setup, the script creates the `store_rating` database and its `users`, `stores`, and `ratings` tables with 100-character name columns. Do not rerun the full script after the tables already exist; its `CREATE TABLE` statements are intended for initial setup.

If the tables already exist, run only these migration statements in MySQL Workbench, selecting `store_rating` first (or your configured database if you chose another name):

```sql
ALTER TABLE users MODIFY name VARCHAR(100) NOT NULL;
ALTER TABLE stores MODIFY name VARCHAR(100) NOT NULL;
```

### 3. Install dependencies and seed the administrator

From the project root, open a terminal and run:

```sh
cd backend
npm install
node seed.js
```

For local setup, set `ADMIN_PASSWORD=Admin@1234` in `backend/.env`, then run the seed command. It creates this administrator when the email is new. If that email already exists, it ensures the role is `ADMIN` and keeps the existing password:

- Email: the address configured in `ADMIN_EMAIL` (default: `admin@example.com`)
- Initial password for a newly seeded local account: `Admin@1234`

Public sign-up cannot claim the reserved `ADMIN_EMAIL`. The seed script provisions it with the administrator role, and the protected admin user-creation form also forces that address to the administrator role. `Admin@1234` is only a documented local setup value; choose a private password outside local development.

### 4. Start the backend

In the backend terminal:

```sh
npm run dev
```

The API listens on the port configured by `PORT` (5000 in the example).

### 5. Start the frontend

Open a second terminal at the project root:

```sh
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend uses `http://localhost:5000/api` by default. To use another API URL, set `VITE_API_URL` in `frontend/.env`, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing frontend environment variables.

## Using the app

1. Sign in with the seeded administrator account.
2. On the admin overview, create a store owner account.
3. Add a store and assign it to that owner.
4. Create additional user/admin accounts from the same page, or register a normal user from the sign-up page.
5. Sign in as a normal user to search stores and submit or update ratings.
6. Sign in as a store owner to see the assigned store's average and submitted ratings.

Public sign-up creates normal-user accounts only. Administrators create store-owner and administrator accounts.

## API overview

Protected endpoints require `Authorization: Bearer <token>` from the login response.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Register a normal user |
| `POST` | `/api/auth/login` | Public | Sign in and receive a JWT |
| `PUT` | `/api/auth/password` | Signed-in user | Change password |
| `GET` | `/api/admin/dashboard` | Administrator | Read platform totals |
| `GET`, `POST` | `/api/admin/users` | Administrator | List/filter users or create a user |
| `GET` | `/api/admin/users/:id` | Administrator | Read user details |
| `GET`, `POST` | `/api/admin/stores` | Administrator | List/filter stores or create a store |
| `GET` | `/api/stores` | Normal user | Search and sort stores with rating data |
| `POST` | `/api/stores/rate` | Normal user | Create or update a store rating |
| `GET` | `/api/owner/dashboard` | Store owner | Read store rating summary and raters |

## Development checks

Run these from `frontend/`:

```sh
npm run lint
npm run build
```

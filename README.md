# Employee API

Node.js + Express + Mongoose REST API with JWT login and header-based authentication.

## Setup

```bash
npm install
cp .env.example .env     # then edit JWT_SECRET and MONGO_URI
npm start                # or: npm run dev
```

Requires Node 18+ and a running MongoDB.

## Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register | No | Create a user (name, email, password) |
| POST | /api/auth/login | No | Login, returns a JWT token |
| POST | /api/employees | Yes | Create an employee |
| GET | /api/employees | Yes | List employees (`?page=1&limit=10&department=IT&search=john`) |
| GET | /api/employees/:id | Yes | Get one employee |

## Authentication

Send the token in the request header:

```
Authorization: Bearer <token>
```

(`x-auth-token: <token>` also works.)

## Example

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"secret123"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123"}'

# 3. Create employee (use the token from login)
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"John Doe","email":"john@example.com","department":"IT","designation":"Developer","salary":50000}'

# 4. Get employees
curl http://localhost:3000/api/employees -H "Authorization: Bearer <token>"

# 5. Get one employee
curl http://localhost:3000/api/employees/<id> -H "Authorization: Bearer <token>"
```

## Structure

```
server.js              app entry, body parser, routes
config/db.js           mongoose connection
models/                User, Employee schemas
middleware/auth.js     JWT header authentication
controllers/           auth and employee logic
routes/                route definitions
```

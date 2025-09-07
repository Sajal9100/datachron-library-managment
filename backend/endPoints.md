# Library Management System API - Postman Payloads

## 1. Register User

**URL:** `POST /api/auth/register`  
**Headers:** `Content-Type: application/json`  
**Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "Admin"
}
```

**Notes:**
- `role` can be "Admin" or "Member".
- Returns user info (without password).

---

## 2. Login User

**URL:** `POST /api/auth/login`  
**Headers:** `Content-Type: application/json`  
**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "token": "JWT_TOKEN_HERE"
}
```

> Copy this token for authenticated requests.

---

## 3. Add a Book (Admin Only)

**URL:** `POST /api/books`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565"
}
```

**Response:**

```json
{
  "message": "Book added",
  "book": {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "available": true,
    "createdAt": "2025-09-07T08:00:00.000Z"
  }
}
```

---

## 4. Get All Available Books (Logged-in users)

**URL:** `GET /api/books`  
**Headers:**
```
Authorization: Bearer JWT_TOKEN_HERE
```

**Response:**

```json
{
  "books": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "9780743273565",
      "available": true,
      "createdAt": "2025-09-07T08:00:00.000Z"
    }
  ]
}
```

---

## 5. Borrow a Book

**URL:** `PUT /api/books/borrow/:id`  
**Headers:**
```
Authorization: Bearer JWT_TOKEN_HERE
```

**Example:** Borrow book with ID 1 → `PUT /api/books/borrow/1`

**Response:**

```json
{
  "message": "Book borrowed",
  "book": {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "available": false,
    "createdAt": "2025-09-07T08:00:00.000Z"
  }
}
```

---

## 6. Return a Book

**URL:** `PUT /api/books/return/:id`  
**Headers:**
```
Authorization: Bearer JWT_TOKEN_HERE
```

**Example:** Return book with ID 1 → `PUT /api/books/return/1`

**Response:**

```json
{
  "message": "Book returned",
  "book": {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "available": true,
    "createdAt": "2025-09-07T08:00:00.000Z"
  }
}
```


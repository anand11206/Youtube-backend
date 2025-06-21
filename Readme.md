# 📺 YouTube Backend Clone

A scalable and modular backend clone of YouTube built with **Node.js** and **Express.js**, featuring user authentication, video management — inspired by YouTube’s core features.

---

## 🌟 Features

- User registration and login with **JWT**
- Upload videos with **Cloudinary**
- View history, playlists, and user-specific content
- RESTful APIs using Express
- MongoDB + Mongoose for database layer

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (Authentication)
- Multer (file uploads)
- Cloudinary (optional)
- dotenv for environment management

---

## 📂 Project Structure

<!-- code block starts -->
```text
Youtube-backend/
├── public/temp/
│   └── .gitkeep
├── src/
│   ├── controllers/
│   ├   └── user.controller.js
|   ├── middlewares/
│   |   └── auth.middleware.js
│   |   └── multer.middleware.js
|   ├── db/
│   |   └── index.js
|   ├── models/
│   |   └── subscription.model.js
│   |   └── user.models.js
|   |   └── video.models.js
|   ├── routes/
│   |   └── user.route.js
|   ├── utils/
│   |   └── ApiError.js
│   |   └── ApiResponse.js
│   |   └── cloudinary.js
│   |   └── asyncHandler.js
│   ├── app.js
│   ├── constants.js
│   ├── index.js
├── .env.sample
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package-lock.json
├── Screenshot 2025-03-05 205445.png
├── package.json
└── Readme.md
```
<!-- code block ends -->

---

## ⚙️ Getting Started

### 📦 Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account 

---

### 🚀 Installation

<!-- code block starts -->
```bash
git clone https://github.com/anand11206/Youtube-backend.git
cd Youtube-backend

npm install
```
<!-- code block ends -->

---

### ⚙️ Environment Setup

Create a `.env` file in the root directory renaming the `.env.sample` file and filling values

<!-- code block starts -->

<!-- code block ends -->

---

### 🧪 Running the Server

<!-- code block starts -->
```bash
npm run dev
```
<!-- code block ends -->

Server will run on:

<!-- code block starts -->
```text
http://localhost:PORT (PORT in .env file)
```
<!-- code block ends -->

---

## 📡 API Endpoints

**Auth**
- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/logout`
- `POST /api/v1/users/refresh-access-token`
- `POST /api/v1/users/change-password`
- `POST /api/v1/users/update-details`
- `POST /api/v1/users/update-avatar-cover-images`


---

## 🧪 Testing Tools

- Postman or Thunder Client for API testing
- MongoDB Compass for DB inspection

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for full details.

---

## 👤 Author

**Your Name**  
GitHub: [@anand11206](https://github.com/anand11206)

---

## 🤝 Contributions

PRs and suggestions are always welcome.  
Please fork the repository and submit a pull request.

---

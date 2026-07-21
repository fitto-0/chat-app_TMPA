# Chat App TMPA

A real-time support chat module developed during my internship at **Tanger Med Port Authority (TMPA)**.

The solution was designed as a reusable messaging module that can be integrated into different TMPA applications, allowing users to contact support directly from the application they are using.

## Features

### Client
- Floating support chat widget
- Start a new conversation
- Send and receive messages in real time
- Automatic conversation creation
- Read (Seen/Unseen) status

### Agent
- View pending conversations
- Assign conversations
- Reply to clients
- Manage conversation priorities
- Close conversations
- Real-time updates

### Admin
- Manage conversations
- Manage agents
- Monitor chat activities
- Full access to the system

## Technologies Used

### Frontend
- React
- Vite
- Material UI
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- Mongoose

### Database
- MongoDB

### DevOps
- Docker
- Docker Compose

---

## Project Structure

```
chat-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

## Project Architecture

The project follows a client-server architecture composed of three main services:

- **Frontend:** React + Vite application that provides the user interface.
- **Backend:** Node.js + Express REST API with Socket.IO for real-time communication.
- **Database:** MongoDB used to store users, conversations, and messages.

The entire application is containerized using **Docker** and orchestrated with **Docker Compose**, allowing all services to run together with a single command.

---

# Installation

## Clone the repository

```bash
git clone https://github.com/fitto-0/chat-app_TMPA.git

cd chat-app_TMPA
```

---

# Environment Variables

Create a `.env` file inside the **backend** folder.

Example:

```env
PORT=5000

MONGO_URI=mongodb://mongodb:27017/chat-app

JWT_SECRET=your_secret_key
```

---

# Running with Docker (Recommended)

Make sure Docker Desktop is running.

```bash
docker compose up --build
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:5000
```

MongoDB runs automatically through Docker Compose.

---

# Running without Docker

## Backend

```bash
cd backend

npm install

npm start
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Main Functionalities

- JWT Authentication
- Real-time messaging using Socket.IO
- Conversation assignment
- Conversation management
- Read receipts (Seen / Unseen)
- Conversation priority
- Conversation closing
- Role-based access (Client / Agent / Admin)

---

# Internship

This project was developed during my internship at:

**Tanger Med Port Authority (TMPA)**

**Direction Centrale Organisation et Systèmes d'Information (DCOSI)**

Supervisor:

**Mrs. Amina Bakkali Tahiri**

---

# Author

**Fatima Zahra Elkasmi**

---

# License

This project was developed for educational and internship purposes.

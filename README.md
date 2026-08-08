# DevCollab

A full-stack collaborative project management platform designed for development teams to organize projects, manage tasks, and collaborate in real time.

DevCollab provides workspaces, Kanban boards, task management, comments, activity tracking, member invitations, notifications, and real-time updates.

---

## Features

- User registration and login
- JWT-based authentication
- Protected routes
- Workspace creation and management
- Workspace member management
- Member invitations
- Kanban board management
- List and task management
- Drag-and-drop task organization
- Task priorities and due dates
- Task comments and discussions
- Real-time collaboration using Socket.IO
- Activity tracking and activity logs
- Notifications
- Search and task filtering
- Responsive React interface

---

## Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Router
- Socket.IO Client
- DnD Kit
- Vite

### Backend

- Node.js
- Express.js
- REST APIs
- Socket.IO
- JWT

### Database

- MongoDB
- Mongoose

---

## Architecture

```text
                 DevCollab
                     │
        ┌────────────┴────────────┐
        │                         │
   React Frontend            Socket.IO
        │                         │
        └────────────┬────────────┘
                     │
              REST APIs
                     │
                     ▼
            Node.js + Express
                     │
                     ▼
             MongoDB + Mongoose
```

---

## Core Modules

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected backend routes

### Workspaces

- Create workspaces
- Manage workspace members
- Invite users
- Manage workspace access

### Kanban Boards

- Create boards
- Create lists
- Create tasks
- Edit tasks
- Delete tasks
- Move tasks between lists
- Drag-and-drop task organization

### Collaboration

- Real-time task updates
- Real-time activity updates
- Comments and discussions
- Member activity tracking
- Notifications

---

## API

The backend provides RESTful APIs for:

- Authentication
- Workspaces
- Boards
- Lists
- Tasks
- Comments
- Invitations
- Activities

Authentication and authorization are handled using JWT-based protected routes.

---

## Project Structure

```text
DevCollab/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── activityController.js
│   │   │   ├── authController.js
│   │   │   ├── boardController.js
│   │   │   ├── commentController.js
│   │   │   ├── invitationController.js
│   │   │   ├── listController.js
│   │   │   ├── taskController.js
│   │   │   └── workspaceController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   └── invitationModel.js
│   │   │
│   │   ├── routes/
│   │   │   ├── activityRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── boardRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── invitationRoutes.js
│   │   │   ├── listRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── workspaceRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   └── logActivity.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   └── devcollab/
│       ├── public/
│       │
│       ├── src/
│       │   ├── components/
│       │   │   ├── ActivityModal.jsx
│       │   │   ├── CommentsModal.jsx
│       │   │   ├── CreateBoardModal.jsx
│       │   │   ├── CreateListModal.jsx
│       │   │   ├── CreateTaskModal.jsx
│       │   │   ├── CreateWorkspaceModal.jsx
│       │   │   ├── EditTaskModal.jsx
│       │   │   ├── InviteMemberModal.jsx
│       │   │   ├── List.jsx
│       │   │   ├── MembersModal.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── TaskCard.jsx
│       │   │   └── WorkspaceMembers.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── Board.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Notifications.jsx
│       │   │   ├── Signup.jsx
│       │   │   └── Workspace.jsx
│       │   │
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── index.css
│       │   ├── main.jsx
│       │   └── socket.js
│       │
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/achopra1be24/DevCollab.git
cd DevCollab
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend/devcollab
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Do not commit `.env` files to the repository.

---

## Running the Project

### Start Backend

From the `backend` directory:

```bash
npm start
```

### Start Frontend

From the `frontend/devcollab` directory:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

---

## Real-Time Collaboration

DevCollab uses Socket.IO to provide real-time communication between connected users.

Real-time functionality includes:

- Task updates
- Comments
- Activity updates
- User-specific events
- Notifications

Changes made by one connected user can be reflected for other connected users without manually refreshing the page.

---

## Authentication & Authorization

DevCollab uses JSON Web Tokens (JWT) for authentication.

The authentication flow includes:

1. User registration
2. User login
3. JWT token generation
4. Protected API requests
5. Authenticated user sessions
6. Socket.IO user connection

---

## Database

MongoDB is used as the primary database, with Mongoose handling schemas and database operations.

The application manages data related to:

- Users
- Workspaces
- Boards
- Lists
- Tasks
- Comments
- Invitations
- Activity history

---

## Future Improvements

- Cloud deployment
- File attachments
- Email notifications
- Advanced team analytics
- More granular workspace permissions
- Enhanced notification system

---

## Author

**Aditya Chopra**

Full Stack Developer | CSE Undergraduate

### DevCollab

A collaborative project management platform built using React.js, Node.js, Express.js, MongoDB, Mongoose, and Socket.IO.
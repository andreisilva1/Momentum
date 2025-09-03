
# Momentum - Workflow Manager ![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react&logoColor=white)![FastAPI](https://img.shields.io/badge/FastAPI-0.116.1-green?logo=fastapi&logoColor=white)


**Momentum** is a web application for managing projects and tasks in teams, in the Kanban/Board style.  
With it, teams can organize their workflows into **boards, lists, and tasks**, assigning responsibilities and deadlines and tracking progress in real time.

## ✨ Features

-   👥 **Team management** – create organizations, add members, and manage your organization as you wish!

-   📋 **Boards and tasks** – organize projects into visual boards, knowing the classification and deadline for your assigned tasks.
    
-   ✅ **Assignments** – assign tasks to specific users.

-   ⏱ **Status and deadlines** – easily track progress and deadlines.
    

-   🔒 **JWT authentication** – secure login with access control.


The following guide will detail the entire process for configuring and using **Momentum** locally, using **React** for the front-end and **FastAPI** for the back-end. The web version of the project + API will be available soon!



## 🚀 Technologies

**Backend:**  
- FastAPI, SQLModel, SQLAlchemy  
- Pydantic, Pydantic-Settings  
- Passlib, PyJWT  
- Scalar FastAPI (extras/utilities)

**Frontend:**  
- React 
- React Router (`react-router-dom`)  
- React Hook Form (`react-hook-form`)  
- Tailwind CSS (`@tailwindcss/cli`, `@tailwindcss/vite`)



## 📘 API Endpoints

### 🧑‍💼 **Users**

| **Method** | **Endpoint**        | **Description** |
|------------|---------------------|------------------|
| `POST`     | `/users/user`     | Receives an ID (UUID) and checks if a user exists. |
| `POST`    | `/users/signup`          | Receives username, email, and password and registers the user if all checks are passed. |
| `GET`     | `/users/profile`      | Receives a token and returns the user if the token matches the logged-in user. |
| `PATCH`      | `/users/update`     | Receives new user information (username, email, password, and profile_picture) and updates the information entered in the form. |
| `DELETE`     | `/users/delete`     | Receives a token and deletes the user if the token matches the logged-in user. |
| `POST`    | `/users/login`          | Receives email and password and logs the user into the system (generates access token). |
| `POST`     | `/users/logout`      | Receives a token and logs the user out (token added to blacklist) if the token matches the logged-in user. |
| `POST`    | `/users/leave_organization`          | Receives the organization ID as a query parameter and the token. If the organization exists, the logged-in user matches the token, and the user is in that organization, it removes them from it. |


---

### 🏭 **Organization** 
All endpoints below require a logged-in user.

| **Method** | **Endpoint**        | **Description** |
|------------|---------------------|------------------|
| `GET`      | `/organization/`           | Receives a “search” and returns all organizations that the user has created or been added to that contain the text somewhere in the title. |
| `GET`     | `/organization/get_all`     | Returns all organizations in which the logged-in user is a member. |
| `GET`    | `/organization/get_all_boards`          | Receives an organization_id and returns all boards in that organization, if the user is a member of the specified organization. |
| `POST`     | `/organization/add_new_participant`      | Receives organization_id and email by query parameter and adds the new user to the organization if all conditions are met: the organization exists, the user with that email exists, AND the logged-in user is an administrator of the provided organization. |
| `DELETE`      | `/organization/delete_participant`     | Receives organization_id and email by query parameter and removes the user if all conditions are met: organization exists, user with that email exists AND the logged-in user is an administrator of the provided organization. |
| `GET`     | `/organization/get_all_participants`     | Receives organization_id and returns all members of the organization, if the organization exists and the logged-in user is a member of it. |
| `POST`    | `/organization/create`          | Receives a title for the organization and creates it if the logged-in user does not already have an organization created with the provided name. |
| `PATCH`     | `/organization/update`      | Receives organization_id and the new title, updates the title of the organization provided if: the organization exists, the title is not being used by any organization created by the user, and the user is an administrator of the organization provided. |
| `DELETE`    | `/organization/delete`          | Receives organization_id and password_confirm and deletes the organization if: the organization exists, the user is the current administrator of the organization, and password_confirm is correct. |
---

### 📚 **Board** 
All endpoints below require a logged-in user.

| **Method** | **Endpoint**        | **Description** |
|------------|---------------------|------------------|
| `GET`      | `/board/`           | Receives a “search” and returns all boards containing the searched text in the organizations the user is a member of. |
| `GET`     | `/board/get_all`     | Returns all boards created by the logged-in user. |
| `GET`    | `/board/get_all_tasks`          | Receives a board_id and returns all tasks created on it, if the user is a member of the organization where the board was created. |
| `POST`     | `/board/create`      | Receives organization_id and board title. Creates the board in that organization, if it exists and the logged-in user is its administrator. |
| `PATCH`      | `/board/update`     | Receives board_id and new title, updates the board title if the user is in the organization to which the board belongs and the logged-in user is an administrator of the organization. |
| `DELETE`     | `/board/delete`     | Receives board_id and password and deletes the board if the logged-in user is an administrator of the organization and the password is correct. |
---

### 📝 **Task** 
Todos os endpoints abaixos necessitam de um usuário logado.

| **Method** | **Endpoint**        | **Description** |
|------------|---------------------|------------------|
| `GET`      | `/task/`           | Receives a “search” and returns all tasks assigned to the user that contain the searched text in the organizations the user is a member of. |
| `GET`     | `/task/get_all`     | Returns all tasks assigned to the user. |
| `POST`    | `/task/create`          | Receives a board_id and returns all tasks created on it, if the user is a member of the organization where the board was created. |
| `POST`     | `/task/create`      | Receives board_id, tag (common, important, urgent), and limit_date (default=15 days) and adds the new task to the board. Any member can add a new task to the board.| 
| `PATCH`      | `/task/update`     | Receives task_id, task_status, limit_date, tag, and title and updates the task if the logged-in user is assigned to it. |
| `PATCH`      | `/task/finish_task`     | Receives task_id and marks the task as finished, updating the finished_at field to datetime.now(), if the logged-in user is assigned to the specified task. |
| `PATCH`      | `/task/update`     | Receives task_id, task_status, limit_date, tag, and title and updates the task if the logged-in user is assigned to it. |
| `POST`     | `/task/attach_task`     | Receives task_id and user_email, if user_email exists in the organization where the task was created, and attaches it to task.users_attached if the logged-in user is an administrator of the organization.  |
| `PATCH`      | `/task/delete`     | Receives task_id and password and deletes the task if the logged-in user is attached to it.|


# Full-stack Project Setup Guide

This guide details the process of setting up and running the **Momentum - Workflow Manager** project, which uses **React** on the frontend, **FastAPI** on the backend and **SQLite**             for databases.

## 1. Initial Repository Setup

First, clone the project from GitHub and navigate to the main directory:

```
git clone https://github.com/andreisilva1/Momentum.git
cd momentum

```

## 2. Backend Setup (FastAPI)

The backend is built with Python and FastAPI. Follow these steps to configure the environment and dependencies.

### 2.1 Virtual Environment

Create and activate a virtual environment to isolate project dependencies.

**Linux/macOS:**

```
cd backend
python -m venv venv
source venv/bin/activate

```

**Windows (PowerShell):**

```
cd backend
python -m venv venv
venv\scripts\activate

```

### 2.2 Installing Dependencies

Install all necessary Python libraries listed in the `requirements.txt` file:

```
pip install -r requirements.txt

```

### 2.3 Environment Variables

Create the `.env` file from the `.env.example` template to store your environment variables, such as API credentials.

**Linux/macOS:**

```
cp .env.example .env

```

**Windows:**

```
copy .env.example .env

```

Open the `.env` file and update the values according to your local configuration (if necessary).

## 3. Frontend Setup (React)

The frontend uses React. Follow these steps to install the Node.js dependencies.

### 3.1 Installing Dependencies

Navigate back to the main directory, then to the `frontend` directory to install the npm dependencies.

```
cd ../frontend
npm install

```

### 3.2 Environment Variables

Just like the backend, create the `.env` file for the frontend.

**Linux/macos:**

```
cp .env.example .env

```

**Windows:**

```
copy .env.example .env

```

Update the variables if necessary (for example, `VITE_API_URL=http://localhost:8000`).

## 4. Running the Application


### 4.1. Backend (FastAPI)

Navigate back to the `backend` directory and start the FastAPI server. The server will automatically reload on source code changes.

```
cd ../backend
venv\scripts\activate
fastapi run

```

The API will be available at `http://localhost:8000`.

### 4.2. Frontend (React)
Navigate to the `frontend` directory and start the React development server.

```
cd ../frontend
npm run dev

```

The frontend will be accessible at `http://localhost:5173`.

## 5. Testing and Documentation

You can test the application by navigating to the frontend in your browser and exploring the interactive API documentation.

-   **Frontend:**  `http://localhost:5173`
    
-   **Interactive API Documentation:**  `http://localhost:8000/docs` or `https://localhost:8000/scalar`
    

## Notes

-   Always use `.env.example` as a template.
    
-   **Python 3.11+** and **Node.js 18+** must be installed for full application functionality.

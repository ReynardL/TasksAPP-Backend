# Task Management Backend

![License](https://img.shields.io/badge/license-MIT-green)

This is the backend for a personal task management application designed to help users manage tasks and collaborate with others via shared folders. The application supports multi-user authentication, folder sharing with role-based permissions, and advanced task search/filter functionality.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation and Setup](#installation-and-setup)
5. [API Documentation](#api-documentation)
6. [Deployment](#deployment)
7. [Folder Structure](#folder-structure)
8. [License](#license)
9. [Contact](#contact)
10. [Future Plans](#future-plans)

---

## Overview

The Task Management Backend is a FastAPI-based application designed to provide a robust API for managing tasks and collaborating with others. It is particularly useful for students, teams, and businesses who need a centralized platform to organize tasks and share them with classmates, friends, or colleagues.

Key features include:
- Multi-user support with JWT-based authentication.
- Folder sharing with member-specific permissions (owner, editor, viewer).
- Task collaboration with due dates, priorities, and repeat functionality.
- Advanced search and filter capabilities for tasks.
- Easy integration with frontend frameworks like React.

---

## Features

- **Authentication**: Secure user registration and login using JWT tokens.
- **Task Management**: Create, update, delete, and filter tasks with due dates, priorities, and repeat options.
- **Folder Sharing**: Share folders with other users and assign roles (owner, editor, viewer).
- **Search and Filter**: Search tasks by title, description, due date, priority, and more.
- **Role-Based Access Control**: Ensure only authorized users can perform specific actions (e.g., editing tasks or managing folder members).

---

## Technologies Used

- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: PostgreSQL hosted on Google Cloud Platform (GCP)
- **ORM**: SQLAlchemy for database interactions
- **Validation**: Pydantic for request/response validation
- **Asynchronous Programming**: Async support for improved performance
- **Authentication**: JWT-based authentication using `fastapi-users`
- **Deployment**: Dockerized and hosted on Google Cloud Run
- **Cloud SQL Proxy**: For secure database connections during local development and deployment

---

## Installation and Setup

### Prerequisites

- Python 3.10+ (configured in `.python-version`)
- [uv](https://github.com/astral-sh/uv) as the package manager
- Docker (optional, for containerization)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_USER=<your-database-username>
DB_PASSWORD=<your-database-password>
DB_NAME=<your-database-name>
ALLOWED_ORIGINS=<comma-separated-list-of-allowed-origins>
SECRET=<your-jwt-secret-key>
```

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Set up a virtual environment and install dependencies:
   ```bash
   uv venv
   uv sync
   ```

3. Start the application:
   ```bash
   uvicorn main:app --reload
   ```

4. Access the API documentation at:
   - Local: `http://localhost:8000/docs`
   - Production: [https://tasks-app-576343866897.us-central1.run.app/docs](https://tasks-app-576343866897.us-central1.run.app/docs)

---

## API Documentation

The API is fully documented using Swagger UI. You can explore all available endpoints and test them directly from the browser:

- **Local**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Production**: [https://tasks-app-576343866897.us-central1.run.app/docs](https://tasks-app-576343866897.us-central1.run.app/docs)

---

## Deployment

### Dockerization

A `Dockerfile` is included for containerizing the application. To build and run the Docker container:

1. Build the Docker image:
   ```bash
   docker build -t task-management-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 task-management-backend
   ```

### Cloud Run Deployment

1. Build and push the Docker image to Google Container Registry (GCR):
   ```bash
   gcloud builds submit --tag gcr.io/<project-id>/task-management-backend
   ```

2. Deploy the application to Cloud Run:
   ```bash
   gcloud run deploy task-management-backend --image gcr.io/<project-id>/task-management-backend --platform managed
   ```

### Database Connection

The application uses Cloud SQL Proxy to securely connect to the PostgreSQL database. This setup works both locally and in production.

---

## Folder Structure

```plaintext
.
├── models.py          # Database models
├── schemas.py         # Pydantic schemas for request/response validation
├── dependencies.py    # Dependency injection and authentication logic
├── main.py            # Main application file with API routes
├── Dockerfile         # Docker configuration for deployment
├── pyproject.toml     # Project dependencies and metadata
├── uv.lock            # Lock file for dependency versions
├── .env               # Environment variables
├── .dockerignore      # Files to ignore during Docker builds
├── .gitignore         # Files to ignore in Git
├── .gitattributes     # Git attributes configuration
└── .python-version    # Python version specification
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For questions, feedback, or collaboration, feel free to reach out:

- Email: [reynardlin1810@gmail.com](mailto:reynardlin1810@gmail.com)

---

## Future Plans

- Add unit tests to ensure code reliability.
- Enhance error handling and logging for better debugging.
- Explore additional integrations (e.g., email notifications for task deadlines).
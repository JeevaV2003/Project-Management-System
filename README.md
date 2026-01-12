# Project Management Dashboard

A full-stack Project Management Dashboard built with Django REST Framework, React, MySQL, and Tailwind CSS. This application enables teams to manage projects, track tasks, and collaborate efficiently with role-based access control.

![Django](https://img.shields.io/badge/Django-4.2.7-green)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.5-cyan)

## About This Project

This is a comprehensive project management solution designed for teams of all sizes. The application provides a modern, intuitive interface for managing projects and tasks while offering powerful analytics and collaboration features.

### Key Features

**For Administrators:**
- Complete control over all projects and tasks
- User management and role assignment
- View team analytics and productivity metrics
- System-wide activity monitoring

**For Team Members:**
- Create and manage personal projects
- Assign and track tasks with priorities
- Collaborate with team members
- View individual and team performance analytics

### Core Capabilities

- **Smart Project Tracking**: Effortlessly create, monitor, and manage projects from start to finish.
- **Advanced Task Management**: Assign tasks with specific deadlines, priorities, and custom status workflows.
- **Financial Integration**: Built-in wallet system to handle transactions, view payment history, and manage payouts.
- **Real-Time Collaboration**: Stay connected with team comments, instant activity logs, and live notifications.
- **Role-Based Security**: dedicated access levels for Admins (Managers) and Team Members to ensure data security.
- **Visual Analytics Dashboard**: Gain actionable insights with interactive charts showing productivity and financial metrics.
- **Secure Authentication**: Enterprise-grade JWT authentication protecting your data and user sessions.

## Project Structure

```
task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API clients
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── ...
├── project_manager/       # Django project settings
├── projects/              # Django app
├── venv/                  # Python virtual environment
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- JWT Authentication (djangorestframework-simplejwt)
- MySQL Database
- CORS Headers for frontend integration

### Frontend
- React 19.2.0
- Vite (Build tool)
- Tailwind CSS 3.3.5
- React Router DOM 6.18.0
- React Query 5.8.0
- React Hook Form 7.47.0
- Recharts 2.8.0

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Backend Setup

```bash
# Clone and enter directory
git clone <repository-url>
cd task-manager

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database (.env file)
# DB_NAME=project_manager_db
# DB_USER=your_mysql_username
# DB_PASSWORD=your_mysql_password

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh

### Core Resources
- `GET/POST /api/projects/` - Project list/create
- `GET/PUT/DELETE /api/projects/{id}/` - Project detail
- `GET/POST /api/tasks/` - Task list/create
- `GET/PUT/DELETE /api/tasks/{id}/` - Task detail
- `GET /api/dashboard/stats/` - Dashboard statistics

## Demo Accounts
- **Admin**: `admin` / `admin123`
- **Member**: `member` / `member123`

## License

MIT License


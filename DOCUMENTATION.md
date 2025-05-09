## 📘 LARO-Hub Documentation

### 🌐 Project Overview

**LARO-Hub** is a web-based administrative platform at the heart of the **LARO** basketball matchmaking ecosystem. It allows team captains, players, and admins to manage accounts, schedule games, view analytics, and organize activities — all through a centralized dashboard.

---

### 🛠️ Tech Stack & Frameworks

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| **Frontend**   | HTML, CSS, JavaScript                         |
| **Backend**    | Django 4+ (Python)                            |
| **Database**   | SQLite (Development), PostgreSQL (Production) |
| **Auth**       | Django Auth, OAuth 2.0                        |
| **API**        | Django REST Framework + Swagger               |
| **Versioning** | Git & GitHub                                  |
| **Deployment** | (User-defined; recommended: Heroku, Railway)  |

---

### 🔑 Key Features

* ✅ User registration and login via secure authentication (Django Auth + OAuth 2.0)
* 🧑‍🤝‍🧑 Team management: create, join, and manage teams
* 📆 Schedule pickup games or formal matches
* 📍 Location-aware matchmaking (planned)
* 📊 Dashboard with analytics (games, players, participation)
* 🗂️ Admin view for overseeing matchmaking behavior and trends

---

### 🧱 System Architecture

This project follows the **MVC (Model-View-Controller)** design pattern:

* **Models** define core data structures (users, teams, games).
* **Views** present templates to users using Django's templating engine.
* **Controllers (Views.py)** handle requests, authentication, and data operations.
* **REST API Layer** exposes endpoints via Django REST Framework (DRF).
* **Swagger** provides interactive API documentation at `/api-docs/`.

```
[Browser] --> [Django Views] --> [Models/Database]
            --> [DRF APIs] --> [Swagger Docs]
```

---

### 📂 Directory Structure

```
LARO-Hub/
├── laro_hub/         # Django project settings
├── core/             # Main app: dashboards, scheduling, matchmaking
├── static/           # CSS, JS, images
├── templates/        # HTML templates
├── docs/             # (Currently empty) UML/system specs
└── README.md         # Project documentation
```

---

### 🚀 Installation Guide

#### Prerequisites

* Python 3.10+
* Django 4.x
* SQLite or PostgreSQL
* Git

#### Steps

```bash
# Clone the repository
git clone https://github.com/EjLaquiorez/LARO-Hub.git
cd LARO-Hub

# Create a virtual environment
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Set SECRET_KEY, DEBUG, DATABASE_URL, etc.

# Apply migrations
python manage.py migrate

# Run the development server
python manage.py runserver
```

Visit the app at `http://127.0.0.1:8000/`
Swagger API Docs: `http://127.0.0.1:8000/api-docs/`

---

### 🔐 User Roles & Permissions

| Role        | Permissions                                  |
| ----------- | -------------------------------------------- |
| **Admin**   | Full access: manage all users, teams, games  |
| **Captain** | Create teams, invite players, schedule games |
| **Player**  | Join teams, accept/decline matches           |
| **Guest**   | View games, limited dashboard access         |

---

### 📡 API Documentation

* Interactive API available via **Swagger UI**
* URL: `/api-docs/`
* Built using **Django REST Framework**

---

### 🚀 Deployment Guide (Suggested)

1. Set up a PostgreSQL database and configure `DATABASE_URL` in `.env`
2. Use Gunicorn + Nginx or deploy to Heroku/Railway with production settings
3. Apply static file collection:

   ```bash
   python manage.py collectstatic
   ```

---

### 🤝 Contribution Guidelines

Branching convention:

```
develop
├── frontend/feature/<feature-name>
├── backend/feature/<feature-name>
└── release/<version>
```

Commit format:

```
<type>(<scope>): <short description>
```

Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

### 🔭 Future Enhancements

* 📍 Map integration with geolocation for match venues
* 📱 PWA/mobile app integration
* 📧 Email notifications and reminders
* 🧠 AI-based match recommendations

---

### 📄 License

This project is licensed under the **MIT License**.

---

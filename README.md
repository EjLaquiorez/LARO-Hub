# LARO-Hub 🌾🌐

## 📖 Overview
**LARO-Hub** is the central web platform for managing and organizing all operations of the **LARO** basketball matchmaking ecosystem. It serves as the administrative and organizational hub, allowing team captains, players, and admins to oversee team creation, match scheduling, user activity, and analytics — all in one browser-based dashboard.

Whether you're managing your team’s stats, scheduling a friendly match, or overseeing matchmaking behavior across the platform, **LARO-Hub** puts everything at your fingertips.

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| **Frontend**| HTML, CSS, JavaScript                |
| **Backend** | Django (Python)                      |
| **Database**| SQLite (for dev), PostgreSQL (for prod) |
| **Auth**    | Django Auth, OAuth2                  |
| **Docs**    | Swagger via Django REST Framework    |
| **Version Control** | Git & GitHub                 |

---

## 📂 Directory Structure
```
LARO-Hub/
├── laro_hub/         # Django project settings
├── core/             # Main app: dashboards, scheduling, matchmaking
├── static/           # CSS, JS, images
├── templates/        # HTML templates
├── docs/             # UML diagrams, ERD, system specs
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Python 3.10+
- Django 4+
- Git
- SQLite (default) or PostgreSQL for production

### ⚙️ Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/EjLaquiorez/LARO-Hub.git
   cd LARO-Hub
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv env
   source env/bin/activate  # Windows: env\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Add SECRET_KEY, DEBUG, DATABASE_URL, etc.
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

6. **Access the app**
   - Visit: `http://127.0.0.1:8000/`
   - Swagger API Docs: `http://127.0.0.1:8000/api-docs/`

---

## 🔑 Key Features

- 🢑🧽 **User & Team Management**  
  Create, update, and monitor users, team rosters, and player activity.

- 🗓️ **Game Scheduling Dashboard**  
  Schedule games, invite teams, manage time slots and locations.

- 📊 **Matchmaking Analytics**  
  View trends, engagement stats, and game history.

- 🔐 **Secure Login System**  
  Django-based authentication system with session or token support.

- 🗺️ **Interactive Map Integration**  
  View nearby courts and match venues (planned).

---

## 📌 Branching Convention

Follows the same Git branching as `LARO-Web`, using:

```
develop
├── frontend/feature/<feature-name>
├── backend/feature/<feature-name>
└── release/<version>
```

---

## 🧪 Development Tips

- Keep HTML templates organized under `templates/`.
- Use `{% include %}` and `{% block %}` in Django templates for layout reuse.
- Static files (CSS/JS) go under `static/`.
- Test with `python manage.py test` before pushing major updates.

---

## ✍️ Commit Message Format

```
<type>(<scope>): <short description>
```

#### Types:
- `feat` – New features
- `fix` – Bug fixes
- `docs` – Documentation
- `style` – UI/style changes
- `refactor` – Code cleanup or structure changes
- `test` – Adding or updating tests
- `chore` – Tooling or dependency updates

---

## 👥 Contributors

| Name              | Role                |
|-------------------|---------------------|
| Earl Laquiorez    | Project Manager     |
| [Your Team Names] | [Roles e.g. Dev, QA, Docs] |

Want to contribute? See `CONTRIBUTING.md`!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

## 🚀 Play Better. Play Together. With LARO-Hub. 🌾

# LARO-App Backend

## 🖥️ Project Overview
LARO is a basketball matchmaking app that connects players to teams and games. This repository contains the **backend** services responsible for handling user authentication, game invitations, matchmaking, and team management using **Django** and **Django REST Framework (DRF)**.

## ⚙️ Features
- User authentication and authorization (JWT-based)
- Game and team management APIs
- Invitation system with QR code and link generation
- Secure handling of user data
- RESTful API architecture

## 🛠️ Tech Stack
- **Language:** Python (Django, Django REST Framework)
- **Database:** PostgreSQL  
- **Authentication:** JWT (djangorestframework-simplejwt) & OAuth2  
- **Version Control:** Git & GitHub  
- **API Documentation:** Swagger (drf-yasg)  

## 📦 Installation
### Prerequisites
- [Python 3.10+](https://www.python.org/) installed  
- [PostgreSQL](https://www.postgresql.org/) instance (local or cloud via Heroku/Postgres)  
- [Git](https://git-scm.com/) installed  
- [pip](https://pip.pypa.io/) or [pipenv](https://pipenv.pypa.io/) for dependency management  

### Steps
1. **Clone the repository:**  
   `git clone https://github.com/EjLaquiorez/LARO-App-Backend.git`

2. **Navigate to the project directory:**  
   `cd LARO-App-Backend`

3. **Create and activate a virtual environment:**  
   ```bash
   python -m venv env
   source env/bin/activate  # For Linux/macOS
   env\Scripts\activate     # For Windows
   ```

4. **Install dependencies:**  
   `pip install -r requirements.txt`

5. **Create a `.env` file:**  
   ```env
   SECRET_KEY=your_secret_key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET_KEY=your_jwt_secret
   ```

6. **Apply database migrations:**  
   `python manage.py migrate`

7. **Run the development server:**  
   `python manage.py runserver`

> 🟢 Server will run on `http://localhost:8000/` by default.

## 📂 Project Structure
```
laro_backend/
├── laro_backend/         # Project settings
│   ├── settings.py       # Project configurations
│   ├── urls.py           # URL routing
│   └── wsgi.py           # WSGI application entry point
├── apps/
│   ├── users/            # User management app
│   ├── games/            # Game creation & management
│   ├── invites/          # Invitation handling
│   └── teams/            # Team management
├── requirements.txt      # Project dependencies
├── manage.py             # Django CLI entry point
└── .env                  # Environment variables
```

## 📖 API Documentation
- **Swagger documentation** available at: `http://localhost:8000/api/docs/`  
- Sample endpoints:
  - `POST /api/auth/login/` – User login  
  - `POST /api/games/create/` – Create a game invitation  
  - `GET /api/teams/` – Fetch teams  

## 🤝 Contribution Guidelines
1. **Fork** the repo.  
2. Create your **feature branch:** `git checkout -b feature/YourFeature`  
3. **Commit changes:** `git commit -m 'feat: Add YourFeature'`  
4. **Push to branch:** `git push origin feature/YourFeature`  
5. **Create a Pull Request** for review.  

> ✨ Follow best practices: write clean, modular, and documented code.

## 📝 Commit Message Format
- `feat`: New feature  
- `fix`: Bug fix  
- `docs`: Documentation changes  
- `refactor`: Code refactoring  
- `test`: Adding tests  
- `chore`: Other maintenance tasks  

## 🛡️ Security
- Store sensitive data in **environment variables**.  
- Use Django’s built-in security features (CSRF protection, secure cookies, etc.).  
- Run code audits and tests before deployment.  

## 📃 License
Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Team
Backend developed by the 11-member LARO team from Palawan State University. Contact [ejlqrz@gmail.com](mailto:ejlqrz@gmail.com) for support.

---
🚀 *Building seamless basketball connections with LARO!* 🏀


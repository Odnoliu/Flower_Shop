# Flower Shop Project

This is a web application for a flower shop, built with:
- **Backend**: PHP (pure, no framework) for RESTful API.
- **Frontend**: ReactJS with TailwindCSS for responsive UI.
- **Database**: MySQL (managed via MySQL Workbench).

## Project Structure
flower-shop/
├── backend/                # PHP backend (API)
│   ├── src/               # Source code
│   │   ├── Config/        # Database and config files
│   │   ├── Controllers/   # API logic
│   │   ├── Models/        # Database interactions
│   │   ├── Services/      # Business logic
│   │   ├── Helpers/       # Utility functions
│   │   └── Routes/        # API routing
│   ├── public/            # Public assets (if needed)
│   ├── logs/              # Log files
│   ├── tests/             # Unit tests
│   ├── .env               # Environment variables (not committed)
│   ├── composer.json      # PHP dependencies
│   └── index.php          # API entry point
├── frontend/               # ReactJS + TailwindCSS
│   ├── src/               # React components, pages, styles
│   ├── public/            # Static files
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # TailwindCSS config
├── .gitignore             # Git ignore file
└── README.md              # This file

## Prerequisites
- **PHP**: >= 7.4 (with `openssl` extension enabled)
- **Composer**: For PHP dependencies
- **Node.js**: >= 14.x (for React)
- **MySQL**: Managed via MySQL Workbench
- **Git**: For version control
- **Web server**: Apache/Nginx

## Setup Instructions

### Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
2. Install PHP dependencies:
    ```bash
composer install
3. Copy .env.example to .env and configure:
    ```bash
cp .env.example .env

Update .env with your MySQL credentials:
DB_HOST=localhost
DB_NAME=flower_shop
DB_USER=your_user
DB_PASS=your_password
APP_SECRET=your_secret_key

4. Import database schema:
Use MySQL Workbench to import database/flower_shop.sql (create this file for your schema).

5. Start server
    ```bash
    php -S localhost:8000

6. Test API
User Postman or Curl 

### Frontend Setup
1. Navigate to frontend/:
    ```bash
    cd frontend
2. Install Node.js dependencies:
    ```bash
    npm install
3. Start development server:
    ```bash
    npm start

→ App runs at http://localhost:3000.

### Running the Project
1. Start backend server: php -S localhost:8000
2. Start frontend: cd frontend && npm start.
3. Access the app at http://localhost:3000.
4. API endpoints are at http://localhost:8000/backend/api/*.


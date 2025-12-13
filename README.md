# Flower Shop Project

This is a web application for a flower shop, built with:
- **Backend**: PHP (pure, no framework) for RESTful API.
- **Frontend**: ReactJS with TailwindCSS for responsive UI.
- **Database**: MySQL (managed via MySQL Workbench).

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

4. Update .env with your MySQL credentials:
    ```bash
    DB_HOST=localhost
    DB_NAME=flower_shop
    DB_USER=your_user
    DB_PASS=your_password
    APP_SECRET=your_secret_key

5. Import database schema:
Use MySQL Workbench to import database/flower_shop.sql (create this file for your schema).

6. Start server
    ```bash
    php -S localhost:8000

7. Test API:
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
    npm run dev

→ App runs at http://localhost:3000.

### Running the Project
1. Start backend server: php -S localhost:8000
2. Start frontend: cd frontend && npm start.
3. Access the app at http://localhost:3000.
4. API endpoints are at http://localhost:8000/backend/api/*.


# File Structure & Functionality
### Root Directory
- README.md: Project introduction & setup guide.
- database/schema.sql: SQL schema (users, products, orders, etc.).
### backend/ (PHP API)
- composer.json: Project dependencies (e.g., phpdotenv).

- .env: Database configuration (not committed to version control).

- index.php: Main API entry point; loads routes and handles CORS.

- src/config/database.php: PDO MySQL connection setup.

- src/controllers/: Handles incoming requests (e.g., UserController.php for user CRUD operations).

- src/models/: Database interaction layer (e.g., UserModel.php for queries).

- src/routes/routes.php: Defines API routes (e.g., GET /api/products).

- public/uploads/: Stores uploaded flower images.
### frontend/ (ReactJS + Tailwind)
- package.json: Frontend dependencies (React, Tailwind, etc.).

- src/App.jsx: Main router component.

- src/App.css: Global styling specific to the App component.

- src/index.css: Global base styles and Tailwind imports.

- src/main.jsx: Application entry file; mounts React to the DOM.

- src/components/: Reusable UI components (e.g., ProductCard.jsx, Cart.jsx).

- src/context/: React Context files for state management (e.g., CartContext.jsx, AuthContext.jsx).

- src/pages/: Application pages (e.g., Home.jsx, ProductDetail.jsx).

- src/api/axios_client.js: Handles API calls to the backend (e.g., fetching products).

- vite.config.js: Build and development configuration.
### database/
- schema.sql: Contains SQL definitions for tables (e.g., CREATE TABLE products (id, name, price, image, ...)).

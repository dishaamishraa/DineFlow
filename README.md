# DineFlow

A full-stack restaurant platform where users can sign up, browse the menu,
check live table availability, place orders, and pay bills.

## Tech stack
React (Vite), React Router, Node.js, Express, MySQL, JWT authentication

## Features
- Sign up / log in with hashed passwords (bcrypt) and JWT tokens
- Menu grouped by category
- Live table status (free / occupied / reserved), refreshed every 5 seconds
- Place orders with transaction-safe table booking
- Bill with 5% tax; paying frees the table

## Run locally
1. Create the database and tables:
   mysql -u root -p -e "CREATE DATABASE dineflow;"
   mysql -u root -p < server/schema.sql
   mysql -u root -p < server/migration.sql
2. Backend:
   cd server
   copy .env.example .env   (then fill in your password)
   npm install
   npm run dev
3. Frontend:
   cd client
   npm install
   npm run dev
4. Open http://localhost:5173
Personal Financial Assistant
The Personal Financial Assistant is a full-stack web application designed to empower users to track, manage, and understand their financial activities. It provides an intuitive interface for logging income and expenses, categorizing transactions, viewing spending summaries, and extracting expenses from uploaded receipts. Built with modularity, scalability, and user experience in mind, this application aims to revolutionize personal finance management.
Table of Contents

About
Features
Bonus Features
Tech Stack
Data Model
Installation
Usage
API Endpoints
Contributing
License
Contact

About
The Personal Financial Assistant is a full-stack application that simplifies personal finance management. Users can log income and expenses, categorize transactions, visualize spending habits through graphs, and extract expense data from uploaded receipts (images or PDFs). The application follows a clean separation of concerns, with a frontend web app communicating with a backend via RESTful APIs, and data persisted in a database for reliability and scalability.
This project showcases modern software engineering practices, including clean code, modularity, robust error handling, and comprehensive documentation, making it a robust portfolio piece for software engineers.
Features

Transaction Logging: Create and categorize income and expense entries through an intuitive web interface.
Transaction Listing: View a list of income and expenses within a specified time range.
Data Visualization: Generate graphs to analyze expenses by category, date, or other metrics.
Receipt Extraction: Upload receipts (images or PDFs) to automatically extract and log expense data.

Bonus Features

Transaction History Import: Upload transaction history from tabular PDFs for bulk import.
Pagination: Support paginated API responses for listing transactions, improving performance for large datasets.
Multi-User Support: Allow multiple users to register and manage their finances independently.

Tech Stack

Frontend: React.js with Tailwind CSS for a responsive and modern UI.
Backend: Node.js with Express.js for RESTful APIs.
Database: PostgreSQL for persistent storage of user and transaction data.
Receipt Processing: Tesseract.js (for image OCR) and pdf2json (for PDF parsing) for expense extraction.
Other Tools:
Axios for API calls from the frontend.
Chart.js for data visualization.
Multer for file uploads.
JSON Web Tokens (JWT) for user authentication (multi-user support).
ESLint and Prettier for code quality and consistency.



Data Model
The application uses a relational data model in PostgreSQL to ensure data integrity and efficient querying. Key tables include:

Users (for multi-user support):

user_id (Primary Key, UUID)
username (String, Unique)
email (String, Unique)
password_hash (String)
created_at (Timestamp)


Transactions:

transaction_id (Primary Key, UUID)
user_id (Foreign Key, references Users)
amount (Decimal)
category (String, e.g., "Groceries", "Salary")
type (Enum: "Income", "Expense")
date (Date)
description (String, Optional)
created_at (Timestamp)


Categories (for customizable categories):

category_id (Primary Key, UUID)
user_id (Foreign Key, references Users, allows custom categories per user)
name (String, e.g., "Utilities")
type (Enum: "Income", "Expense")



This model supports efficient querying for transaction listings, filtering by date range, and generating visualizations by category or date.
Installation
Follow these steps to set up the Personal Financial Assistant locally:
Prerequisites

Node.js (v18 or higher)
PostgreSQL (v14 or higher)
Git
A modern web browser (e.g., Chrome, Firefox)

Steps

Clone the Repository
git clone https://github.com/your-username/personal-financial-assistant.git
cd personal-financial-assistant


Install Backend DependenciesNavigate to the backend directory:
cd backend
npm install


Install Frontend DependenciesNavigate to the frontend directory:
cd ../frontend
npm install


Set Up PostgreSQL Database

Create a database named personal_finance.
Run the SQL schema file to set up tables:psql -U your_postgres_user -d personal_finance -f backend/db/schema.sql




Configure Environment VariablesCreate a .env filerobin in the backend directory:
DATABASE_URL=postgresql://your_postgres_user:your_password@localhost:5432/personal_finance
JWT_SECRET=your_jwt_secret
PORT=5000

Create a .env file in the frontend directory (if needed for API URL):
REACT_APP_API_URL=http://localhost:5000/api


Run the Backend
cd backend
npm start


Run the FrontendIn a new terminal:
cd frontend
npm start


Access the AppOpen your browser and navigate to http://localhost:3000.


Usage

Register/Login: Create an account or log in to access your dashboard.
Log Transactions: Use the "Add Transaction" form to input income or expenses, selecting a category and date.
View Transactions: Filter transactions by date range to see a paginated list.
Visualize Data: Navigate to the "Reports" section to view graphs (e.g., expenses by category or date).
Upload Receipts: Use the upload feature to process receipts (images or PDFs) for automatic expense extraction.

Example API Usage
To create a transaction via API:
curl -X POST http://localhost:5000/api/transactions \
-H "Authorization: Bearer <your_jwt_token>" \
-H "Content-Type: application/json" \
-d '{"amount": 50, "category": "Groceries", "type": "Expense", "date": "2025-07-06", "description": "Weekly shopping"}'

API Endpoints

POST /api/register: Register a new user.
POST /api/login: Authenticate and receive a JWT.
GET /api/transactions: List transactions (supports ?startDate, ?endDate, ?page, ?limit for pagination).
POST /api/transactions: Create a new transaction.
POST /api/receipts: Upload a receipt (image/PDF) for expense extraction.
GET /api/reports/categories: Get expense data by category for visualization.
GET /api/reports/dates: Get expense data by date for visualization.

Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch:git checkout -b feature/your-feature-name


Commit your changes:git commit -m "Add your feature description"


Push to the branch:git push origin feature/your-feature-name


Open a pull request.

Please adhere to the Code Quality Guidelines below.
Code Quality Guidelines

Clean Code: Use clear, meaningful variable/function names and avoid complex structures.
Modularity: Organize code into reusable modules and components.
Documentation: Update this README and include inline comments for complex logic (optional).
Error Handling: Implement robust validation and error handling for all inputs and API responses.

License
This project is licensed under the MIT License - see the LICENSE.md file for details.
Contact
For questions or feedback, contact:

GitHub: your-username
Email: your.email@example.com

Thank you for exploring the Personal Financial Assistant! Let’s revolutionize personal finance together!

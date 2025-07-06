# 💰 Personal Financial Assistant

Welcome to the **Personal Financial Assistant**, a dynamic full-stack web application designed to revolutionize personal finance management.

This project empowers users to:
- Track income and expenses
- Visualize financial data through interactive charts
- Extract transactions from uploaded receipts or tabular PDFs

Built with clean, modular code and robust error handling, it showcases modern software engineering practices and serves as a standout portfolio piece for a software engineering placement.

---

## 📑 Table of Contents

- [About](#about)
- [Features](#features)
- [Bonus Features](#bonus-features)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Installation](#installation)

---

## 📘 About

The **Personal Financial Assistant** is a full-stack web application that simplifies personal finance management.

With a sleek, user-friendly interface, users can:
- Register with email verification
- Log and categorize transactions
- View detailed financial summaries
- Upload receipts or PDFs to extract expense data

The application separates frontend and backend logic, communicates via RESTful APIs, and persists data in a PostgreSQL database for scalability and reliability.

This project demonstrates expertise in full-stack development, data visualization, and file processing — making it an ideal showcase for a software engineering role.

---

## ✨ Features

### 🔐 Email Verification
Secure user registration with email verification to ensure account authenticity.

### 📊 Dashboard
- Links to Profile, Dashboard, Income, Expenses, Add Transactions, and Logout pages
- Pie chart displaying total income, total expenses, and balance
- Numeric display of income, expenses, and balance
- Download transactions (all or filtered) as **PDF**, **Excel**, or **CSV**
- Interactive pie/bar charts for income/expenses by category
- Line chart showing balance variation over time
- Paginated transaction list (5 per page) with filters:
  - Start date
  - End date
  - Sort order (recent, high-to-low amount, low-to-high amount)
  - Dynamic user-defined categories
- Reset filters button for easy navigation
![image](https://github.com/user-attachments/assets/05733a0e-9d64-47f6-8e90-b195c76c4e8f)
![image](https://github.com/user-attachments/assets/f2d4c86a-eacb-476a-93c1-d6899386578b)



### 📈 Income & Expenses Pages
- Display filtered content specific to **income** or **expenses**
- Same visualizations and download options as the dashboard but specific to **income** or **expenses**

### ➕ Add Transactions
- Manual entry for income/expense with amount, category, date, and description
- Upload **receipts** for automatic expense extraction
- Upload **tabular PDFs** for bulk transaction import
![image](https://github.com/user-attachments/assets/a68c5b71-9e62-4aa6-a007-2711af840e14)
![image](https://github.com/user-attachments/assets/e432af3d-4faf-4484-a749-bc4bf52ce647)


### 👤 Profile Page
- View user details (name, email)

### 📉 Data Visualization
- Dynamic pie charts, bar graphs, and line charts for insightful analysis

---

## 🚀 Bonus Features

- **Multi-User Support**: Secure JWT-authenticated users with isolated data
- **Pagination**: Handles large datasets with paginated API responses (5 per page)
- **Tabular PDF Import**: Extracts structured data from uploaded PDFs

These features demonstrate advanced functionality, scalability, and thoughtful user-focused design.

---

## 🛠 Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js (RESTful APIs)
- **Database**: MongoDB

### 📁 File Processing
- `tesseract.js`: OCR for receipt image processing
- `pdf2json`: For parsing tabular PDFs

### 📊 Data Visualization
- `Chart.js`: Interactive pie, bar, and line charts

### 🧰 Other Tools
- `Axios`: API communication
- `Multer`: File uploads
- `JWT`: Authentication
- `Nodemailer`: Email verification
- `jsPDF`, `exceljs`, `json2csv`: File export (PDF, Excel, CSV)
- `ESLint`, `Prettier`: Code quality and formatting

---

## 🧩 Data Model

A **MONGODB** database is used. Key schemas:

### Users

| Field        | Type           |
|--------------|----------------|
| user_id      | UUID, Primary Key |
| name         | String         |
| email        | String, Unique |
| password_hash| String         |
| is_verified | Boolean      |
| created_at   | Timestamp      |

### Transactions

| Field         | Type                           |
|---------------|--------------------------------|
| transaction_id| UUID, Primary Key              |
| user_id       | UUID, Foreign Key (Users)      |
| amount        | Decimal                        |
| category_id   | String                         |
| type          | Enum: `"Income"` or `"Expense"`|
| date          | Date                           |
| description   | String (optional)              |
| created_at    | Timestamp                      |

---

## ⚙️ Installation

### ✅ Prerequisites
- Node.js 
- MongoDB
- Git
- Modern Web Browser

### 🔧 Steps

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/your-username/personal-financial-assistant.git](https://github.com/GaneshSriVardhan/PersonalFinanceAssistant)
   cd personal-financial-assistant
2. **Install Backend Dependencies**

    ```bash
    cd backend
    npm install
3. **Install Frontend Dependencies**

    ```bash
    cd ../frontend
    npm install
4. **Configure Environment Variables**

    ```.env (Backend):
    DATABASE_URL=yourURL
    JWT_SECRET=your_jwt_secret
    CLIENT_URI=http://localhost:3000
    EMAIL_USER=your_email_user
    EMAIL_PASS=your_email_password
    PORT=5000
    ```
    ```.env (Frontend):
    REACT_APP_API_URL=http://localhost:5000
  5. **Run the Backend**
     cd backend
     npm start
  6. **Run the Frontend**
      cd frontend
      npm start

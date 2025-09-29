# 📦 Backend Service – Setup Guide

Welcome to the **Backend Service** of the `pbroker` monorepo. This guide walks you through setting up and running the backend locally for development, testing, or integration.

---

## 🧰 1. Prerequisites

Ensure the following are installed on your local development environment:

- **Node.js** – Latest LTS version recommended  
- **npm** – Comes bundled with Node.js  
- **PostgreSQL** – Supabase PostgreSQL instance (local or remote), accessible via `DATABASE_URL` and `DIRECT_URL` in your environment config

> ℹ️ Contact the Backend team if you need access credentials.

---

## 📁 2. Clone Repository & Navigate

Clone the monorepo and navigate to the backend service directory:

```bash
git clone https://github.com/hulum-inc/pbroker.git
cd pbroker
cd pbroker-backend/          # Navigate to the backend service
git checkout dev             # Switch to the dev branch
```

---

## 🔐 3. Environment Configuration

The backend service uses a `.env` file for sensitive configurations.

1. Duplicate the example configuration file:

    ```bash
    cp .env.example .env
    ```

2. Edit the `.env` file with appropriate values such as:
   - Database connection strings
   - JWT secrets
   - Application ports

> ⚠️ Do **not** commit `.env` files to version control.

---

## 📦 4. Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

## 🚀 5. Run the Development Server

Start the backend server:

```bash
npm run dev
```

The service will be running at:

```
http://localhost:<PORT>
```

Replace `<PORT>` with the value from your `.env` file (e.g., `4000`).

---

## 🌐 6. API Usage

- All API endpoints are **prefixed** with `/api`
- To confirm the server is running, visit:

  ```
  GET http://localhost:<PORT>/api/health
  ```

- Swagger API documentation is available at:

  ```
  http://localhost:<PORT>/api/api-docs
  ```

This interface provides a visual overview of all available endpoints and their request/response structures.

---

## 🧪 7. Next Steps

You can now:

- Test endpoints using Postman, Insomnia, or Swagger UI
- Connect your frontend to this backend
- Begin development or debugging tasks

---

## 📬 Need Help?

Reach out to the backend team on Telegram or check the internal developer documentation if you face any setup issues.

---

**Happy coding! 🛠️**

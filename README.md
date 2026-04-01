# Home Cleaning Service System (HCSS)

The **Home Cleaning Service System (HCSS)** is a comprehensive, modern web application designed to streamline the booking and management of professional cleaning services. It provides a seamless interface for clients to book services, for workers to manage their assignments, and for administrators to oversee the entire platform.

---

## 🚀 Key Features

- **User Management**: Multi-role system (Admin, Client, Worker) with secure authentication.
- **Service Booking**: Interactive client portal to request cleaning services with date, time, and location.
- **Worker Dashboard**: Tools for workers to view assignments, update status (e.g., "Arrived," "Completed"), and set availability.
- **Admin Control Center**: Manage services, monitor reports, user accounts, and handle global system settings.
- **Dynamic Reviews**: Clients can provide feedback and ratings for services they've received.
- **Secure Payments**: Integrated tracking for various payment methods like GCASH, Card, and Cash.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [MariaDB](https://mariadb.org/) / [MySQL](https://www.mysql.com/)
- **Validation**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)
- **Table Management**: [TanStack Table](https://tanstack.com/table)
- **State/Icons**: [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons)

---

## 📂 Project Structure & Documentation

Detailed documentation for each area of the project can be found in the [`docs/`](./docs) directory:

- 🏗️ **[Architecture](./docs/ARCHITECTURE.md)**: High-level system design and directory structure.
- 🗄️ **[Database Schema](./docs/SCHEMA.md)**: Models, Enums, and Entity Relationship Diagram.
- 🔌 **[API Routes](./docs/API_ROUTES.md)**: Details on available endpoints and request/response formats.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/)
- A running MariaDB or MySQL instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YourUsername/home-cleaning-service-system.git
    cd home-cleaning-service-system
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Setup environment variables:**
    Create a `.env` file in the root directory and add your connection strings:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/hcss_db"
    ```

4.  **Synchronize the database:**
    ```bash
    npx prisma db push
    ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

---

## 📝 License

This project is licensed under the **ISC License**.

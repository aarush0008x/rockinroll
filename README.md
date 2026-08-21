# 🌯 RockinRoll — Gourmet Food Ordering & Delivery Platform

**RockinRoll** is a production-grade, full-stack food ordering and delivery web platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Cashfree Payments**, and **Brevo Transactional Emails**.

---

## 🌟 Key Features

- **🎨 Premium Responsive UI & 3D Interactive Roll**: Procedural Three.js 3D gourmet roll with interactive rotation and custom lighting.
- **🛡️ JWT Authentication & Role-Based Access Control**:
  - `CUSTOMER`: Order customization, live tracking, order history, address book.
  - `STAFF`: Kitchen Display System (KDS) with prep timers & status advancement.
  - `DELIVERY_PARTNER`: Rider fleet dispatch, customer calling & Google Maps navigation.
  - `ADMIN`: Platform analytics, user management, category & product catalog controls, master live order override.
- **⚡ Real-Time Live Order Management**: 6-stage live fulfillment pipeline (`CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
- **💳 Payment Integration**: Cashfree Payment Gateway integration + Cash on Delivery (COD).
- **📧 Brevo (Sendinblue) Transactional Emails**:
  - Account verification with 6-digit OTP codes (`/auth/verify`).
  - Secure password reset flows (`/auth/forgot-password` & `/auth/reset-password`).
  - Real-time order status update emails with direct tracking buttons.
- **📱 PWA & Mobile-First**: Installable Progressive Web App with offline fallback support.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aarush0008x/rockinroll.git
cd rockinroll
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="your_jwt_access_secret_min_32_chars"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_min_32_chars"
CASHFREE_APP_ID="your_cashfree_app_id"
CASHFREE_SECRET_KEY="your_cashfree_secret_key"
CASHFREE_WEBHOOK_SECRET="your_cashfree_webhook_secret"
CASHFREE_ENVIRONMENT="PROD"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
NEXT_PUBLIC_APP_NAME="RockinRoll"
BREVO_API_KEY="your_brevo_api_key_here"
BREVO_SENDER_EMAIL="rockinroll@gmail.com"
BREVO_SENDER_NAME="RockinRoll Gourmet Rolls"
```

### 3. Initialize Database & Seed
```bash
npx prisma db push
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 📍 Contact & Kitchen HQ
- **Location**: CGC university, Mohali
- **Phone**: +91 95017 14559
- **Email**: support@rockinroll.in
- **Hours**: Open Daily 11:00 AM – 11:00 PM<br>
In Collab With [Renuka](https://github.com/Renuka-wq) <br>


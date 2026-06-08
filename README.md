# Styleverse

Styleverse is a full-stack e-commerce college project with a customer storefront, an admin/seller dashboard, and a Node.js backend with Python-powered virtual try-on.

## Hosted Links

- Frontend: https://styleverse-app.netlify.app
- Admin/Seller Dashboard: https://styleverse-app-admin.netlify.app
- Backend API: https://styleverse-22l1.onrender.com

## Project Structure

```text
Styleverse/
  backend/   Node.js, Express, MongoDB, Socket.IO, GraphQL, Stripe, Cloudinary, Python try-on proxy
  client/    Customer React app
  admin/     Admin and seller React dashboard
```

## Features

- Customer authentication and email verification
- Product listing, filters, categories, badges, recommendations, cart, wishlist, checkout, orders, invoices
- Stripe payment flow
- Admin login, product/category/order/user/seller management
- Seller dashboard and seller request approval flow
- Realtime notifications with Socket.IO
- Live camera virtual try-on using Python, MediaPipe, OpenCV, and rembg
- AI try-on through OpenRouter image models

## Tech Stack

- Frontend: React, Redux Toolkit, Tailwind CSS, Axios, Socket.IO Client, Stripe.js
- Admin: React, Material UI, Redux Toolkit, Apollo Client, GraphQL
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, Apollo Server, Stripe, Cloudinary
- Python: Flask, Flask-SocketIO, OpenCV, MediaPipe, rembg

## Clone Project

```bash
git clone https://github.com/Ranasahil19/Styleverse.git
cd Styleverse
```

## Backend Setup

```bash
cd backend
npm install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
npm run dev
```

Production start command:

```bash
cd backend
npm install
npm start
```

Backend default URL:

```text
http://localhost:5000
```

Python try-on default URL:

```text
http://localhost:5001
```

## Backend Environment Variables

Create `backend/.env`:

```env
PORT=
MONGO_URI=

CLIENT_URL=
ADMIN_CLIENT_URL=
ALLOWED_ORIGINS=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
REFRESH_ENCRYPTION_KEY=

ADMIN_USERNAME=
ADMIN_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

EMAIL_FROM=
EMAIL_USER=
EMAIL_PASSWORD=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

OPENROUTER_API_KEY=
OPENROUTER_IMAGE_MODEL=
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=

PYTHON_PORT=
PYTHON_URL=
PYTHON_BIN=
START_PYTHON_SERVER=
TRYON_REQUEST_TIMEOUT=
TRYON_PRODUCT_CACHE_LIMIT=
MPLCONFIGDIR=
```

## Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend default URL:

```text
http://localhost:3000
```

## Frontend Environment Variables

Create `client/.env`:

```env
REACT_APP_API_BASE_URL=
REACT_APP_STRIPE_PUBLIC_KEY=
SECRET_KEY=
```

For local development, use:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=
SECRET_KEY=
```

## Admin Setup

```bash
cd admin
npm install
npm start
```

Admin default URL:

```text
http://localhost:3000
```

If the customer frontend is already running on port `3000`, React will ask to start admin on another port, usually `3001`.

## Admin Environment Variables

Create `admin/.env`:

```env
REACT_APP_API_BASE_URL=
REACT_APP_SECRET_KEY=
REACT_APP_VERSION=
```

For local development, use:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SECRET_KEY=
REACT_APP_VERSION=
```

## Run All Projects Locally

Open three terminals.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd client
npm start
```

Terminal 3:

```bash
cd admin
npm start
```

## Build Commands

Frontend build:

```bash
cd client
npm run build
```

Admin build:

```bash
cd admin
npm run build
```

Backend start:

```bash
cd backend
npm start
```

## Docker Backend Deployment

The root `Dockerfile` builds the backend with Node.js and Python dependencies.

```bash
docker build -t styleverse-backend .
docker run -p 5000:10000 --env-file backend/.env styleverse-backend
```

When deployed with Docker, the backend exposes port `10000` inside the container.

## Important Hosting Notes

- Set `REACT_APP_API_BASE_URL` in both `client` and `admin` to your hosted backend URL.
- Set `CLIENT_URL`, `ADMIN_CLIENT_URL`, and `ALLOWED_ORIGINS` in backend hosting to your hosted frontend/admin URLs.
- Live try-on is CPU-heavy. Use a backend host with enough RAM/CPU for `mediapipe`, `opencv`, and `rembg`.
- If try-on is slow on hosting, increase `TRYON_REQUEST_TIMEOUT` and use a stronger backend instance.
- Never commit real `.env` values, API keys, Stripe keys, MongoDB URI, or JWT secrets.

## Useful API URLs

```text
GET  /test
POST /tryon
POST /api/ai-tryon
GET  /graphql
```

## License

This project is for academic/college project use.

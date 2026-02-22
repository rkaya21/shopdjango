# ShopDjango 🛒

A full-stack e-commerce platform built with Django REST Framework and React, containerized with Docker.

## Tech Stack

**Backend**
- Django 6 + Django REST Framework
- PostgreSQL
- Celery + Redis (async tasks & background jobs)
- JWT Authentication

**Frontend**
- React
- Tailwind CSS

**DevOps**
- Docker & Docker Compose

## Features

- User registration & login with JWT
- Product listing, detail pages & category filtering
- Shopping cart management
- Order placement & order history
- Async email notifications via Celery
- Admin panel for full content management

## Project Structure

```
shopdjango/
├── backend/
│   ├── core/          # Project settings, URLs, Celery config
│   ├── users/         # Custom user model, auth endpoints
│   ├── products/      # Product & category models, API
│   ├── orders/        # Cart, order models, API
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/rkaya21/shopdjango.git
cd shopdjango
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your own values.

3. **Build and run containers**

```bash
docker-compose up --build
```

4. **Apply migrations**

```bash
docker-compose exec backend python manage.py migrate
```

5. **Create a superuser**

```bash
docker-compose exec backend python manage.py createsuperuser
```

6. **Access the app**

| Service       | URL                          |
|---------------|------------------------------|
| Backend API   | http://localhost:8000/api/   |
| Admin Panel   | http://localhost:8000/admin/ |
| Frontend      | http://localhost:3000/       |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register a new user |
| POST | `/api/auth/login/` | Login & get JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products |
| GET | `/api/products/<slug>/` | Product detail |
| GET | `/api/categories/` | List all categories |

### Cart & Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/` | Get current user's cart |
| POST | `/api/cart/add/` | Add item to cart |
| DELETE | `/api/cart/remove/<id>/` | Remove item from cart |
| GET | `/api/orders/` | List user's orders |
| POST | `/api/orders/create/` | Place an order |

## Environment Variables

See `.env.example` for all required variables:

```env
POSTGRES_DB=shopdjango
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first.
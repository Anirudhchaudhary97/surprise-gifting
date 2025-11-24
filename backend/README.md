# Surprise Gifting - Backend API

Backend API for the Surprise Gifting Platform built with Express.js, TypeScript, Prisma, and PostgreSQL (Neon).

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon - Serverless)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Neon PostgreSQL database (free tier available at [neon.tech](https://neon.tech))
- Cloudinary account for image uploads
- Stripe account for payments

## 🛠 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   
   Create a `.env` file in the backend root directory:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your credentials:
   ```env
   # Database (Get from Neon dashboard)
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/surprise_gifting?sslmode=require"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   JWT_EXPIRES_IN="7d"

   # Cloudinary (Get from cloudinary.com)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Stripe (Get from stripe.com)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Server
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database** (optional but recommended):
   ```bash
   npm run prisma:seed
   ```

## 🎯 Running the Server

### Development Mode
```bash
npm run dev
```
Server will start on `http://localhost:5000`

### Production Mode
```bash
npm run build
npm start
```

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### **Auth Routes** (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user

#### **Category Routes** (`/api/categories`)
- `GET /` - Get all categories (public)
- `GET /:id` - Get category by ID (public)
- `POST /` - Create category (admin only)
- `PUT /:id` - Update category (admin only)
- `DELETE /:id` - Delete category (admin only)

#### **Gift Routes** (`/api/gifts`)
- `GET /` - Get all gifts with filters (public)
  - Query params: `categoryId`, `minPrice`, `maxPrice`, `search`, `featured`, `page`, `limit`
- `GET /:id` - Get gift by ID (public)
- `POST /` - Create gift with images (admin only)
- `PUT /:id` - Update gift (admin only)
- `DELETE /:id` - Delete gift (admin only)
- `DELETE /images/:imageId` - Delete gift image (admin only)

#### **Cart Routes** (`/api/cart`)
- `GET /` - Get user's cart (authenticated)
- `POST /add` - Add item to cart (authenticated)
- `PUT /update` - Update cart item (authenticated)
- `DELETE /remove/:cartItemId` - Remove item from cart (authenticated)
- `DELETE /clear` - Clear cart (authenticated)

#### **Order Routes** (`/api/orders`)
- `POST /` - Create order (authenticated)
- `GET /user` - Get user's orders (authenticated)
- `GET /:id` - Get order details (authenticated)
- `GET /` - Get all orders (admin only)
- `PUT /:id` - Update order status (admin only)

#### **Review Routes** (`/api/reviews`)
- `GET /gift/:giftId` - Get reviews for a gift (public)
- `POST /` - Create review (authenticated, must have purchased)
- `PUT /:id` - Update review (authenticated, own review only)
- `DELETE /:id` - Delete review (authenticated, own review only)

## 🗄 Database Schema

### Models
- **User** - User accounts (customers and admins)
- **Category** - Gift categories
- **Gift** - Products/gifts
- **GiftImage** - Multiple images per gift
- **Review** - User reviews and ratings
- **Cart** - Shopping cart
- **CartItem** - Items in cart with customization
- **Order** - Order header
- **OrderItem** - Order line items
- **Address** - Delivery addresses

### Enums
- **Role**: `USER`, `ADMIN`
- **OrderStatus**: `PENDING`, `PREPARING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`

## 🔐 Default Credentials (After Seeding)

### Admin Account
- Email: `admin@surprise.com`
- Password: `admin123`

### Test User
- Email: `john@example.com`
- Password: `password123`

## 📦 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── config/            # Configuration files
│   │   ├── database.ts
│   │   ├── cloudinary.ts
│   │   └── stripe.ts
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── server.ts          # Express app entry
├── uploads/               # Temporary file uploads
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json
└── tsconfig.json
```

## 🧪 Testing

### Test API with cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Gifts:**
```bash
curl http://localhost:5000/api/gifts
```

## 🚢 Deployment

### Environment Variables
Ensure all environment variables are set in your production environment.

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## 🔧 Troubleshooting

### Database Connection Issues
- Verify your Neon connection string is correct
- Ensure `?sslmode=require` is appended to the connection string
- Check if your IP is whitelisted in Neon dashboard

### Cloudinary Upload Errors
- Verify API credentials are correct
- Check if `uploads/` directory exists
- Ensure file size is under 5MB

### Stripe Payment Errors
- Use test mode keys during development
- Test with Stripe test cards: `4242 4242 4242 4242`
- Check webhook configuration for production

## 📝 License

ISC

## 👥 Support

For issues or questions, please create an issue in the repository.

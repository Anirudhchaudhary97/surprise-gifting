# Surprise Gifting Website - Frontend

This is the frontend for the Surprise Gifting Website, built with Next.js 14, TypeScript, Tailwind CSS, and React Query.

## Features

- **User Features**
  - Browse gifts by category
  - Filter gifts by price, search, and category
  - Product details with image gallery
  - Customization options (Personal message, Add-ons, Image upload)
  - Shopping Cart management
  - Secure Checkout with Stripe
  - Order history and tracking
  - User authentication (Login/Register)

- **Admin Features**
  - Dashboard with key statistics
  - Manage Gifts (Create, Edit, Delete)
  - Manage Categories
  - Manage Orders (View details, Update status)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (Cart & Auth)
- **Data Fetching:** TanStack React Query
- **Forms:** React Hook Form
- **Payment:** Stripe Elements
- **Icons:** Heroicons (via SVG)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on port 5000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication pages
│   ├── (user)/           # User pages (Cart, Checkout, etc.)
│   ├── admin/            # Admin dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
│   ├── cart/             # Cart related components
│   ├── gift/             # Gift related components
│   ├── layout/           # Layout components (Navbar, Footer)
│   └── ui/               # Basic UI components (Button, Input, etc.)
├── lib/                  # Utilities and API client
├── store/                # Zustand stores
├── types/                # TypeScript interfaces
└── public/               # Static assets
```

## Key Components

- **Navbar:** Handles navigation, auth state, and cart count.
- **GiftCard:** Displays gift summary with hover effects.
- **ProductGallery:** Interactive image gallery for product details.
- **CartItem:** Manages individual cart items (quantity, remove).
- **AdminLayout:** Sidebar navigation for admin pages.

## Deployment

The application is designed to be deployed on Vercel.

1. Push code to GitHub.
2. Import project in Vercel.
3. Set environment variables in Vercel dashboard.
4. Deploy.

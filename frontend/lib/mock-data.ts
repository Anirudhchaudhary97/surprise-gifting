import {
  type CartItem,
  type Category,
  type Gift,
  type Order,
  type Review,
} from "@/types";

export const categoriesMock: Category[] = [
  {
    id: "cat-1",
    name: "Birthday Delights",
    slug: "birthday-delights",
    image: "/images/categories/birthday.jpg",
    description: "Curated surprises to make birthdays unforgettable.",
  },
  {
    id: "cat-2",
    name: "Anniversary Bliss",
    slug: "anniversary-bliss",
    image: "/images/categories/anniversary.jpg",
    description: "Romantic experiences and keepsakes for every milestone.",
  },
  {
    id: "cat-3",
    name: "Corporate Gifting",
    slug: "corporate-gifting",
    image: "/images/categories/corporate.jpg",
    description: "Thoughtful kits tailored for clients and teams.",
  },
];

export const giftsMock: Gift[] = [
  {
    id: "gift-1",
    name: "Sunrise Breakfast Basket",
    slug: "sunrise-breakfast-basket",
    price: 89,
    images: [
      "/images/gifts/breakfast-1.jpg",
      "/images/gifts/breakfast-2.jpg",
      "/images/gifts/breakfast-3.jpg",
    ],
    categoryId: "cat-1",
    categoryName: "Birthday Delights",
    rating: 4.8,
    reviewsCount: 128,
    shortDescription:
      "Fresh pastries, premium teas, and a handwritten note to start the day right.",
    description:
      "Crafted for early risers, this basket includes an assortment of freshly baked goods, locally sourced jams, organic tea blends, and a personalized note card.",
    tags: ["breakfast", "birthday", "gourmet"],
    isCustomizable: true,
    allowPersonalMsg: true,
    allowAddons: true,
    allowImageUpload: true,
    addons: [
      {
        id: "artisan-coffee",
        name: "Artisan coffee beans",
        price: 12,
        description: "Single-origin roast from the Himalayas",
      },
      {
        id: "handcrafted-mug",
        name: "Handcrafted ceramic mug",
        price: 18,
        description: "Locally made stoneware mug in a neutral glaze",
      },
      {
        id: "greeting-card",
        name: "Handwritten greeting card",
        price: 8,
        description: "Include a premium cardstock card with your message",
      },
    ],
  },
  {
    id: "gift-2",
    name: "Weekend Escape Experience",
    slug: "weekend-escape-experience",
    price: 259,
    images: [
      "/images/gifts/weekend-1.jpg",
      "/images/gifts/weekend-2.jpg",
      "/images/gifts/weekend-3.jpg",
    ],
    categoryId: "cat-2",
    categoryName: "Anniversary Bliss",
    rating: 4.9,
    reviewsCount: 96,
    shortDescription:
      "A two-night boutique stay paired with spa treatments and dinner reservations.",
    description:
      "Surprise your partner with a curated getaway featuring boutique accommodations, spa sessions, and chef-curated dining.",
    tags: ["experience", "anniversary", "luxury"],
  },
  {
    id: "gift-3",
    name: "Executive Productivity Kit",
    slug: "executive-productivity-kit",
    price: 149,
    images: ["/images/gifts/executive-1.jpg", "/images/gifts/executive-2.jpg"],
    categoryId: "cat-3",
    categoryName: "Corporate Gifting",
    rating: 4.6,
    reviewsCount: 54,
    shortDescription:
      "Premium stationery, a smart mug, and productivity tools for peak performance.",
    description:
      "A thoughtful kit designed to elevate your team's workspace with smart productivity gadgets and elegant stationery.",
    tags: ["corporate", "productivity", "tech"],
  },
  {
    id: "gift-4",
    name: "Luxury Floral Subscription",
    slug: "luxury-floral-subscription",
    price: 199,
    images: ["/images/gifts/floral-1.jpg", "/images/gifts/floral-2.jpg"],
    categoryId: "cat-1",
    categoryName: "Birthday Delights",
    rating: 4.7,
    reviewsCount: 87,
    shortDescription:
      "Hand-tied bouquets delivered monthly with seasonal stems.",
    description:
      "Keep the celebration going with a trio of seasonal floral arrangements delivered over three months.",
    tags: ["floral", "subscription", "birthday"],
  },
];

export const reviewsMock: Review[] = [
  {
    id: "rev-1",
    rating: 5,
    comment:
      "Exceeded expectations! The presentation was stunning and delivery was on time.",
    user: {
      id: "user-1",
      name: "Priya Sharma",
      avatar: "/images/users/priya.jpg",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "rev-2",
    rating: 4,
    comment:
      "Loved the curation, would have liked a custom note option by default.",
    user: {
      id: "user-2",
      name: "Ishan Verma",
    },
    createdAt: new Date().toISOString(),
  },
];

export const cartMock: CartItem[] = [
  {
    id: "cart-gift-1-standard",
    giftId: "gift-1",
    name: "Sunrise Breakfast Basket",
    image: "/images/gifts/breakfast-1.jpg",
    basePrice: 89,
    price: 158,
    quantity: 1,
    addons: [
      {
        id: "greeting-card",
        name: "Handwritten greeting card",
        price: 8,
      },
      {
        id: "artisan-coffee",
        name: "Artisan coffee beans",
        price: 12,
      },
    ],
    personalization: {
      message: "Happy birthday! Enjoy the treats.",
      giftWrap: {
        enabled: true,
        price: 49,
      },
    },
  },
  {
    id: "cart-gift-3-default",
    giftId: "gift-3",
    name: "Executive Productivity Kit",
    image: "/images/gifts/executive-1.jpg",
    basePrice: 149,
    price: 149,
    quantity: 2,
  },
];

export const ordersMock: Order[] = [
  {
    id: "order-1045",
    status: "preparing",
    total: 387,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    paymentMethod: "stripe",
    shippingAddress: {
      fullName: "Ananya Rao",
      line1: "221B Residency Road",
      city: "Bengaluru",
      state: "KA",
      postalCode: "560001",
      country: "India",
    },
    items: [
      {
        giftId: "gift-1",
        name: "Sunrise Breakfast Basket",
        image: "/images/gifts/breakfast-1.jpg",
        price: 89,
        quantity: 1,
      },
      {
        giftId: "gift-4",
        name: "Luxury Floral Subscription",
        image: "/images/gifts/floral-1.jpg",
        price: 199,
        quantity: 1,
      },
    ],
  },
  {
    id: "order-1023",
    status: "delivered",
    total: 149,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    paymentMethod: "cod",
    shippingAddress: {
      fullName: "Rahul Singh",
      line1: "78 Ocean View",
      city: "Mumbai",
      state: "MH",
      postalCode: "400002",
      country: "India",
    },
    items: [
      {
        giftId: "gift-3",
        name: "Executive Productivity Kit",
        image: "/images/gifts/executive-1.jpg",
        price: 149,
        quantity: 1,
      },
    ],
  },
];

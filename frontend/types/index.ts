export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Gift {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  rating: number;
  reviewsCount: number;
  shortDescription: string;
  description: string;
  tags: string[];
  stock?: number;
  isCustomizable?: boolean;
  allowPersonalMsg?: boolean;
  allowAddons?: boolean;
  allowImageUpload?: boolean;
  addonsOptions?: string[];
  featured?: boolean;
  imageRecords?: GiftImageRecord[];
  addons?: GiftAddonOption[];
}

export interface GiftImageRecord {
  id?: string;
  url: string;
  isPrimary?: boolean;
}

export interface GiftAddonOption {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface OrderItem {
  giftId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  paymentMethod: "stripe" | "cod";
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface CartItem {
  id: string;
  giftId: string;
  name: string;
  image: string;
  basePrice: number;
  price: number;
  quantity: number;
  addons?: CartAddonSelection[];
  personalization?: CartPersonalization;
}

export interface CartAddonSelection {
  id: string;
  name: string;
  price: number;
}

export interface CartPersonalization {
  message?: string;
  giftWrap?: {
    enabled: boolean;
    price: number;
  };
  artwork?: {
    previewUrl: string;
    fileName?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

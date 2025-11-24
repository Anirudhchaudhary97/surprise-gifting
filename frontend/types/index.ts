export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    slug: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        gifts: number;
    };
}

export interface GiftImage {
    id: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
}

export interface Gift {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    isCustomizable: boolean;
    allowPersonalMsg: boolean;
    allowAddons: boolean;
    allowImageUpload: boolean;
    addonsOptions: string[];
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    category?: Category;
    images: GiftImage[];
    averageRating?: number;
    _count?: {
        reviews: number;
    };
}

export interface Review {
    id: string;
    userId: string;
    giftId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
    };
}

export interface CartItem {
    id: string;
    cartId: string;
    giftId: string;
    quantity: number;
    personalMessage?: string;
    selectedAddons: string[];
    deliveryDate?: string;
    customImageUrl?: string;
    gift: Gift;
    createdAt: string;
    updatedAt: string;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    giftId: string;
    quantity: number;
    price: number;
    personalMessage?: string;
    selectedAddons: string[];
    deliveryDate?: string;
    customImageUrl?: string;
    gift: Gift;
    createdAt: string;
}

export interface Order {
    id: string;
    userId: string;
    addressId: string;
    status: 'PENDING' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
    subtotal: number;
    tax: number;
    deliveryCharge: number;
    total: number;
    paymentIntentId?: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
    address: Address;
    items: OrderItem[];
    user?: User;
    _count?: {
        items: number;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GiftPaginatedResponse {
    gifts: Gift[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LoginInput {
    email: string;
    password: string;
}

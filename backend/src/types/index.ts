import { Request } from "express";
import { PaymentMethod, Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
}

export interface CreateGiftInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  isCustomizable?: boolean;
  allowPersonalMsg?: boolean;
  allowAddons?: boolean;
  allowImageUpload?: boolean;
  addonsOptions?: string[];
  featured?: boolean;
}

export interface AddToCartInput {
  giftId: string;
  quantity: number;
  personalMessage?: string;
  selectedAddons?: string[];
  deliveryDate?: string;
  customImage?: Express.Multer.File;
}

export interface UpdateCartItemInput {
  cartItemId: string;
  quantity?: number;
  personalMessage?: string;
  selectedAddons?: string[];
  deliveryDate?: string;
}

export interface CreateOrderInput {
  addressId: string;
  paymentMethodId: string;
}

export interface DirectOrderAddonInput {
  id: string;
  name: string;
  price: number;
}

export interface DirectOrderItemInput {
  giftId: string;
  quantity: number;
  unitPrice: number;
  basePrice?: number;
  addons?: DirectOrderAddonInput[];
  personalMessage?: string;
  giftWrapPrice?: number;
  artworkUrl?: string;
  giftName?: string;
}

export interface DirectOrderShippingInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface DirectOrderTotalsInput {
  subtotal?: number;
  tax?: number;
  deliveryCharge?: number;
  total?: number;
}

export interface CreateDirectOrderInput {
  items: DirectOrderItemInput[];
  shipping: DirectOrderShippingInput;
  totals?: DirectOrderTotalsInput;
  note?: string;
  paymentMethod?: PaymentMethod;
}

export interface CreateReviewInput {
  giftId: string;
  rating: number;
  comment?: string;
}

export interface CreateAddressInput {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

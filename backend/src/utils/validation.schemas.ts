import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    slug: z.string().min(2, "Slug is required"),
    imageUrl: z.string().url().optional(),
  }),
});

export const createGiftSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().nonnegative("Stock must be non-negative"),
    categoryId: z.string().min(1, "Category is required"),
    isCustomizable: z.boolean().optional(),
    allowPersonalMsg: z.boolean().optional(),
    allowAddons: z.boolean().optional(),
    allowImageUpload: z.boolean().optional(),
    addonsOptions: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }),
});

export const addToCartSchema = z.object({
  body: z.object({
    giftId: z.string().min(1, "Gift ID is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    personalMessage: z.string().optional(),
    selectedAddons: z.array(z.string()).optional(),
    deliveryDate: z.string().optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    giftId: z.string().min(1, "Gift ID is required"),
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z.string().optional(),
  }),
});

export const createAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    addressLine: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(4, "Zip code is required"),
    country: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const createDirectOrderSchema = z.object({
  body: z.object({
    shipping: z.object({
      fullName: z.string().min(2, "Recipient name is required"),
      phone: z.string().min(6, "Phone number is required"),
      addressLine1: z.string().min(4, "Address line 1 is required"),
      addressLine2: z.string().optional(),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      postalCode: z.string().min(3, "Postal code is required"),
      country: z.string().optional(),
    }),
    items: z
      .array(
        z.object({
          giftId: z.string().min(1, "Gift ID is required"),
          quantity: z.number().int().positive("Quantity must be positive"),
          unitPrice: z.number().nonnegative("Unit price must be provided"),
          basePrice: z.number().nonnegative().optional(),
          addons: z
            .array(
              z.object({
                id: z.string().min(1),
                name: z.string().min(1),
                price: z.number().nonnegative(),
              })
            )
            .optional(),
          personalMessage: z.string().optional(),
          giftWrapPrice: z.number().nonnegative().optional(),
          artworkUrl: z.string().optional(),
          giftName: z.string().optional(),
        })
      )
      .min(1, "Order must contain at least one item"),
    totals: z
      .object({
        subtotal: z.number().nonnegative().optional(),
        tax: z.number().nonnegative().optional(),
        deliveryCharge: z.number().nonnegative().optional(),
        total: z.number().nonnegative().optional(),
      })
      .optional(),
    note: z.string().optional(),
    paymentMethod: z
      .enum(["stripe", "cod", "STRIPE", "COD"])
      .transform((value) => value.toUpperCase() as "STRIPE" | "COD")
      .optional(),
  }),
});

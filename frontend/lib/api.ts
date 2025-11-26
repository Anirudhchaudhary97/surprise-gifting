import {
  categoriesMock,
  giftsMock,
  ordersMock,
  reviewsMock,
} from "@/lib/mock-data";
import {
  type Category,
  type Gift,
  type Order,
  type Review,
  type User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
  revalidate?: number;
  cache?: RequestCache;
}

function buildUrl(endpoint: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE}${endpoint}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

async function fetchFromApi<T>(
  endpoint: string,
  fallback: () => T | Promise<T>,
  options: RequestOptions = {}
): Promise<T> {
  if (!API_BASE) {
    return fallback();
  }

  try {
    const url = buildUrl(endpoint, options.query);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache,
      next: options.revalidate
        ? { revalidate: options.revalidate }
        : { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Falling back to mock data for ${endpoint}`, error);
    return fallback();
  }
}

function mapGift(apiGift: any): Gift {
  return {
    id: apiGift.id,
    name: apiGift.name,
    slug: apiGift.slug ?? apiGift.id,
    price: apiGift.price,
    images: (apiGift.images ?? []).map((image: any) => image.url),
    categoryId: apiGift.categoryId,
    categoryName: apiGift.category?.name ?? "Uncategorized",
    rating: Number(apiGift.averageRating ?? apiGift.rating ?? 0),
    reviewsCount: apiGift._count?.reviews ?? apiGift.reviews?.length ?? 0,
    shortDescription:
      apiGift.shortDescription ?? apiGift.description?.slice(0, 120) ?? "",
    description: apiGift.description ?? "",
    tags: apiGift.tags ?? apiGift.addonsOptions ?? [],
  };
}

function mapCategory(apiCategory: any): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    image: apiCategory.imageUrl ?? apiCategory.image ?? "/file.svg",
    description: apiCategory.description ?? "",
  };
}

function mapReview(apiReview: any): Review {
  return {
    id: apiReview.id,
    rating: apiReview.rating,
    comment: apiReview.comment ?? "",
    user: {
      id: apiReview.user?.id ?? "unknown",
      name: apiReview.user?.name ?? "Anonymous",
    },
    createdAt: apiReview.createdAt,
  };
}

function mapOrder(apiOrder: any): Order {
  return {
    id: apiOrder.id,
    status: String(apiOrder.status ?? "").toLowerCase() as Order["status"],
    total: apiOrder.total ?? 0,
    createdAt: apiOrder.createdAt,
    shippingAddress: {
      fullName: apiOrder.address?.fullName ?? "Unknown",
      line1: apiOrder.address?.addressLine ?? "",
      line2: "",
      city: apiOrder.address?.city ?? "",
      state: apiOrder.address?.state ?? "",
      postalCode: apiOrder.address?.zipCode ?? "",
      country: apiOrder.address?.country ?? "Nepal",
    },
    items: (apiOrder.items ?? []).map((item: any) => ({
      giftId: item.giftId,
      name: item.gift?.name ?? item.name ?? "Gift",
      image: item.gift?.images?.[0]?.url ?? item.image ?? "/file.svg",
      price: item.price ?? item.gift?.price ?? 0,
      quantity: item.quantity ?? 1,
    })),
  };
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  if (!API_BASE) {
    throw new Error("API base URL is not configured");
  }

  const url = `${API_BASE}/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? "Unable to sign in");
  }

  return (await response.json()) as { user: User; token: string };
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  if (!API_BASE) {
    throw new Error("API base URL is not configured");
  }

  const url = `${API_BASE}/auth/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error ?? "Unable to create account");
  }

  return (await response.json()) as { user: User; token: string };
}

export async function getCategories(): Promise<Category[]> {
  const categories = await fetchFromApi("/categories", () => categoriesMock);
  return categories.map(mapCategory);
}

export async function getFeaturedGifts(): Promise<Gift[]> {
  const response = await fetchFromApi(
    "/gifts",
    () => giftsMock.slice(0, 3),
    { query: { featured: true, limit: 3 } }
  );

  const gifts = Array.isArray((response as any).gifts)
    ? (response as any).gifts
    : response;

  return gifts.map(mapGift).slice(0, 3);
}

export async function getGifts(): Promise<Gift[]> {
  const response = await fetchFromApi("/gifts", () => giftsMock);
  const gifts = Array.isArray((response as any).gifts)
    ? (response as any).gifts
    : response;
  return gifts.map(mapGift);
}

export async function getGiftById(id: string): Promise<Gift | undefined> {
  const fallback = giftsMock.find((gift) => gift.id === id || gift.slug === id);
  if (!API_BASE) {
    return fallback;
  }

  try {
    const response = await fetch(`${API_BASE}/gifts/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 120,
      },
    });

    if (!response.ok) {
      throw new Error(`Gift ${id} not found`);
    }

    const apiGift = await response.json();
    return mapGift(apiGift);
  } catch (error) {
    console.warn(`Falling back to mock gift ${id}`, error);
    return fallback;
  }
}

export async function getGiftReviews(giftId: string): Promise<Review[]> {
  const response = await fetchFromApi(
    `/reviews/gift/${giftId}`,
    () => reviewsMock
  );

  const reviews = (response as any).reviews ?? response;
  return reviews.map(mapReview);
}

export async function getOrders(token?: string | null): Promise<Order[]> {
  if (!token) {
    return ordersMock;
  }

  const orders = await fetchFromApi(
    "/orders/user",
    () => ordersMock,
    { token, cache: "no-store" }
  );

  return orders.map(mapOrder);
}

export async function getOrderById(
  id: string,
  token?: string | null
): Promise<Order | undefined> {
  const fallback = ordersMock.find((order) => order.id === id);
  if (!API_BASE) {
    return fallback;
  }

  if (!token) {
    return fallback;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Order ${id} not found`);
    }

    const apiOrder = await response.json();
    return mapOrder(apiOrder);
  } catch (error) {
    console.warn(`Falling back to mock order ${id}`, error);
    return fallback;
  }
}

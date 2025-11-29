import {
  categoriesMock,
  giftsMock,
  ordersMock,
  reviewsMock,
} from "@/lib/mock-data";
import {
  type Category,
  type Gift,
  type GiftAddonOption,
  type GiftImageRecord,
  type Order,
  type Review,
  type User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

function normalizeRemoteImage(url: string | undefined | null): string {
  if (!url) {
    return PLACEHOLDER_IMAGE;
  }

  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "images.unsplash.com") {
      if (!parsed.searchParams.has("auto")) {
        parsed.searchParams.set("auto", "format");
      }
      if (!parsed.searchParams.has("fit")) {
        parsed.searchParams.set("fit", "crop");
      }
      if (!parsed.searchParams.has("w")) {
        parsed.searchParams.set("w", "800");
      }
      if (!parsed.searchParams.has("q")) {
        parsed.searchParams.set("q", "80");
      }
    }

    return parsed.toString();
  } catch (error) {
    console.warn("Failed to normalize image URL", url, error);
    return PLACEHOLDER_IMAGE;
  }
}

function coerceImageValue(image: unknown): string | undefined {
  if (!image) {
    return undefined;
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    const candidate =
      (
        image as {
          url?: string;
          imageUrl?: string;
          src?: string;
          path?: string;
        }
      ).url ??
      (
        image as {
          imageUrl?: string;
          url?: string;
          src?: string;
          path?: string;
        }
      ).imageUrl ??
      (image as { src?: string; path?: string }).src ??
      (image as { path?: string }).path;

    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return undefined;
}

function slugifyLabel(value: string | undefined | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug.length ? slug : fallback;
}

function normalizeAddonOption(
  raw: Record<string, unknown>,
  index: number
): GiftAddonOption | null {
  const nameCandidate =
    (raw.name as string | undefined) ??
    (raw.label as string | undefined) ??
    (raw.title as string | undefined);

  const priceCandidate =
    (raw.price as number | string | undefined) ??
    (raw.amount as number | string | undefined);

  const descriptionCandidate =
    (raw.description as string | undefined) ??
    (raw.details as string | undefined);

  const name = nameCandidate?.toString().trim();
  if (!name || name.length === 0) {
    return null;
  }

  const priceNumber = Number.parseFloat(String(priceCandidate ?? "0"));
  const price = Number.isFinite(priceNumber) ? priceNumber : 0;

  const idSource =
    (raw.id as string | number | undefined) ??
    (raw.key as string | number | undefined);

  const id =
    idSource !== undefined
      ? String(idSource)
      : slugifyLabel(name, `addon-${index}`);

  return {
    id,
    name,
    price,
    description: descriptionCandidate?.toString().trim() || undefined,
  };
}

function parseAddonOption(raw: unknown, index: number): GiftAddonOption | null {
  if (!raw) {
    return null;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed.length) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return normalizeAddonOption(parsed, index);
    } catch (error) {
      const [namePart, pricePart, descriptionPart] = trimmed
        .split("|")
        .map((segment) => segment.trim());

      if (!namePart) {
        return null;
      }

      const priceNumber = Number.parseFloat(pricePart ?? "0");
      const price = Number.isFinite(priceNumber) ? priceNumber : 0;

      return {
        id: slugifyLabel(namePart, `addon-${index}`),
        name: namePart,
        price,
        description: descriptionPart?.length ? descriptionPart : undefined,
      };
    }
  }

  if (typeof raw === "object") {
    return normalizeAddonOption(raw as Record<string, unknown>, index);
  }

  return null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

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

async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<never> {
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  throw new Error(payload.error ?? payload.message ?? fallbackMessage);
}

function ensureApiBaseConfigured() {
  if (!API_BASE) {
    throw new Error("API base URL is not configured");
  }
}

function requireAdminToken(token: string | null | undefined): string {
  if (!token) {
    throw new Error("Admin authentication required");
  }

  return token;
}

function requireAuthToken(token: string | null | undefined): string {
  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

function mapGift(apiGift: any): Gift {
  const imageRecords: GiftImageRecord[] = Array.isArray(apiGift.images)
    ? apiGift.images
      .map((image: any): GiftImageRecord | null => {
        const source = coerceImageValue(image);
        if (!source) {
          return null;
        }

        const idCandidate =
          typeof image === "object" && image
            ? image.id ?? image.imageId ?? image._id
            : undefined;

        return {
          id: idCandidate ? String(idCandidate) : undefined,
          url: normalizeRemoteImage(source),
          isPrimary:
            typeof image === "object" && image
              ? Boolean(
                image.isPrimary ??
                image.primary ??
                image.is_primary ??
                image.default
              )
              : false,
        };
      })
      .filter((record: GiftImageRecord | null): record is GiftImageRecord =>
        Boolean(record)
      )
    : [];

  if (imageRecords.length) {
    imageRecords.sort(
      (a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))
    );
  }

  const candidateImages: (string | undefined)[] = [];

  if (!imageRecords.length && Array.isArray(apiGift.images)) {
    const inlineSource = coerceImageValue(apiGift.images[0]);
    if (inlineSource) {
      candidateImages.push(inlineSource);
    }
  }

  candidateImages.push(
    coerceImageValue(apiGift.imageUrl),
    coerceImageValue(apiGift.coverImage),
    coerceImageValue(apiGift.thumbnail)
  );

  const primaryCandidate = candidateImages.find(
    (value) => typeof value === "string" && value.length > 0
  );

  const normalizedPrimary = normalizeRemoteImage(primaryCandidate);

  const images = imageRecords.length
    ? imageRecords.map((record) => record.url)
    : [normalizedPrimary];

  const imageRecordsResult =
    imageRecords.length > 0
      ? imageRecords
      : primaryCandidate
        ? [
          {
            id: undefined,
            url: normalizedPrimary,
            isPrimary: true,
          },
        ]
        : undefined;

  const ratingSource =
    apiGift.averageRating ?? apiGift.rating ?? apiGift.reviews?.average ?? 0;
  const reviewsCountSource =
    apiGift._count?.reviews ??
    apiGift.reviewsCount ??
    (Array.isArray(apiGift.reviews) ? apiGift.reviews.length : 0);

  const addonSources: unknown[] = [];
  const addonOptionStrings: string[] = [];
  const seenAddonStrings = new Set<string>();

  const addStringOption = (value: string, includeInSources = true) => {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return;
    }

    if (!seenAddonStrings.has(trimmed)) {
      addonOptionStrings.push(trimmed);
      seenAddonStrings.add(trimmed);
    }

    if (includeInSources) {
      addonSources.push(trimmed);
    }
  };

  const addObjectOption = (value: Record<string, unknown>) => {
    addonSources.push(value);
    const normalized = normalizeAddonOption(value, addonSources.length - 1);
    if (!normalized) {
      return;
    }

    const serialized =
      normalized.description && normalized.description.length
        ? `${normalized.name}|${normalized.price}|${normalized.description}`
        : `${normalized.name}|${normalized.price}`;

    addStringOption(serialized, false);
  };

  const processAddonEntry = (entry: unknown) => {
    if (!entry) {
      return;
    }

    if (typeof entry === "string") {
      addStringOption(entry);
      return;
    }

    if (Array.isArray(entry)) {
      entry.forEach((item) => processAddonEntry(item));
      return;
    }

    if (typeof entry === "object") {
      addObjectOption(entry as Record<string, unknown>);
      return;
    }
  };

  if (Array.isArray(apiGift.addonsOptions)) {
    apiGift.addonsOptions.forEach((entry: unknown) => processAddonEntry(entry));
  } else if (
    typeof apiGift.addonsOptions === "string" &&
    apiGift.addonsOptions.trim().length
  ) {
    const raw = apiGift.addonsOptions.trim();
    let parsed = false;

    if (raw.startsWith("[") || raw.startsWith("{")) {
      try {
        const json = JSON.parse(raw);
        processAddonEntry(json);
        parsed = true;
      } catch (error) {
        console.warn("Failed to parse addons options JSON", error);
      }
    }

    if (!parsed) {
      raw
        .split(/[\n,]/)
        .forEach((segment: string) => processAddonEntry(segment));
    }
  }

  if (Array.isArray(apiGift.addons)) {
    apiGift.addons.forEach((entry: unknown) => processAddonEntry(entry));
  }

  const parsedAddons = addonSources
    .map((entry, index) => parseAddonOption(entry, index))
    .filter((entry): entry is GiftAddonOption => Boolean(entry));

  const addonsMap = new Map<string, GiftAddonOption>();
  parsedAddons.forEach((addon) => {
    if (!addonsMap.has(addon.id)) {
      addonsMap.set(addon.id, addon);
    }
  });

  const addons = Array.from(addonsMap.values());

  const addonsOptions = addonOptionStrings.length
    ? addonOptionStrings
    : Array.from(
      new Set(
        addons.map((addon) =>
          addon.description && addon.description.length
            ? `${addon.name}|${addon.price}|${addon.description}`
            : `${addon.name}|${addon.price}`
        )
      )
    );

  const stockCandidate =
    apiGift.stock ?? apiGift.inventory ?? apiGift.quantity ?? undefined;

  return {
    id: apiGift.id,
    name: apiGift.name,
    slug: apiGift.slug ?? apiGift.id,
    price: Number(apiGift.price ?? 0),
    images,
    imageRecords: imageRecordsResult,
    categoryId:
      apiGift.categoryId ??
      apiGift.category?.id ??
      apiGift.category?.categoryId ??
      "unknown",
    categoryName:
      apiGift.category?.name ?? apiGift.categoryName ?? "Uncategorized",
    rating: Number(ratingSource ?? 0),
    reviewsCount: Number(reviewsCountSource ?? 0),
    shortDescription:
      apiGift.shortDescription ??
      apiGift.subtitle ??
      (typeof apiGift.description === "string"
        ? apiGift.description.slice(0, 120)
        : ""),
    description: apiGift.description ?? "",
    tags: Array.isArray(apiGift.tags)
      ? apiGift.tags
      : addons.length > 0
        ? addons.map((addon) => addon.name)
        : Array.isArray(apiGift.labels)
          ? apiGift.labels
          : addonsOptions,
    stock:
      stockCandidate !== undefined && stockCandidate !== null
        ? Number(stockCandidate)
        : undefined,
    isCustomizable:
      apiGift.isCustomizable !== undefined
        ? Boolean(apiGift.isCustomizable)
        : apiGift.customizable !== undefined
          ? Boolean(apiGift.customizable)
          : undefined,
    allowPersonalMsg:
      apiGift.allowPersonalMsg !== undefined
        ? Boolean(apiGift.allowPersonalMsg)
        : apiGift.personalMessageAllowed !== undefined
          ? Boolean(apiGift.personalMessageAllowed)
          : undefined,
    allowAddons:
      apiGift.allowAddons !== undefined
        ? Boolean(apiGift.allowAddons)
        : addons.length > 0 || addonsOptions.length > 0
          ? true
          : undefined,
    allowImageUpload:
      apiGift.allowImageUpload !== undefined
        ? Boolean(apiGift.allowImageUpload)
        : apiGift.imageUploadAllowed !== undefined
          ? Boolean(apiGift.imageUploadAllowed)
          : undefined,
    addonsOptions,
    addons,
    featured:
      apiGift.featured !== undefined
        ? Boolean(apiGift.featured)
        : apiGift.isFeatured !== undefined
          ? Boolean(apiGift.isFeatured)
          : undefined,
  };
}

function mapCategory(apiCategory: any): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    image: normalizeRemoteImage(
      coerceImageValue(apiCategory.imageUrl) ??
      coerceImageValue(apiCategory.image) ??
      coerceImageValue(apiCategory.coverImage) ??
      PLACEHOLDER_IMAGE
    ),
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
  const items = Array.isArray(apiOrder.items) ? apiOrder.items : [];

  return {
    id: apiOrder.id,
    status: String(
      apiOrder.status ?? "pending"
    ).toLowerCase() as Order["status"],
    total: Number(apiOrder.total ?? 0),
    createdAt: apiOrder.createdAt,
    paymentMethod:
      String(apiOrder.paymentMethod ?? "cod").toLowerCase() === "stripe"
        ? "stripe"
        : "cod",
    shippingAddress: {
      fullName:
        apiOrder.address?.fullName ??
        apiOrder.shippingAddress?.fullName ??
        "Unknown",
      line1:
        apiOrder.address?.addressLine ?? apiOrder.shippingAddress?.line1 ?? "",
      line2: apiOrder.shippingAddress?.line2 ?? "",
      city: apiOrder.address?.city ?? apiOrder.shippingAddress?.city ?? "",
      state: apiOrder.address?.state ?? apiOrder.shippingAddress?.state ?? "",
      postalCode:
        apiOrder.address?.zipCode ?? apiOrder.shippingAddress?.postalCode ?? "",
      country:
        apiOrder.address?.country ??
        apiOrder.shippingAddress?.country ??
        "Nepal",
    },
    items: items.map((item: any) => {
      const imageSource =
        coerceImageValue(item.image) ??
        (Array.isArray(item.images)
          ? coerceImageValue(item.images[0])
          : undefined) ??
        (item.gift
          ? coerceImageValue(item.gift.images?.[0]) ??
          coerceImageValue(item.gift.imageUrl)
          : undefined);

      return {
        giftId: item.giftId ?? item.id ?? "unknown",
        name: item.gift?.name ?? item.name ?? "Gift",
        image: normalizeRemoteImage(imageSource),
        price: Number(item.price ?? item.gift?.price ?? 0),
        quantity: Number(item.quantity ?? 1),
      };
    }),
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
  const response = await fetchFromApi("/gifts", () => giftsMock.slice(0, 3), {
    query: { featured: true, limit: 3 },
  });

  const gifts = Array.isArray((response as any).gifts)
    ? (response as any).gifts
    : response;

  return gifts.map(mapGift).slice(0, 3);
}

export interface GetGiftsFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  sortBy?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface GetGiftsResponse {
  gifts: Gift[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getGifts(filters?: GetGiftsFilters): Promise<GetGiftsResponse> {
  const query: Record<string, string | number | boolean | undefined> = {};

  if (filters) {
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.minPrice) query.minPrice = filters.minPrice;
    if (filters.maxPrice) query.maxPrice = filters.maxPrice;
    if (filters.search) query.search = filters.search;
    if (filters.featured !== undefined) query.featured = filters.featured;
    if (filters.sortBy) query.sortBy = filters.sortBy;
    if (filters.page) query.page = filters.page;
    if (filters.limit) query.limit = filters.limit;
  }

  const response = await fetchFromApi("/gifts", () => ({ gifts: giftsMock, pagination: { page: 1, limit: 12, total: giftsMock.length, totalPages: 1 } }), { query });

  // Backend returns { gifts, pagination }
  if ((response as any).gifts && (response as any).pagination) {
    return {
      gifts: (response as any).gifts.map(mapGift),
      pagination: (response as any).pagination,
    };
  }

  // Fallback for mock data
  const gifts = Array.isArray((response as any).gifts)
    ? (response as any).gifts
    : response;
  return {
    gifts: gifts.map(mapGift),
    pagination: {
      page: 1,
      limit: gifts.length,
      total: gifts.length,
      totalPages: 1,
    },
  };
}


export async function getGiftById(id: string): Promise<Gift | undefined> {
  const fallback = giftsMock.find((gift) => gift.id === id || gift.slug === id);
  if (!API_BASE) {
    return fallback ? mapGift(fallback) : undefined;
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
    return fallback ? mapGift(fallback) : undefined;
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
    return ordersMock.map((order) => mapOrder(order));
  }

  const orders = await fetchFromApi("/orders/user", () => ordersMock, {
    token,
    cache: "no-store",
  });

  return orders.map(mapOrder);
}

export async function getOrderById(
  id: string,
  token?: string | null
): Promise<Order | undefined> {
  const fallback = ordersMock.find((order) => order.id === id);
  if (!API_BASE) {
    return fallback ? mapOrder(fallback) : undefined;
  }

  if (!token) {
    return fallback ? mapOrder(fallback) : undefined;
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
    return fallback ? mapOrder(fallback) : undefined;
  }
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export async function createCategory(
  payload: CategoryPayload,
  token: string | null
): Promise<Category> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const response = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to create category");
  }

  const result = await response.json();
  return mapCategory(result);
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>,
  token: string | null
): Promise<Category> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to update category");
  }

  const result = await response.json();
  return mapCategory(result);
}

export async function deleteCategory(
  id: string,
  token: string | null
): Promise<void> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to delete category");
  }
}

export interface GiftWritePayload {
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
}

export interface CheckoutOrderAddonPayload {
  id: string;
  name: string;
  price: number;
}

export interface CheckoutOrderItemPayload {
  giftId: string;
  giftName?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  basePrice?: number;
  addons?: CheckoutOrderAddonPayload[];
  personalMessage?: string;
  giftWrapPrice?: number;
  artworkUrl?: string;
}

export interface CheckoutOrderShippingPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface CheckoutOrderTotalsPayload {
  subtotal?: number;
  tax?: number;
  deliveryCharge?: number;
  total?: number;
}

export interface CheckoutOrderPayload {
  items: CheckoutOrderItemPayload[];
  shipping: CheckoutOrderShippingPayload;
  totals?: CheckoutOrderTotalsPayload;
  note?: string;
  paymentMethod: "stripe" | "cod";
}

function buildGiftFormData(
  payload: GiftWritePayload,
  images: File[]
): FormData {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("stock", String(payload.stock));
  formData.append("categoryId", payload.categoryId);
  formData.append("isCustomizable", String(payload.isCustomizable));
  formData.append("allowPersonalMsg", String(payload.allowPersonalMsg));
  formData.append("allowAddons", String(payload.allowAddons));
  formData.append("allowImageUpload", String(payload.allowImageUpload));
  formData.append("featured", String(payload.featured));

  formData.append("addonsOptions", JSON.stringify(payload.addonsOptions ?? []));

  images.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}

export async function createGift(
  payload: GiftWritePayload,
  images: File[],
  token: string | null
): Promise<Gift> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const formData = buildGiftFormData(payload, images);

  const response = await fetch(`${API_BASE}/gifts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to create gift");
  }

  const result = await response.json();
  return mapGift(result);
}

export async function updateGift(
  id: string,
  payload: GiftWritePayload,
  images: File[],
  token: string | null
): Promise<Gift> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const formData = buildGiftFormData(payload, images);

  const response = await fetch(`${API_BASE}/gifts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to update gift");
  }

  const result = await response.json();
  return mapGift(result);
}

export async function createDirectOrder(
  payload: CheckoutOrderPayload,
  token: string | null
): Promise<Order> {
  ensureApiBaseConfigured();
  const authToken = requireAuthToken(token);

  const response = await fetch(`${API_BASE}/orders/direct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to place order");
  }

  const order = await response.json();
  return mapOrder(order);
}

export async function deleteGift(
  id: string,
  token: string | null
): Promise<void> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const response = await fetch(`${API_BASE}/gifts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to delete gift");
  }
}

export async function deleteGiftImage(
  imageId: string,
  token: string | null
): Promise<void> {
  ensureApiBaseConfigured();
  const adminToken = requireAdminToken(token);

  const response = await fetch(`${API_BASE}/gifts/images/${imageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Failed to delete gift image");
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

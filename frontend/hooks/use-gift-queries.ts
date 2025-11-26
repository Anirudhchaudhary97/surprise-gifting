"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getFeaturedGifts,
  getGiftById,
  getGiftReviews,
  getGifts,
  getOrderById,
  getOrders,
} from "@/lib/api";

export function useCategoriesQuery() {
  return useQuery({ queryKey: ["categories"], queryFn: getCategories });
}

export function useFeaturedGiftsQuery() {
  return useQuery({
    queryKey: ["gifts", "featured"],
    queryFn: getFeaturedGifts,
  });
}

export function useGiftsQuery() {
  return useQuery({ queryKey: ["gifts", "all"], queryFn: getGifts });
}

export function useGiftQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["gift", id],
    queryFn: () => (id ? getGiftById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
  });
}

export function useGiftReviewsQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["gift", id, "reviews"],
    queryFn: () => (id ? getGiftReviews(id) : Promise.resolve([])),
    enabled: Boolean(id),
  });
}

export function useOrdersQuery(token: string | null) {
  return useQuery({
    queryKey: ["orders", token],
    queryFn: () => (token ? getOrders(token) : Promise.resolve([])),
    enabled: Boolean(token),
  });
}

export function useOrderQuery(id: string | undefined, token: string | null) {
  return useQuery({
    queryKey: ["orders", id, token],
    queryFn: () => (id && token ? getOrderById(id, token) : Promise.resolve(undefined)),
    enabled: Boolean(id && token),
  });
}

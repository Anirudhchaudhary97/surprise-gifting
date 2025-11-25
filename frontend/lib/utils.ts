import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  amount: number | string,
  locale: string = "en-US",
  currency: string = "USD"
) {
  const value = typeof amount === "string" ? Number(amount) : amount
  if (Number.isNaN(value)) return "—"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(date: string | Date, locale: string = "en-US") {
  const parsed = typeof date === "string" ? new Date(date) : date
  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) return ""

  return parsed.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const statusColorMap: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PREPARING: "bg-blue-100 text-blue-700",
  DISPATCHED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
}

export function getStatusColor(status: string) {
  return statusColorMap[status] ?? "bg-gray-100 text-gray-700"
}

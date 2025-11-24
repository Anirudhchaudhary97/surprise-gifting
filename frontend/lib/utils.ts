import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatPrice(price: number): string {
    return `NPR ${price.toLocaleString()}`;
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PREPARING: 'bg-blue-100 text-blue-800',
        DISPATCHED: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

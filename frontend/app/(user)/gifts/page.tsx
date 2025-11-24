'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GiftCard from '@/components/gift/GiftCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import api from '@/lib/api';
import { Gift, Category, PaginatedResponse, GiftPaginatedResponse } from '@/types';

export default function GiftsPage() {
    const searchParams = useSearchParams();
    const categoryIdParam = searchParams.get('categoryId');
    const searchParam = searchParams.get('search');

    const [filters, setFilters] = useState({
        categoryId: categoryIdParam || '',
        search: searchParam || '',
        minPrice: '',
        maxPrice: '',
        page: 1,
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
    });

    const { data: giftsData, isLoading } = useQuery<GiftPaginatedResponse>({
        queryKey: ['gifts', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.search) params.append('search', filters.search);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            params.append('page', filters.page.toString());
            params.append('limit', '12');

            const res = await api.get(`/gifts?${params.toString()}`);
            return res.data;
        },
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 bg-gray-50">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full md:w-64 shrink-0 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4">Filters</h3>

                                {/* Search */}
                                <div className="mb-6">
                                    <Input
                                        placeholder="Search gifts..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>

                                {/* Categories */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={filters.categoryId === ''}
                                                onChange={() => handleFilterChange('categoryId', '')}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-gray-600">All Categories</span>
                                        </label>
                                        {categories?.map((category) => (
                                            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={filters.categoryId === category.id}
                                                    onChange={() => handleFilterChange('categoryId', category.id)}
                                                    className="text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-600">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Min"
                                            type="number"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="text-sm"
                                        />
                                        <Input
                                            placeholder="Max"
                                            type="number"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="flex-grow">
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-2xl font-bold">
                                    {filters.search ? `Search results for "${filters.search}"` : 'All Gifts'}
                                </h1>
                                <span className="text-gray-500 text-sm">
                                    {giftsData?.pagination.total || 0} results found
                                </span>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader size="lg" />
                                </div>
                            ) : giftsData?.gifts.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                    <p className="text-gray-500 text-lg">No gifts found matching your criteria.</p>
                                    <Button
                                        variant="ghost"
                                        className="mt-4"
                                        onClick={() => setFilters({ categoryId: '', search: '', minPrice: '', maxPrice: '', page: 1 })}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {giftsData?.gifts.map((gift) => (
                                            <GiftCard key={gift.id} gift={gift} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {giftsData && giftsData.pagination.totalPages > 1 && (
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                disabled={filters.page === 1}
                                                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                                            >
                                                Previous
                                            </Button>
                                            <span className="flex items-center px-4 font-medium text-gray-600">
                                                Page {filters.page} of {giftsData.pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                disabled={filters.page === giftsData.pagination.totalPages}
                                                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

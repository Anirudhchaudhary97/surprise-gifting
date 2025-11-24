'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/gift/ProductGallery';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import RatingStar from '@/components/ui/RatingStar';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { Gift, Review } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatDate } from '@/lib/utils';

interface CustomizationForm {
    personalMessage?: string;
    deliveryDate?: string;
    selectedAddons: string[];
}

export default function GiftDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuthStore();
    const { updateItemCount } = useCartStore();

    const [quantity, setQuantity] = useState(1);
    const [customImage, setCustomImage] = useState<File | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const { register, handleSubmit, watch, setValue } = useForm<CustomizationForm>({
        defaultValues: {
            selectedAddons: [],
        },
    });

    const selectedAddons = watch('selectedAddons');

    // Fetch Gift Details
    const { data: gift, isLoading } = useQuery<Gift>({
        queryKey: ['gift', id],
        queryFn: async () => {
            const res = await api.get(`/gifts/${id}`);
            return res.data;
        },
    });

    // Fetch Reviews
    const { data: reviewsData } = useQuery<{ reviews: Review[], averageRating: number, totalReviews: number }>({
        queryKey: ['reviews', id],
        queryFn: async () => {
            const res = await api.get(`/reviews/gift/${id}`);
            return res.data;
        },
        enabled: !!gift,
    });

    const addToCartMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await api.post('/cart/add', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            updateItemCount();
            router.push('/cart');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to add to cart');
        },
    });

    const onSubmit = async (data: CustomizationForm) => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/gifts/' + id);
            return;
        }

        setIsAddingToCart(true);
        const formData = new FormData();
        formData.append('giftId', id as string);
        formData.append('quantity', quantity.toString());

        if (data.personalMessage) formData.append('personalMessage', data.personalMessage);
        if (data.deliveryDate) formData.append('deliveryDate', data.deliveryDate);
        if (data.selectedAddons.length > 0) {
            formData.append('selectedAddons', JSON.stringify(data.selectedAddons));
        }
        if (customImage) {
            formData.append('customImage', customImage);
        }

        try {
            await addToCartMutation.mutateAsync(formData);
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!gift) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Gift not found</h1>
                <Button onClick={() => router.push('/gifts')}>Browse Gifts</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 bg-gray-50">
                <div className="container-custom">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                            {/* Left: Gallery */}
                            <div>
                                <ProductGallery images={gift.images} name={gift.name} />
                            </div>

                            {/* Right: Details & Customization */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="info">{gift.category?.name}</Badge>
                                        {gift.stock <= 0 ? (
                                            <Badge variant="error">Out of Stock</Badge>
                                        ) : (
                                            <Badge variant="success">In Stock</Badge>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                        {gift.name}
                                    </h1>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <RatingStar rating={gift.averageRating || 0} />
                                            <span className="text-sm text-gray-500">
                                                ({reviewsData?.totalReviews || 0} reviews)
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatPrice(gift.price)}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        {gift.description}
                                    </p>
                                </div>

                                <hr className="border-gray-100" />

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Customization Options */}
                                    {(gift.isCustomizable || gift.allowPersonalMsg || gift.allowAddons) && (
                                        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                                            <h3 className="font-semibold text-gray-900">Customize Your Gift</h3>

                                            {gift.allowPersonalMsg && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Personal Message (Optional)
                                                    </label>
                                                    <textarea
                                                        {...register('personalMessage')}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                        rows={3}
                                                        placeholder="Write a heartfelt message..."
                                                    />
                                                </div>
                                            )}

                                            {gift.allowImageUpload && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Upload Custom Image (Optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setCustomImage(e.target.files?.[0] || null)}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Delivery Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    {...register('deliveryDate')}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="bg-white"
                                                />
                                            </div>

                                            {gift.allowAddons && gift.addonsOptions.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Add-ons
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {gift.addonsOptions.map((addon) => (
                                                            <label key={addon} className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    value={addon}
                                                                    {...register('selectedAddons')}
                                                                    className="text-primary focus:ring-primary rounded"
                                                                />
                                                                <span className="text-sm text-gray-700">{addon}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Quantity & Add to Cart */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-primary transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold text-gray-900">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.min(gift.stock, quantity + 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-primary transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            fullWidth
                                            isLoading={isAddingToCart}
                                            disabled={gift.stock <= 0}
                                        >
                                            {gift.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-gray-50 p-8 border-t border-gray-100">
                            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                            {reviewsData?.reviews.length === 0 ? (
                                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                            ) : (
                                <div className="grid gap-6">
                                    {reviewsData?.reviews.map((review) => (
                                        <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {review.user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">
                                                        {review.user.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                            <RatingStar rating={review.rating} size="sm" className="mb-2" />
                                            <p className="text-gray-600">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import api from '@/lib/api';
import { Category, Gift } from '@/types';

interface GiftForm {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    isCustomizable: boolean;
    allowPersonalMsg: boolean;
    allowAddons: boolean;
    allowImageUpload: boolean;
    featured: boolean;
    addonsOptions: string; // Comma separated string for input
}

export default function GiftForm() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params.id;
    const queryClient = useQueryClient();
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GiftForm>();

    // Fetch Categories
    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
    });

    // Fetch Gift Data if Edit Mode
    const { data: gift, isLoading: isLoadingGift } = useQuery<Gift>({
        queryKey: ['gift', params.id],
        queryFn: async () => {
            const res = await api.get(`/gifts/${params.id}`);
            return res.data;
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (gift) {
            setValue('name', gift.name);
            setValue('description', gift.description);
            setValue('price', gift.price);
            setValue('stock', gift.stock);
            setValue('categoryId', gift.categoryId);
            setValue('isCustomizable', gift.isCustomizable);
            setValue('allowPersonalMsg', gift.allowPersonalMsg);
            setValue('allowAddons', gift.allowAddons);
            setValue('allowImageUpload', gift.allowImageUpload);
            setValue('featured', gift.featured);
            setValue('addonsOptions', gift.addonsOptions.join(', '));
            setPreviewUrls(gift.images.map(img => img.url));
        }
    }, [gift, setValue]);

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            if (isEdit) {
                const res = await api.put(`/gifts/${params.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return res.data;
            } else {
                const res = await api.post('/gifts', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return res.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-gifts'] });
            router.push('/admin/gifts');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to save gift');
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const onSubmit = (data: GiftForm) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('stock', data.stock.toString());
        formData.append('categoryId', data.categoryId);
        formData.append('isCustomizable', String(data.isCustomizable));
        formData.append('allowPersonalMsg', String(data.allowPersonalMsg));
        formData.append('allowAddons', String(data.allowAddons));
        formData.append('allowImageUpload', String(data.allowImageUpload));
        formData.append('featured', String(data.featured));

        if (data.addonsOptions) {
            const options = data.addonsOptions.split(',').map(s => s.trim()).filter(Boolean);
            options.forEach(opt => formData.append('addonsOptions[]', opt));
        }

        images.forEach(image => {
            formData.append('images', image);
        });

        mutation.mutate(formData);
    };

    if (isEdit && isLoadingGift) {
        return <Loader size="lg" />;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Gift' : 'Add New Gift'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Gift Name"
                        {...register('name', { required: 'Name is required' })}
                        error={errors.name?.message}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                            {...register('categoryId', { required: 'Category is required' })}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories?.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <span className="text-xs text-error">{errors.categoryId.message}</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={4}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    {errors.description && <span className="text-xs text-error">{errors.description.message}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Price"
                        type="number"
                        {...register('price', { required: 'Price is required', min: 0 })}
                        error={errors.price?.message}
                    />
                    <Input
                        label="Stock"
                        type="number"
                        {...register('stock', { required: 'Stock is required', min: 0 })}
                        error={errors.stock?.message}
                    />
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-900">Customization Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('isCustomizable')} className="text-primary focus:ring-primary rounded" />
                            <span className="text-sm text-gray-700">Is Customizable</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('allowPersonalMsg')} className="text-primary focus:ring-primary rounded" />
                            <span className="text-sm text-gray-700">Allow Personal Message</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('allowImageUpload')} className="text-primary focus:ring-primary rounded" />
                            <span className="text-sm text-gray-700">Allow Image Upload</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('allowAddons')} className="text-primary focus:ring-primary rounded" />
                            <span className="text-sm text-gray-700">Allow Add-ons</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('featured')} className="text-primary focus:ring-primary rounded" />
                            <span className="text-sm text-gray-700">Featured Product</span>
                        </label>
                    </div>

                    {watch('allowAddons') && (
                        <Input
                            label="Add-ons Options (comma separated)"
                            placeholder="Chocolates, Flowers, Greeting Card"
                            {...register('addonsOptions')}
                        />
                    )}
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-900">Images</h3>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />

                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {isEdit ? 'Update Gift' : 'Create Gift'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

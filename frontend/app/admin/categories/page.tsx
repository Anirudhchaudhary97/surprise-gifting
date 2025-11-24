'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import api from '@/lib/api';
import { Category } from '@/types';

interface CategoryForm {
    name: string;
    description: string;
    imageUrl: string;
}

export default function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryForm>();

    const { data: categories, isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: CategoryForm) => {
            await api.post('/categories', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: CategoryForm) => {
            await api.put(`/categories/${isEditing}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const onSubmit = (data: CategoryForm) => {
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (category: Category) => {
        setIsEditing(category.id);
        setValue('name', category.name);
        setValue('description', category.description || '');
        setValue('imageUrl', category.imageUrl || '');
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure? This will delete the category and might affect related gifts.')) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setIsFormOpen(false);
        reset();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
                <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
                    Add New Category
                </Button>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Category' : 'New Category'}</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Name"
                            {...register('name', { required: 'Name is required' })}
                            error={errors.name?.message}
                        />
                        <Input
                            label="Description"
                            {...register('description')}
                        />
                        <Input
                            label="Image URL"
                            {...register('imageUrl')}
                            placeholder="https://example.com/image.jpg"
                        />
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                                {isEditing ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map((category) => (
                    <div key={category.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="text-gray-400 hover:text-primary transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="text-gray-400 hover:text-error transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                            {category.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{category._count?.gifts || 0} Gifts</span>
                            <span>Slug: {category.slug}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

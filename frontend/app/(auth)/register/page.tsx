'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
    const password = watch('password');

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterForm) => {
            const res = await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });
            return res.data;
        },
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            router.push('/');
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || 'Registration failed');
        },
    });

    const onSubmit = (data: RegisterForm) => {
        setError('');
        registerMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-gray-900 font-playfair">
                            Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join us to start gifting happiness
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                autoComplete="name"
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                })}
                                error={errors.name?.message}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                autoComplete="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                error={errors.email?.message}
                            />

                            <Input
                                label="Password"
                                type="password"
                                autoComplete="new-password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                })}
                                error={errors.password?.message}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                autoComplete="new-password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (val) => val === password || 'Passwords do not match'
                                })}
                                error={errors.confirmPassword?.message}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-error text-center bg-error/10 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={registerMutation.isPending}
                        >
                            Create Account
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}

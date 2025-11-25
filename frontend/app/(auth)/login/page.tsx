'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card, {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LoginInput } from '@/types'; // We need to define this type or just use any

interface LoginForm extends LoginInput { }

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const { setAuth } = useAuthStore();
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

    const loginMutation = useMutation({
        mutationFn: async (data: LoginForm) => {
            const res = await api.post('/auth/login', data);
            return res.data;
        },
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            router.push(redirect);
        },
        onError: (err: any) => {
            setError(err.response?.data?.error || 'Invalid credentials');
        },
    });

    const onSubmit = (data: LoginForm) => {
        setError('');
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full space-y-6">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-3xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                <Input
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    autoComplete="email"
                                    {...register('email', { required: 'Email is required' })}
                                    error={errors.email?.message}
                                />

                                <Input
                                    id="password"
                                    label="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...register('password', { required: 'Password is required' })}
                                    error={errors.password?.message}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={loginMutation.isPending}
                            >
                                Sign In
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-600">Don't have an account? </span>
                                <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}

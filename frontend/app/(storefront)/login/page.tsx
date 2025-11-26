"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const payload = {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
        };

        try {
            setIsLoading(true);
            setError(null);
            const result = await login(payload);
            setAuth(result);
            router.push("/gifts");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to sign in";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to access your saved surprises.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input type="email" name="email" placeholder="Email address" required />
                <Input type="password" name="password" placeholder="Password" required />
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
                New here?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}

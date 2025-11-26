"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LogOut, Menu, ShoppingBag, ShoppingCart, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartStorePersist, useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/gifts", label: "Gifts" },
    { href: "/orders", label: "Orders" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const cartCount = useCartStore((state) => state.count());
    const hasHydrated = cartStorePersist.hasHydrated();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const isAuthenticated = Boolean(user);
    const userInitials = useMemo(() => {
        if (!user) return "?";
        if (user.name && user.name.length > 0) {
            return user.name
                .split(" ")
                .map((segment) => segment.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("");
        }
        if (user.email && user.email.length > 0) {
            return user.email.charAt(0).toUpperCase();
        }
        return "?";
    }, [user]);

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        clearAuth();
        closeMenu();
        router.push("/");
    };

    const isLinkActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMenu}>
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        <span className="sr-only">Toggle navigation</span>
                    </Button>
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Surprise Gifting
                    </Link>
                </div>

                <nav className="hidden items-center gap-1 lg:flex">
                    {navLinks.map((link) => {
                        const isActive = isLinkActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={cn(
                                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                pathname.startsWith("/admin") ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/cart"
                        className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition hover:border-primary"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">Cart</span>
                        {hasHydrated && cartCount > 0 && (
                            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground sm:flex">
                                <UserRound className="h-4 w-4" />
                                <span>{user?.name?.split(" ")[0] ?? "Account"}</span>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:hidden">
                                {userInitials}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button asChild variant="outline">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Register</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-border bg-background lg:hidden">
                    <nav className="flex flex-col px-4 py-3">
                        {navLinks.map((link) => {
                            const isActive = isLinkActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-sm font-medium",
                                        isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                                    )}
                                    onClick={closeMenu}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className={cn(
                                    "rounded-md px-3 py-2 text-sm font-medium",
                                    pathname.startsWith("/admin") ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                                )}
                                onClick={closeMenu}
                            >
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href="/cart"
                            className="mt-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                            onClick={closeMenu}
                        >
                            <ShoppingCart className="h-4 w-4" /> Cart ({hasHydrated ? cartCount : 0})
                        </Link>
                        {isAuthenticated ? (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        {userInitials}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{user?.name ?? user?.email ?? "Account"}</p>
                                        <p className="text-xs text-muted-foreground">Signed in</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" /> Logout
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button asChild variant="outline" className="mt-4">
                                    <Link href="/login" onClick={closeMenu}>
                                        Login
                                    </Link>
                                </Button>
                                <Button asChild className="mt-2">
                                    <Link href="/register" onClick={closeMenu}>
                                        Register
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}


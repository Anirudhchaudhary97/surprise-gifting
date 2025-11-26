"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
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
    const isAdmin = useAuthStore((state) => state.isAdmin);

    const toggleMenu = () => setIsOpen((prev) => !prev);

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
                        const isActive = pathname === link.href;
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
                    <Link href="/cart" className="relative rounded-full border border-border px-4 py-2 text-sm font-medium">
                        Cart
                        {cartCount > 0 && (
                            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Button asChild variant="outline">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Register</Link>
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-border bg-background lg:hidden">
                    <nav className="flex flex-col px-4 py-3">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-sm font-medium",
                                        isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                                    )}
                                    onClick={() => setIsOpen(false)}
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
                                onClick={() => setIsOpen(false)}
                            >
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href="/cart"
                            className="mt-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            Cart ({cartCount})
                        </Link>
                        <Button asChild variant="outline" className="mt-4">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild className="mt-2">
                            <Link href="/register">Register</Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

export default function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
    const { itemCount } = useCartStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/gifts', label: 'Gifts' },
        ...(isAdmin ? [{ href: '/admin', label: 'Dashboard' }] : []),
        ...(isAuthenticated && !isAdmin ? [{ href: '/orders', label: 'My Orders' }] : []),
    ];

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b bg-white transition-shadow',
                isScrolled ? 'shadow-sm' : ''
            )}
        >
            <div className="container-custom flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold font-playfair text-neutral-900">
                        Surprise Gifting
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'text-sm font-medium transition-colors',
                                pathname === link.href
                                    ? 'text-neutral-900'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {!isAdmin && (
                        <Link href="/cart" className="relative p-2 text-neutral-600 hover:text-neutral-900">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-neutral-700">
                                Hi, {user?.name.split(' ')[0]}
                            </span>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-neutral-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <div className="container-custom py-4 flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'text-sm font-medium py-2',
                                    pathname === link.href ? 'text-neutral-900' : 'text-neutral-600'
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="border-neutral-200" />
                        {!isAdmin && (
                            <Link
                                href="/cart"
                                className="flex items-center justify-between text-sm font-medium text-neutral-700 py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Cart
                                <span className="bg-neutral-900 text-white text-xs px-2 py-0.5 rounded-full">
                                    {itemCount}
                                </span>
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <Button variant="outline" fullWidth onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                                Logout
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" fullWidth>Login</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button fullWidth>Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

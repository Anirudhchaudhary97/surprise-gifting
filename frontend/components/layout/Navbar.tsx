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

    // Handle scroll effect
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
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
            )}
        >
            <div className="container-custom flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-bold font-playfair gradient-text">
                        Surprise Gifting
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'text-sm font-medium transition-colors hover:text-primary',
                                pathname === link.href
                                    ? 'text-primary'
                                    : 'text-gray-600'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Cart Icon */}
                    {!isAdmin && (
                        <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
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
                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 5c.07.286.074.58.012.865a2.25 2.25 0 01-2.142 1.828H6.758a2.25 2.25 0 01-2.142-1.828l1.263-5a2.25 2.25 0 012.142-1.672h7.372a2.25 2.25 0 012.142 1.672z"
                                />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-pulse">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Auth Buttons */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                Hi, {user?.name.split(' ')[0]}
                            </span>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" size="sm">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
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
                            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 flex flex-col gap-4 animate-slide-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'text-sm font-medium py-2',
                                pathname === link.href ? 'text-primary' : 'text-gray-600'
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <hr className="border-gray-100" />
                    {!isAdmin && (
                        <Link
                            href="/cart"
                            className="flex items-center justify-between text-sm font-medium text-gray-600 py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Cart
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
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
                                <Button variant="primary" fullWidth>Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

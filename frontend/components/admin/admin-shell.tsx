"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Tags, X } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarNav,
    SidebarNavItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/gifts", label: "Gifts", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/categories", label: "Categories", icon: Tags },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, user, clearAuth } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!isAdmin && user) {
            router.push("/");
        } else if (!user) {
            router.push("/login");
        }
    }, [isAdmin, user, router]);

    if (!isAdmin) {
        return null;
    }

    const handleLogout = () => {
        clearAuth();
        router.push("/login");
    };

    const renderNavItems = (onNavigate?: () => void) =>
        navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
                <SidebarNavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={active}
                    onClick={onNavigate}
                />
            );
        });

    return (
        <div className="min-h-screen bg-background">
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <Sidebar
                className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex-col"
            >
                <SidebarHeader>
                    <Link href="/admin" className="text-lg font-semibold">
                        Surprise Admin
                    </Link>
                </SidebarHeader>
                <SidebarContent className="pb-6">
                    <SidebarNav>{renderNavItems()}</SidebarNav>
                </SidebarContent>
                <SidebarFooter>
                    <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" /> Logout
                    </Button>
                </SidebarFooter>
            </Sidebar>

            <Sidebar
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 -translate-x-full bg-card shadow-lg transition-transform lg:hidden",
                    mobileOpen && "translate-x-0",
                )}
            >
                <SidebarHeader className="flex items-center justify-between">
                    <Link href="/admin" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>
                        Surprise Admin
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </SidebarHeader>
                <SidebarContent className="pb-6">
                    <SidebarNav>{renderNavItems(() => setMobileOpen(false))}</SidebarNav>
                </SidebarContent>
                <SidebarFooter>
                    <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" /> Logout
                    </Button>
                </SidebarFooter>
            </Sidebar>

            <div className="flex min-h-screen flex-col lg:pl-64">
                <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open navigation</span>
                            </Button>
                            <p className="text-base font-semibold">Dashboard</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                                <Link href="/">View storefront</Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                                <Link href="/">
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span className="sr-only">View storefront</span>
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}

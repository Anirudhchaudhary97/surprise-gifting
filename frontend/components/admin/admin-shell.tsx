"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Tags } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarNav, SidebarNavItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/gifts", label: "Gifts", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/categories", label: "Categories", icon: Tags },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, user } = useAuthStore();

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

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar className="hidden lg:flex">
                <SidebarHeader>
                    <Link href="/admin" className="text-lg font-semibold">
                        Surprise Admin
                    </Link>
                </SidebarHeader>
                <SidebarContent className="pb-6">
                    <SidebarNav>
                        {navItems.map((item) => (
                            <SidebarNavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                isActive={pathname === item.href}
                            />
                        ))}
                    </SidebarNav>
                </SidebarContent>
            </Sidebar>
            <div className="flex w-full flex-col lg:pl-6">
                <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <p className="text-base font-semibold">Dashboard</p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/">View storefront</Link>
                        </Button>
                    </div>
                </header>
                <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}

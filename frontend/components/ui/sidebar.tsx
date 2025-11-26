import Link from "next/link";
import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <aside
            ref={ref}
            className={cn(
                "flex h-full w-64 flex-col border-r border-border bg-card text-card-foreground",
                className,
            )}
            {...props}
        />
    ),
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center justify-between px-6 py-4", className)} {...props} />
);

const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex-1 space-y-4 overflow-y-auto px-4", className)} {...props} />
);

const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("border-t border-border px-6 py-4", className)} {...props} />
);

type SidebarNavProps = React.HTMLAttributes<HTMLDivElement>;

const SidebarNav = ({ className, ...props }: SidebarNavProps) => (
    <nav className={cn("grid gap-1", className)} {...props} />
);

interface SidebarNavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
}

const SidebarNavItem = ({ href, icon: Icon, label, isActive, className, ...props }: SidebarNavItemProps) => (
    <Link
        href={href}
        className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            isActive ? "bg-muted text-foreground" : "text-muted-foreground",
            className,
        )}
        {...props}
    >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
    </Link>
);

export { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarNav, SidebarNavItem };

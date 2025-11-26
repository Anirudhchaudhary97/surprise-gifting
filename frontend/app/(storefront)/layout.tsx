import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">{children}</div>
            </main>
            <Footer />
        </div>
    );
}

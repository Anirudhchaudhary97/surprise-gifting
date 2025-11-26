"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewGiftPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Implement gift creation
        alert("Gift creation coming soon!");
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Add New Gift</h1>
                    <p className="text-sm text-muted-foreground">Create a new gift offering.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/gifts">Cancel</Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">
                            Gift Name
                        </label>
                        <Input id="name" name="name" required className="mt-1" />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium">
                            Price
                        </label>
                        <Input id="price" name="price" type="number" step="0.01" required className="mt-1" />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium">
                            Category
                        </label>
                        <Input id="category" name="category" required className="mt-1" />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.push("/admin/gifts")}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Gift"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

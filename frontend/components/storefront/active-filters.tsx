"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { type Category } from "@/types";

export function ActiveFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const removeFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const clearAll = () => {
        router.push("/gifts");
    };

    const activeFilters: { key: string; label: string; value: string }[] = [];

    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
        const category = categories.find((c) => c.id === categoryId);
        activeFilters.push({
            key: "categoryId",
            label: "Category",
            value: category?.name || categoryId,
        });
    }

    const search = searchParams.get("search");
    if (search) {
        activeFilters.push({
            key: "search",
            label: "Search",
            value: search,
        });
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
        activeFilters.push({
            key: "price",
            label: "Price",
            value: `Rs. ${minPrice || 0} - Rs. ${maxPrice || 20000}`,
        });
    }

    const sortBy = searchParams.get("sortBy");
    if (sortBy && sortBy !== "newest") {
        const sortLabels: Record<string, string> = {
            price_asc: "Price: Low to High",
            price_desc: "Price: High to Low",
        };
        activeFilters.push({
            key: "sortBy",
            label: "Sort",
            value: sortLabels[sortBy] || sortBy,
        });
    }

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
                    <span className="text-xs">
                        {filter.label}: {filter.value}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0.5 hover:bg-transparent"
                        onClick={() => {
                            if (filter.key === "price") {
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete("minPrice");
                                params.delete("maxPrice");
                                router.push(`?${params.toString()}`, { scroll: false });
                            } else {
                                removeFilter(filter.key);
                            }
                        }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto px-2 py-1 text-xs">
                Clear all
            </Button>
        </div>
    );
}

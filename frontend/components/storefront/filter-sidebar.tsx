"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/lib/api";
import { type Category } from "@/types";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [priceRange, setPriceRange] = useState([0, 20000]);

    // Sync local state with URL params
    const currentCategory = searchParams.get("categoryId");
    const currentSort = searchParams.get("sortBy") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        if (minPrice || maxPrice) {
            setPriceRange([
                minPrice ? Number(minPrice) : 0,
                maxPrice ? Number(maxPrice) : 20000
            ]);
        }
    }, [minPrice, maxPrice]);

    const createQueryString = useCallback(
        (name: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === null) {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const updateFilter = (name: string, value: string | null) => {
        router.push(`?${createQueryString(name, value)}`, { scroll: false });
    };

    const handlePriceChange = (value: number[]) => {
        setPriceRange(value);
    };

    const applyPriceFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("minPrice", priceRange[0].toString());
        params.set("maxPrice", priceRange[1].toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const clearFilters = () => {
        router.push("/gifts");
        setPriceRange([0, 20000]);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {(currentCategory || minPrice || maxPrice) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                        Clear all
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                <Label>Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search gifts..."
                        value={searchParams.get("search") || ""}
                        onChange={(e) => updateFilter("search", e.target.value || null)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Label>Sort by</Label>
                <Select
                    value={currentSort}
                    onValueChange={(value) => updateFilter("sortBy", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                <Label>Categories</Label>
                <div className="space-y-2">
                    <button
                        onClick={() => updateFilter("categoryId", null)}
                        className={cn(
                            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                            !currentCategory ? "bg-muted font-medium" : "text-muted-foreground"
                        )}
                    >
                        All Gifts
                        {!currentCategory && <Check className="h-4 w-4" />}
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => updateFilter("categoryId", category.id)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                                currentCategory === category.id ? "bg-muted font-medium" : "text-muted-foreground"
                            )}
                        >
                            {category.name}
                            {currentCategory === category.id && <Check className="h-4 w-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Price Range</Label>
                    <span className="text-xs text-muted-foreground">
                        Rs. {priceRange[0]} - Rs. {priceRange[1]}
                    </span>
                </div>
                <Slider
                    defaultValue={[0, 20000]}
                    value={priceRange}
                    max={20000}
                    step={500}
                    minStepsBetweenThumbs={1}
                    onValueChange={handlePriceChange}
                    onValueCommit={applyPriceFilter}
                    className="py-4"
                />
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "./filter-sidebar";
import { useSearchParams } from "next/navigation";

export function MobileFilterButton() {
    const [open, setOpen] = useState(false);
    const searchParams = useSearchParams();

    // Count active filters
    const activeCount = Array.from(searchParams.keys()).filter(
        (key) => !["page"].includes(key)
    ).length;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Refine your gift search
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <FilterSidebar />
                </div>
            </SheetContent>
        </Sheet>
    );
}

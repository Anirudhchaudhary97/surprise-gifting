"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete("page");
        } else {
            params.set("page", page.toString());
        }
        router.push(`?${params.toString()}`, { scroll: true });
    };

    if (totalPages <= 1) {
        return null;
    }

    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            <div className="flex items-center gap-1">
                {pages.map((page, index) =>
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page as number)}
                            className="min-w-[40px]"
                        >
                            {page}
                        </Button>
                    )
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

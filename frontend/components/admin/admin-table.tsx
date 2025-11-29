"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AdminTableColumn<T> {
    key: keyof T;
    header: string;
    className?: string;
    render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T> {
    data: T[];
    columns: AdminTableColumn<T>[];
    emptyState?: string;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    searchKey?: keyof T;
    pageSize?: number;
}

export function AdminTable<T extends { id: string }>({
    data,
    columns,
    emptyState = "No data available yet.",
    onEdit,
    onDelete,
    searchKey,
    pageSize = 10,
}: AdminTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        if (!searchKey || !searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter((item) => {
            const value = item[searchKey];
            return String(value).toLowerCase().includes(lowerQuery);
        });
    }, [data, searchKey, searchQuery]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    if (!data.length) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
                {emptyState}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {searchKey && (
                <div className="flex items-center gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            {columns.map((column) => (
                                <th key={String(column.key)} className={cn("px-4 py-3", column.className)}>
                                    {column.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && <th className="px-4 py-3 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <tr key={row.id} className="transition hover:bg-muted/30">
                                    {columns.map((column) => (
                                        <td key={String(column.key)} className={cn("px-4 py-4", column.className)}>
                                            {column.render ? column.render(row) : String(row[column.key])}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {onEdit && (
                                                    <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
                                                        Edit
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button variant="destructive" size="sm" onClick={() => onDelete(row)}>
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[2rem] text-center font-medium">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

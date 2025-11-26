import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
}

export function AdminTable<T extends { id: string }>({
    data,
    columns,
    emptyState = "No data available yet.",
    onEdit,
    onDelete,
}: AdminTableProps<T>) {
    if (!data.length) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
                {emptyState}
            </div>
        );
    }

    return (
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
                    {data.map((row) => (
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
                    ))}
                </tbody>
            </table>
        </div>
    );
}

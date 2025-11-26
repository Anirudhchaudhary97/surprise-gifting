import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { getGifts } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default async function AdminGiftsPage() {
    const gifts = await getGifts();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Manage gifts</h1>
                    <p className="text-sm text-muted-foreground">Edit offerings and track inventory coming soon.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/gifts/new">Add gift</Link>
                </Button>
            </div>

            <AdminTable
                data={gifts}
                columns={[
                    { key: "name", header: "Gift" },
                    {
                        key: "categoryName",
                        header: "Category",
                    },
                    {
                        key: "price",
                        header: "Price",
                        render: (gift) => formatCurrency(gift.price),
                    },
                    {
                        key: "rating",
                        header: "Rating",
                        render: (gift) => `${gift.rating.toFixed(1)} (${gift.reviewsCount})`,
                    },
                ]}
                emptyState="No gifts configured yet."
                onEdit={(gift) => alert(`Edit ${gift.name} coming soon`)}
                onDelete={(gift) => alert(`Delete ${gift.name} coming soon`)}
            />
        </div>
    );
}

import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/api";

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <p className="text-sm text-muted-foreground">Group gifts by occasion for easy discovery.</p>
                </div>
                <Button variant="outline">New category</Button>
            </div>
            <AdminTable
                data={categories}
                columns={[
                    { key: "name", header: "Category" },
                    { key: "slug", header: "Slug" },
                    {
                        key: "description",
                        header: "Description",
                    },
                ]}
                emptyState="No categories yet."
                onEdit={(category) => alert(`Edit ${category.name} coming soon`)}
                onDelete={(category) => alert(`Delete ${category.name} coming soon`)}
            />
        </div>
    );
}

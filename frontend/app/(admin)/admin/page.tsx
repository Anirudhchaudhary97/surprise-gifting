import { AdminTable } from "@/components/admin/admin-table";
import { getCategories, getGifts, getOrders } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOverviewPage() {
    const [gifts, orders, categories] = await Promise.all([
        getGifts(),
        getOrders(),
        getCategories(),
    ]);

    return (
        <div className="space-y-10">
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Active gifts</p>
                    <p className="mt-3 text-3xl font-semibold">{gifts.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="mt-3 text-3xl font-semibold">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="mt-3 text-3xl font-semibold">{categories.length}</p>
                </div>
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Recent orders</h2>
                    <p className="text-sm text-muted-foreground">Monitor customer surprises currently in progress.</p>
                </div>
                <AdminTable
                    data={orders.slice(0, 5)}
                    columns={[
                        { key: "id", header: "Order ID" },
                        {
                            key: "status",
                            header: "Status",
                            render: (order) => <span className="capitalize">{order.status}</span>,
                        },
                        {
                            key: "createdAt",
                            header: "Placed",
                            render: (order) => new Date(order.createdAt).toLocaleDateString(),
                        },
                        {
                            key: "total",
                            header: "Total",
                            render: (order) => formatCurrency(order.total),
                        },
                    ]}
                    emptyState="No recent orders yet."
                />
            </section>
        </div>
    );
}

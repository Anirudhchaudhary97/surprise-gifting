import { AdminTable } from "@/components/admin/admin-table";
import { getOrders } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Orders</h1>
                <p className="text-sm text-muted-foreground">Track order statuses and manage fulfilment.</p>
            </div>
            <AdminTable
                data={orders}
                columns={[
                    { key: "id", header: "Order ID" },
                    {
                        key: "status",
                        header: "Status",
                        render: (order) => <span className="capitalize">{order.status}</span>,
                    },
                    {
                        key: "createdAt",
                        header: "Created",
                        render: (order) => new Date(order.createdAt).toLocaleString(),
                    },
                    {
                        key: "total",
                        header: "Total",
                        render: (order) => formatCurrency(order.total),
                    },
                ]}
                emptyState="No orders found."
                onEdit={(order) => alert(`Update status for ${order.id} coming soon`)}
            />
        </div>
    );
}

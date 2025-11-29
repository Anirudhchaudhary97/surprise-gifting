"use client";

import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { type Order } from "@/types";

interface RevenueChartProps {
    orders: Order[];
}

export function RevenueChart({ orders }: RevenueChartProps) {
    const data = useMemo(() => {
        // Group orders by date (last 7 days or all time)
        const grouped = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
            });
            acc[date] = (acc[date] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort by date (simplified for now)
        return Object.entries(grouped).map(([date, total]) => ({
            date,
            total,
        }));
    }, [orders]);

    if (!data.length) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
                No revenue data available.
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Revenue over time</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

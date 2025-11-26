"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GiftForm, type GiftFormValues } from "@/components/admin/gift-form";
import { Button } from "@/components/ui/button";
import {
    createGift,
    getCategories,
    type GiftWritePayload,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

function buildPayload(values: GiftFormValues): { payload: GiftWritePayload; images: File[] } {
    const { images, ...rest } = values;
    return {
        payload: {
            ...rest,
            addonsOptions: rest.addonsOptions ?? [],
        },
        images,
    };
}

export default function NewGiftPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const queryClient = useQueryClient();

    const [formError, setFormError] = useState<string | null>(null);

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const createMutation = useMutation({
        mutationFn: (values: GiftFormValues) => {
            const { payload, images } = buildPayload(values);
            return createGift(payload, images, token ?? null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gifts"] });
            router.push("/admin/gifts");
        },
        onError: (error: Error) => setFormError(error.message),
    });

    const handleSubmit = (values: GiftFormValues) => {
        setFormError(null);
        createMutation.mutate(values);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Add new gift</h1>
                    <p className="text-sm text-muted-foreground">Craft a new surprise for customers.</p>
                </div>
                <Button variant="outline" onClick={() => router.push("/admin/gifts")}>Back to list</Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                {formError && (
                    <div className="mb-4 rounded-md border border-destructive/70 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {formError}
                    </div>
                )}
                <GiftForm
                    categories={categories}
                    loading={createMutation.isPending}
                    submitLabel={createMutation.isPending ? "Creating..." : "Create gift"}
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/admin/gifts")}
                />
            </div>
        </div>
    );
}

"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import { GiftForm, type GiftFormValues } from "@/components/admin/gift-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    createGift,
    deleteGift,
    deleteGiftImage,
    getCategories,
    getGiftById,
    getGifts,
    updateGift,
    type GiftWritePayload,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { type Gift } from "@/types";

type DialogMode = "create" | "edit";

function createPayload(values: GiftFormValues): { payload: GiftWritePayload; images: File[] } {
    const { images, ...rest } = values;
    return {
        payload: {
            ...rest,
            addonsOptions: rest.addonsOptions ?? [],
        },
        images,
    };
}

export default function AdminGiftsPage() {
    const { token } = useAuthStore();
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<DialogMode>("create");
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
    const [activeGiftId, setActiveGiftId] = useState<string | null>(null);
    const [dialogError, setDialogError] = useState<string | null>(null);
    const [loadingGiftDetail, setLoadingGiftDetail] = useState(false);
    const [deletingGiftId, setDeletingGiftId] = useState<string | null>(null);
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

    const { data: gifts = [], isLoading: giftsLoading } = useQuery({
        queryKey: ["gifts"],
        queryFn: getGifts,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const createMutation = useMutation({
        mutationFn: async (values: GiftFormValues) => {
            const { payload, images } = createPayload(values);
            return createGift(payload, images, token ?? null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gifts"] });
            handleCloseDialog();
        },
        onError: (error: Error) => setDialogError(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: async (input: { id: string; values: GiftFormValues }) => {
            const { payload, images } = createPayload(input.values);
            return updateGift(input.id, payload, images, token ?? null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gifts"] });
            handleCloseDialog();
        },
        onError: (error: Error) => setDialogError(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteGift(id, token ?? null),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gifts"] });
        },
        onError: (error: Error) => setDialogError(error.message),
        onSettled: () => setDeletingGiftId(null),
    });

    const loadGiftDetail = useCallback(
        async (giftId: string) => {
            setLoadingGiftDetail(true);
            setDialogError(null);
            try {
                const detail = await getGiftById(giftId);
                if (!detail) {
                    setDialogError("Unable to load gift details.");
                    return;
                }
                setSelectedGift(detail);
            } catch (error) {
                setDialogError((error as Error).message);
            } finally {
                setLoadingGiftDetail(false);
            }
        },
        [],
    );

    const deleteImageMutation = useMutation({
        mutationFn: (imageId: string) => deleteGiftImage(imageId, token ?? null),
        onSuccess: async () => {
            if (activeGiftId) {
                await loadGiftDetail(activeGiftId);
                queryClient.invalidateQueries({ queryKey: ["gifts"] });
            }
        },
        onError: (error: Error) => setDialogError(error.message),
        onSettled: () => setDeletingImageId(null),
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleOpenCreate = () => {
        setDialogMode("create");
        setDialogError(null);
        setSelectedGift(null);
        setActiveGiftId(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (gift: Gift) => {
        setDialogMode("edit");
        setDialogError(null);
        setSelectedGift(null);
        setActiveGiftId(gift.id);
        setDialogOpen(true);
        loadGiftDetail(gift.id);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDialogError(null);
        setSelectedGift(null);
        setActiveGiftId(null);
    };

    const handleDeleteGift = (gift: Gift) => {
        if (deletingGiftId || !window.confirm(`Delete ${gift.name}? This will remove associated images.`)) {
            return;
        }

        setDeletingGiftId(gift.id);
        deleteMutation.mutate(gift.id);
    };

    const handleSubmit = (values: GiftFormValues) => {
        setDialogError(null);

        const giftId = activeGiftId ?? selectedGift?.id;

        if (dialogMode === "edit" && giftId) {
            updateMutation.mutate({ id: giftId, values });
        } else {
            createMutation.mutate(values);
        }
    };

    const handleDeleteImage = (imageId: string) => {
        if (!imageId || deletingImageId) {
            return;
        }

        setDeletingImageId(imageId);
        deleteImageMutation.mutate(imageId);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Manage gifts</h1>
                    <p className="text-sm text-muted-foreground">
                        Create new offerings, adjust inventory, and curate featured surprises.
                    </p>
                </div>
                <Button variant="outline" onClick={handleOpenCreate}>
                    Add gift
                </Button>
            </div>

            {giftsLoading ? (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                    Loading gifts...
                </div>
            ) : (
                <AdminTable
                    data={gifts}
                    columns={[
                        {
                            key: "images",
                            header: "Preview",
                            className: "w-28",
                            render: (gift) => (
                                <div className="flex items-center">
                                    <Image
                                        src={gift.images[0]}
                                        alt={gift.name}
                                        width={64}
                                        height={64}
                                        className="h-16 w-16 rounded-md border border-border/70 object-cover"
                                    />
                                </div>
                            ),
                        },
                        {
                            key: "name",
                            header: "Gift",
                            render: (gift) => (
                                <div className="space-y-1">
                                    <p className="font-medium">{gift.name}</p>
                                    <p className="text-xs text-muted-foreground">{gift.categoryName}</p>
                                </div>
                            ),
                        },
                        {
                            key: "price",
                            header: "Price",
                            render: (gift) => formatCurrency(gift.price),
                        },
                        {
                            key: "stock",
                            header: "Stock",
                            render: (gift) =>
                                gift.stock !== undefined && gift.stock !== null
                                    ? gift.stock.toString()
                                    : "—",
                        },
                        {
                            key: "featured",
                            header: "Featured",
                            render: (gift) => (gift.featured ? "Yes" : "No"),
                        },
                    ]}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteGift}
                    emptyState="No gifts configured yet."
                    searchKey="name"
                />
            )}

            <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleCloseDialog())}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === "edit" ? "Edit gift" : "Create gift"}</DialogTitle>
                        <DialogDescription>
                            Manage gift details, inventory, and gallery assets in one place.
                        </DialogDescription>
                    </DialogHeader>

                    {dialogError && (
                        <div className="mb-4 rounded-md border border-destructive/70 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {dialogError}
                        </div>
                    )}

                    {dialogMode === "edit" && loadingGiftDetail && !selectedGift ? (
                        <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                            Loading gift details...
                        </div>
                    ) : (
                        <GiftForm
                            key={selectedGift?.id ?? "new"}
                            categories={categories}
                            initialGift={dialogMode === "edit" ? selectedGift : null}
                            loading={isSubmitting || loadingGiftDetail}
                            submitLabel={dialogMode === "edit" ? "Update gift" : "Create gift"}
                            onSubmit={handleSubmit}
                            onCancel={handleCloseDialog}
                            onDeleteImage={selectedGift ? handleDeleteImage : undefined}
                            deletingImageId={deletingImageId}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {deletingGiftId && (
                <div className="text-sm text-muted-foreground">Deleting gift...</div>
            )}
        </div>
    );
}

"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
    type CategoryPayload,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { type Category } from "@/types";

interface CategoryFormState {
    id: string | null;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
}

const defaultFormState: CategoryFormState = {
    id: null,
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function buildPayload(form: CategoryFormState): CategoryPayload {
    return {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() ? form.description.trim() : undefined,
        imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : undefined,
    };
}

export default function AdminCategoriesPage() {
    const { token } = useAuthStore();
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState<CategoryFormState>(defaultFormState);
    const [slugTouched, setSlugTouched] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CategoryPayload) => createCategory(payload, token ?? null),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            handleCloseDialog();
        },
        onError: (error: Error) => setFormError(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: (input: { id: string; payload: Partial<CategoryPayload> }) =>
            updateCategory(input.id, input.payload, token ?? null),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            handleCloseDialog();
        },
        onError: (error: Error) => setFormError(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCategory(id, token ?? null),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (error: Error) => setFormError(error.message),
        onSettled: () => setDeletingId(null),
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormState(defaultFormState);
        setSlugTouched(false);
        setFormError(null);
    };

    const handleOpenCreate = () => {
        setFormState(defaultFormState);
        setSlugTouched(false);
        setFormError(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (category: Category) => {
        setFormState({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            imageUrl: category.image.startsWith("/images/") ? "" : category.image,
        });
        setSlugTouched(true);
        setFormError(null);
        setDialogOpen(true);
    };

    const handleNameChange = (value: string) => {
        setFormState((prev) => ({
            ...prev,
            name: value,
            slug: slugTouched ? prev.slug : slugify(value),
        }));
    };

    const handleSlugChange = (value: string) => {
        setSlugTouched(true);
        setFormState((prev) => ({
            ...prev,
            slug: value.toLowerCase(),
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!formState.name.trim() || !formState.slug.trim()) {
            setFormError("Name and slug are required.");
            return;
        }

        const payload = buildPayload(formState);

        if (formState.id) {
            updateMutation.mutate({ id: formState.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (category: Category) => {
        if (!window.confirm(`Delete ${category.name}? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(category.id);
        deleteMutation.mutate(category.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Group gifts by occasion for easy discovery.
                    </p>
                </div>
                <Button variant="outline" onClick={handleOpenCreate}>
                    New category
                </Button>
            </div>

            {isLoading ? (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                    Loading categories...
                </div>
            ) : (
                <AdminTable
                    data={categories}
                    columns={[
                        {
                            key: "image",
                            header: "Preview",
                            className: "w-28",
                            render: (category) => (
                                <div className="flex items-center">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        width={56}
                                        height={56}
                                        className="h-14 w-14 rounded-md border border-border/70 object-cover"
                                    />
                                </div>
                            ),
                        },
                        { key: "name", header: "Category" },
                        {
                            key: "slug",
                            header: "Slug",
                            render: (category) => <code className="text-xs">{category.slug}</code>,
                        },
                        {
                            key: "description",
                            header: "Description",
                            render: (category) => (
                                <span className="line-clamp-2 text-sm text-muted-foreground">
                                    {category.description || "—"}
                                </span>
                            ),
                        },
                    ]}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    emptyState="No categories yet."
                />
            )}

            <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleCloseDialog())}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{formState.id ? "Edit category" : "Create category"}</DialogTitle>
                        <DialogDescription>
                            Configure how gifts are grouped inside the storefront experience.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="category-name" className="text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id="category-name"
                                value={formState.name}
                                onChange={(event) => handleNameChange(event.target.value)}
                                placeholder="Birthday surprises"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category-slug" className="text-sm font-medium">
                                Slug
                            </label>
                            <Input
                                id="category-slug"
                                value={formState.slug}
                                onChange={(event) => handleSlugChange(event.target.value)}
                                placeholder="birthday-surprises"
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in URLs: <span className="font-mono">/gifts/category/{formState.slug || "slug"}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category-description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="category-description"
                                value={formState.description}
                                onChange={(event) =>
                                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                                }
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category-image" className="text-sm font-medium">
                                Image URL
                            </label>
                            <Input
                                id="category-image"
                                value={formState.imageUrl}
                                onChange={(event) =>
                                    setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))
                                }
                                placeholder="https://res.cloudinary.com/..."
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide a hosted image URL. Leave blank to use the default artwork.
                            </p>
                        </div>

                        {formError && (
                            <div className="rounded-md border border-destructive/70 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {formError}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : formState.id ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {deletingId && (
                <div className="text-sm text-muted-foreground">
                    Removing category...
                </div>
            )}
        </div>
    );
}

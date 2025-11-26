export function LoadingSpinner({ label }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
            {label && <p className="text-sm font-medium">{label}</p>}
        </div>
    );
}

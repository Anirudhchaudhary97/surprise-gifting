export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/40">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <p className="text-base font-semibold">Surprise Gifting</p>
                    <p className="text-sm text-muted-foreground">
                        Thoughtful curation for birthdays, anniversaries, and every milestone in between.
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Surprise Gifting. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

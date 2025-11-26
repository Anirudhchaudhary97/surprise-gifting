"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { cartStorePersist } from "@/stores/cart-store";

interface AppProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        staleTime: 1000 * 60,
                    },
                },
            }),
    );

    useEffect(() => {
        cartStorePersist.rehydrate();
    }, []);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

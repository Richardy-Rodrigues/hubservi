import type { ReactNode, ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function Providers({
  children,
  initialEntries = ["/"],
  client = makeQueryClient(),
}: {
  children: ReactNode;
  initialEntries?: string[];
  client?: QueryClient;
}) {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

// Render customizado que embrulha o componente nos Providers (React Query + Router),
// evitando repetir <Providers>...</Providers> em cada teste.
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ["/"],
    client = makeQueryClient(),
    ...options
  }: { initialEntries?: string[]; client?: QueryClient } & Omit<RenderOptions, "wrapper"> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers initialEntries={initialEntries} client={client}>
        {children}
      </Providers>
    ),
    ...options,
  });
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "../Dashboard";
import { Providers } from "@/test/utils";

const useAuthMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/components/dashboard/ClientDashboard", () => ({
  ClientDashboard: () => <div>client-dashboard-stub</div>,
}));

vi.mock("@/components/dashboard/ProviderDashboard", () => ({
  ProviderDashboard: () => <div>provider-dashboard-stub</div>,
}));

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Dashboard role routing", () => {
  beforeEach(() => useAuthMock.mockReset());

  it("renders ProviderDashboard when profile.user_type === 'provider'", () => {
    useAuthMock.mockReturnValue({
      profile: { full_name: "Ana", user_type: "provider" },
    });
    render(
      <Providers>
        <Dashboard />
      </Providers>,
    );
    expect(screen.getByText("provider-dashboard-stub")).toBeInTheDocument();
    expect(screen.queryByText("client-dashboard-stub")).toBeNull();
  });

  it("renders ClientDashboard otherwise", () => {
    useAuthMock.mockReturnValue({
      profile: { full_name: "Bob", user_type: "client" },
    });
    render(
      <Providers>
        <Dashboard />
      </Providers>,
    );
    expect(screen.getByText("client-dashboard-stub")).toBeInTheDocument();
    expect(screen.queryByText("provider-dashboard-stub")).toBeNull();
  });
});

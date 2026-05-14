import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";

const useAuthMock = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>auth page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("renders the loader while auth is hydrating", () => {
    useAuthMock.mockReturnValue({ user: null, loading: true });
    const { container } = renderAt("/protected");
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(screen.queryByText("secret content")).toBeNull();
  });

  it("redirects to /auth when there is no user", () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    renderAt("/protected");
    expect(screen.getByText("auth page")).toBeInTheDocument();
    expect(screen.queryByText("secret content")).toBeNull();
  });

  it("renders children when an authenticated user is present", () => {
    useAuthMock.mockReturnValue({ user: { id: "u-1" }, loading: false });
    renderAt("/protected");
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});

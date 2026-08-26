import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@/components/Navbar/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar-stub" />,
}));
vi.mock("@/components/Footer/Footer", () => ({
  Footer: () => <footer data-testid="footer-stub" />,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    loading: false,
  })),
}));

import ComunidadPage from "./page";

describe("ComunidadPage", () => {
  it("renders the community heading and at least one discussion card", () => {
    render(<ComunidadPage />);

    expect(screen.getByRole("heading", { name: /Comunidad/i })).toBeInTheDocument();
    expect(screen.getByText(/Hexagonal Architecture/i)).toBeInTheDocument();
  });

  it("renders topic filter chips", () => {
    render(<ComunidadPage />);

    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Testing" })).toBeInTheDocument();
  });

  it("renders the sidebar with popular topics", () => {
    render(<ComunidadPage />);

    expect(screen.getByText("Temas populares")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@/components/Navbar/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar-stub" />,
}));
vi.mock("@/components/Footer/Footer", () => ({
  Footer: () => <footer data-testid="footer-stub" />,
}));

vi.mock("@/contexts/CourseContext", () => ({
  useCourses: vi.fn(() => ({
    allCourses: [],
    setAllCourses: vi.fn(),
    favorites: [],
  })),
}));

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn<() => unknown>(() => null),
  fetchCurrentUser: vi.fn<() => Promise<unknown>>(),
  logout: vi.fn(() => Promise.resolve()),
  clearSession: vi.fn(),
}));

vi.mock("@/services/authApi", () => ({
  AUTH_USER_KEY: "mindcode_user",
  AUTH_CHANGE_EVENT: "mindcode-auth-change",
  getUser: authMocks.getUser,
  clearSession: authMocks.clearSession,
  fetchCurrentUser: authMocks.fetchCurrentUser,
  logout: authMocks.logout,
  updateProfile: vi.fn(),
}));

import PerfilPage from "./page";

describe("PerfilPage", () => {
  it("shows login gate for anonymous visitors", async () => {
    authMocks.getUser.mockReturnValue(null);
    authMocks.fetchCurrentUser.mockRejectedValue(
      Object.assign(new Error("HTTP 401"), { status: 401 })
    );

    render(<PerfilPage />);

    expect(
      await screen.findByText("Iniciá sesión para ver tu perfil")
    ).toBeInTheDocument();
  });
});

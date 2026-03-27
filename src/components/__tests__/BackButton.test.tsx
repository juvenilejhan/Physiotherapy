import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { BackButton } from "../BackButton";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
}));

describe("BackButton Component", () => {
  it("should render button element", () => {
    render(<BackButton />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  it("should apply custom className", () => {
    render(<BackButton className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });

  it("should accept href prop", () => {
    render(<BackButton href="/dashboard" />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  it("should accept isAuthPage prop", () => {
    render(<BackButton isAuthPage={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });
});

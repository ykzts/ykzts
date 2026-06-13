import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navigation from "@ykzts/layout/components/site-navigation";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("Navigation", () => {
  it("should render site-wide navigation links", () => {
    render(<Navigation />);

    expect(screen.getAllByText("About").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Blog").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Contact").length).toBeGreaterThan(0);
  });

  it("renders Blog as a direct link (no Archive/Search sub-items)", async () => {
    render(<Navigation />);

    // Blog is now a direct link, not a dropdown trigger
    expect(screen.getAllByText("Blog").length).toBeGreaterThan(0);

    const menuButton = screen.getByRole("button", { name: "メニューを開く" });
    await userEvent.click(menuButton);

    // Archive and Search sub-items have been removed from navigation
    expect(screen.queryByText("Archive")).not.toBeInTheDocument();
    expect(screen.queryByText("Search")).not.toBeInTheDocument();
  });

  it("shows Works link when hasWorks is true", () => {
    render(<Navigation hasWorks={true} />);

    expect(screen.getAllByText("Works").length).toBeGreaterThan(0);
  });

  it("hides Works link when hasWorks is false", () => {
    render(<Navigation hasWorks={false} />);

    expect(screen.queryByText("Works")).not.toBeInTheDocument();
  });

  it("shows About link when hasAbout is true", () => {
    render(<Navigation hasAbout={true} />);

    expect(screen.getAllByText("About").length).toBeGreaterThan(0);
  });

  it("hides About link when hasAbout is false", () => {
    render(<Navigation hasAbout={false} />);

    expect(screen.queryByText("About")).not.toBeInTheDocument();
  });

  it("should have accessible menu button for mobile", () => {
    render(<Navigation />);

    const menuButton = screen.getByRole("button", { name: "メニューを開く" });
    expect(menuButton).toBeInTheDocument();
  });

  it("should have aria-label for main navigation", () => {
    render(<Navigation />);

    const nav = screen.getByLabelText("Main navigation");
    expect(nav).toBeInTheDocument();
  });
});

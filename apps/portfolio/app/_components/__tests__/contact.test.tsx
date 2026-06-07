import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Contact from "../contact";

// Mock the intersection observer hook
vi.mock("react-intersection-observer", () => ({
  useInView: vi.fn(() => [vi.fn(), false]),
}));

// Mock the ContactForm component
vi.mock("../contact-form", () => ({
  default: () => <div data-testid="contact-form">Contact Form</div>,
}));

// Mock the async server-rendered SocialLinks subtree to keep this test focused.
vi.mock("../social-links", () => ({
  default: () => <div data-testid="social-links">Social Links</div>,
}));

// Mock getProfile from @ykzts/supabase/queries
vi.mock("@ykzts/supabase/queries", () => ({
  getProfile: vi.fn(async () => ({
    about: [
      {
        _type: "block",
        children: [{ _type: "span", text: "About text" }],
      },
    ],
    email: "test@example.com",
    id: "test-id",
    name: "テストユーザー",
    profile_technologies: [
      { sort_order: 0, technology: { name: "JavaScript" } },
      { sort_order: 1, technology: { name: "TypeScript" } },
    ],
    social_links: [
      {
        url: "https://github.com/test",
      },
    ],
    tagline: "ソフトウェア開発者",
  })),
}));

describe("Contact Component", () => {
  it('renders with id="contact"', () => {
    render(<Contact />);

    const section = document.querySelector("section");
    expect(section).toHaveAttribute("id", "contact");
  });

  it("renders the section title", () => {
    const { container } = render(<Contact />);

    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Contact");
  });
});

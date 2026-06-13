import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Prevent "server-only" (and "client-only") guards from throwing or failing resolution
// when running server-only modules under jsdom test environment.
vi.mock("server-only", () => ({}));
vi.mock("client-only", () => ({}));

vi.mock("@vercel/microfrontends/next/client", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children),
}));

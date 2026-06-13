import type { Metadata } from "next";
import type { ReactNode } from "react";

interface TagLayoutProps {
  children: ReactNode;
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({
  params,
}: TagLayoutProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const encodedTag = encodeURIComponent(decodedTag);

  return {
    alternates: {
      types: {
        "application/atom+xml": `/blog/tags/${encodedTag}.atom`,
      },
    },
  };
}

export default function TagLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

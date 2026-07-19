import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { proseContent } from "@ykzts/ui/lib/prose";
import type { ComponentProps } from "react";
import Link from "@/components/link";

const portableTextComponents = {
  marks: {
    link({
      children,
      value,
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href;

      if (!href) {
        return <>{children}</>;
      }

      return <Link href={href}>{children}</Link>;
    },
  },
} satisfies Partial<PortableTextReactComponents>;

type PortableTextProps = Omit<
  ComponentProps<typeof PortableText>,
  "components"
> & {
  value: PortableTextBlock[];
};

export default function MemoPortableText({
  value,
  ...props
}: PortableTextProps) {
  return (
    <div className={proseContent("max-w-none")}>
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  );
}

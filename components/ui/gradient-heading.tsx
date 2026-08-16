import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "span";

export function GradientHeading({
  as: Tag = "h2",
  className,
  ...props
}: React.ComponentProps<"h2"> & { as?: HeadingTag }) {
  return (
    <Tag
      className={cn("text-gradient-entaj font-expanded font-light", className)}
      {...props}
    />
  );
}

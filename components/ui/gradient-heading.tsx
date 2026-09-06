import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "span";

export function GradientHeading({
  as: Tag = "h2",
  className,
  color,
  style,
  ...props
}: Omit<React.ComponentProps<"h2">, "color"> & {
  as?: HeadingTag;
  /** Solid color override (e.g. a category's color). Falls back to the default brand gradient
   * when not provided. */
  color?: string | null;
}) {
  return (
    <Tag
      className={cn("font-expanded font-light", !color && "text-gradient-entaj", className)}
      style={color ? { color, ...style } : style}
      {...props}
    />
  );
}

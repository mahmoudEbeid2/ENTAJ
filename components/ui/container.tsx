import { cn } from "@/lib/utils";

export function Container({
  className,
  narrow = false,
  ...props
}: React.ComponentProps<"div"> & { narrow?: boolean }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 lg:px-10",
        narrow ? "max-w-[1040px]" : "max-w-[1280px]",
        className,
      )}
      {...props}
    />
  );
}

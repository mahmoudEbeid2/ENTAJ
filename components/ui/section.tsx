import { cn } from "@/lib/utils";

export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-16 lg:py-24", className)} {...props} />;
}

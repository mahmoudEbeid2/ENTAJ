import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-entaj-blue/10 bg-entaj-light-grey/50">
      <Container className="flex flex-wrap items-center gap-1.5 py-4 font-expanded text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="size-3.5 shrink-0 text-entaj-medium-grey/50" aria-hidden="true" />
              ) : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="text-entaj-medium-grey transition-colors hover:text-entaj-blue">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? "font-semibold text-entaj-dark-grey" : "text-entaj-medium-grey")}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </Container>
    </nav>
  );
}

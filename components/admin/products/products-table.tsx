"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileText, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/components/admin/products/product-form-dialog";
import {
  ProductDocumentsDialog,
  type ProductDocumentSummary,
} from "@/components/admin/products/product-documents-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteProduct } from "@/actions/admin/products";
import { storageUrl } from "@/lib/utils/asset-url";
import type { divisions, products, ProductDocumentType } from "@/database/schema";

type Product = typeof products.$inferSelect;
type Division = typeof divisions.$inferSelect;

export function ProductsTable({
  products: initialProducts,
  divisions: divisionList,
  documentsByProductId = {},
}: {
  products: Product[];
  divisions: Division[];
  documentsByProductId?: Record<number, Partial<Record<ProductDocumentType, ProductDocumentSummary>>>;
}) {
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");

  const divisionOptions = divisionList.map((d) => ({ id: d.id, name: d.name }));
  const divisionNameById = useMemo(
    () => new Map(divisionList.map((d) => [d.id, d.name])),
    [divisionList],
  );

  const filtered = initialProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesDivision = divisionFilter === "all" || p.divisionId === Number(divisionFilter);
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={divisionFilter} onValueChange={(value) => setDivisionFilter(value ?? "all")}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All divisions">
                {(value: string | null) =>
                  !value || value === "all" ? "All divisions" : (divisionNameById.get(Number(value)) ?? "All divisions")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All divisions</SelectItem>
              {divisionOptions.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ProductFormDialog
          divisions={divisionOptions}
          trigger={
            <Button>
              <Plus className="size-4" />
              Add Product
            </Button>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            {initialProducts.length === 0
              ? "Add your first product to get started."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      {product.imagePath ? (
                        <Image
                          src={storageUrl(product.imagePath)!}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium whitespace-normal">
                    <span className="flex items-center gap-1.5">
                      {product.name}
                      {product.isFeatured ? (
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {divisionNameById.get(product.divisionId) ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {product.isRecommended ? <Badge variant="outline">Recommended</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ProductDocumentsDialog
                        productId={product.id}
                        productName={product.name}
                        documents={documentsByProductId[product.id] ?? {}}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Manage documents for ${product.name}`}>
                            <FileText className="size-4" />
                          </Button>
                        }
                      />
                      <ProductFormDialog
                        divisions={divisionOptions}
                        product={product}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${product.name}`}>
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title={`Delete "${product.name}"?`}
                        description="This product will be removed from the site. This action cannot be undone."
                        onConfirm={() => deleteProduct(product.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${product.name}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

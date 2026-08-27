"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteCategory } from "@/actions/admin/categories";
import { storageUrl } from "@/lib/utils/asset-url";
import type { categories } from "@/database/schema";

type Category = typeof categories.$inferSelect & { productCount: number; specRowCount: number };

export function CategoriesTable({ categories: initialCategories }: { categories: Category[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.slug.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add Category
            </Button>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No categories found</p>
          <p className="text-sm text-muted-foreground">
            {initialCategories.length === 0
              ? "Add your first category to get started."
              : "Try a different search."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Catalog Products</TableHead>
                <TableHead>Spec Table Rows</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((category) => {
                const iconSrc = category.iconPath
                  ? category.iconPath.startsWith("/")
                    ? category.iconPath
                    : storageUrl(category.iconPath)
                  : null;

                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div
                        className="relative size-10 flex items-center justify-center overflow-hidden rounded-lg p-1.5"
                        style={{ backgroundColor: category.bgColor ?? "#E2E8F0" }}
                      >
                        {iconSrc ? (
                          <Image
                            src={iconSrc}
                            alt={category.name}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium whitespace-normal">
                      <div>
                        <p>{category.name}</p>
                        {category.shortName ? (
                          <p className="text-xs text-muted-foreground">{category.shortName}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{category.productCount}</TableCell>
                    <TableCell className="text-muted-foreground">{category.specRowCount}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <CategoryFormDialog
                          category={category}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${category.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <ConfirmDeleteDialog
                          title={`Delete "${category.name}"?`}
                          description="This category will be deleted. Any active products must be reassigned first."
                          onConfirm={() => deleteCategory(category.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${category.name}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

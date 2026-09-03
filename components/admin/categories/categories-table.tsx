"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { GripVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteCategory, reorderCategories } from "@/actions/admin/categories";
import { storageUrl } from "@/lib/utils/asset-url";
import { cn } from "@/lib/utils";
import type { categories } from "@/database/schema";

type Category = typeof categories.$inferSelect & { productCount: number; specRowCount: number };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function categoryIconSrc(category: Category) {
  if (!category.iconPath) return null;
  return category.iconPath.startsWith("/") ? category.iconPath : storageUrl(category.iconPath);
}

function CategoryRowCells({ category }: { category: Category }) {
  const iconSrc = categoryIconSrc(category);

  return (
    <>
      <td className="p-2 align-middle">
        <div
          className="relative flex size-10 items-center justify-center overflow-hidden rounded-lg p-1.5"
          style={{ backgroundColor: category.bgColor ?? "#E2E8F0" }}
        >
          {iconSrc ? (
            <Image src={iconSrc} alt={category.name} fill sizes="40px" className="object-contain p-1" />
          ) : null}
        </div>
      </td>
      <td className="p-2 align-middle font-medium whitespace-normal">
        <div>
          <p>{category.name}</p>
          {category.shortName ? <p className="text-xs text-muted-foreground">{category.shortName}</p> : null}
        </div>
      </td>
      <td className="p-2 align-middle text-xs font-mono text-muted-foreground">{category.slug}</td>
      <td className="p-2 align-middle text-muted-foreground">{category.productCount}</td>
      <td className="p-2 align-middle text-muted-foreground">{category.specRowCount}</td>
      <td className="p-2 align-middle">
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="p-2 text-right align-middle">
        <div className="flex justify-end gap-1">
          <CategoryFormDialog
            category={category}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`}>
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
      </td>
    </>
  );
}

const ROW_CLASSNAME =
  "relative border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted";

/** Static (non-draggable) row, used while a search filter narrows the visible rows. */
function StaticCategoryRow({ category }: { category: Category }) {
  return (
    <TableRow>
      <td className="w-10 p-2 align-middle">
        <span
          title="Clear the search to reorder"
          className="flex size-8 items-center justify-center text-muted-foreground opacity-30"
        >
          <GripVertical className="size-4" />
        </span>
      </td>
      <CategoryRowCells category={category} />
    </TableRow>
  );
}

function SortableCategoryRow({
  category,
  disabled,
  dropIndicator,
  reducedMotion,
}: {
  category: Category;
  disabled: boolean;
  dropIndicator: "before" | "after" | null;
  reducedMotion: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: reducedMotion ? undefined : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        ROW_CLASSNAME,
        dropIndicator === "before" &&
          "before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-0.5 before:bg-entaj-blue",
        dropIndicator === "after" &&
          "after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-0.5 after:bg-entaj-blue",
      )}
    >
      <td className="w-10 p-2 align-middle">
        <button
          type="button"
          aria-label={`Drag to reorder ${category.name}`}
          disabled={disabled}
          className="flex size-8 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-30 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <CategoryRowCells category={category} />
    </tr>
  );
}

function CategoryTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" aria-hidden="true" />
            <TableHead className="w-16">Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Catalog Products</TableHead>
            <TableHead>Spec Table Rows</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

export function CategoriesTable({ categories: initialCategories }: { categories: Category[] }) {
  const [items, setItems] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  // Keep in sync with the server-fetched list (e.g. after a revalidate from an edit/delete
  // elsewhere), but only while nothing is actively being dragged/saved here.
  useEffect(() => {
    if (activeId === null && !isSaving) setItems(initialCategories);
  }, [initialCategories, activeId, isSaving]);

  const isFiltering = search.trim().length > 0;
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      items.filter(
        (c) => c.name.toLowerCase().includes(normalizedSearch) || c.slug.toLowerCase().includes(normalizedSearch),
      ),
    [items, normalizedSearch],
  );

  const nameById = useMemo(() => new Map(items.map((c) => [c.id, c.name])), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${nameById.get(Number(active.id)) ?? "category"}. Use arrow keys to move, space to drop, escape to cancel.`;
    },
    onDragOver({ active, over }) {
      if (!over) return undefined;
      return `${nameById.get(Number(active.id)) ?? "Category"} moved over ${nameById.get(Number(over.id)) ?? "category"}.`;
    },
    onDragEnd({ active, over }) {
      if (!over) return `${nameById.get(Number(active.id)) ?? "Category"} was dropped, order unchanged.`;
      return `${nameById.get(Number(active.id)) ?? "Category"} was moved to the position of ${nameById.get(Number(over.id)) ?? "category"}.`;
    },
    onDragCancel({ active }) {
      return `Reordering ${nameById.get(Number(active.id)) ?? "category"} was cancelled.`;
    },
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? Number(event.over.id) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = items;
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    setIsSaving(true);

    const result = await reorderCategories(reordered.map((c) => c.id));
    setIsSaving(false);

    if (!result.success) {
      setItems(previous);
      toast.error(result.error ?? "The new order was not saved.");
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const activeIndex = activeId !== null ? items.findIndex((c) => c.id === activeId) : -1;
  const overIndex = overId !== null ? items.findIndex((c) => c.id === overId) : -1;
  const activeCategory = activeId !== null ? items.find((c) => c.id === activeId) : undefined;

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
            {items.length === 0 ? "Add your first category to get started." : "Try a different search."}
          </p>
        </div>
      ) : isFiltering ? (
        <CategoryTableShell>
          {filtered.map((category) => (
            <StaticCategoryRow key={category.id} category={category} />
          ))}
        </CategoryTableShell>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{ announcements }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <CategoryTableShell>
            <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {items.map((category) => {
                const dropIndicator =
                  activeId !== null && overId === category.id && category.id !== activeId
                    ? overIndex > activeIndex
                      ? "after"
                      : "before"
                    : null;
                return (
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    disabled={isSaving}
                    dropIndicator={dropIndicator}
                    reducedMotion={reducedMotion}
                  />
                );
              })}
            </SortableContext>
          </CategoryTableShell>

          <DragOverlay>
            {activeCategory ? (
              <div className="flex items-center gap-3 rounded-xl border bg-popover px-4 py-2.5 shadow-xl">
                <div
                  className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1"
                  style={{ backgroundColor: activeCategory.bgColor ?? "#E2E8F0" }}
                >
                  {categoryIconSrc(activeCategory) ? (
                    <Image
                      src={categoryIconSrc(activeCategory)!}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-contain p-1"
                    />
                  ) : null}
                </div>
                <span className="text-sm font-medium">{activeCategory.name}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

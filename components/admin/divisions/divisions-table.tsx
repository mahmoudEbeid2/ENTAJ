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
import { DivisionFormDialog } from "@/components/admin/divisions/division-form-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteDivision } from "@/actions/admin/divisions";
import { storageUrl } from "@/lib/utils/asset-url";
import type { homeDivisions } from "@/database/schema";

type HomeDivision = typeof homeDivisions.$inferSelect;

export function DivisionsTable({ divisions: initialDivisions }: { divisions: HomeDivision[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialDivisions.filter((d) =>
    d.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search home divisions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <DivisionFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add Home Division
            </Button>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No home divisions found</p>
          <p className="text-sm text-muted-foreground">
            {initialDivisions.length === 0
              ? "Add your first home division card to get started."
              : "Try a different search."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead className="w-24">Numeral</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((division) => (
                <TableRow key={division.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      {division.imagePath ? (
                        <Image
                          src={storageUrl(division.imagePath)!}
                          alt={division.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{division.numeral ?? "—"}</TableCell>
                  <TableCell className="font-medium whitespace-normal">{division.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate">{division.subtitle ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={division.isActive ? "default" : "secondary"}>
                      {division.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <DivisionFormDialog
                        division={division}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${division.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title={`Delete "${division.name}"?`}
                        description="This home division card will be removed from the Home page. Categories and products will not be affected."
                        onConfirm={() => deleteDivision(division.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${division.name}`}
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


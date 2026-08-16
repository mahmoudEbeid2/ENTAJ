import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq, and, isNull } from "drizzle-orm";
import { Package, Layers, Mail, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { products, divisions, contactMessages, activityLogs, admins } from "@/database/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [[productCount], [divisionCount], [newMessageCount], recentProducts, recentActivity] =
    await Promise.all([
      db.select({ value: count() }).from(products).where(isNull(products.deletedAt)),
      db.select({ value: count() }).from(divisions).where(isNull(divisions.deletedAt)),
      db
        .select({ value: count() })
        .from(contactMessages)
        .where(and(eq(contactMessages.status, "new"), isNull(contactMessages.deletedAt))),
      db
        .select()
        .from(products)
        .where(isNull(products.deletedAt))
        .orderBy(desc(products.createdAt))
        .limit(5),
      db
        .select({ log: activityLogs, adminName: admins.name })
        .from(activityLogs)
        .leftJoin(admins, eq(activityLogs.adminId, admins.id))
        .orderBy(desc(activityLogs.createdAt))
        .limit(8),
    ]);

  const stats = [
    { label: "Products", value: productCount?.value ?? 0, icon: Package, href: "/admin/products" },
    { label: "Divisions", value: divisionCount?.value ?? 0, icon: Layers, href: "/admin/divisions" },
    {
      label: "New Messages",
      value: newMessageCount?.value ?? 0,
      icon: Mail,
      href: "/admin/messages",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your site content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{s.value}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-full bg-entaj-blue/10 text-entaj-blue">
                  <s.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/admin/products" />}>
          <Plus className="size-4" />
          Add Product
        </Button>
        <Button variant="outline" render={<Link href="/admin/divisions" />}>
          <Plus className="size-4" />
          Add Division
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            ) : (
              <ul className="divide-y">
                {recentProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y">
                {recentActivity.map(({ log, adminName }) => (
                  <li key={log.id} className="py-2.5 text-sm">
                    <span className="font-medium">{adminName ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">
                      {log.action} {log.entityType}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

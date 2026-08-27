import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Package, Layers, Grid, FileText, Mail, Settings } from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Grid },
  { label: "Home Divisions", href: "/admin/divisions", icon: Layers },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];


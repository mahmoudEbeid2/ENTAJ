import { relations } from "drizzle-orm";
import { activityLogs, admins, permissions, roles, rolePermissions } from "./auth";
import { divisions, products, productDocuments } from "./content";
import { contactMessages } from "./contact";
import { mediaLibrary } from "./media";
import { blogCategories, blogPosts } from "./cms";

export const rolesRelations = relations(roles, ({ many }) => ({
  admins: many(admins),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const adminsRelations = relations(admins, ({ one, many }) => ({
  role: one(roles, { fields: [admins.roleId], references: [roles.id] }),
  activityLogs: many(activityLogs),
  mediaUploads: many(mediaLibrary),
  blogPosts: many(blogPosts),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  admin: one(admins, { fields: [activityLogs.adminId], references: [admins.id] }),
}));

export const divisionsRelations = relations(divisions, ({ many }) => ({
  products: many(products),
  contactMessages: many(contactMessages),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  division: one(divisions, { fields: [products.divisionId], references: [divisions.id] }),
  documents: many(productDocuments),
}));

export const productDocumentsRelations = relations(productDocuments, ({ one }) => ({
  product: one(products, { fields: [productDocuments.productId], references: [products.id] }),
}));

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
  division: one(divisions, {
    fields: [contactMessages.divisionId],
    references: [divisions.id],
  }),
}));

export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  uploadedBy: one(admins, {
    fields: [mediaLibrary.uploadedByAdminId],
    references: [admins.id],
  }),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  author: one(admins, { fields: [blogPosts.authorAdminId], references: [admins.id] }),
}));

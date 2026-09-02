import { relations } from "drizzle-orm";
import { admins } from "./auth";

import { homeDivisions } from "./homepage";
import { categories, divisions, products, productDocuments, divisionSpecRows, productDivisions } from "./content";
import { contactMessages } from "./contact";
import { mediaLibrary } from "./media";
import { blogCategories, blogPosts } from "./cms";

export const homeDivisionsRelations = relations(homeDivisions, () => ({}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  contactMessages: many(contactMessages),
  specRows: many(divisionSpecRows),
  productDivisions: many(productDivisions),
}));

export const divisionsRelations = categoriesRelations;


export const productsRelations = relations(products, ({ one, many }) => ({
  division: one(divisions, { fields: [products.divisionId], references: [divisions.id] }),
  documents: many(productDocuments),
  specRows: many(divisionSpecRows),
  productDivisions: many(productDivisions),
}));

export const productDivisionsRelations = relations(productDivisions, ({ one }) => ({
  product: one(products, { fields: [productDivisions.productId], references: [products.id] }),
  division: one(divisions, { fields: [productDivisions.divisionId], references: [divisions.id] }),
}));

export const divisionSpecRowsRelations = relations(divisionSpecRows, ({ one }) => ({
  division: one(divisions, { fields: [divisionSpecRows.divisionId], references: [divisions.id] }),
  product: one(products, { fields: [divisionSpecRows.productId], references: [products.id] }),
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

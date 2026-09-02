CREATE TABLE `product_divisions` (
	`product_id` int NOT NULL,
	`division_id` int NOT NULL,
	CONSTRAINT `product_divisions_product_id_division_id_pk` PRIMARY KEY(`product_id`,`division_id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `formula` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `purity` varchar(150);--> statement-breakpoint
ALTER TABLE `products` ADD `applications` json;--> statement-breakpoint
ALTER TABLE `product_divisions` ADD CONSTRAINT `product_divisions_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_divisions` ADD CONSTRAINT `product_divisions_division_id_divisions_id_fk` FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_divisions_division_id_idx` ON `product_divisions` (`division_id`);
--> statement-breakpoint
-- Seed each existing product's current single division as its baseline membership in the
-- new many-to-many join table, so no existing product/division association is lost.
INSERT INTO `product_divisions` (`product_id`, `division_id`)
SELECT p.id, p.division_id FROM `products` p
WHERE NOT EXISTS (
	SELECT 1 FROM `product_divisions` pd WHERE pd.product_id = p.id AND pd.division_id = p.division_id
);